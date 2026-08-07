import React, { useEffect } from 'react';
import { RxCross2 } from 'react-icons/rx';

// ─── Types ────────────────────────────────────────────────────────────────────
type AgreementData = Record<string, unknown>;

interface AgreementPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AgreementData | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert snake_case / camelCase keys to human-readable Title Case labels.
 * e.g. "bank_account_number" → "Bank Account Number"
 */
const formatKey = (key: string): string =>
  key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')   // camelCase split
    .replace(/\b\w/g, c => c.toUpperCase()) // capitalise each word
    .trim();

/**
 * Render a value safely.
 * Values that are ".", null, undefined or empty string → "-"
 */
const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '' || value === '.') {
    return '-';
  }
  return String(value);
};

// ─── Component ────────────────────────────────────────────────────────────────

const AgreementPreviewModal: React.FC<AgreementPreviewModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const entries = data ? Object.entries(data) : [];

  return (
    // Overlay — click outside to close
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      {/* Modal card — stop propagation so inner clicks don't close */}
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between rounded-t-xl border-b border-gray-200 bg-[#1A439A] px-6 py-4">
          <h2 className="text-xl font-bold tracking-wide text-white">
            Agreement Preview
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-white transition hover:bg-white/20"
            aria-label="Close modal"
          >
            <RxCross2 size={22} />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">
          {entries.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              No data available.
            </p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-1/2 border-b-2 border-[#1A439A] pb-2 text-left font-semibold text-[#1A439A]">
                    Field
                  </th>
                  <th className="w-1/2 border-b-2 border-[#1A439A] pb-2 text-left font-semibold text-[#1A439A]">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map(([key, value], index) => (
                  <tr
                    key={key}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-[#F3F5FA]'}
                  >
                    <td className="py-2 pr-4 font-medium text-[#4B5563]">
                      {formatKey(key)}
                    </td>
                    <td className="py-2 text-black">
                      {formatValue(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 justify-end rounded-b-xl border-t border-gray-200 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#1A439A] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#163280]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgreementPreviewModal;
