import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'danger';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(toastOrMessage: Omit<Toast, 'id'> | string, type: 'success' | 'error' | 'warning' | 'info' | 'danger' = 'info') {
    const normalizedType = type === 'danger' ? 'error' : type;
    if (typeof toastOrMessage === 'string') {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = {
        id,
        type: normalizedType,
        message: toastOrMessage,
        duration: 4000
      };
      this.toasts.update(list => [...list, newToast]);
      setTimeout(() => this.remove(id), 4000);
      return;
    }

    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toastOrMessage, id, duration: toastOrMessage.duration ?? 4000 };
    this.toasts.update(list => [...list, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newToast.duration);
    }
  }

  success(message: string, title: string = 'Success') {
    this.show({ type: 'success', title, message });
  }

  error(message: string, title: string = 'Error') {
    this.show({ type: 'error', title, message, duration: 6000 });
  }

  warning(message: string, title: string = 'Warning') {
    this.show({ type: 'warning', title, message });
  }

  info(message: string, title: string = 'Info') {
    this.show({ type: 'info', title, message });
  }

  remove(id: string) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
