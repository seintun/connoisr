"use client";

import { Checkout } from "@/components/domain/Checkout";
import { useTableSession } from "@/components/providers/TableSessionProvider";

const MENU_ITEMS = [
  {
    id: "item-1",
    name: "Truffle Risotto",
    price: 28,
    description: "Arborio rice, black truffle, parmesan crisp",
  },
  {
    id: "item-2",
    name: "Pan-Seared Scallops",
    price: 32,
    description: "Cauliflower purée, brown butter, capers",
  },
  {
    id: "item-3",
    name: "Wagyu Beef Carpaccio",
    price: 24,
    description: "Mustard seed, pickled shallot, rye cracker",
  },
];

export default function DinerPage() {
  const { session, addItem } = useTableSession();

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold text-primary">TempoDine</h1>
        <div className="text-sm font-medium">
          Table {session?.tableId} • Cart: {session?.cart.length}
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-muted-foreground uppercase tracking-wider">
          Signatures
        </h2>
        <div className="grid gap-4">
          {MENU_ITEMS.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-sm border border-border bg-card hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif text-lg font-medium">{item.name}</h3>
                <span className="text-primary font-medium">${item.price}</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                {item.description}
              </p>
              <button
                onClick={() =>
                  addItem({
                    menuItemId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                  })
                }
                className="w-full py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-sm active:scale-95 transition-transform"
              >
                Add to Order
              </button>
            </div>
          ))}
        </div>
      </section>
      <Checkout />
    </div>
  );
}
