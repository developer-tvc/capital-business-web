import { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { resentRequisitionAPI } from '../../../api/loanServices';
import { NotificationType } from '../../../utils/hooks/toastify/enums';
import useToast from '../../../utils/hooks/toastify/useToast';
import Loader from '../../Loader';

interface RevokedRequisitionModalProps {
  onClose: () => void;
  statement: {
    institution_id: string;
    bank_name: string;
    requisition_id: string;
  };
  loanId: string;
  onSuccess: () => void;
}

const RevokedRequisitionModal: React.FC<RevokedRequisitionModalProps> = ({
  onClose,
  statement,
  loanId,
  onSuccess
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      showToast('Please enter a reason', { type: NotificationType.Error });
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        institution_id: statement.institution_id,
        bank_name: statement.bank_name,
        requisition_id: statement.requisition_id,
        reason: reason.trim()
      };

      const response = await resentRequisitionAPI(loanId, payload);

      if (response.status_code === 200) {
        showToast(
          response.status_message || 'Requisition revoked successfully',
          { type: NotificationType.Success }
        );
        onSuccess();
        onClose();
      } else {
        showToast(
          response.status_message || 'Failed to revoke requisition',
          { type: NotificationType.Error }
        );
      }
    } catch (error) {
      showToast(error.message || 'Something went wrong!', {
        type: NotificationType.Error
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50">
          <Loader />
        </div>
      )}
      <div className="relative w-full max-w-md md:h-auto">
        <div className="relative bg-white px-2 shadow">
          <div className="flex justify-end px-4 pt-6">
            <p className="my-1 text-[15px] font-medium">
              Revoke Requisition
            </p>
            <button
              onClick={onClose}
              type="button"
              className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-400"
            >
              <RxCross2 size={24} />
            </button>
          </div>
          <form
            onSubmit={handleSubmit}
            className="px-4 pb-6 text-[#000000]"
          >
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Bank: <span className="font-semibold">{statement.bank_name}</span>
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 p-2">
              <label className="text-sm font-medium text-gray-700">
                Reason for Revocation *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason (e.g., personal bank account)"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4 py-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-[12px] font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer rounded border border-blue-700 bg-blue-900 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RevokedRequisitionModal;
