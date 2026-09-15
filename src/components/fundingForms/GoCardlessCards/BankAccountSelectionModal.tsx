import { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';

import { NotificationType } from '../../../utils/hooks/toastify/enums';
import useToast from '../../../utils/hooks/toastify/useToast';

interface BankAccount {
  iban: string;
  account_id: string;
}

interface BankAccountSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccounts: BankAccount[];
  onDownload: (accountId: string) => Promise<void>;
}

const BankAccountSelectionModal: React.FC<BankAccountSelectionModalProps> = ({
  isOpen,
  onClose,
  bankAccounts,
  onDownload
}) => {
  const { showToast } = useToast();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!selectedAccountId) {
      showToast('Please select a bank account', {
        type: NotificationType.Error
      });
      return;
    }

    setIsDownloading(true);
    try {
      await onDownload(selectedAccountId);
      onClose();
      setSelectedAccountId(null);
    } catch (error) {
      showToast('Failed to download bank details', {
        type: NotificationType.Error
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancel = () => {
    setSelectedAccountId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-[80%] max-w-[500px] rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-lg font-semibold">Download Bank Details</h3>
          <button
            onClick={handleCancel}
            className="rounded-lg bg-transparent p-1.5 text-gray-400 hover:bg-gray-200"
          >
            <RxCross2 size={24} />
          </button>
        </div>

        <div className="py-4">
          <p className="mb-4 text-sm font-medium">Select Bank Account</p>
          {bankAccounts.length === 0 ? (
            <p className="text-sm text-gray-500">No bank accounts available for download.</p>
          ) : (
            <div className="space-y-2">
              {bankAccounts.map(account => (
                <label
                  key={account.account_id}
                  className="flex cursor-pointer items-center space-x-3 rounded border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="bankAccount"
                    value={account.account_id}
                    checked={selectedAccountId === account.account_id}
                    onChange={e => setSelectedAccountId(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{account.iban}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 border-t pt-4">
          <button
            onClick={handleCancel}
            disabled={isDownloading}
            className="rounded-lg bg-gray-300 px-4 py-2 font-bold text-black hover:bg-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={!selectedAccountId || isDownloading}
            className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankAccountSelectionModal;
