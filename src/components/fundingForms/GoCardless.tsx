import { useEffect, useRef, useState } from 'react';
import { FaClosedCaptioning } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchgocardlessStatementGroupedApi,
  gocardlessStatementGroupedApi,
  uwVerifyGetApi
  // updateContinueWithGocardlessApi
} from '../../api/loanServices';
import { authSelector } from '../../store/auth/userSlice';
import {
  updateCurrentStage,
  updateGocardlessButton
} from '../../store/fundingStateReducer';
import { loanFormCommonStyleConstant } from '../../utils/constants';
import { FundingFromCurrentStatus, Roles } from '../../utils/enums';
import { updateFilledForms } from '../../utils/helpers';
import { NotificationType } from '../../utils/hooks/toastify/enums';
import useToast from '../../utils/hooks/toastify/useToast';
import useAuth from '../../utils/hooks/useAuth';
import { LoanFromCommonProps } from '../../utils/types';
import BankDetails from '../customerDocuments/BankDetails';
import GrandGocardless from '../customerDocuments/GrandGocardless';
import Header from '../management/common/Header';
import BankCard from './GoCardlessCards/BankCard';
import GoCardlessModal from './GoCardlessCards/GoCardlessModal';
import Loader from '../Loader';

const GoCardLess: React.FC<LoanFromCommonProps> = ({
  setRef,
  loanId,
  fundingFormStatus,
  setStatueUpdate
}) => {
  const { authenticated } = useAuth();
  const dispatch = useDispatch();
  const formRef = useRef<HTMLFormElement>(null);
  if (setRef) {
    setRef(formRef);
  }
  const { role } = useSelector(authSelector);
  const { showToast } = useToast();

  const [gocardlessData, setGocardlessData] = useState([]);
  const [withoutGocardlessData, setWithoutGocardlessData] = useState([]);

  const [isSendConsent, setIsSendConsent] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isUpdatedPrimaryAccount, setUpdatedPrimaryAccount] = useState(false);
  const [continueWithGocardless, setContinueWithGocardless] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const isHigherAuthority = ![
    Roles.Customer,
    Roles.Leads,
    Roles.FieldAgent,
    Roles.FinanceManager
  ].includes(role);
  const isFundingInProgress = [
    FundingFromCurrentStatus.Inprogress,
    FundingFromCurrentStatus.UnderwriterReturned
  ].includes(fundingFormStatus);
  const [isBankDetailsAdded, setIsBankDetailsAdded] = useState(false);
  const [isGocardless, setIsGocardless] = useState(false);
  const [institutionId, setInstitutionId] = useState(false);
  const [requisitionLink, setRequisitionLink] = useState('');
  const [updateRequisitionLink, setUpdateRequisitionLink] = useState(false);

  const fetchGocardlessStatementApi = async loanId => {
    try {
      const response = await fetchgocardlessStatementGroupedApi(loanId);
      if (response?.status_code >= 200 && response?.status_code < 300) {
        setIsGocardless(response.data.continue_with_gocardless);
        setContinueWithGocardless(response.data.continue_with_gocardless);
        const dataWithId = response.data.bank_details
          .filter(
            item =>
              item?.gocardless_status &&
              !item?.continue_with_gocardless === false
          )
          .map(i => ({ ...i, statement_id: i.id }));
        const gocardlessBanks = response.data.bank_details.filter(
          item => item?.continue_with_gocardless === true
        );

        const dataWithoutGocardless = response.data.bank_details
          .filter(item => item?.continue_with_gocardless === false)
          .map(i => ({ ...i, statement_id: i.id }));
        setWithoutGocardlessData(dataWithoutGocardless);
        if (gocardlessBanks.length > 0) {
          setInstitutionId(gocardlessBanks[0].institution_id);
          setRequisitionLink(gocardlessBanks[0].requisition_link);
        }
        setGocardlessData(dataWithId);
        dispatch(updateGocardlessButton(true));
      } else {
        showToast(response.status_message || 'Error fetching statements', {
          type: NotificationType.Error
        });
      }
    } catch (error) {
      console.error('Error fetching statements:', error);
      showToast('Something went wrong!', { type: NotificationType.Error });
    }
  };

  const fetchUwVerify = async () => {
    try {
      const response = await uwVerifyGetApi(loanId);
      return response.status_code === 200
        ? response.data.underwriter_verified_forms || {}
        : null;
    } catch {
      showToast('Something went wrong!', { type: NotificationType.Error });
      return null;
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // await handleCheckbox();
    const uwVerifyData = await fetchUwVerify();
    if (!uwVerifyData) return;

    if (isHigherAuthority) {
      //for uw ,admin,manager
      const allVerified = Object.entries(uwVerifyData)
        .filter(([key]) => key !== 'complete_contract')
        .every(([, value]) => value === true);

      const allItemsGrouped = [
        ...(gocardlessData || []),
        ...(withoutGocardlessData || [])
      ].every(item => item?.all_grouped);

      if (!allItemsGrouped) {
        showToast('Please sort the statements.', {
          type: NotificationType.Error
        });
      } else if (!allVerified) {
        showToast(
          role === Roles.UnderWriter
            ? 'Please verify the forms.'
            : 'Please reach out to an Underwriter for form verification.',
          { type: NotificationType.Error }
        );
      } else {
        await submitGrouped();
      }
    }
  };

  const submitGrouped = async () => {
    try {
      setIsLoading(true);
      const response = await gocardlessStatementGroupedApi(
        continueWithGocardless ? gocardlessData : withoutGocardlessData,
        loanId
      );
      if (response?.status_code === 200) {
        showToast('Statement sorting completed', {
          type: NotificationType.Success
        });
        updateFilledForms(loanId, { gocardless_statement: true });

        if ([Roles.Admin, Roles.Manager, Roles.UnderWriter].includes(role)) {
          setTimeout(() => dispatch(updateCurrentStage(10)), 1500);
        }
      } else {
        showToast('Error while submitting grouped statements', {
          type: NotificationType.Error
        });
      }
    } catch {
      showToast('Error while submitting grouped statements', {
        type: NotificationType.Error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sortTransactionCheckpoint = async (isToast = false) => {
    try {
      setIsLoading(true);
      const response = await gocardlessStatementGroupedApi(
        isGocardless ? gocardlessData : withoutGocardlessData,
        loanId
      );
      if (response?.status_code === 200) {
        if (isToast) {
          showToast('Statement sorting Saved Successfully', {
            type: NotificationType.Success
          });
        }
      } else {
        showToast('Error while submitting grouped statements', {
          type: NotificationType.Error
        });
      }
    } catch {
      showToast('Error while submitting grouped statements', {
        type: NotificationType.Error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderBankCards = (data, isHigherAuthority) => (
    <div className="my-2 grid gap-4 max-lg:grid-cols-1 max-md:grid-cols-1">
      {data.length > 0 ? (
        data.map(statement => (
          <BankCard
            setIsGocardless={setIsGocardless}
            key={statement.statement_id}
            isHigherAuthority={isHigherAuthority}
            setSelectedStatement={setSelectedStatement}
            setShowModal={setShowModal}
            statement={statement}
            seuUpdatedPrimaryAccount={setUpdatedPrimaryAccount}
            isFundingInProgress={isFundingInProgress}
          />
        ))
      ) : (
        <div className="m-4 flex items-center text-amber-500">
          <FaClosedCaptioning className="mr-2" />
          <span>{'Pending'}</span>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (authenticated && loanId) fetchGocardlessStatementApi(loanId);
    if (setStatueUpdate) {
      setStatueUpdate(prev => !prev);
    }
  }, [
    authenticated,
    loanId,
    isSendConsent,
    isUpdatedPrimaryAccount,
    isBankDetailsAdded,
    showModal,
    updateRequisitionLink
  ]);

  useEffect(() => {
    const allGrouped = [...gocardlessData, ...withoutGocardlessData].every(
      i => i?.all_grouped
    );
    dispatch(updateGocardlessButton(!allGrouped));
  }, [gocardlessData, withoutGocardlessData]);

  // const handleCheckbox = async () => {
  //   try {
  //     setIsLoading(true);
  //     const response = await updateContinueWithGocardlessApi(
  //       {
  //         continue_with_gocardless: continueWithGocardless
  //       },
  //       loanId
  //     );
  //     if (response?.status_code !== 200) {
  //       showToast('Error while updated continue with gocardless', {
  //         type: NotificationType.Error
  //       });
  //     }
  //   } catch {
  //     showToast('Error while updated continue with gocardless', {
  //       type: NotificationType.Error
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className="grid w-full grid-cols-1 px-4">
      {isLoading && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
        >
          <Loader />
        </div>
      )}
      <form
        ref={formRef}
        className="relative mt-2 px-4"
        onSubmit={handleSubmit}
      />
      {isFundingInProgress && (
        <>
          <div className="col-span-full block w-full rounded-lg border border-[#1A439A] bg-[#F3F5FA] p-4 text-[12px] text-[#1A439A]">
            <input
              type="checkbox"
              checked={continueWithGocardless}
              onChange={e => setContinueWithGocardless(e.target.checked)}
              className={loanFormCommonStyleConstant.checkbox.fieldClass}
            />
            <label
              htmlFor="continue_with_gocardless"
              className={loanFormCommonStyleConstant.checkbox.labelClass}
            >
              {'Continuing with GoCardless'}
            </label>
          </div>
          {continueWithGocardless ? (
            <>
              <Header title="GoCardless" />
              <GrandGocardless
                setIsSendConsent={setIsSendConsent}
                loanId={loanId}
                oldInstitutionId={institutionId}
                oldRequisitionLink={requisitionLink}
                setUpdateRequisitionLink={setUpdateRequisitionLink}
              />
            </>
          ) : (
            <>
              <Header title="Bank Details" />
              <BankDetails
                setIsBankDetailsAdded={setIsBankDetailsAdded}
                loanId={loanId}
              />
            </>
          )}
        </>
      )}

      {showModal && (
        <GoCardlessModal
          isGocardless={isGocardless}
          onClose={() => {
            setShowModal(false);
          }}
          selectedId={selectedStatement?.id}
          setGocardlessData={setGocardlessData}
          gocardlessData={gocardlessData}
          withoutGocardlessData={withoutGocardlessData}
          setWithoutGocardlessData={setWithoutGocardlessData}
          sortTransactionCheckpoint={sortTransactionCheckpoint}
        />
      )}
      <p className="mb-4 pr-4 text-[20px] font-semibold text-[#000000] max-sm:text-[18px]">
        {'Statements Granted'}
      </p>
      {renderBankCards(
        [...gocardlessData, ...withoutGocardlessData],
        isHigherAuthority
      )}
      {isHigherAuthority && isFundingInProgress && (
        <span className="text-sm font-semibold text-red-600">
          * Disclaimer: If no agent is assigned, please ask the customer to
          submit the form.
        </span>
      )}
    </div>
  );
};

export default GoCardLess;
