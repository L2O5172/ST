// Fix: Removed circular import and explicitly defined DonenessLevel to resolve type errors.
export type DonenessLevel = '3分熟' | '5分熟' | '7分熟' | '全熟';

export interface SingleChoiceAddon {
  price: number;
  options: string[];
}

export interface MultiChoice {
  title: string;
  options: string[];
}

export interface MenuItemCustomizations {
  doneness?: boolean;
  sauceChoice?: boolean;
  saucesPerItem?: number;
  drinkChoice?: boolean;
  dessertChoice?: boolean; // New customization for dessert selection
  notes?: boolean;
  singleChoiceAddon?: SingleChoiceAddon;
  multiChoice?: MultiChoice;
}

export interface MenuItem {
  id: string;
  name: string;
  weight?: string;
  price: number;
  description?: string;
  customizations: MenuItemCustomizations;
  isAvailable: boolean;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

export interface SelectedAddon extends Addon {
    quantity: number;
}

export interface SelectedSauce {
    name:string;
    quantity: number;
}

export interface SelectedDessert {
    name: string;
    quantity: number;
}

export interface CartItem {
  cartId: string;
  cartKey: string;
  item: MenuItem;
  quantity: number;
  categoryTitle: string;
  selectedDonenesses?: Partial<Record<DonenessLevel, number>>;
  selectedDrinks?: { [key: string]: number };
  selectedAddons?: SelectedAddon[];
  selectedSauces?: SelectedSauce[];
  selectedDesserts?: SelectedDessert[]; // New property for selected desserts
  selectedNotes?: string;
  selectedSingleChoiceAddon?: string;
  selectedMultiChoice?: { [key: string]: number };
  totalPrice: number;
}

export interface CustomerInfo {
    name: string;
    phone: string;
    tableNumber: string;
}

export type OrderType = '內用' | '外帶';
export type OrderStatus = '待店長確認' | '待處理' | '製作中' | '可以取餐' | '已完成' | '錯誤';


export interface OrderData {
    items: CartItem[];
    totalPrice: number;
    customerInfo: CustomerInfo;
    orderType: OrderType;
}

export interface Order {
    id: string;
    status: OrderStatus;
    orderType: OrderType;
    items: CartItem[];
    customerInfo: CustomerInfo;
    totalPrice: number;
    createdAt: string;
}

export interface OrderSummary {
    id: string;
    customerName: string;
    totalAmount: number;
    timestamp: string;
}

// Types for Sales Statistics
export interface PopularItem {
    name: string;
    quantity: number;
    revenue: number;
}

export interface SalesTrendData {
    date: string; // YYYY-MM-DD
    revenue: number;
}

export interface SalesStatistics {
    totalRevenue: number;
    orderCount: number;
    popularItems: PopularItem[];
    salesTrend: SalesTrendData[];
}