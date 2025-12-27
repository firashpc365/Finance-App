
import { MenuPackage } from './types';

export const MENUS: MenuPackage[] = [
  {
    id: 'mandi-std',
    name: 'Standard Mandi Package',
    items: ['Chicken Mandi', 'Green Salad', 'Yogurt Sauce', 'Water', 'Dates'],
    base_cost_per_pax: 25
  },
  {
    id: 'mandi-vip',
    name: 'VIP Lamb Mandi',
    items: ['Lamb Mandi', 'Arabic Salad', 'Kunafa', 'Soft Drinks', 'Coffee/Tea'],
    base_cost_per_pax: 45
  },
  {
    id: 'breakfast-box',
    name: 'Corporate Breakfast Box',
    items: ['Club Sandwich', 'Muffin', 'Fruit Cup', 'Orange Juice'],
    base_cost_per_pax: 18
  }
];

export const CLIENTS = ['Paul', 'Aramco', 'SABIC', 'JAG Arabia'];
