import { useSyncExternalStore } from 'react';
import { Suplemento } from '@/services/api';

export type CartItem = {
  suplementoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
};

let _items: CartItem[] = [];
const _listeners = new Set<() => void>();

function emit() {
  _listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

function getSnapshot() {
  return _items;
}

export function addToCart(producto: Suplemento, cantidad = 1) {
  const existing = _items.find((i) => i.suplementoId === producto.id);
  const maxQty = producto.stock;

  if (existing) {
    _items = _items.map((i) =>
      i.suplementoId === producto.id
        ? { ...i, cantidad: Math.min(i.cantidad + cantidad, maxQty) }
        : i
    );
  } else {
    _items = [
      ..._items,
      {
        suplementoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: Math.min(cantidad, maxQty),
        stock: producto.stock,
      },
    ];
  }
  emit();
}

export function removeFromCart(suplementoId: number) {
  _items = _items.filter((i) => i.suplementoId !== suplementoId);
  emit();
}

export function setQuantity(suplementoId: number, cantidad: number) {
  if (cantidad <= 0) {
    removeFromCart(suplementoId);
    return;
  }
  _items = _items.map((i) =>
    i.suplementoId === suplementoId
      ? { ...i, cantidad: Math.min(cantidad, i.stock) }
      : i
  );
  emit();
}

export function clearCart() {
  _items = [];
  emit();
}

export function getCartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.cantidad, 0);
}

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
