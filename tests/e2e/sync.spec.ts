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

async function sendOrderFromDiner(page: Page) {
  await page.goto('/table/1');
  await disableAnimations(page);

  await page.getByTestId('identity-name-input').fill('Alice');
  await page.getByTestId('identity-start-btn').click();
  await expect(page.getByTestId('diner-menu-page')).toBeVisible({ timeout: 15000 });

  await page.getByTestId('add-item-item-7').click();
  await page.getByTestId('cart-trigger-btn').click();
  await expect(page.getByTestId('checkout-sheet')).toBeVisible();
  await page.getByTestId('send-order-btn').click();
  await expect(page.getByTestId('checkout-sheet')).not.toBeVisible();
}

async function openKitchenTicket(page: Page) {
  await page.goto('/kitchen');
  await disableAnimations(page);

  await expect(page.getByTestId('kitchen-page')).toBeVisible();
  const ticket = page.getByTestId(/kitchen-order-card-/).first();
  await expect(ticket).toBeVisible({ timeout: 15000 });
  await expect(ticket).toContainText('Table 1');

  return ticket;
}

test.describe('Multi-client Synchronization', () => {
  test('@smoke order flow from diner to kitchen and status sync back', async ({ context }) => {
    const dinerPage = await context.newPage();
    const kitchenPage = await context.newPage();

    await sendOrderFromDiner(dinerPage);
    const ticket = await openKitchenTicket(kitchenPage);

    await expect(ticket.getByText('ordered', { exact: false })).toBeVisible();

    await ticket.getByRole('button', { name: 'Start Cooking' }).click();
    await expect(ticket.getByText('cooking', { exact: false })).toBeVisible();

    await dinerPage.getByTestId('cart-trigger-btn').click();
    await expect(dinerPage.getByTestId('checkout-sheet')).toBeVisible();
    await expect(dinerPage.getByTestId('checkout-sheet')).toContainText(/Preparing/i);

    await ticket.getByRole('button', { name: 'Mark Ready' }).click();
    await expect(ticket.getByText('ready', { exact: false })).toBeVisible();
    await expect(dinerPage.getByTestId('checkout-sheet')).toContainText(/Ready to Serve/i, {
      timeout: 10000,
    });
  });

  test('@smoke keyboard control updates focused kitchen ticket', async ({ context }) => {
    const dinerPage = await context.newPage();
    const kitchenPage = await context.newPage();

    await sendOrderFromDiner(dinerPage);
    const ticket = await openKitchenTicket(kitchenPage);

    await expect(ticket.getByText('ordered', { exact: false })).toBeVisible();

    await kitchenPage.keyboard.press('Enter');
    await expect(ticket.getByText('cooking', { exact: false })).toBeVisible();

    await dinerPage.getByTestId('cart-trigger-btn').click();
    await expect(dinerPage.getByTestId('checkout-sheet')).toBeVisible();
    await expect(dinerPage.getByTestId('checkout-sheet')).toContainText(/Preparing/i);
  });
});
