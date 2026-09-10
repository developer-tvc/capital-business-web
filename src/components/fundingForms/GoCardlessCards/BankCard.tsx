import { useState } from 'react';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { useSelector } from 'react-redux';

import {
  downloadBankDetailsApi,
  primaryBankAccountApi
} from '../../../api/loanServices';
import build from '../../../assets/svg/gocard_bank.svg';
import { authSelector } from '../../../store/auth/userSlice';
import { declarationCheckboxStyle } from '../../../utils/constants';
import { FundingFromCurrentStatus, Roles } from '../../../utils/enums';
import { NotificationType } from '../../../utils/hooks/toastify/enums';
import useToast from '../../../utils/hooks/toastify/useToast';
import RevokedRequisitionModal from './RevokedRequisitionModal';
// OLD IMPLEMENTATION - kept for reference
// import BankDetails from '../../customerDocuments/BankDetails';

const BankCard = ({
  statement,
  setSelectedStatement,
  setShowModal,
  isHigherAuthority,
  seuUpdatedPrimaryAccount,
  setIsGocardless,
  isFundingInProgress,
  loanId,
  onRevokeSuccess,
  fundingFormStatus
}) => {
  const { role } = useSelector(authSelector);
  const { showToast } = useToast();
  const [showRevokedModal, setShowRevokedModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  // OLD IMPLEMENTATION - kept for reference
  // const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);

  const getStyle = () => {
    if (isHigherAuthority && !isFundingInProgress) {
      if (statement.continue_with_gocardless === false) {
        return {
          border:
            statement?.all_grouped && statement.end_date && statement.start_date
              ? '1px solid green'
              : '1px solid tomato'
        };
      }
      return {
        border: statement?.all_grouped ? '1px solid green' : '1px solid tomato'
      };
    } else {
      return { border: '1px solid gray' };
    }
  };

  const handlePrimaryBankAccount = async () => {
    try {
      const payload = {
        is_primary_account: !statement.is_primary_account // Toggle the value
      };

      const loanGetApiResponse = await primaryBankAccountApi(
        statement.statement_id,
        payload
      );

      if (loanGetApiResponse.status_code === 200) {
        seuUpdatedPrimaryAccount(prevState => !prevState);
        showToast('Primary bank account set successfully', {
          type: NotificationType.Success
        });
      } else {
        showToast(loanGetApiResponse.status_message, {
          type: NotificationType.Error
        });
      }
    } catch (error) {
      console.error('Exception', error);
      showToast('Something went wrong!', { type: NotificationType.Error });
    }
  };

  // OLD IMPLEMENTATION - kept for reference (dummy data download)
  // const handleDownloadBankDetails = async () => {
  //   setIsDownloading(true);
  //   try {
  //     // Dummy API delay
  //     await new Promise(resolve => setTimeout(resolve, 1500));
  //
  //     const dummyResponse = {
  //       bank_name: statement.bank_name || 'HSBC Business',
  //       account_holder_name: statement.account_holder_name || 'DSIM DISTRIBUTION LTD',
  //       account_number: statement.bank_account_number || '30263893',
  //       statement_start_date: statement.start_date || '2026-05-18',
  //       statement_end_date: statement.end_date || '2026-08-12'
  //     };
  //
  //     const blob = new Blob([JSON.stringify(dummyResponse, null, 2)], {
  //       type: 'application/json'
  //     });
  //     const url = URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = 'bank-details.json';
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     URL.revokeObjectURL(url);
  //
  //     setDownloadSuccess(true);
  //     showToast('Bank details downloaded successfully', {
  //       type: NotificationType.Success
  //     });
  //   } catch (error) {
  //     showToast('Failed to download bank details', {
  //       type: NotificationType.Error
  //     });
  //     setDownloadSuccess(false);
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };

  // NEW IMPLEMENTATION - using real bank_details_download/<loan_id> API
  const handleDownloadBankDetails = async () => {
    setIsDownloading(true);
    try {
      const response = await downloadBankDetailsApi(loanId);

      if (response?.status_code && response.status_code >= 400) {
        showToast(response.status_message || 'Failed to download bank details', {
          type: NotificationType.Error
        });
        setDownloadSuccess(false);
        return;
      }

      let blob: Blob;
      if (response instanceof Blob) {
        blob = response;
      } else {
        const downloadContent =
          response?.data !== undefined ? response.data : response;
        const fileData =
          typeof downloadContent === 'string'
            ? downloadContent
            : JSON.stringify(downloadContent, null, 2);
        blob = new Blob([fileData], { type: 'application/json' });
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bank-details-${statement.bank_name || loanId || 'download'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      showToast('Bank details downloaded successfully', {
        type: NotificationType.Success
      });
    } catch (error) {
      console.error('Failed to download bank details', error);
      showToast('Failed to download bank details', {
        type: NotificationType.Error
      });
      setDownloadSuccess(false);
    } finally {
      setIsDownloading(false);
    }
  };



console.log("BANK:", statement.bank_name, {
  continue_with_gocardless: statement.continue_with_gocardless,
  institution_id: statement.institution_id,
  requisition_id: statement.requisition_id
});
// ---- TEST / SANDBOX BANK ----
const isTestBank = Boolean(
  statement?.institution_id?.includes("SANDBOX")
);

// ---- ROLES (ONLY THESE CAN SEE) ----
const allowRoles = [
  Roles.Admin,
  Roles.UnderWriter,
  Roles.Manager
].includes(role);

// Hide ONLY when status is Inprogress
const isInProgress =
  fundingFormStatus === FundingFromCurrentStatus.Inprogress;

// ---- FINAL DECISION ----
const showThreeDots =
  allowRoles &&
  !isTestBank &&
  !isInProgress;



  return (
    <div
      style={getStyle()}
      className="relative flex flex-col justify-between gap-2 rounded-lg border bg-white p-4 shadow-md"
    >
      <div className="text-[14px] font-medium leading-6">
        {statement.continue_with_gocardless
          ? 'With Gocardless'
          : 'With out Gocardless'}
      </div>
      <div className="bg-white-300 flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3 hidden items-center justify-center rounded-full border-4 border-white bg-[#E8E8E8] p-3 text-xl font-semibold text-[#1A439A] sm:flex">
            <img src={build} className="h-5 w-5" />
          </div>
          <div className="text-[14px] font-medium leading-6">
            <p className="text-[12px] font-semibold text-[#929292]">
              {'Bank name'}
            </p>
            {statement.bank_name || 'Company Name'}
          </div>
        </div>
        <div className="text-[14px] font-medium leading-6">
          <p className="text-[12px] font-semibold text-[#929292]">
            {'Account Holder Name'}
          </p>
          {statement.account_holder_name || 'N/A'}
        </div>

        <div className="text-[14px] font-medium leading-6">
          <p className="text-[12px] font-semibold text-[#929292]">
            {'Account Number'}
          </p>
          {statement.bank_account_number || 'N/A'}
        </div>
        <div className="mr-8 mt-4 flex items-center">
          <label
            htmlFor="setPrimaryBankAccount"
            className={`flex cursor-pointer items-center ${declarationCheckboxStyle.wrapperClass} `}
          >
            <span className={`${declarationCheckboxStyle.labelClass} mr-2`}>
              {'Primary'}
            </span>
            <input
              id="setPrimaryBankAccount"
              type="checkbox"
              onChange={handlePrimaryBankAccount}
              disabled={
                ![Roles.UnderWriter, Roles.Manager, Roles.Admin].includes(role)
              } // only allow befor disbursal
              checked={statement?.is_primary_account}
              className={` ${declarationCheckboxStyle.fieldClass}`}
            />
          </label>
        </div>

        {showThreeDots && (
          <div className="cursor-not-allowed opacity-50">
            <HiOutlineDotsHorizontal size={32} color="#929292" />
          </div>
        )}
      </div>

      <div className="m-4 flex justify-between">
        {statement.start_date && statement.end_date && (
          <span>
            {' '}
            <p className="text-[12px] font-semibold text-[#929292]">
              {'Statement Date'}
            </p>
            <div className="my-3 flex items-center text-[16px] font-semibold max-sm:text-[12px]">
              <span>
                {' '}
                {statement.start_date}{' '}
                <a className="mx-2 text-[14px] font-medium text-[#929292] max-sm:text-[12px]">
                  {'TO'}{' '}
                </a>
                {statement.end_date}
              </span>
            </div>
          </span>
        )}

        {statement.total_periods && (
          <span>
            <p className="text-[12px] font-semibold text-[#929292]">
              {'Total periods'}
            </p>{' '}
            <div className="my-3">{statement.total_periods}</div>
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        {statement.continue_with_gocardless && 
         statement.institution_id && 
         statement.requisition_id && 
         isFundingInProgress &&
         [Roles.Manager, Roles.Admin, Roles.UnderWriter].includes(role) && (
          <button
            onClick={() => setShowRevokedModal(true)}
            className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Revoke Requisition
          </button>
        )}
        
        <button
          onClick={handleDownloadBankDetails}
          disabled={isDownloading}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? 'Downloading...' : 'Download Bank Details'}
        </button>

        {/* OLD IMPLEMENTATION - kept for reference */}
        {/* <button
          onClick={() => {
            setSelectedStatement(statement);
            setShowModal(true);
            setIsGocardless(statement.continue_with_gocardless);
          }}
          disabled={!downloadSuccess}
          className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Sort Data
        </button> */}

        {/* NEW IMPLEMENTATION */}
        <button
          onClick={() => {
            setSelectedStatement(statement);
            setShowModal(true);
            setIsGocardless(false);
          }}
          disabled={!downloadSuccess}
          className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Sort Data
        </button>
      </div>

      {/* Revoked Requisition Modal */}
      {showRevokedModal && (
        <RevokedRequisitionModal
          onClose={() => setShowRevokedModal(false)}
          statement={{
            institution_id: statement.institution_id,
            bank_name: statement.bank_name,
            requisition_id: statement.requisition_id
          }}
          loanId={loanId}
          onSuccess={onRevokeSuccess}
        />
      )}
    </div>
  );
};

export default BankCard;
