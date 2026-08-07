import { RxCross2 } from 'react-icons/rx';

interface RepresentativeAccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RepresentativeAccessDeniedModal = ({
  isOpen,
  onClose
}: RepresentativeAccessDeniedModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      aria-hidden={!isOpen}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
    >
      <div className="relative w-full max-w-md md:h-auto">
        <div className="relative rounded bg-white px-2 py-4 shadow-lg">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Access Denied
              </h3>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
              aria-label="Close modal"
            >
              <RxCross2 size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="mb-2 text-sm text-gray-700">
              <span className="font-semibold">
                Representative Mode Restriction
              </span>
            </p>
            <p className="text-sm leading-relaxed text-gray-600">
              This funding application cannot be accessed or modified because it
              was submitted in{' '}
              <span className="font-semibold">Representative mode</span>.
              Representative applications require special handling and cannot be
              edited through the standard form interface.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              type="button"
              className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepresentativeAccessDeniedModal;
