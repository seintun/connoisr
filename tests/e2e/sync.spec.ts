import { expect, test } from '@playwright/test';

test.describe('Multi-client Synchronization', () => {
  test('order flow from diner to kitchen and status sync back', async ({ context }) => {
    // We use two pages in the same context to share localStorage
    const dinerPage = await context.newPage();
    const kitchenPage = await context.newPage();

    // Disable animations globally for all pages in this context for stability
    await context.addInitScript(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        *, *::before, *::after {
          transition: none !important;
          animation: none !important;
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `;
      document.head.appendChild(style);
    });

    // 1. Diner: Onboarding
    await dinerPage.goto('/table/1');
    
    await dinerPage.getByPlaceholder('Your first name').fill('Alice');
    await dinerPage.getByText('Start Dining').click();

    // Verify Diner is in - use a unique element like the menu categories
    // Increasing timeout to allow useMenuPrefetch simulation to finish
    await expect(dinerPage.getByRole('heading', { name: 'Mains' })).toBeVisible({ timeout: 15000 });

    // 2. Diner: Add item to cart
    // Using a more robust selector for the Mains section first item
    const mainItem = dinerPage.locator('section#Mains').locator('div.group').first();
    await mainItem.getByRole('button', { name: 'Add' }).click();

    // 3. Diner: Review & Send Order
    // Wait for the button to be fully visible
    const cartTrigger = dinerPage.getByRole('button', { name: /Review & Send/i });
    await expect(cartTrigger).toBeVisible();
    
    // Using evaluate click to bypass framer-motion stability issues
    await cartTrigger.evaluate(node => (node as HTMLElement).click());
    
    await expect(dinerPage.getByText('Your Table', { exact: false })).toBeVisible();
    
    // Using evaluate click for Send Order
    await dinerPage.getByRole('button', { name: 'Send Order' }).evaluate(node => (node as HTMLElement).click());
    
    // After sending, the cart sheet closes. 
    // We should wait for it to be hidden.
    await expect(dinerPage.getByText('Your Table', { exact: false })).not.toBeVisible();

    // 4. Kitchen: Verify order received
    await kitchenPage.goto('/kitchen');
    // Ensure the KDS loads and shows the ticket
    const ticket = kitchenPage.locator('div').filter({ hasText: 'Table 1' }).first();
    await expect(ticket).toBeVisible({ timeout: 15000 });
    await expect(ticket.getByText('ordered', { exact: false })).toBeVisible();

    // 5. Kitchen: Update status to Cooking
    await ticket.getByRole('button', { name: 'Start Cooking' }).evaluate(node => (node as HTMLElement).click());
    await expect(ticket.getByText('cooking', { exact: false })).toBeVisible();

    // 6. Diner: Verify status sync
    // Re-open the cart to see the status
    // The button now says "Pay $..." because cart is empty but orders exist
    const payButton = dinerPage.getByRole('button', { name: /Pay \$/i });
    await expect(payButton).toBeVisible();
    await payButton.evaluate(node => (node as HTMLElement).click());

    // UI shows "Preparing" for 'cooking' status
    await expect(dinerPage.getByText(/Preparing/i)).toBeVisible({ timeout: 10000 });

    // 7. Kitchen: Update status to Ready
    await ticket.getByRole('button', { name: 'Mark Ready' }).evaluate(node => (node as HTMLElement).click());
    await expect(ticket.getByText('ready', { exact: false })).toBeVisible();

    // 8. Diner: Verify status is Ready
    // UI shows "Ready to Serve" for 'ready' status
    await expect(dinerPage.getByText(/Ready to Serve/i)).toBeVisible({ timeout: 10000 });
  });
});
