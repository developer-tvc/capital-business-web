import React, { useState, useEffect } from 'react';
import { bankAccountListingApi, loanFinanceEntryApi } from '../../../../api/financeManagerServices';
import useToast from '../../../../utils/hooks/toastify/useToast';
import { NotificationType } from '../../../../utils/hooks/toastify/enums';

interface BankAccount {
  id: string;
  gl_code: string;
  gl_name: string;
  is_active: boolean;
}

interface FinanceEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
}

const FinanceEntryModal: React.FC<FinanceEntryModalProps> = ({
  isOpen,
  onClose,
  loanId
}) => {
  const { showToast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchBankAccounts();
    }
  }, [isOpen]);

  const fetchBankAccounts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await bankAccountListingApi();
      console.log('Bank accounts API response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Bank accounts array:', response.data);
        setBankAccounts(response.data);
      } else {
        console.log('No bank accounts data found, response:', response);
        setBankAccounts([]);
        setError('No bank accounts found');
      }
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      setError('Failed to fetch bank accounts');
      showToast('Failed to fetch bank accounts', {
        type: NotificationType.Error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBankAccountId) {
      setError('Please select a bank account');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await loanFinanceEntryApi(loanId, {
        bank_account_id: selectedBankAccountId,
        partner_type: 'LOAN_CUSTOMERS'
      });

      if (response.success || response.status === 'success' || response.data) {
        showToast('Finance entry added successfully', {
          type: NotificationType.Success
        });
        onClose();
        setSelectedBankAccountId('');
      } else {
        throw new Error('Failed to add finance entry');
      }
    } catch (err) {
      console.error('Error adding finance entry:', err);
      setError('Failed to add finance entry');
      showToast('Failed to add finance entry', {
        type: NotificationType.Error
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedBankAccountId('');
    setError('');
  };

  const getBankAccountDisplay = (account: BankAccount) => {
    if (account.gl_name && account.gl_code) {
      return `${account.gl_name} (${account.gl_code})`;
    }
    if (account.gl_name) {
      return account.gl_name;
    }
    if (account.gl_code) {
      return account.gl_code;
    }
    return `Account ${account.id}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50">
      <div className="relative mx-auto max-w-md w-full rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Finance Entry
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Select a bank account to add finance entry
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="bankAccount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Bank Account *
            </label>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading...</span>
              </div>
            ) : (
              <select
                id="bankAccount"
                value={selectedBankAccountId}
                onChange={(e) => {
                  setSelectedBankAccountId(e.target.value);
                  setError('');
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="">Select a bank account</option>
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {getBankAccountDisplay(account)}
                  </option>
                ))}
              </select>
            )}
            
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedBankAccountId || isSubmitting || isLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinanceEntryModal;
