import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { IoMdClose } from 'react-icons/io';
import { IoCheckmark } from 'react-icons/io5';
import { PiFilesLight } from 'react-icons/pi';

import {
  customerIdentityPostApi,
  customersGetList
} from '../../api/loanServices';
import {
  customerIdentityDocumentFormFields,
  loanFormCommonStyleConstant
} from '../../utils/constants';
import { NotificationType } from '../../utils/hooks/toastify/enums';
import useToast from '../../utils/hooks/toastify/useToast';
import { CustomerIdentityDocumentSchema } from '../../utils/Schema';
import { fileControllerProps } from '../../utils/types';
import FieldRenderer from '../commonInputs/FieldRenderer';
import Loader from '../Loader';
import { Roles } from '../../utils/enums';
import { useSelector } from 'react-redux';
import { authSelector } from '../../store/auth/userSlice';
import { managementSliceSelector } from '../../store/managementReducer';

const CustomerIdentityDocument = ({ userId, setIdentityUpdateToggle }) => {
  const { showToast } = useToast();

  const fieldRenderer = new FieldRenderer(
    customerIdentityDocumentFormFields,
    loanFormCommonStyleConstant,
    CustomerIdentityDocumentSchema
  );

  const methods = useForm({
    resolver: yupResolver(CustomerIdentityDocumentSchema)
  });
  const {
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors }
  } = methods;
  const { role } = useSelector(authSelector);
  const authUser = useSelector(authSelector);
  const managementUser = useSelector(managementSliceSelector).user;
  const user = [Roles.Customer, Roles.Leads].includes(role as Roles)
    ? authUser
    : managementUser;

  const customerId = userId || user?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [customerList, setCustomerList] = useState([]);

  const onSubmit = async data => {
    setIsLoading(true);
    try {
      // setResultData([...resultData, data]);
      const formData = new FormData();
      if (data.customer_id) {
        const customer = customerList.find(
          cust => cust.name == data.customer_id
        );
        formData.append('customer_id', customer.id);
      }
      if (data?.liveness_check) {
        formData.append('liveness_check', data?.liveness_check);
      }
      if (data?.face_match) {
        formData.append('face_match', data?.face_match);
      }
      if (data?.kyc_aml_check) {
        formData.append('kyc_aml_check', data?.kyc_aml_check);
      }
      if (data?.document_Verification) {
        formData.append('document_Verification', data?.document_Verification);
      }
      if (data?.document?.[0]) {
        formData.append('document', data?.document?.[0]);
      }
      const response = await customerIdentityPostApi(formData, customerId);
      if (response.status_code >= 200 && response.status_code < 300) {
        showToast(response.status_message, { type: NotificationType.Success });
      } else {
        showToast(response.status_message, { type: NotificationType.Error });
      }
    } catch (error) {
      console.log('Exception', error);
      showToast('something wrong!', { type: NotificationType.Error });
    } finally {
      reset(); // reset form after submit
      setTimeout(() => {
        setIsLoading(false); // Reset loading state when done submitting
        setIdentityUpdateToggle((PrevState: boolean) => !PrevState);
      }, 1500);
    }
  };

  const fetchCustomerList = async () => {
    const list = await customersGetList(customerId);

    const customerOptions = list.data.map(item => ({
      id: item.id, // ID you will need to send
      name: `${item.first_name} ${item.last_name}` // Name you want to show
    }));

    setCustomerList(customerOptions);
  };

  useEffect(() => {
    fetchCustomerList();
  }, []);

  const onError = error => {
    showToast('Please check the validation error!', {
      type: NotificationType.Error
    });
    console.log('error', error);
  };

  const watchIdentityDocument = watch('document', null);

  const FileUploadOption = ({ name, item, handleFileUpload, errors }) => (
    <div
      className={`flex w-full items-center justify-center ${
        errors[name] && 'border-red-500'
      }`}
    >
      <label
        className={`flex h-32 w-full flex-col border-[2px] border-dashed border-[#B7B7B7] ${
          errors[name] && 'border-red-500'
        }`}
      >
        <div className="flex flex-col items-center justify-center pt-7">
          <input
            type="file"
            multiple={
              (
                customerIdentityDocumentFormFields.find(
                  i => i.type === 'file' && i.name === item.name
                ) as fileControllerProps
              ).isMultiple
            }
            accept={
              (
                customerIdentityDocumentFormFields.find(
                  i => i.type === 'file' && i.name === item.name
                ) as fileControllerProps
              ).memTypes
            }
            onChange={e => handleFileUpload(e, item)}
            className="hidden"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-8 w-8 ${
              errors[name] ? 'text-red-500' : 'text-[#1A439A]'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600"></p>
          <p
            className={`text-[12px] ${
              errors[name] ? 'text-red-500' : 'text-[#1A449A]'
            } max-sm:text-[9px]`}
          >
            {'Upload Document'}
            {/* <a className="text-black"> or drag and drop </a> */}
          </p>
        </div>
      </label>
    </div>
  );

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
    // item: FundingFormFieldType
  ) => {
    const files = event.target.files;
    if (files) {
      setValue('document', files); // Set the value to an array of files
      // setIsOpenIndex(-1);
      trigger('document');
    }
  };

  const handleClose = () => {
    setValue('document', null);
    trigger('document');
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="mt-2 px-4 max-sm:px-1"
      >
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <Loader />
          </div>
        )}
        <div className="container mx-auto border bg-white p-4">
          <div className="grid grid-cols-1 gap-4 p-2">
            <div className="">
              {fieldRenderer.renderField(['liveness_check'])}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 p-2">
            <div className="">{fieldRenderer.renderField(['face_match'])}</div>
          </div>
          <div className="grid grid-cols-1 gap-4 p-2">
            <div className="">
              {fieldRenderer.renderField(['kyc_aml_check'])}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 p-2">
            <div className="">
              {fieldRenderer.renderField(['document_Verification'])}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 p-2">
            <div className="">
              {fieldRenderer.renderField(['customer_id'], {
                options: customerList.map(cust => cust.name),
                type: 'dropdown'
              })}
            </div>
          </div>

          {customerIdentityDocumentFormFields.map((item, index) => {
            // Check if the item is "document_upload_self_declaration"
            if (item.name !== 'document') {
              return null; // Skip rendering this item
            }

            return (
              <div className="w-full p-2" key={index}>
                <div
                  className={`accordion-title flex cursor-pointer justify-between py-2 ${
                    watchIdentityDocument && watchIdentityDocument
                      ? errors?.['document']
                        ? 'text-[#F44336]'
                        : 'border border-[#50C878] bg-[#EAF8EE] text-[#00CC08]'
                      : ''
                  } ${
                    // true // isOpenIndex === index
                    //   ? "border-t border-l  rounded-t-lg   border-r  mt-1"
                    //   : "border rounded-lg"

                    'mt-1 rounded-t-lg border-l border-r border-t'
                  }`}
                  onClick={() => {
                    // toggleAccordion(index);
                    // setIsOpenIndex(isOpenIndex === index ? null : index);
                  }}
                >
                  <span className="accordion flex gap-2 p-3.5 text-[14px] font-medium">
                    <div className="text-gray-400">
                      {item.icon && item.icon()}
                    </div>
                    <label>
                      {item.label}{' '}
                      {item.isRequired && (
                        <span className="text-red-500">{' *'}</span>
                      )}
                    </label>
                  </span>
                  {watchIdentityDocument &&
                    watchIdentityDocument &&
                    !errors?.['document'] && (
                      <span className="accordion-tick p-4">
                        <IoCheckmark />
                      </span>
                    )}
                </div>

                <div className="accordion-content rounded-b-lg border border-t-0 bg-white py-1">
                  <div className="flex flex-wrap gap-6 p-4 text-[12px] font-normal text-[#929292]">
                    {watchIdentityDocument ? (
                      <span
                        key={'document'}
                        className="flex items-center gap-1"
                      >
                        <PiFilesLight
                          size={28}
                          color={errors?.['document'] ? '#F44336' : '#00CC08'}
                        />
                        <span
                          className={
                            errors?.['document']
                              ? 'text-red-500'
                              : 'text-[#00CC08]'
                          }
                        >
                          {watchIdentityDocument[0].name}
                        </span>
                        <a onClick={() => handleClose()}>
                          <IoMdClose color="#000000" className="font-medium" />
                        </a>
                      </span>
                    ) : (
                      <FileUploadOption
                        name={item.name}
                        item={item}
                        handleFileUpload={handleFileUpload}
                        errors={errors}
                      />
                    )}
                  </div>
                </div>

                {Array.isArray(errors['document']) ? (
                  <div className={loanFormCommonStyleConstant.file.errorClass}>
                    <p className="mb-[12px] border-b-2 border-red-500"></p>
                    <p>{errors['document'][0].message}</p> {/* Error message */}
                  </div>
                ) : (
                  errors[item.name] && (
                    <div
                      className={loanFormCommonStyleConstant.file.errorClass}
                    >
                      <p className="mb-[12px] border-b-2 border-red-500"></p>
                      <p>{errors[item.name].message}</p> {/* Error message */}
                    </div>
                  )
                )}
              </div>
            );
          })}

          <div className="grid grid-cols-1 gap-4 p-2">
            <button
              type="submit"
              className="bg-[#1A439A] px-5 py-3 font-medium uppercase text-white"
            >
              {'Add Customer Identity'}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default CustomerIdentityDocument;
