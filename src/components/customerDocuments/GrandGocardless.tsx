import { useCallback, useEffect, useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { LuRefreshCw } from 'react-icons/lu';
import { RiArrowDownSLine } from 'react-icons/ri';
import { TbAlignBoxLeftStretch } from 'react-icons/tb';
import { useSelector } from 'react-redux';

import {
  confirmBankAccountGetApi,
  confirmBankAccountPostApi,
  createRequisitionLinkApi,
  gocardlessBankListApi
} from '../../api/loanServices';
import bank from '../../assets/svg/bank.svg';
import { authSelector } from '../../store/auth/userSlice';
// import { updateFilledForms } from "../../utils/helpers";
import { Roles } from '../../utils/enums';
import { NotificationType } from '../../utils/hooks/toastify/enums';
import useToast from '../../utils/hooks/toastify/useToast';
import Loader from '../Loader';

const GrandGocardless = ({
  setIsSendConsent,
  loanId,
  oldInstitutionId,
  oldRequisitionLink,
  setUpdateRequisitionLink
}) => {
  const { showToast } = useToast();
  const { role } = useSelector(authSelector);

  const [bankList, setBankList] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [showBanks, setShowBanks] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [requisitionLink, setRequisitionLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmBankAccountList, setConfirmBankAccountList] = useState([]);
  const [accountNumber, setAccountNumber] = useState(null);
  const [consent, setConsent] = useState(false);
  const [sendMail, setSendMail] = useState(false);
  const [errors, setErrors] = useState({ bank: '', account: '' });
  const [confirmBankAccountInstitutionId, setConfirmBankAccountInstitutionId] =
    useState(null);

  useEffect(() => {
    fetchBankList();
  }, []);

  useEffect(() => {
    setSendMail(false);
  }, [selectedBank]);

  const fetchBankList = async () => {
    setIsLoading(true);
    try {
      const { status_code, status_message, data } =
        await gocardlessBankListApi();
      if (status_code >= 200 && status_code < 300) {
        const bankData = [
          ...data,
          {
            // bankData will remove in production
            id: 'SANDBOXFINANCE_SFIN0000',
            name: 'ABN AMRO Bank Commercial(Test Bank)',
            bic: 'ABNAGB2LXXX',
            transaction_total_days: '540',
            countries: ['GB'],
            logo: 'https://storage.googleapis.com/gc-prd-institution_icons-production/UK/PNG/abnamrobank.png'
          }
        ];

        setBankList(bankData);
      } else {
        showToast(status_message, { type: NotificationType.Error });
      }
    } catch (error) {
      console.error('Error fetching bank list:', error);
      showToast('Something went wrong!', { type: NotificationType.Error });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const bank = bankList.find(item => item.id === oldInstitutionId);
    const isBankSameAsOld =
      selectedBank && selectedBank.id === oldInstitutionId;
    setSelectedBank(bank);
    if (isBankSameAsOld) {
      if (oldRequisitionLink && selectedBank.id === oldInstitutionId) {
        setRequisitionLink(oldRequisitionLink);
      }
    } else {
      setAccountNumber(null);
      setConfirmBankAccountList([]);
      setRequisitionLink('');
    }
    setIsLoading(false);
  }, [oldInstitutionId, bankList]);

  const createRequisitionLink = async () => {
    try {
      setIsLoading(true);
      const { status_code, status_message, data } =
        await createRequisitionLinkApi(
          { bank_name: selectedBank.name, institution_id: selectedBank.id },
          loanId
        );
      if (status_code >= 200 && status_code < 300) {
        setRequisitionLink(data.link);
        setUpdateRequisitionLink(prevState => !prevState);
        if ([Roles.Customer, Roles.Leads].includes(role)) {
          showToast('Requisition Link Created.', {
            type: NotificationType.Success
          });
        } else {
          setSendMail(true);
          showToast("Requisition link sent to customer's email address.", {
            type: NotificationType.Success
          });
        }
      } else {
        showToast(status_message, { type: NotificationType.Error });
      }
    } catch (error) {
      console.error('Error creating requisition link:', error);
      showToast('Something went wrong!', { type: NotificationType.Error });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfirmBankAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { status_code, status_message, data } =
        await confirmBankAccountGetApi(loanId);
      if (status_code >= 200 && status_code < 300) {
        setConfirmBankAccountList(data.accounts);
        setConfirmBankAccountInstitutionId(data.institution_id);
      } else {
        showToast(status_message, { type: NotificationType.Error });
      }
    } catch (error) {
      console.error('Error fetching confirm bank accounts:', error);
      showToast('Something went wrong!', { type: NotificationType.Error });
    } finally {
      setIsLoading(false);
    }
  }, [loanId, showToast]);

  useEffect(() => {
    if (accountNumber) {
      setErrors({ ...errors, bank: '' });
    }
  }, [accountNumber]);

  const confirmBankAccount = async event => {
    event.preventDefault();

    setIsLoading(true);
    try {
      const { status_code, status_message, data } =
        await confirmBankAccountPostApi(
          { account_number: accountNumber?.id },
          loanId
        );
      if (status_code === 200) {
        showToast('Bank account confirmed successfully', {
          type: NotificationType.Success
        });
        // updateFilledForms(loanId, { gocardless_statement: true });
        setIsSendConsent(true);
        setAccountNumber(null);
        setSelectedBank(null);
        setConfirmBankAccountList([]);
        setRequisitionLink('');
        setConsent(data.consent_completed);
      } else {
        showToast(status_message, { type: NotificationType.Error });
      }
    } catch (error) {
      console.error('Error confirming bank account:', error);
      showToast('Something went wrong!', { type: NotificationType.Error });
    } finally {
      setIsLoading(false);
    }
  };

  const renderBankList = () => (
    <div className="absolute z-40 flex h-[10rem] w-full flex-col overflow-y-scroll bg-gray-100 px-4 py-1 text-gray-800 shadow-xl">
      {bankList.map(item => (
        <a
          key={item.id}
          onClick={() => setSelectedBank(item)}
          className="my-2 block border-b border-gray-100 py-1 font-semibold text-gray-500 hover:text-black"
        >
          {item.name}
        </a>
      ))}
    </div>
  );

  const renderAccountList = () => (
    <div className="absolute z-50 flex w-full flex-col bg-gray-100 px-4 py-1 text-gray-800 shadow-xl">
      {confirmBankAccountList.map(account => (
        <a
          key={account}
          onClick={() => setAccountNumber(account)}
          className="my-2 block border-b border-gray-100 py-1 font-semibold text-gray-500 hover:text-black"
        >
          {account?.account_number}
        </a>
      ))}
    </div>
  );

  return (
    <div>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}
      <div className="container mx-auto h-[20rem] border bg-white p-4">
        <div
          className="group relative my-4 cursor-pointer border-b py-4"
          onClick={() => setShowBanks(!showBanks)}
        >
          <div className="flex items-center justify-between">
            <a className="font-regular flex items-center text-[14px] text-[#929292]">
              <img src={bank} className="mr-1 h-5 w-5" />
              {selectedBank ? selectedBank.name : 'Select Bank'}
            </a>
            <RiArrowDownSLine size={24} />
          </div>
          {showBanks && renderBankList()}
          {errors.bank && (
            <p className="mt-1 text-xs text-red-500">{errors.bank}</p>
          )}
        </div>

        {selectedBank &&
          ([Roles.Customer, Roles.Leads].includes(role) ? (
            <div className="my-3 py-4">
              <div className="flex w-full items-center text-[14px] font-normal text-[#1A439A]">
                <button
                  type="button"
                  onClick={createRequisitionLink}
                  className={`flex w-2/6 flex-col gap-2 border-r border-[#1A439A] bg-[#DDE3F0] px-4 py-4`}
                >
                  <span>Step 1 </span>
                  <span className="flex items-center">
                    <LuRefreshCw className="mr-1" />
                    {selectedBank?.id === oldInstitutionId && requisitionLink
                      ? 'Re-Generate Link'
                      : 'Generate Link'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    selectedBank?.id === oldInstitutionId &&
                    requisitionLink &&
                    window.open(requisitionLink, '_blank')
                  }
                  className="flex w-2/6 flex-col gap-2 border-r border-[#1A439A] bg-[#DDE3F0] px-4 py-4"
                >
                  <span>Step 2 </span>
                  <span className="flex items-center">
                    <FaChevronRight className="mr-1" />
                    {'Go to Requisition Link'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={fetchConfirmBankAccounts}
                  className={`flex w-2/6 flex-col gap-2 bg-[#DDE3F0] px-4 py-4`}
                >
                  <span>Step 3 </span>
                  <span className="flex items-center">
                    <LuRefreshCw className="mr-1" />
                    {'Fetch Bank Account'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="my-3 py-4">
              <div className="flex w-full items-center text-[14px] font-normal text-[#1A439A]">
                <button
                  type="button"
                  onClick={createRequisitionLink}
                  className="flex w-3/5 flex-col gap-2 border-r border-[#1A439A] bg-[#DDE3F0] px-4 py-4 max-sm:w-full max-sm:border-b"
                >
                  <span>Step 1 </span>
                  <span className="flex items-center">
                    <FaChevronRight className="mr-1" />
                    {sendMail || selectedBank?.id === oldInstitutionId
                      ? 'Resend'
                      : 'Send'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={fetchConfirmBankAccounts}
                  className="flex w-2/5 flex-col gap-2 bg-[#DDE3F0] px-4 py-4"
                >
                  <span>Step 2 </span>
                  <span className="flex items-center">
                    <LuRefreshCw className="mr-1" />
                    {'Fetch Bank Account'}
                  </span>
                </button>
              </div>
            </div>
          ))}

        {confirmBankAccountList.length > 0 &&
          selectedBank.id === confirmBankAccountInstitutionId && (
            <div
              className="group relative mt-4 cursor-pointer"
              onClick={() => setShowAccounts(!showAccounts)}
            >
              <div className="flex items-center justify-between">
                <a className="font-regular flex items-center text-[14px] text-[#929292]">
                  <TbAlignBoxLeftStretch className="mr-1 h-5 w-5" />
                  {accountNumber?.account_number || 'Select Account'}
                </a>
                <RiArrowDownSLine size={24} />
              </div>
              {showAccounts && renderAccountList()}
              {errors.account && (
                <p className="mt-1 text-xs text-red-500">{errors.account}</p>
              )}
            </div>
          )}
      </div>
      {accountNumber?.account_number && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={confirmBankAccount}
            className="bg-[#1A439A] px-5 py-3 font-medium uppercase text-white"
          >
            {'Confirm Bank Account'}
          </button>
        </div>
      )}
      {consent && <a>{consent}</a>}
    </div>
  );
};

export default GrandGocardless;
