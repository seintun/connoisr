import { expect, test, type Page } from '@playwright/test';

const disableAnimations = async (page: Page) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition: none !important;
        animation: none !important;
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `,
  });
};

test.describe('Multi-client Synchronization', () => {
  test('@smoke order flow from diner to kitchen and status sync back', async ({ context }) => {
    // We use two pages in the same context to share localStorage
    const dinerPage = await context.newPage();
    const kitchenPage = await context.newPage();

    // 1. Diner: Onboarding
    await dinerPage.goto('/table/1');
    await disableAnimations(dinerPage);
    await dinerPage.getByTestId('identity-name-input').fill('Alice');
    await dinerPage.getByTestId('identity-start-btn').click();

    // Verify the menu shell is visible after onboarding + prefetch.
    await expect(dinerPage.getByTestId('diner-menu-page')).toBeVisible({ timeout: 15000 });

    // 2. Diner: Add item to cart
    await dinerPage.getByTestId('add-item-item-7').click();

    // 3. Diner: Review & Send Order
    await dinerPage.getByTestId('cart-trigger-btn').click();
    await expect(dinerPage.getByTestId('checkout-sheet')).toBeVisible();
    await dinerPage.getByTestId('send-order-btn').click();
    await expect(dinerPage.getByTestId('checkout-sheet')).not.toBeVisible();

    // 4. Kitchen: Verify order received
    await kitchenPage.goto('/kitchen');
    await disableAnimations(kitchenPage);

    await expect(kitchenPage.getByTestId('kitchen-page')).toBeVisible();
    const ticket = kitchenPage.getByTestId(/kitchen-order-card-/).first();
    await expect(ticket).toBeVisible({ timeout: 15000 });
    await expect(ticket).toContainText('Table 1');
    await expect(ticket.getByText('ordered', { exact: false })).toBeVisible();

    // 5. Kitchen: Update status to Cooking
    await ticket.getByRole('button', { name: 'Start Cooking' }).click();
    await expect(ticket.getByText('cooking', { exact: false })).toBeVisible();

    // 6. Diner: Verify status sync
    await dinerPage.getByTestId('cart-trigger-btn').click();
    await expect(dinerPage.getByTestId('checkout-sheet')).toBeVisible();

    // UI shows "Preparing" for 'cooking' status
    await expect(dinerPage.getByTestId('checkout-sheet')).toContainText(/Preparing/i);

    // 7. Kitchen: Update status to Ready
    await ticket.getByRole('button', { name: 'Mark Ready' }).click();
    await expect(ticket.getByText('ready', { exact: false })).toBeVisible();

    // 8. Diner: Verify status is Ready
    // UI shows "Ready to Serve" for 'ready' status
    await expect(dinerPage.getByTestId('checkout-sheet')).toContainText(/Ready to Serve/i, { timeout: 10000 });
  });
});
