"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
export default function Modal({
  children,
  title,
  closeLabel,
  onClose,
  kind = "",
}: {
  children: ReactNode;
  title: string;
  closeLabel: string;
  onClose: () => void;
  kind?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${kind}`}
      aria-label={title}
      onCancel={onClose}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((element) => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        <button
          className="icon-button modal-close"
          aria-label={closeLabel}
          onClick={onClose}
        >
          <X size={21} />
        </button>
        {children}
      </div>
    </dialog>
  );
}
