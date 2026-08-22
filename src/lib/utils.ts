export function cn(...inputs: any[]) {
  return inputs.flatMap((i) => typeof i === 'string' ? i : i && typeof i === 'object' ? Object.entries(i).filter(([, v]) => v).map(([k]) => k) : []).filter(Boolean).join(' ')
}
