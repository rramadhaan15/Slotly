'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
export function Choice({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => v !== null && onChange(String(v))}
      items={options}
    >
      <SelectTrigger aria-label={label} className="choice">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export async function api<T = Record<string, unknown>>(
  payload?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(
    '/api/slotly',
    payload
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      : { cache: 'no-store' },
  );
  const data = (await response.json()) as { error?: string };
  if (!response.ok)
    throw new Error(data.error ?? 'Koneksi bermasalah. Coba lagi.');
  return data as T;
}
export type Booking = {
  id: string;
  venue_id: string;
  unit: string;
  date: string;
  hour: number;
  price: number;
  paid: number;
  status: string;
  name: string;
  phone: string;
  created_at: number;
};
export type Notification = {
  id: string;
  action: string;
  created_at: number;
  booking_id: string;
};
