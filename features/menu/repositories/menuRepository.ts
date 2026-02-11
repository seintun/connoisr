import { MENU_ITEMS } from '@/lib/menu';

export type MenuItem = (typeof MENU_ITEMS)[number];

export interface MenuRepository {
  getMenu(tableId: string): Promise<MenuItem[]>;
}

class LocalMenuRepository implements MenuRepository {
  async getMenu(tableId: string): Promise<MenuItem[]> {
    void tableId;
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MENU_ITEMS;
  }
}

export const menuRepository: MenuRepository = new LocalMenuRepository();
