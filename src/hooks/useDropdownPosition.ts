import { useEffect, useState } from 'react';

export function useDropdownPosition(
  ref: React.RefObject<HTMLElement | null>,
  open: boolean,
  minSpaceBelow = 264,
): boolean {
  const [openUp, setOpenUp] = useState(false);

  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setOpenUp(window.innerHeight - rect.bottom < minSpaceBelow);
  }, [open, minSpaceBelow, ref]);

  return openUp;
}