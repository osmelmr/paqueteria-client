export function toLocalDateInput(date?: string | null): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function dateInputToIso(dateInput?: string): string | undefined {
  if (!dateInput) return undefined;
  const d = new Date(`${dateInput}T00:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function todayDateInput(): string {
  return toLocalDateInput(new Date().toISOString());
}
