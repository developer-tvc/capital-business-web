import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useRef, useState } from 'react';
import {
  FormProvider,
  SubmitErrorHandler,
  SubmitHandler,
  useForm
} from 'react-hook-form';
import { IoMdClose } from 'react-icons/io';
import { IoCheckmark } from 'react-icons/io5';
import { PiFilesLight } from 'react-icons/pi';
import { useDispatch } from 'react-redux';

import {
  businessPremiseDetailsGetAPI,
  businessPremiseDetailsPostAPI
} from '../../api/loanServices';
// import camera from '../../assets/svg/camera.svg';
import { updateCurrentStage } from '../../store/fundingStateReducer';
import {
  loanFormBusinessPremiseDetails,
  loanFormCommonStyleConstant
} from '../../utils/constants';
import {
  convertDateString,
  convertImageLinkToFile,
  lookUpAddressFormatter,
  updateFilledForms
} from '../../utils/helpers';
import { NotificationType } from '../../utils/hooks/toastify/enums';
import useToast from '../../utils/hooks/toastify/useToast';
import useAuth from '../../utils/hooks/useAuth';
import { BusinessPremiseDetailsSchema } from '../../utils/Schema';
import {
  BusinessPremiseDetailsType,
  fileControllerProps,
  LoanFromCommonProps
} from '../../utils/types';
import FieldRenderer from '../commonInputs/FieldRenderer';
import Loader from '../Loader';
import AddressLookup from './AddressLookup';

const EMPTY_TRADING_ADDRESS = {
  address_line: '',
  town_city: '',
  post_code: '',
  premise_type: '',
  start_date: '',
  end_date: '',
  trading_documents: []
};


const BusinessPremiseDetails: React.FC<LoanFromCommonProps> = ({
  setRef,
  loanId = null
}) => {
  const { authenticated } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  setRef(formRef);

  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [businessPremiseDetails, setBusinessPremiseDetails] = useState<
    Partial<BusinessPremiseDetailsType>
  >({});

  const fieldRenderer = new FieldRenderer(
    loanFormBusinessPremiseDetails,
    loanFormCommonStyleConstant,
    BusinessPremiseDetailsSchema
  );
  const [registeredAddress, setRegisteredAddress] = useState(undefined);
  const [tradingAddress, setTradingAddress] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isLimitedCompany, setIsLimitedCompany] = useState(false);

  const methods = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(BusinessPremiseDetailsSchema),
    defaultValues: {
      registered_address: {
        address_line: '',
        post_code: ''
      },
      trading_same_as_registered: false,
      trading_address: EMPTY_TRADING_ADDRESS
    }
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState,
    trigger,
    reset,
    getValues
  } = methods;

  // Helper function to convert leasehold documents (handles both single and multiple)
  const convertLeaseholdDocument = async address => {
    try {
      // Handle new 'documents' array from API response
      if (address?.documents && Array.isArray(address.documents) && address.documents.length > 0) {
        const filePromises = address.documents.map(doc => 
          convertImageLinkToFile(doc.url || doc)
        );
        const files = await Promise.all(filePromises);
        address.trading_documents = files; // Store as trading_documents for form
        delete address.documents; // Remove API response field
      }
      // Handle legacy single 'document' field for backward compatibility
      else if (address?.document) {
        const file = await convertImageLinkToFile(address?.document);
        address.trading_documents = [file]; // Use trading_documents for form
        delete address.document; // Remove old singular field
      }
      return address;
    } catch (error) {
      console.error('Error converting leasehold documents:', error);
      throw new Error(error);
    }
  };

  const fetchDataFromApi = async (loanId: string) => {
    try {
      const BusinessPremiseDetailsApiResponse =
        await businessPremiseDetailsGetAPI(loanId);
      if (BusinessPremiseDetailsApiResponse?.status_code === 200) {
        const data = BusinessPremiseDetailsApiResponse.data;
        if (Object.keys(data)?.length > 0) {
          setIsLimitedCompany(data.business_type === 'Limited Company');
          
          // Handle registered_address - flatten leasehold if exists
          if (data.registered_address?.leasehold) {
            data.registered_address = {
              ...data.registered_address,
              ...data.registered_address.leasehold
            };
            delete data.registered_address.leasehold;
          }
          
          // Handle trading_address - keep leasehold nested but extract documents
          if (data.trading_address?.leasehold) {
            // Extract documents from leasehold (API returns 'documents' array)
            const documents = data.trading_address.leasehold.documents || [];
            
            // Create a flattened version for form handling but preserve the structure
            const flattenedTradingAddress = {
              ...data.trading_address,
              ...data.trading_address.leasehold,
              documents: documents // Keep documents for conversion
            };
            
            // Keep original structure for API but use flattened for form
            data.trading_address_for_form = flattenedTradingAddress;
          }

          // Convert leasehold document for trading address and registered address
          const modifiedTradingAddress = await convertLeaseholdDocument(
            data.trading_address_for_form || data.trading_address
          );
          const modifiedRegisteredAddress = await convertLeaseholdDocument(
            data.registered_address
          );

          // Update data with modified addresses
          const modifiedData = {
            ...data,
            trading_address: modifiedTradingAddress,
            registered_address: modifiedRegisteredAddress
          };
          // Set business premise details and reset form
          setBusinessPremiseDetails(modifiedData);
        }

        reset({
          ...BusinessPremiseDetailsApiResponse.data,
          trading_address: {
            ...EMPTY_TRADING_ADDRESS,
            ...(BusinessPremiseDetailsApiResponse.data.trading_address_for_form || BusinessPremiseDetailsApiResponse.data.trading_address || {})
          }
        });

      } else {
        showToast(BusinessPremiseDetailsApiResponse.status_message, {
          type: NotificationType.Error
        });
      }
    } catch (error) {
      console.log('Exception', error);
      showToast('something wrong!', { type: NotificationType.Error });
    }
  };

  useEffect(() => {
    if (authenticated && loanId) {
      fetchDataFromApi(loanId);
    }
  }, [loanId]);

  useEffect(() => {
    if (registeredAddress) {
      const lookedUpData = lookUpAddressFormatter(registeredAddress);
      setValue('registered_address.post_code', lookedUpData.pincode);
      setValue('registered_address.address_line', lookedUpData.addressText);
      trigger('registered_address.address_line');
    }
    if (tradingAddress) {
      const tradingAddressData = {
        address_line: tradingAddress.address_line || '',
        town_city: tradingAddress.town_city || '',
        post_code: tradingAddress.post_code || '',
        premise_type: tradingAddress.premise_type || '',
        start_date: tradingAddress.start_date || '',
        end_date: tradingAddress.end_date || '',
        trading_documents: tradingAddress.trading_documents || []
      };
      
      setValue('trading_address', {
        ...EMPTY_TRADING_ADDRESS,
        ...(tradingAddressData ?? {})
      });

      trigger(
        'trading_address.address_line' as keyof BusinessPremiseDetailsType
      );
    } else {
      // Initialize with empty object if no trading address data
      setValue('trading_address', EMPTY_TRADING_ADDRESS);
      trigger('trading_address');
    }
  }, [tradingAddress, registeredAddress, setValue, trigger]);

  const onSubmit: SubmitHandler<BusinessPremiseDetailsType> = async data => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      if (!data.trading_same_as_registered) {
        data.trading_same_as_registered = false;
      }
      formData.append(
        'registered_address.address_line',
        data.registered_address.address_line
      );
      formData.append(
        'registered_address.post_code',
        data.registered_address.post_code
      );
      // formData.append(
      //   'registered_address.premise_type',
      //   data.registered_address.premise_type
      // );
      formData.append(
        'trading_same_as_registered',
        JSON.stringify(data.trading_same_as_registered)
      );

      // if (data?.registered_address?.premise_type === 'Leasehold') {
      //   formData.append(
      //     'registered_address.leasehold.start_date',
      //     convertDateString(data.registered_address.start_date)
      //   );
      //   formData.append(
      //     'registered_address.leasehold.end_date',
      //     convertDateString(data.registered_address.end_date)
      //   );
      //   formData.append(
      //     'registered_address.leasehold.document',
      //     data.registered_address.document[0]
      //   );
      // }
      if (data.trading_same_as_registered === false) {
        formData.append(
          'trading_address.address_line',
          data.trading_address.address_line
        );
        formData.append(
          'trading_address.post_code',
          data.trading_address.post_code
        );
      }
      if (data?.trading_address.premise_type) {
        formData.append(
          'trading_address.premise_type',
          data.trading_address.premise_type
        );
      }
      if (data?.trading_address?.premise_type === 'Leasehold') {
        formData.append(
          'trading_address.leasehold.start_date',
          convertDateString(data.trading_address.start_date)
        );
        formData.append(
          'trading_address.leasehold.end_date',
          convertDateString(data.trading_address.end_date)
        );
        // Handle trading documents
        const tradingDocuments = getValues('trading_address.trading_documents' as any);
        
        if (tradingDocuments && Array.isArray(tradingDocuments) && tradingDocuments.length > 0) {
          tradingDocuments.forEach((file: File) => {
            // Send all documents with the correct field name as backend expects
            formData.append('trading_address.leasehold.trading_documents', file);
          });
        }
      }

      const response = await businessPremiseDetailsPostAPI(formData, loanId);
      if (response.status_code >= 200 && response.status_code < 300) {
        // dispatch(updateBusinessPremiseDetails(data));
        showToast(response.status_message, { type: NotificationType.Success });
        updateFilledForms(loanId, {
          complete_business_premis_detail: true
        }); // update filled forms

        setTimeout(() => {
          dispatch(updateCurrentStage(4));
        }, 1500);
      } else {
        console.log('error', response.status_message);
        showToast(response.status_message, { type: NotificationType.Error });
      }
    } catch (error) {
      console.log('Exception', error);
      showToast('something wrong!', { type: NotificationType.Error });
    } finally {
      setTimeout(() => {
        setIsLoading(false); // Reset loading state when done submitting
      }, 1500);
    }
  };

  const onError: SubmitErrorHandler<BusinessPremiseDetailsType> = error => {
    trigger();
    showToast('Please check the validation error!', {
      type: NotificationType.Error
    });
    console.log('error', error);
  };

  // const watchRegisteredPremiseType = watch(
  //   'registered_address.premise_type',
  //   'Freehold'
  // );
  const watchBusinessSameAsRegistered = watch(
    'trading_same_as_registered',
    businessPremiseDetails.trading_same_as_registered || false
  );

  useEffect(() => {
    if (watchBusinessSameAsRegistered) {
      setValue(
        'trading_address.post_code' as keyof BusinessPremiseDetailsType,
        getValues('registered_address.post_code')
      );

      setValue(
        'trading_address.address_line' as keyof BusinessPremiseDetailsType,
        getValues('registered_address.address_line')
      );
      trigger('trading_address');
    } else {
      setValue(
        'trading_address.post_code' as keyof BusinessPremiseDetailsType,
        ''
      );

      setValue(
        'trading_address.address_line' as keyof BusinessPremiseDetailsType,
        ''
      );
      trigger('trading_address');
    }
  }, [watchBusinessSameAsRegistered]);

  const watchTradingPremiseType = watch(
    'trading_address.premise_type' as keyof BusinessPremiseDetailsType,
    'Freehold'
  );

  const getNestedError = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };



  const DocumentUpload = ({ itemName }) => {
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, itemName: string) => {
      const files = e.target.files;
      if (!files) return;

      const fileArray = Array.from(files);
      const fieldName = itemName;
      
      // Append new files to existing ones
      const currentFiles = getValues(fieldName as any) || [];
      const updatedFiles = Array.isArray(currentFiles) 
        ? [...currentFiles, ...fileArray] 
        : [...(currentFiles ? [currentFiles] : []), ...fileArray];
        
      console.log(`📁 Adding ${fileArray.length} files. New total: ${updatedFiles.length}`);
      
      setValue(fieldName as keyof BusinessPremiseDetailsType, updatedFiles);
      trigger(fieldName as keyof BusinessPremiseDetailsType);
      
      // Reset input so same files can be selected again if removed
      e.target.value = '';
    };


    // const isMultiple = (
    //   loanFormBusinessPremiseDetails.find(
    //     i => i.type === 'file' && i.name === itemName
    //   ) as fileControllerProps
    // ).isMultiple;

    const fieldName = itemName;
    const rawWatchedFiles = watch(fieldName);
const watchedFiles: File[] = Array.isArray(rawWatchedFiles)
  ? rawWatchedFiles
  : rawWatchedFiles
  ? [rawWatchedFiles]
  : [];

    const fieldError = getNestedError(formState?.errors, fieldName);

    const handleClose = (fileName) => {
      const file = watchedFiles.filter(
        word => word.name !== fileName
      );
      setValue(fieldName, file);
      trigger(fieldName);
    };



    return (
      <div className={`w-full rounded-2xl border transition-all duration-300 mb-6 bg-white ${
        fieldError 
          ? 'border-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]' 
          : watchedFiles.length > 0 
            ? 'border-green-100 shadow-[0_8px_20px_-8px_rgba(34,197,94,0.1)]' 
            : 'border-gray-100 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.03)]'
      }`}>
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              fieldError 
                ? 'bg-red-50 border-red-100 text-red-500' 
                : watchedFiles.length > 0 
                  ? 'bg-green-50 border-green-100 text-green-500' 
                  : 'bg-gray-50 border-gray-100 text-[#1A439A]'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div>
              <h4 className={`text-sm font-bold tracking-tight ${
                fieldError ? 'text-red-600' : 'text-gray-800'
              }`}>
                Upload Documents
              </h4>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">
                Proof of address / Premises
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {watchedFiles.length > 0 && !fieldError && (
              <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-green-50 border border-green-100 text-green-600 text-[11px] font-bold uppercase tracking-wider">
                <IoCheckmark size={14} />
                Complete
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="container mx-auto mt-4">
            {watchedFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {watchedFiles.map((file, fileId) => {
                  const isImage = file.type && file.type.startsWith('image/');
                  const previewUrl = file instanceof File ? URL.createObjectURL(file) : (file as any).url;
                  
                  return (
                    <div 
                      key={fileId} 
                      className="group relative flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)] hover:border-[#1A439A]/10"
                    >
                      <div className="flex-shrink-0 w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-50">
                        {isImage ? (
                          <img 
                            src={previewUrl} 
                            alt="preview" 
                            className="w-full h-full object-cover"
                            onLoad={() => { if (file instanceof File) URL.revokeObjectURL(previewUrl); }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <PiFilesLight size={24} className="text-[#1A439A]" />
                            <span className="text-[9px] font-extrabold text-[#1A439A]/40 mt-0.5 uppercase">
                              {file.type?.split('/')[1] || 'PDF'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <p className="text-[13px] font-bold text-gray-800 truncate leading-tight">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {/* <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> */}
                          <span className="text-[10px] text-gray-400 font-medium font-mono">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>

                      <button 
                        type="button"
                        onClick={() => handleClose(file.name)}
                        className="flex-shrink-0 p-2 rounded-full hover:bg-red-50 text-gray-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                        title="Remove file"
                      >
                        <IoMdClose size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {(watchedFiles.length === 0 || 
              (loanFormBusinessPremiseDetails.find(i => i.type === 'file' && i.name === itemName) as fileControllerProps)?.isMultiple
            ) && (
              <div className="w-full">
                <label
                  className={`group relative flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 ${
                    fieldError 
                      ? 'border-red-200 bg-red-50/20' 
                      : 'border-gray-200 bg-gray-50/30 hover:bg-white hover:border-[#1A439A]/30 hover:shadow-[0_8px_30px_-4px_rgba(26,67,154,0.05)]'
                  }`}
                >
                  <input
                    type="file"
                    multiple={(loanFormBusinessPremiseDetails.find(i => i.type === 'file' && i.name === itemName) as fileControllerProps).isMultiple}
                    onChange={event => handleFileUpload(event, itemName)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept={(loanFormBusinessPremiseDetails.find(i => i.type === 'file' && i.name === itemName) as fileControllerProps).memTypes}
                  />
                  
                  <div className={`p-4 rounded-2xl bg-white shadow-sm mb-3 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_12px_20px_-8px_rgba(26,67,154,0.2)] ${
                    fieldError ? 'text-red-500 ring-4 ring-red-50' : 'text-[#1A439A]'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  
                  <span className={`text-[15px] font-bold ${fieldError ? 'text-red-600' : 'text-gray-800'}`}>
                    {watchedFiles.length > 0 ? 'Add more documents' : 'Choose files to upload'}
                  </span>
                  <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                    Drag and drop or <span className="text-[#1A439A] underline decoration-2 underline-offset-4">browse local files</span>
                  </p>
                </label>
              </div>
            )}
            
            <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-center">
              <div className="flex items-center gap-2 py-1.5 px-4 rounded-full bg-gray-50/50 border border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <p className={`text-[10px] font-bold tracking-tight uppercase ${fieldError ? 'text-red-500' : 'text-gray-400'}`}>
                  JPG, PNG, GIF, SVG, WEBP & PDF • Max 10MB per file
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // const registeredAddressStartDate = getValues('registered_address.start_date');

  const getTradingAddress = getValues('trading_address') as
    | {
        start_date?: string;
        end_date?: string;
      }
    | undefined;

  return (
    <FormProvider {...methods}>
      {isLoading && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
        >
          <Loader />
        </div>
      )}
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit, onError)}
        className="p-4"
      >
        <div>
          <div className="p-2 text-[16px] font-medium">
            {'Registered Address'}
          </div>

          <div className="grid gap-4 p-2 max-sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
            <div className="">
              <AddressLookup
                setAddress={setRegisteredAddress}
                value={watch(
                  'registered_address.post_code',
                  businessPremiseDetails?.registered_address?.post_code || ''
                )}
                methods={methods}
                pincodeKey="registered_address.post_code"
                error={formState?.errors?.registered_address?.post_code}
                isDisabled={isLimitedCompany}
              />
            </div>
            <div className="">
              {fieldRenderer.renderField(['registered_address.address_line'], {
                isDisabled: isLimitedCompany
              })}
            </div>
          </div>

          {/* <div className="grid grid-cols-1 gap-4 p-2">
            <div className="flex items-center border-b-2  ">
              <div className=" text-gray-400 pr-2 w-5 ">
                <img src={quest} />
              </div>{" "}
              <a className="text-[14px] text-[#929292]">Premise Type?</a>
            </div>
            <div>
              {fieldRenderer.renderField(['registered_address.premise_type'], {
                isDisabled: isLimitedCompany
              })}
            </div>{' '}
          </div> */}
        </div>

        {/* {watchRegisteredPremiseType === 'Leasehold' && (
          <>
            <div className="p-2 text-[16px] font-medium">
              {'Lease Time period'}
            </div>
            <div className="grid gap-4 p-2 max-sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
              <div className="">
                {fieldRenderer.renderField(['registered_address.start_date'])}
              </div>
              <div className=" ">
                {fieldRenderer.renderField(['registered_address.end_date'], {
                  min: (registeredAddressStartDate as string) || null
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 p-2">
              <DocumentUpload itemName="registered_address.document" />
            </div>
          </>
        )} */}

        <div className="grid grid-cols-1 gap-4 p-2">
          {fieldRenderer.renderField('trading_same_as_registered')}
        </div>

        <div className="p-2 text-[16px] font-medium">{'Trading Address'}</div>
        <div className="grid gap-4 p-2 max-sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          <div className="">
            <AddressLookup
              setAddress={setTradingAddress}
              value={watch(
                'trading_address.post_code' as keyof BusinessPremiseDetailsType,
                businessPremiseDetails?.trading_address?.post_code || ''
              )}
              methods={methods}
              pincodeKey="trading_address.post_code"
              // @ts-expect-error: Type error occurs because `post_code` is missing its type in `BusinessPremiseDetailsSchema` when `trading_same_as_registered` is false
              error={formState?.errors?.trading_address?.post_code}
              isDisabled={getValues('trading_same_as_registered')}
            />
          </div>
          <div className="">
            {fieldRenderer.renderField(['trading_address.address_line'])}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-2">
          {/* <div className="flex items-center border-b-2  ">
                <div className=" text-gray-400 pr-2 w-5 ">
                  <img src={quest} />
                </div>{" "}
                <a className="text-[14px] text-[#929292]">Premise Type?</a>
              </div> */}
          <div className=" ">
            {fieldRenderer.renderField(['trading_address.premise_type'])}
          </div>{' '}
        </div>

        {watchTradingPremiseType && watchTradingPremiseType === 'Leasehold' && (
          <>
            <div className="p-2 text-[16px] font-medium">
              {'Lease Time period'}
            </div>
            <div className="grid gap-4 p-2 max-sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
              <div className="">
                {fieldRenderer.renderField(['trading_address.start_date'])}
              </div>
              <div className=" ">
                {fieldRenderer.renderField(['trading_address.end_date'], {
                  min: getTradingAddress?.start_date ?? '',
                  isDisabled: !getTradingAddress?.start_date
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 p-2">
              <DocumentUpload 
                itemName="trading_address.trading_documents" 
              />
            </div>
          </>
        )}
      </form>
    </FormProvider>
  );
};

export default BusinessPremiseDetails;
