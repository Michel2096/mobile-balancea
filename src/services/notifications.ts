import { useSyncExternalStore } from 'react';
import { notificacionesApi } from '@/services/api';

let _unreadCount = 0;
const _listeners = new Set<() => void>();

function emit() {
  _listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

function getSnapshot() {
  return _unreadCount;
}

export function setUnreadCount(count: number) {
  _unreadCount = count;
  emit();
}

export async function refreshUnreadCount() {
  try {
    const data = await notificacionesApi.getContador();
    setUnreadCount(data.total_no_leidas);
  } catch {
    // Usuario sin sesión o backend inalcanzable: se ignora silenciosamente.
  }
}

export function useUnreadCount() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
