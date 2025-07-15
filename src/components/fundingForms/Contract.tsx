import { useEffect, useState } from 'react';
import { CiMail } from 'react-icons/ci';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { IoCheckmark } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';

import {
  getContractApi,
  getDebitApi,
  reSendContractEmailApi,
  sendContractEmailApi,
  sendDirectDebitLinkApi
} from '../../api/loanServices';
import eye from '../../assets/svg/eye.svg';
import { authSelector } from '../../store/auth/userSlice';
import { updateIsContractSend } from '../../store/fundingStateReducer';
import { managementSliceSelector } from '../../store/managementReducer';
import { loanFormCommonStyleConstant } from '../../utils/constants';
import {
  contractStatus,
  FundingFromCurrentStatus,
  Roles
} from '../../utils/enums';
import { updateFilledForms } from '../../utils/helpers';
import { NotificationType } from '../../utils/hooks/toastify/enums';
// import { useNavigate } from "react-router-dom";
import useToast from '../../utils/hooks/toastify/useToast';
import { LoanFromCommonProps } from '../../utils/types';
import Loader from '../Loader';
import ContractSignConfirmation from './modals/ContractSignConfirmationModal';

export const badgeClassesHead = [
  {
    name: 'false'
  },
  {
    name: 'true'
  }
];

type ProfileField = {
  label: string;
  value: string | undefined;
};

const ProfileSection: React.FC<{
  title: string;
  profileData: ProfileField[];
  editedFields: Set<string>;
}> = ({ title, profileData, editedFields }) => {
  const isOldProfile = title === 'Old Profile';

  return (
    <div className="col-span-1 rounded-lg border border-gray-300 bg-gray-50 text-[13px]">
      <div
        className={`h-16 rounded-t-lg border-b p-4 text-[16px] font-semibold ${
          isOldProfile ? 'bg-[#D9D9D9] text-black' : 'bg-[#1A439A] text-white'
        }`}
      >
        {title}
      </div>
      <div className="mt-4 space-y-4">
        {profileData.map(({ label, value }) => {
          const isEdited = editedFields.has(label);
          const bgColor = isEdited
            ? isOldProfile
              ? 'bg-[#FAEBEB]'
              : 'bg-[#E0F7E7]'
            : '';

          return (
            <div
              key={label}
              className={`p-2 text-[14px] text-[#929292] ${bgColor}`}
            >
              <div className="px-6">{label}</div>
              <div className="px-6 text-[16px] font-medium text-black">
                {value || '-'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ProfileComparison: React.FC<{
  oldProfileData: ProfileField[];
  newProfileData: ProfileField[];
}> = ({ oldProfileData, newProfileData }) => {
  const getEditedFields = (
    oldData: ProfileField[],
    newData: ProfileField[]
  ): Set<string> => {
    const editedFields = new Set<string>();
    newData.forEach((newField, index) => {
      const oldField = oldData[index];
      if (newField.value && newField.value !== oldField.value) {
        editedFields.add(newField.label);
      }
    });
    return editedFields;
  };

  const editedFields = getEditedFields(oldProfileData, newProfileData);
  const filteredNewData = newProfileData.filter(({ label }) =>
    editedFields.has(label)
  );

  return (
    <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1 max-md:grid-cols-1">
      <ProfileSection
        title="Loan data"
        profileData={oldProfileData}
        editedFields={editedFields}
      />
      <ProfileSection
        title="Gocardless data"
        profileData={filteredNewData}
        editedFields={editedFields}
      />
    </div>
  );
};
const Contract: React.FC<LoanFromCommonProps> = ({
  loanId,
  fundingFormStatus
}) => {
  const { showToast } = useToast();

  const { loan } = useSelector(managementSliceSelector);
  const { role } = useSelector(authSelector);
  const [contractError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isContractSend, setIsContractSend] = useState(false);
  const [openContract, setOpenContract] = useState(false);
  const [openContract2, setOpenContract2] = useState(false);
  const [rateOfInterest, setRateOfInterest] = useState(null);
  const [isContractSendConfirmModal, setIsContractSendConfirmModal] =
    useState(false);
  // const [contractPdf, setContractPdf] = useState(null);
  const [contractResponse, setContractResponse] = useState(null);
  const dispatch = useDispatch();
  const [contractApiStatus, setContractApiStatus] = useState<
    'idle' | 'loading' | 'fulfilled' | 'waiting' | 'error'
  >('idle');
  const [contractApiData, setContractApiData] = useState(null);
  console.log('contractApiStatus', contractApiStatus);

  const fetchDebitApi = async (loanId: string) => {
    try {
      const response = await getDebitApi(loanId);

      if (response.status_code >= 200 && response.status_code < 300) {
        const data = response.data;
        setContractApiData(data);

        if (data?.status === 'fulfilled') {
          setContractApiStatus('fulfilled');
        } else {
          setContractApiStatus('waiting');
        }
      } else {
        showToast(response.status_message, { type: NotificationType.Error });
        setContractApiStatus('error');
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      showToast('Something went wrong!', { type: NotificationType.Error });
      setContractApiStatus('error');
    }
  };

  const handleContractToggle = () => {
    const isOpening = !openContract2;
    setOpenContract2(isOpening);

    if (isOpening) {
      const fetchData = async () => {
        await Promise.all([fetchDebitApi(loanId), fetchContractApi(loanId)]);
      };

      fetchData();
    }
  };
  const isSigned = !!(
    contractResponse?.signed_pdf && contractResponse?.signed_pdf !== ''
  );

  const fetchContractApi = async loanId => {
    try {
      const getContractApiResponse = await getContractApi(loanId);
      if (
        getContractApiResponse.status_code >= 200 &&
        getContractApiResponse.status_code < 300
      ) {
        if (
          [
            contractStatus.opened,
            contractStatus.sent,
            contractStatus.resent,
            contractStatus.processing,
            contractStatus.signed,
            contractStatus.signedByAll
          ].includes(getContractApiResponse.data.envelope_status)
        ) {
          setContractResponse(getContractApiResponse.data);

          setIsContractSend(!!getContractApiResponse.data);
          // if (getContractApiResponse.data.envelope_status === contractStatus.signedByAll) {
          //   setContractPdf(getContractApiResponse.data.signed_pdf);
          //   // window.open(link, "_blank");
          //   // setIsContractSend(getContractApiResponse.data)
          // }
        }
      } else {
        showToast(getContractApiResponse.status_message, {
          type: NotificationType.Error
        });
      }
    } catch (error) {
      console.log('Exception', error);
      showToast('something wrong!', { type: NotificationType.Error });
    }
  };

  const handleSignContract = async () => {
    setIsContractSendConfirmModal(false);

    try {
      // if(envelopeStatus !== contractStatus.signedByAll){
      //   showToast("Need to sign Contract!", { type: NotificationType.Error });
      // }
      setIsLoading(true);
      if (
        isContractSend ||
        (contractResponse &&
          [contractStatus.resent, contractStatus.sent].includes(
            contractResponse.envelope_status
          ))
      ) {
        const reSendContractEmailApiResponse = await reSendContractEmailApi(
          loanId || loan.id
        );

        if (
          reSendContractEmailApiResponse.status_code >= 200 &&
          reSendContractEmailApiResponse.status_code < 300
        ) {
          setIsContractSend(true);
          showToast(reSendContractEmailApiResponse.status_message, {
            type: NotificationType.Success
          });
          updateFilledForms(loanId, {
            complete_contract: true
          }); // update filled forms
        } else {
          showToast(reSendContractEmailApiResponse.status_message, {
            type: NotificationType.Error
          });
        }
      } else {
        const sendContractEmailApiResponse = await sendContractEmailApi(
          loanId || loan.id
        );

        if (
          sendContractEmailApiResponse.status_code >= 200 &&
          sendContractEmailApiResponse.status_code < 300
        ) {
          showToast(sendContractEmailApiResponse.status_message, {
            type: NotificationType.Success
          });
          if (!(isContractSend || isSigned)) {
            // send not resend
            sendDirectDebitLinkApi({}, loanId || loan.id);
            updateFilledForms(loanId, {
              complete_contract: true
            }); // update filled forms
          }
          setIsContractSend(true);
        } else {
          showToast(sendContractEmailApiResponse.status_message, {
            type: NotificationType.Error
          });
        }
      }
    } catch (error) {
      console.log('Exception', error);
      showToast('something wrong!', { type: NotificationType.Error });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (role !== Roles.FieldAgent) {
      fetchContractApi(loanId || loan.id);
      fetchDebitApi(loanId || loan.id);
    }
  }, [loanId, loan.id]);

  useEffect(() => {
    dispatch(updateIsContractSend(isContractSend));
  }, [isContractSend]);

  const ViewContract = () => {
    return (
      <div className="p-4">
        {isSigned && (
          <div className="flex">
            <h2 className="mb-4 text-[16px] font-bold">{'Contract'}</h2>
            <div>
              <p
                className="flex pr-4 text-[12px] font-medium text-[#1A439A]"
                onClick={() => {
                  window.open(contractResponse?.signed_pdf, '_blank');
                }}
              >
                <img src={eye} alt="eye" className="px-2" /> {'VIEW'}
              </p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4"></div>
      </div>
    );
  };

  const getValueOrFallback = value => (value?.trim() ? value : 'N/A');

  return (
    <>
      <div className="mt-2 px-4">
        {isLoading && (
          <div
            aria-hidden="true"
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
          >
            <Loader />
          </div>
        )}
        {[Roles.Admin, Roles.Manager].includes(role as Roles) && (
          <div className="flex flex-col pb-8">
            <div
              className={`items-center rounded-lg border border-[#D4D4D4] px-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                contractError && 'w-[100%] border-b-2 border-red-500'
              }`}
            >
              <div
                className={`accordion-title flex h-[4rem] cursor-pointer items-center justify-between bg-white ${
                  isContractSend ? 'text-[#1A439A]' : ''
                }`}
                onClick={() => setOpenContract(prevProps => !prevProps)}
              >
                <div className="flex items-center justify-between">
                  {isContractSend && (
                    <span className="accordion-tick">
                      <IoCheckmark className="mx-2" />
                    </span>
                  )}
                  <span className="flex items-center gap-x-2 max-sm:text-[12px]">
                    {' '}
                    <CiMail className="mt-[1px] h-5 w-5" />
                    {isContractSend || isSigned
                      ? 'Contract'
                      : 'Send Contract Sign Email and Direct debit'}
                  </span>
                </div>
                {isContractSend || isSigned ? (
                  isSigned ? (
                    <span className="accordion-arrow">
                      {openContract ? <IoIosArrowUp /> : <IoIosArrowDown />}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={`bg-white ${[FundingFromCurrentStatus.UnderwriterSubmitted].includes(fundingFormStatus) ? 'text-[#1A439A]' : 'text-[#BABABA]'} cursor-pointer text-[14px] font-semibold uppercase max-sm:text-[10px]`}
                      disabled={
                        ![
                          FundingFromCurrentStatus.UnderwriterSubmitted
                        ].includes(fundingFormStatus)
                      }
                      onClick={() => {
                        setIsContractSendConfirmModal(true);
                      }}
                    >
                      {'RESEND'}
                    </button>
                  )
                ) : (
                  <span>
                    <button
                      type="button"
                      className={`bg-white ${[FundingFromCurrentStatus.UnderwriterSubmitted].includes(fundingFormStatus) ? 'text-[#1A439A]' : 'text-[#BABABA]'} cursor-pointer text-[14px] font-semibold uppercase max-sm:text-[10px]`}
                      disabled={
                        ![
                          FundingFromCurrentStatus.UnderwriterSubmitted
                        ].includes(fundingFormStatus)
                      }
                      onClick={() => {
                        setIsContractSendConfirmModal(true);
                      }}
                    >
                      {'SEND'}
                    </button>
                  </span>
                )}
              </div>
            </div>

            {contractError && (
              <p className={loanFormCommonStyleConstant.text.errorClass}>
                {contractError}
              </p>
            )}
          </div>
        )}
        {[Roles.Admin, Roles.Manager].includes(role) && isContractSend && (
          <>
            {isSigned && openContract && <ViewContract />}

            <div className="flex flex-col pb-8">
              <div
                className={`items-center rounded-lg border border-[#D4D4D4] px-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  contractError && 'w-[100%] border-b-2 border-red-500'
                }`}
              >
                <div
                  className={`accordion-title flex h-[4rem] cursor-pointer items-center justify-between bg-white ${
                    isContractSend ? 'text-[#1A439A]' : ''
                  }`}
                  onClick={handleContractToggle}
                >
                  <div className="flex items-center justify-between">
                    {isContractSend && (
                      <span className="accordion-tick">
                        <IoCheckmark className="mx-2" />
                      </span>
                    )}
                    <span className="flex items-center gap-x-2 max-sm:text-[12px]">
                      <CiMail className="mt-[1px] h-5 w-5" />
                      Direct debit data
                    </span>
                  </div>
                  <span className="accordion-arrow">
                    {openContract2 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  </span>
                </div>
              </div>

              {contractError && (
                <p className={loanFormCommonStyleConstant.text.errorClass}>
                  {contractError}
                </p>
              )}

              {openContract2 && (
                <div className="mt-4">
                  {contractApiStatus === 'fulfilled' ? (
                    <>
                      <ProfileComparison
                        oldProfileData={[
                          {
                            label: 'Name',
                            value: getValueOrFallback(
                              contractApiData?.loan_data?.first_name
                            )
                          },
                          {
                            label: 'Last Name',
                            value: getValueOrFallback(
                              contractApiData?.loan_data?.last_name
                            )
                          },
                          {
                            label: 'Company Name',
                            value: getValueOrFallback(
                              contractApiData?.loan_data?.company_name
                            )
                          },
                          {
                            label: 'Email',
                            value: getValueOrFallback(
                              contractApiData?.loan_data?.email
                            )
                          },
                          {
                            label: 'Bank Name',
                            value: getValueOrFallback(
                              contractApiData?.loan_data?.bank_name
                            )
                          },
                          {
                            label: 'Account Number',
                            value: getValueOrFallback(
                              contractApiData?.loan_data?.account_number
                            )
                          },
                          {
                            label: 'Sort Code',
                            value: getValueOrFallback(
                              contractApiData?.loan_data?.sort_code
                            )
                          }
                        ]}
                        newProfileData={[
                          {
                            label: 'Name',
                            value: getValueOrFallback(
                              contractApiData?.gocardless_data?.first_name
                            )
                          },
                          {
                            label: 'Last Name',
                            value: getValueOrFallback(
                              contractApiData?.gocardless_data?.last_name
                            )
                          },
                          {
                            label: 'Company Name',
                            value: getValueOrFallback(
                              contractApiData?.gocardless_data?.company_name
                            )
                          },
                          {
                            label: 'Email',
                            value: getValueOrFallback(
                              contractApiData?.gocardless_data?.email
                            )
                          },
                          {
                            label: 'Bank Name',
                            value: getValueOrFallback(
                              contractApiData?.gocardless_data?.bank_name
                            )
                          },
                          {
                            label: 'Account Number',
                            value: getValueOrFallback(
                              contractApiData?.gocardless_data?.account_number
                            )
                          },
                          {
                            label: 'Sort Code',
                            value: getValueOrFallback(
                              contractApiData?.gocardless_data?.sort_code
                            )
                          }
                        ]}
                      />
                    </>
                  ) : (
                    <div className="text-sm italic text-gray-500">
                      Waiting Customer authorization...
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className={`bg-white ${
                        [
                          FundingFromCurrentStatus.UnderwriterSubmitted
                        ].includes(fundingFormStatus)
                          ? 'text-[#1A439A]'
                          : 'text-[#BABABA]'
                      } cursor-pointer text-[14px] font-semibold uppercase max-sm:text-[10px]`}
                      onClick={() =>
                        sendDirectDebitLinkApi(
                          {
                            resend: true
                          },
                          loanId || loan.id
                        )
                      }
                    >
                      RESEND
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <span className="text-blue-600">
        * Please refresh after signing the contract for approval
      </span>
      <ContractSignConfirmation
        isOpen={isContractSendConfirmModal}
        onClose={() => {
          setIsContractSendConfirmModal(false);
        }}
        onApprove={handleSignContract}
        head="Send Contract Mail!"
        content="Are you sure send contract mail?"
        setUpdateRateOfInterest={setRateOfInterest}
        InterestOld={12}
        InterestNew={rateOfInterest}
      />
    </>
  );
};

export default Contract;
