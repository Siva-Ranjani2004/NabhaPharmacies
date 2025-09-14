import { storage } from './storage';
import { firebaseService } from '../services/firebase-service';
import type { User, Pharmacy, Stock, ActivityLog, RegistrationRequest } from '../types';

// Firebase-based API manager
class ApiManager {
  private isOnline = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingUpdates();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }


  // Authentication - now uses Firebase Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return await firebaseService.signIn(email, password);
  }

  // Registration - now uses Firestore
  async submitRegistrationRequest(data: Omit<RegistrationRequest, 'id' | 'status' | 'submitted_at'>): Promise<{ request_id: string }> {
    return await firebaseService.submitRegistrationRequest(data);
  }

  // Stock Management - now uses Firestore
  async getStock(pharmacyId: string): Promise<Stock[]> {
    if (!this.isOnline) {
      // Return cached stock from IndexedDB
      return await storage.getAll('stock');
    }

    try {
      const stock = await firebaseService.getStock(pharmacyId);
      
      // Cache stock data for offline use
      for (const stockItem of stock) {
        await storage.put('stock', stockItem);
      }
      
      return stock;
    } catch (error) {
      console.error('Error fetching stock from Firestore:', error);
      // Fallback to cached data
      return await storage.getAll('stock');
    }
  }

  async updateStock(stock: Partial<Stock>): Promise<Stock> {
    if (!this.isOnline) {
      // Save to pending updates for later sync
      const updatedStock: Stock = {
        ...stock as Stock,
        last_updated_at: new Date(),
        version: (stock.version || 0) + 1
      };
      await storage.addPendingUpdate(updatedStock);
      throw new Error('OFFLINE_SAVED');
    }

    try {
      const updatedStock = await firebaseService.updateStock(stock);
      
      // Update local cache
      await storage.put('stock', updatedStock);
      
      return updatedStock;
    } catch (error) {
      console.error('Error updating stock in Firestore:', error);
      throw error;
    }
  }

  async syncPendingUpdates(): Promise<void> {
    if (!this.isOnline) return;

    const pendingUpdates = await storage.getPendingUpdates();
    
    for (const update of pendingUpdates) {
      try {
        await this.updateStock(update);
        await storage.delete('pendingUpdates', update.id);
      } catch (error) {
        console.error('Failed to sync update:', error);
        // Continue with next update
      }
    }
  }

  // Activity Log - now uses Firestore
  async getActivityLog(pharmacyId: string): Promise<ActivityLog[]> {
    try {
      return await firebaseService.getActivityLog(pharmacyId);
    } catch (error) {
      console.error('Error fetching activity log from Firestore:', error);
      return [];
    }
  }

  // Registration Requests (Admin) - now uses Firestore
  async getRegistrationRequests(): Promise<RegistrationRequest[]> {
    try {
      return await firebaseService.getRegistrationRequests();
    } catch (error) {
      console.error('Error fetching registration requests from Firestore:', error);
      return [];
    }
  }

  async approveRegistrationRequest(requestId: string, adminNotes?: string, adminUser?: User): Promise<{ pharmacyId: string; credentials: { email: string; tempPassword: string }; emailSent: boolean; accountAlreadyExists: boolean }> {
    try {
      return await firebaseService.approveRegistrationRequest(requestId, adminNotes, adminUser);
    } catch (error) {
      console.error('Error approving registration request:', error);
      throw error;
    }
  }

  async rejectRegistrationRequest(requestId: string, reason: string): Promise<void> {
    try {
      return await firebaseService.rejectRegistrationRequest(requestId, reason);
    } catch (error) {
      console.error('Error rejecting registration request:', error);
      throw error;
    }
  }

  // Admin - Get all pharmacies - now uses Firestore
  async getPharmacies(): Promise<Pharmacy[]> {
    try {
      return await firebaseService.getPharmacies();
    } catch (error) {
      console.error('Error fetching pharmacies from Firestore:', error);
      return [];
    }
  }

  isOnlineStatus(): boolean {
    return this.isOnline;
  }
}

export const api = new ApiManager();