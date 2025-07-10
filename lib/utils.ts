import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPriceRangeInRupiah(divisions: { price: string }[]) {
  const prices = divisions.map((d) =>
    Number(String(d.price).replace(/\./g, ""))
  );

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  return `${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)}`;
}

export function convertToRupiah(value: number | string) {
  const numericValue = typeof value === "string" 
    ? Number(value.replace(/\./g, "").replace(/,/g, "")) 
    : value;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numericValue);
}