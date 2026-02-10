import { CartItem } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

const ADJECTIVES = ["Hungry", "Happy", "Crispy", "Golden", "Chilled", "Spicy", "Umami"];
const FOODS = ["Taco", "Noodle", "Dumpling", "Brioche", "Espresso", "Bao", "Fries"];

export function generateGuestName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const food = FOODS[Math.floor(Math.random() * FOODS.length)];
  return `${adj} ${food}`;
}
