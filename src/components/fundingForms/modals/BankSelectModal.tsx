import { useEffect, useState } from 'react';
import { RxCross2 } from 'react-icons/rx';

import { bankAccountListingApi } from '../../../api/financeManagerServices';
import { NotificationType } from '../../../utils/hooks/toastify/enums';
import useToast from '../../../utils/hooks/toastify/useToast';

interface BankSelectModalProps {
  isOpen: boolean;
  close: () => void;
  onBankSelect: (bankAccountId: string) => void;
}

const BankSelectModal: React.FC<BankSelectModalProps> = ({
  isOpen,
  close,
  onBankSelect
}) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const fetchBankAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await bankAccountListingApi();
      if (response.status_code >= 200 && response.status_code < 300) {
        const fetchedBanks = response.data.map(bank => ({
          id: bank.id,
          display: `${bank.bank_name} - ${bank.account_number}`,
          bank_name: bank.bank_name,
          account_number: bank.account_number
        }));
        setBankAccounts(fetchedBanks);
      } else {
        showToast('Failed to fetch bank accounts.', {
          type: NotificationType.Error
        });
      }
    } catch (error) {
      showToast('An error occurred while fetching bank accounts.', {
        type: NotificationType.Error
      });
      console.error('Error during API call:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBankAccounts();
    }
  }, [isOpen]);

  const handleBankSelect = (bankAccountId: string) => {
    setSelectedBankId(bankAccountId);
  };

  const handleSubmit = () => {
    if (selectedBankId) {
      onBankSelect(selectedBankId);
      close();
    } else {
      showToast('Please select a bank account', {
        type: NotificationType.Error
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
    >
      <div className="relative w-full max-w-[800px] md:h-auto">
        <div className="relative min-h-[50vh] bg-white p-4 shadow">
          <h2 className="mb-4 text-xl font-bold">Select Bank Account</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading bank accounts...</div>
            </div>
          ) : (
            <div className="my-4 max-h-[60vh] overflow-auto">
              {bankAccounts.length > 0 ? (
                bankAccounts.map(bank => (
                  <div
                    key={bank.id}
                    onClick={() => handleBankSelect(bank.id)}
                    className={`border-bottom-2 w-full cursor-pointer border p-4 hover:bg-gray-100 ${
                      selectedBankId === bank.id ? 'bg-gray-200' : ''
                    }`}
                  >
                    {bank.display}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No bank accounts available
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={close}
              type="button"
              className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              type="button"
              disabled={!selectedBankId}
              className={`rounded px-4 py-2 text-white ${
                selectedBankId
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'cursor-not-allowed bg-gray-400'
              }`}
            >
              Submit
            </button>
          </div>

          <button
            onClick={close}
            type="button"
            className="absolute right-2 top-2 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-400"
          >
            <RxCross2 size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankSelectModal;
