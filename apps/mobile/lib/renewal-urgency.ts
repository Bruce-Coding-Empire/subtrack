export type RenewalUrgency = "error" | "warning" | "info" | null;

export function getRenewalUrgency(nextRenewalDate: string, now: Date = new Date()): RenewalUrgency {
  const [year, month, day] = nextRenewalDate.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysUntil = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return "error";
  if (daysUntil <= 7) return "warning";
  if (daysUntil <= 30) return "info";
  return null;
}
