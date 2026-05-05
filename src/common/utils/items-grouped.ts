import type { Category, Item } from '@prisma/client';

const CATEGORY_ORDER: Category[] = [
  'COMIDA',
  'LIMPEZA',
  'HIGIENE',
  'DIA_A_DIA',
  'BEBIDAS',
  'OUTROS',
];

export type GroupedByCategory<T> = Record<Category, T[]>;

export function emptyGroupedItems(): GroupedByCategory<Item> {
  const base = {} as GroupedByCategory<Item>;
  for (const c of CATEGORY_ORDER) {
    base[c] = [];
  }
  return base;
}

export function groupItemsByCategory(items: Item[]): GroupedByCategory<Item> {
  const grouped = emptyGroupedItems();
  for (const item of items) {
    grouped[item.category].push(item);
  }
  return grouped;
}
