import type { MenuCategory, Addon, OrderData, Order, OrderSummary, OrderStatus, SalesStatistics } from '../types';
import { MENU_DATA, ADDONS } from '../constants';

// --- IMPORTANT ---
// Replace this with your actual Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbxr4l4N3rRgm0d8BqzEJr_OIhpuaJ2WnH_u3o1wjX3fHzV4lt5SDZ8y9Sn8qP42pCfJ/exec'; 

const apiService = {
  async getMenuAndAddons(): Promise<{ menu: MenuCategory[], addons: Addon[], from: 'api' | 'fallback' }> {
    try {
      const response = await fetch(`${API_URL}?action=getMenu`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (!data.menu || !data.addons) throw new Error('Invalid data structure from API');
      return { ...data, from: 'api' };
    } catch (error) {
      console.warn("API fetch failed, using fallback.", error);
      return { menu: MENU_DATA, addons: ADDONS, from: 'fallback' };
    }
  },

  async submitOrder(orderData: OrderData): Promise<{ success: boolean; orderId?: string; message?: string; }> {
    try {
      const payload = {
        action: 'createOrder',
        orderData: {
            ...orderData,
            // Ensure items are stringified for Google Apps Script to handle
            items: JSON.stringify(orderData.items)
        },
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error("Failed to submit order:", error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred during order submission.';
      throw new Error(message);
    }
  },

  async getOrder(orderId: string): Promise<{ success: boolean; order?: Order, message?: string }> {
    try {
      const response = await fetch(`${API_URL}?action=getOrder&orderId=${orderId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error(`Failed to get order ${orderId}:`, error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      return { success: false, message };
    }
  },
  
  async searchOrders(params: { name?: string; phone?: string; startDate?: string; endDate?: string; }): Promise<{ success: boolean; orders?: OrderSummary[]; message?: string; }> {
    try {
        const query = new URLSearchParams({ action: 'searchOrders' });
        if (params.name) query.append('name', params.name);
        if (params.phone) query.append('phone', params.phone);
        if (params.startDate) query.append('startDate', params.startDate);
        if (params.endDate) query.append('endDate', params.endDate);
        
        const response = await fetch(`${API_URL}?${query.toString()}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("Failed to search orders:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, message };
    }
  },
  
  // --- New functions for Admin Dashboard ---

  async getAllOrders(): Promise<{ success: boolean; orders?: Order[]; message?: string }> {
    try {
      const response = await fetch(`${API_URL}?action=getAllOrders`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Failed to get all orders:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      return { success: false, message };
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ success: boolean; message?: string }> {
    try {
      const payload = { action: 'updateOrderStatus', orderId, status };
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to update status for order ${orderId}:`, error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      return { success: false, message };
    }
  },

  async getSalesStatistics(startDate: string, endDate: string): Promise<{ success: boolean; stats?: SalesStatistics; message?: string }> {
    try {
      const query = new URLSearchParams({ action: 'getSalesStatistics', startDate, endDate });
      const response = await fetch(`${API_URL}?${query.toString()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Failed to get sales statistics:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      return { success: false, message };
    }
  }
};

export { apiService };