import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const getFaviconUrl = (url) => {
  try {
    if(!url || !url.startsWith('http')) return 'https://via.placeholder.com/64';
    const urlObject = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObject.hostname}&sz=64`;
  } catch (e) {
    return 'https://via.placeholder.com/64';
  }
};