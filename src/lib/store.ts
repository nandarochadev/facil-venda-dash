import { useEffect, useState } from "react";

export type Product = {
  code: string;
  name: string;
  category: "Bebida" | "Doce" | "Salgado";
  price: number;
  stock: number;
  emoji: string;
};

export type Sale = {
  id: string;
  date: string; // ISO
  items: { code: string; name: string; price: number; qty: number }[];
  total: number;
  payment: "Cartão" | "Pix" | "Dinheiro";
};

export type Settings = {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  endereco: string;
  email: string;
};

const PRODUCTS_KEY = "vf_products";
const SALES_KEY = "vf_sales";
const SETTINGS_KEY = "vf_settings";
const PASSWORD_KEY = "vf_password";

export const defaultProducts: Product[] = [
  { code: "BEB001", name: "Café Expresso", category: "Bebida", price: 5.5, stock: 15, emoji: "☕" },
  { code: "DOC001", name: "Chocolate", category: "Doce", price: 3.5, stock: 27, emoji: "🍫" },
  { code: "BEB003", name: "Àgua", category: "Bebida", price: 2.5, stock: 30, emoji: "💧" },
  { code: "SAL002", name: "Sanduíche", category: "Salgado", price: 9.0, stock: 8, emoji: "🥪" },
  { code: "BEB002", name: "Suco", category: "Bebida", price: 3.0, stock: 12, emoji: "🧃" },
  { code: "SAL001", name: "Salgadinho", category: "Salgado", price: 5.0, stock: 10, emoji: "🍿" },
  { code: "BEB004", name: "Refrigerante", category: "Bebida", price: 6.0, stock: 18, emoji: "🥤" },
  { code: "DOC002", name: "Bolo", category: "Doce", price: 9.0, stock: 20, emoji: "🍰" },
  { code: "SAL003", name: "Salgados", category: "Salgado", price: 8.0, stock: 14, emoji: "🥟" },
];

const defaultSettings: Settings = {
  razaoSocial: "VendaFácil Comércio LTDA",
  nomeFantasia: "VendaFácil",
  cnpj: "00.000.000/0001-00",
  inscricaoEstadual: "ISENTO",
  endereco: "Rua Exemplo, 123 - Centro",
  email: "contato@vendafacil.com",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("vf-store"));
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() => read(PRODUCTS_KEY, defaultProducts));
  useEffect(() => {
    const onChange = () => setProducts(read(PRODUCTS_KEY, defaultProducts));
    window.addEventListener("vf-store", onChange);
    return () => window.removeEventListener("vf-store", onChange);
  }, []);
  return {
    products,
    setProducts: (p: Product[]) => write(PRODUCTS_KEY, p),
  };
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>(() => read(SALES_KEY, []));
  useEffect(() => {
    const onChange = () => setSales(read(SALES_KEY, []));
    window.addEventListener("vf-store", onChange);
    return () => window.removeEventListener("vf-store", onChange);
  }, []);
  return {
    sales,
    addSale: (s: Sale) => write(SALES_KEY, [s, ...read<Sale[]>(SALES_KEY, [])]),
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => read(SETTINGS_KEY, defaultSettings));
  useEffect(() => {
    const onChange = () => setSettings(read(SETTINGS_KEY, defaultSettings));
    window.addEventListener("vf-store", onChange);
    return () => window.removeEventListener("vf-store", onChange);
  }, []);
  return {
    settings,
    setSettings: (s: Settings) => write(SETTINGS_KEY, s),
  };
}

export function getPassword(): string {
  if (typeof window === "undefined") return "admin";
  return localStorage.getItem(PASSWORD_KEY) ?? "admin";
}

export function setPassword(p: string) {
  localStorage.setItem(PASSWORD_KEY, p);
}

export const formatBRL = (v: number) =>
  `R$ ${v.toFixed(2).replace(".", ",")}`;
