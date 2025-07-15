import { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import { AiOutlineClose } from 'react-icons/ai';
import { FiPlus } from 'react-icons/fi';
import { GrGroup } from 'react-icons/gr';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

import {
  downloadBankStatementApi,
  transactionCategoryApi
} from '../../../api/loanServices';
import proof from '../../../assets/images/proof.png';
import download from '../../../assets/svg/download.svg';
import eye from '../../../assets/svg/eye.svg';
import {
  creditCategoryOptions,
  debitCategoryOptions,
  gocardlessSortingConstant,
  loanFormCommonStyleConstant
} from '../../../utils/constants';
import {
  getExtensionFromUrl,
  getNameFromUrl,
  handleReportDownload
} from '../../../utils/helpers';
import { NotificationType } from '../../../utils/hooks/toastify/enums';
import useToast from '../../../utils/hooks/toastify/useToast';
import useCategoryCount from '../../../utils/hooks/useCategoryCount';
import Loader from '../../Loader';
import ChipInput from './ChipInput';
import GoCardlessStatementCard from './GoCardlessStatementCard';
import DatePicker from 'react-datepicker';
import date from '../../../assets/svg/system-uicons_calendar-date.svg';

const GoCardlessModal = ({
  isGocardless,
  gocardlessData,
  setGocardlessData,
  onClose,
  selectedId,
  withoutGocardlessData,
  setWithoutGocardlessData,
  sortTransactionCheckpoint
}) => {
  const [isDebitListing, setIsDebitListing] = useState(true);
  const [openStatements, setOpenStatements] = useState(false);
  const [fileSizes, setFileSizes] = useState({});
  const [openChipInput, setOpenChipInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState('payments');

  const currentDate = new Date();
  const prevFiveYearDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 5)
  );

  const [currentDateRange, setCurrentDateRange] = useState({
    start_date: null,
    end_date: null
  });
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);

  const setCurrentStayStartDate = date => {
    if (!date) {
      setStartDateError('Start date is required.');
    } else {
      setStartDateError(null);
      // console.log('date', date);

      setCurrentDateRange(prev => ({ ...prev, start_date: date }));
    }
  };

  const setCurrentStayEndDate = date => {
    if (!date) {
      setEndDateError('End date is required.');
    } else {
      setEndDateError(null);
      setCurrentDateRange(prev => ({ ...prev, end_date: date }));
    }
  };

  useEffect(() => {
    if (!isGocardless) {
      if (!currentDateRange.start_date || startDateError) {
        setStartDateError('Start date is required.');
      }
      if (!currentDateRange.end_date || endDateError) {
        setEndDateError('End date is required.');
      }
    }
  }, [onClose, sortTransactionCheckpoint]);
  const { showToast } = useToast();

  const bankData = [...gocardlessData, ...withoutGocardlessData].find(
    i => selectedId === i.id
  );

  function sortBankData(data) {
    return data.sort((a, b) => {
      // Place items without a 'category' key at the top
      if (!('category' in a) && 'category' in b) {
        return -1;
      }
      if (!('category' in b) && 'category' in a) {
        return 1;
      }
      // Place items with an empty category at the top
      if (a.category === '' && b.category !== '') {
        return -1;
      }
      if (b.category === '' && a.category !== '') {
        return 1;
      }
      // Place items with "ignore_transaction" at the very end
      if (
        a.category === 'ignore_transaction' &&
        b.category !== 'ignore_transaction'
      ) {
        return 1;
      }
      if (
        b.category === 'ignore_transaction' &&
        a.category !== 'ignore_transaction'
      ) {
        return -1;
      }
      // Sort by 'category' in ascending order if both items have categories
      const categoryComparison = a?.category
        ? a?.category?.localeCompare(b.category)
        : 0;
      if (categoryComparison !== 0) return categoryComparison;

      // If categories are the same, sort by 'entryReference' in ascending order
      return a?.entryReference?.localeCompare(b.entryReference);
    });
  }

  const creditData = bankData.credit ? sortBankData(bankData.credit) : [];
  const debitData = bankData.debit ? sortBankData(bankData.debit) : [];

  const debitCategoryGrouped = useCategoryCount(debitData);
  const creditCategoryGrouped = useCategoryCount(creditData);

  const onCategorySelect = (data, type) => {
    const arr = type === 'debit' ? [...debitData] : [...creditData];
    let parentArr = isGocardless
      ? [...gocardlessData]
      : [...withoutGocardlessData];
    const modArr = arr.map(item => (item.id === data.id ? { ...data } : item));
    parentArr = parentArr.map(item =>
      item.id === selectedId ? { ...item, [type]: modArr } : item
    );
    if (isGocardless) {
      setGocardlessData(parentArr);
    } else {
      setWithoutGocardlessData(parentArr);
    }
  };
  // const autoSelect =()=>{
  //   const debarr =  [...debitData]
  //   const credarr =  [...creditData]
  //   const parentArr = [...gocardlessData]
  //   debarr.forEach((i)=> {
  //     return i.category = 'payment'
  //   })
  //   credarr.forEach((i)=> {
  //     return i.category = 'payment'
  //   })
  //   const accountObject =  parentArr.find(i=> selectedId === i.id)

  //   accountObject.debit = debarr
  //   accountObject.credit = credarr
  //   setGocardlessData(parentArr)
  // }

  useEffect(() => {
    setType(isDebitListing ? 'payments' : 'card');
  }, [isDebitListing]);

  useEffect(() => {
    const parentArr = isGocardless
      ? [...gocardlessData]
      : [...withoutGocardlessData];
    const setData = isGocardless ? setGocardlessData : setWithoutGocardlessData;
    const accountObject = parentArr?.find(i => selectedId === i.id);

    accountObject.all_grouped =
      debitCategoryGrouped === debitData?.length &&
      creditCategoryGrouped === creditData?.length &&
      debitData?.length >= 1 &&
      creditData?.length >= 1;
    setData(parentArr);
  }, [debitCategoryGrouped, creditCategoryGrouped]);

  const onAdd = () => {
    const type = isDebitListing ? 'debit' : 'credit';
    const arr = type === 'debit' ? [...debitData] : [...creditData];
    arr.push({
      id: arr.length + 1,
      debtorName: '',
      transactionAmount: {
        amount: '',
        currency: 'EUR'
      },
      bankTransactionCode: '',
      remittanceInformationUnstructured: ''
    });

    const parentArr = [...withoutGocardlessData];

    const updatedParentArr = parentArr.map(item =>
      item.id === selectedId ? { ...item, [type]: arr } : item
    );

    setWithoutGocardlessData(updatedParentArr);
  };

  const handleViewLinkClick = (link: string) => {
    if (link) {
      window.open(link, '_blank');
    }
  };

  const fetchFileSize = async url => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const size = (blob.size / 1024).toFixed(2);
      return `${size} KB`;
    } catch (error) {
      console.error('Error fetching file size:', error);
    }
  };

  useEffect(() => {
    const fetchSizes = async () => {
      const sizes = {};
      const promises = bankData?.business_account_statements?.map(
        async statement => {
          const size = await fetchFileSize(statement.file);
          sizes[statement.file] = size; // Using file link as key
        }
      );
      await Promise.all(promises);
      setFileSizes(sizes);
    };

    if (bankData?.business_account_statements) {
      fetchSizes();
    }
  }, [bankData]);

  useEffect(() => {
    const parentArr = [...withoutGocardlessData];
    const accountObject = parentArr.find(i => selectedId === i.id);
    if (!isGocardless) {
      if (accountObject.start_date && accountObject.end_date) {
        setCurrentDateRange({
          start_date: accountObject.start_date,
          end_date: accountObject.end_date
        });
      }
    }
    return () => {
      if (!isGocardless) {
        if (currentDateRange.start_date && currentDateRange.end_date) {
          accountObject.start_date = currentDateRange.start_date;
          accountObject.end_date = currentDateRange.end_date;
          sortTransactionCheckpoint();
        }
      }
    };
  }, []);

  const [chips, setChips] = useState(gocardlessSortingConstant);

  const fetchTransactionCategor = async () => {
    try {
      const response = await transactionCategoryApi();
      if (response.status_code === 200) {
        setChips(response.data);
      }
    } catch (error) {
      console.error('Error fetching transaction categor:', error);
    }
  };

  useEffect(() => {
    fetchTransactionCategor();
  }, []);

  useEffect(() => {
    if (selectedId) {
      downloadData();
    }
  }, [selectedId]);

  const onBulkSort = () => {
    setIsLoading(true);
    try {
      if (isDebitListing) {
        const debarr = [...debitData];
        const parentArr = [...gocardlessData];

        debarr.forEach(item => {
          const values = chips.debit[type];
          for (const value of values) {
            if (item.remittanceInformationUnstructured) {
              const remittanceInfo =
                item.remittanceInformationUnstructured.toLowerCase();

              if (remittanceInfo.includes(value.toLowerCase())) {
                item.category = type;
                break;
              }
            }
          }
        });
        const accountObject = parentArr.find(i => selectedId === i.id);

        accountObject.debit = debarr;
        setGocardlessData(parentArr);
      } else {
        const credarr = [...creditData];
        const parentArr = [...gocardlessData];

        credarr.forEach(item => {
          const values = chips.credit[type];
          for (const value of values) {
            if (item.remittanceInformationUnstructured) {
              const remittanceInfo =
                item.remittanceInformationUnstructured.toLowerCase();

              if (remittanceInfo.includes(value.toLowerCase())) {
                item.category = type;
                break;
              }
            }
          }
        });
        const accountObject = parentArr.find(i => selectedId === i.id);

        accountObject.credit = credarr;
        setGocardlessData(parentArr);
      }
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
    setOpenChipInput(false);
  };

  const [transactionData, setTransactionData] = useState([]);

  const downloadData = () => {
    handleReportDownload(
      downloadBankStatementApi,
      setTransactionData,
      showToast,
      selectedId
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end overflow-auto bg-black bg-opacity-50">
      <div className="h-screen w-full overflow-auto bg-white md:w-1/2 lg:w-1/2 xl:w-2/5">
        {isLoading && (
          <div
            aria-hidden="true"
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
          >
            <Loader />
          </div>
        )}
        <div className="sticky top-0 z-50 w-full border-[1px] border-b-gray-200 bg-white px-6 pt-6">
          <div className="flex w-[90%] items-center justify-between py-3">
            <div className="flex items-center gap-x-4">
              <p className="font-semibold text-gray-700">{'Bank Name:'}</p>
              <p className="text-gray-900">{bankData?.bank_name}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!isGocardless) {
                  if (startDateError || endDateError) {
                    showToast('Start date and End date are mandatory', {
                      type: NotificationType.Error
                    });
                  } else {
                    const parentArr = [...withoutGocardlessData];
                    const accountObject = parentArr.find(
                      i => selectedId === i.id
                    );
                    accountObject.start_date = currentDateRange.start_date;
                    accountObject.end_date = currentDateRange.end_date;
                    sortTransactionCheckpoint(true);
                  }
                } else {
                  sortTransactionCheckpoint(true);
                }
              }}
              className="rounded-lg bg-[#1B4398] px-6 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#3a5692] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {'Save Sort'}
            </button>
          </div>

          {isGocardless && (
            <>
              <p className="mb-4 font-bold">{'Statement Date'}</p>
              <div className="flex items-center gap-2">
                <p className="">{bankData?.start_date}</p>
                <p className="">{'TO'}</p>
                <p className="">{bankData?.end_date}</p>
              </div>
            </>
          )}
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-4 text-gray-500 hover:text-gray-700"
          >
            <AiOutlineClose size={32} />
          </button>
        </div>

        <div className="my-8">
          <div className="flex items-center gap-2 px-4">
            <div
              onClick={() => setIsDebitListing(true)}
              className={`w-1/2 cursor-pointer rounded border-2 p-4 ${
                isDebitListing
                  ? 'border-[#1A439A] bg-[#1A439A] text-white'
                  : 'border-gray-300'
              }`}
            >
              <p>{'Debit transactions'}</p>
              <div className="flex items-center gap-2">
                <GrGroup />
                <p className="text-[13px]">{'Grouped:'}</p>
                <p className="text-[13px]">
                  {debitCategoryGrouped}
                  {'/'}
                  {debitData?.length}
                </p>
              </div>
            </div>

            <div
              onClick={() => setIsDebitListing(false)}
              className={`w-1/2 cursor-pointer rounded border-2 p-4 ${
                !isDebitListing
                  ? 'border-[#1A439A] bg-[#1A439A] text-white'
                  : 'border-gray-300'
              }`}
            >
              <p>{'Credit transactions'}</p>
              <div className="flex items-center gap-2">
                <GrGroup />
                <p className="text-[13px]">{'Grouped:'}</p>
                <p className="text-[13px]">
                  {creditCategoryGrouped}
                  {'/'}
                  {creditData?.length}
                </p>
              </div>
            </div>
          </div>

          {isGocardless && (
            <div className="flex flex-col items-center gap-4 px-4 pt-4">
              <CSVLink
                data={transactionData}
                filename={`statement-${selectedId}.csv`}
                target="_blank"
                onClick={event => {
                  if (transactionData.length === 0 || bankData.length === 0) {
                    event.preventDefault();
                    showToast('No data available for download.', {
                      type: NotificationType.Error
                    });
                  } else {
                    showToast('Download started successfully!', {
                      type: NotificationType.Success
                    });
                  }
                }}
                className="flex w-full cursor-pointer justify-between rounded border border-gray-300 p-4 text-[#929292]"
              >
                <div className="flex gap-2">
                  <img src={download} alt="download" />
                  <div>
                    <a className="text-[14px]">{'Download Statement'}</a>
                  </div>
                </div>
              </CSVLink>
              {openStatements &&
                bankData?.business_account_statements?.map(statement => (
                  <div
                    key={statement.file}
                    className="flex w-full cursor-pointer justify-between rounded border border-gray-300 p-4 text-[#929292]"
                  >
                    <div className="flex gap-2">
                      <div className="flex h-full w-[30px] items-center justify-center">
                        <img src={proof} alt="proof" />
                      </div>
                      <div>
                        <a className="text-[14px]">
                          {getNameFromUrl(statement.file)}
                        </a>
                        <a className="ml-4 text-[14px] text-[#1A439A]">
                          {fileSizes[statement.file] || 'Loading...'}
                        </a>
                      </div>
                    </div>
                    <span
                      onClick={() => handleViewLinkClick(statement.file || '')}
                      style={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                      {['xlsx'].includes(
                        getExtensionFromUrl(statement.file) || ''
                      ) ? (
                        <img src={download} alt="download" />
                      ) : (
                        <img src={eye} alt="blue-eye" />
                      )}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {!isGocardless && (
            <div className="flex flex-col items-center gap-4 px-4 pt-4">
              <div
                className="flex w-full cursor-pointer justify-between rounded border border-gray-300 p-4 text-[#929292]"
                onClick={() => setOpenStatements(prev => !prev)}
              >
                <div className="flex gap-2">
                  <img src={download} alt="download" />
                  <div>
                    <a className="text-[14px] text-[#1A439A]">
                      {`${bankData?.business_account_statements?.length} `}
                    </a>
                    <a className="text-[14px]">{'file for download'}</a>
                  </div>
                </div>
                <span className="accordion-arrow">
                  {openStatements ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </span>
              </div>

              {openStatements &&
                bankData?.business_account_statements?.map(statement => (
                  <div
                    key={statement.file}
                    className="flex w-full cursor-pointer justify-between rounded border border-gray-300 p-4 text-[#929292]"
                  >
                    <div className="flex gap-2">
                      <div className="flex h-full w-[30px] items-center justify-center">
                        <img src={proof} alt="proof" />
                      </div>
                      <div>
                        <a className="text-[14px]">
                          {getNameFromUrl(statement.file)}
                        </a>
                        <a className="ml-4 text-[14px] text-[#1A439A]">
                          {fileSizes[statement.file] || 'Loading...'}
                        </a>
                      </div>
                    </div>
                    <span
                      onClick={() => handleViewLinkClick(statement.file || '')}
                      style={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                      {['xlsx'].includes(
                        getExtensionFromUrl(statement.file) || ''
                      ) ? (
                        <img src={download} alt="download" />
                      ) : (
                        <img src={eye} alt="blue-eye" />
                      )}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="mx-4 mb-8 flex flex-col items-center gap-4">
          <div
            className="flex w-full cursor-pointer justify-between rounded border border-gray-300 p-4 text-gray-500"
            onClick={() => setOpenChipInput(prev => !prev)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{'Bulk Sort'}</span>
            </div>
            <span className="accordion-arrow text-gray-500">
              {openChipInput ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </span>
          </div>
          {openChipInput && (
            <div className="flex w-full flex-col gap-4 rounded border border-gray-200 bg-white p-4">
              {isDebitListing ? (
                <div key={type} className="mb-4">
                  <ChipInput
                    options={debitCategoryOptions}
                    setType={setType}
                    type={type}
                    chips={chips.debit[type] || []}
                    setChips={setChips}
                    category="debit"
                    mainCategory={type}
                  >
                    <button
                      type="button"
                      onClick={onBulkSort}
                      className="self-center rounded bg-[#1B4398] px-6 py-2 text-sm font-semibold text-white hover:bg-[#3a5692]"
                    >
                      {'Apply'}
                    </button>
                  </ChipInput>
                </div>
              ) : (
                <div key={type} className="mb-4">
                  <ChipInput
                    options={creditCategoryOptions}
                    setType={setType}
                    type={type}
                    chips={chips.credit[type] || []}
                    setChips={setChips}
                    category="credit"
                    mainCategory={type}
                  >
                    <button
                      type="button"
                      onClick={onBulkSort}
                      className="self-center rounded bg-[#1B4398] px-6 py-2 text-sm font-semibold text-white hover:bg-[#3a5692]"
                    >
                      {'Apply'}
                    </button>
                  </ChipInput>
                </div>
              )}
            </div>
          )}
        </div>

        {!isGocardless && (
          <div className="relative flex w-full flex-col justify-between p-4">
            <div className="flex justify-between gap-4">
              <div className="flex w-[80%] gap-4">
                <div className="relative bg-inherit">
                  <div className="rounded-lg bg-white">
                    <div className="relative bg-inherit">
                      <div className="absolute bottom-3 left-1 px-1 text-[#737373]">
                        <img src={date} className="w-6 pr-1 text-gray-400" />
                      </div>
                      <DatePicker
                        inputProps={{ name: 'start_date' }}
                        selected={currentDateRange.start_date}
                        selectsStart
                        onChange={date => {
                          const formattedDate = date
                            ? date.toISOString().split('T')[0]
                            : null;
                          setCurrentStayStartDate(formattedDate);
                        }}
                        peekNextMonth
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        wrapperClassName="w-full"
                        startDate={currentDateRange.start_date}
                        endDate={currentDateRange.end_date}
                        className={`${
                          !currentDateRange.start_date
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } peer h-12 w-full rounded-lg border bg-transparent px-8 text-black placeholder-transparent focus:outline-none`}
                        minDate={new Date(prevFiveYearDate)}
                        maxDate={new Date(new Date().getTime() - 86400000)}
                      />
                      <label
                        htmlFor={'start_date'}
                        className={loanFormCommonStyleConstant.date.labelClass}
                      >
                        <span
                          className={` ${
                            !currentDateRange.start_date && 'text-red-500'
                          } `}
                        >
                          {'Start date '}
                        </span>
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="relative bg-inherit">
                  <div className="rounded-lg bg-white">
                    <div className="relative bg-inherit">
                      <div className="absolute bottom-3 left-1 px-1 text-[#737373]">
                        <img src={date} className="w-6 pr-1 text-gray-400" />
                      </div>
                      <DatePicker
                        inputProps={{ name: 'end_date' }}
                        selected={currentDateRange.end_date}
                        selectsEnd
                        onChange={date => {
                          const formattedDate = date
                            ? date.toISOString().split('T')[0]
                            : null;
                          setCurrentStayEndDate(formattedDate);
                        }}
                        peekNextMonth
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        wrapperClassName="w-full"
                        startDate={currentDateRange.start_date}
                        endDate={currentDateRange.end_date}
                        minDate={
                          currentDateRange.start_date
                            ? new Date(
                                new Date(
                                  currentDateRange.start_date
                                ).getTime() + 86400000
                              )
                            : new Date(prevFiveYearDate)
                        }
                        className={`${
                          !currentDateRange.end_date
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } peer h-12 w-full rounded-lg border bg-transparent px-8 text-black placeholder-transparent focus:outline-none`}
                        maxDate={currentDate}
                        disabled={!currentDateRange.start_date}
                      />
                      <label
                        htmlFor="end_date"
                        className={loanFormCommonStyleConstant.date.labelClass}
                      >
                        <span
                          className={` ${
                            !currentDateRange.end_date && 'text-red-500'
                          } `}
                        >
                          {'End date '}
                        </span>
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onAdd()}
                className="flex h-12 items-center rounded-lg border bg-transparent px-5 py-2.5 text-center text-sm font-medium text-gray-400 hover:bg-gray-200 hover:text-gray-400 focus:ring-1 focus:ring-gray-300"
                type="button"
              >
                <FiPlus size={16} className="mr-2" />
                {'Add'}
              </button>
            </div>
          </div>
        )}

        <div className="custom-scrollbar h-[60%]">
          {isDebitListing
            ? debitData?.map(debit => (
                <GoCardlessStatementCard
                  isGocardless={isGocardless}
                  data={debit}
                  onCategorySelect={onCategorySelect}
                  options={debitCategoryOptions}
                  isDebit={true}
                />
              ))
            : creditData?.map(credit => (
                <GoCardlessStatementCard
                  isGocardless={isGocardless}
                  data={credit}
                  onCategorySelect={onCategorySelect}
                  options={creditCategoryOptions}
                  isDebit={false}
                />
              ))}
        </div>
      </div>
    </div>
  );
};

export default GoCardlessModal;
