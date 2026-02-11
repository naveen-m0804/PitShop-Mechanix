import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isShopOpen(openTime: string, closeTime: string): boolean {
  if (!openTime || !closeTime) return true;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);
  
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  // Handle overnight hours (e.g. 21:00 to 09:00)
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
  }
  
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

export function formatTime12Hour(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    
    if (isNaN(h) || isNaN(m)) return time;

    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m < 10 ? '0' + m : m} ${ampm}`;
}
