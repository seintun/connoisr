import { expect, test, type Page } from '@playwright/test';

const SPICY_ITEM_ID = 'item-5';
const SPICY_ITEM_NAME = 'Avocado Toast';

async function disableAnimations(page: Page) {
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
}

async function startDining(page: Page, tableId: string, dinerName: string) {
  await page.goto(`/table/${tableId}`);
  await disableAnimations(page);
  await page.getByTestId('identity-name-input').fill(dinerName);
  await page.getByTestId('identity-start-btn').click();
  await expect(page.getByTestId('diner-menu-page')).toBeVisible({ timeout: 15_000 });
}

async function addItemQuantity(page: Page, menuItemId: string, quantity: number) {
  if (quantity < 1) return;

  await page.getByTestId(`add-item-${menuItemId}`).click();
  for (let i = 1; i < quantity; i += 1) {
    await page.getByTestId(`increment-item-${menuItemId}`).click();
  }

  await expect(page.getByTestId(`item-quantity-${menuItemId}`)).toHaveText(String(quantity));
}

async function openCheckout(page: Page) {
  await page.getByTestId('cart-trigger-btn').click();
  await expect(page.getByTestId('checkout-sheet')).toBeVisible();
}

test.describe('Checkout modify edge cases', () => {
  test('@smoke splits one item from a group and preserves note + spiciness level', async ({ page }) => {
    await startDining(page, '3', 'E2E Split');
    await addItemQuantity(page, SPICY_ITEM_ID, 3);
    await openCheckout(page);

    const groups = page.getByTestId(`cart-group-${SPICY_ITEM_NAME}`);
    await expect(groups).toHaveCount(1);
    await expect(groups.first().getByTestId('item-quantity')).toHaveText('3');

    await groups.first().getByTestId('modify-item-btn').click();
    await expect(page.getByTestId('customization-drawer')).toBeVisible();

    await page.getByTestId('customization-intensity-150').click();
    await page.getByTestId('customization-chef-note').fill('extra crispy on this one');
    await page.getByTestId('customization-add-to-order-btn').click();

    const updatedGroups = page.getByTestId(`cart-group-${SPICY_ITEM_NAME}`);
    const customGroup = updatedGroups.filter({ hasText: 'Custom' });
    const standardGroup = updatedGroups.filter({ hasNotText: 'Custom' });

    await expect(updatedGroups).toHaveCount(2);
    await expect(customGroup.getByTestId('item-quantity')).toHaveText('1');
    await expect(customGroup).toContainText('Spiciness:');
    await expect(customGroup).toContainText('Extra');
    await expect(customGroup).toContainText('extra crispy on this one');

    await expect(standardGroup.getByTestId('item-quantity')).toHaveText('2');
  });

  test('editing full group at max quantity keeps controls correct and decrements to zero cleanly', async ({ page }) => {
    await startDining(page, '4', 'E2E Max');
    await addItemQuantity(page, SPICY_ITEM_ID, 3);
    await openCheckout(page);

    const initialGroup = page.getByTestId(`cart-group-${SPICY_ITEM_NAME}`).first();
    await initialGroup.getByTestId('modify-item-btn').click();
    await expect(page.getByTestId('customization-drawer')).toBeVisible();

    await page.getByTestId('customization-qty-increment').click();
    await page.getByTestId('customization-qty-increment').click();
    await expect(page.getByTestId('drawer-quantity')).toHaveText('3');
    await expect(page.getByTestId('customization-qty-increment')).toBeDisabled();

    await page.getByTestId('customization-intensity-50').click();
    await page.getByTestId('customization-chef-note').fill('all three light');
    await page.getByTestId('customization-add-to-order-btn').click();

    const groups = page.getByTestId(`cart-group-${SPICY_ITEM_NAME}`);
    const customGroup = groups.filter({ hasText: 'Custom' }).first();
    await expect(groups).toHaveCount(1);
    await expect(customGroup.getByTestId('item-quantity')).toHaveText('3');
    await expect(customGroup).toContainText('Spiciness:');
    await expect(customGroup).toContainText('Light');
    await expect(customGroup).toContainText('all three light');

    const decrementButton = customGroup.getByTestId(`checkout-item-decrement-${SPICY_ITEM_ID}`);
    await decrementButton.click();
    await expect(customGroup.getByTestId('item-quantity')).toHaveText('2');

    await decrementButton.click();
    await expect(customGroup.getByTestId('item-quantity')).toHaveText('1');

    await decrementButton.click();
    await expect(page.getByTestId(`cart-group-${SPICY_ITEM_NAME}`)).toHaveCount(0);
    await expect(page.getByTestId('checkout-sheet')).not.toBeVisible();
  });
});
