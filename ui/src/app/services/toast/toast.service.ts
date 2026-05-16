import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toast = signal<ToastMessage | null>(null);

  show(message: string, type: ToastType = 'success') {
    this.toast.set({ message, type });
    setTimeout(() => {
      this.toast.set(null);
    }, 3000);
  }
}
