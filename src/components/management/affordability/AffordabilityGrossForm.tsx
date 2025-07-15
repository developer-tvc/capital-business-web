import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { postAffordabilityApi } from '../../../api/loanServices';
import {
  affordabilityGrossAmountFields,
  affordabilityGrossFields,
  fieldClass,
  labelClass
} from '../../../utils/constants';
import { updateFilledForms } from '../../../utils/helpers';
import { NotificationType } from '../../../utils/hooks/toastify/enums';
import useToast from '../../../utils/hooks/toastify/useToast';
import { affordabilityGrossSchema } from '../../../utils/Schema';
import { affordabilityGrossType } from '../../../utils/types';
import InputController from '../../commonInputs/Input';

const AffordabilityGrossForm = ({
  data,
  loanId,
  isHigherAuthority,
  setAffordabilityActiveStage,
  fetchData,
  setRef,
  isUpdate,
  setIsUpdate
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  setRef(formRef);
  const methods = useForm({
    resolver: yupResolver(affordabilityGrossSchema)
  });
  const { showToast } = useToast();

  const [directors, setDirectors] = useState([]);
  const [existingContracts, setExistingContracts] = useState([]);

  const {
    getValues,
    setValue,
    handleSubmit,
    formState: { errors }
  } = methods;

  const setData = () => {
    const dataArray = [
      ...affordabilityGrossFields,
      ...affordabilityGrossAmountFields
    ];

    dataArray.forEach(
      (i: {
        key: string;
        label: string;
        type:
          | 'number'
          | 'email'
          | 'text'
          | 'tel'
          | 'range'
          | 'password'
          | 'date';
        autoFilled: boolean;
      }) => {
        if (i.type === 'number') {
          const value = parseFloat(data[i.key]);
          setValue(i.key as keyof affordabilityGrossType, value);
        } else {
          setValue(i.key as keyof affordabilityGrossType, data[i.key]);
        }
      }
    );

    if (data?.directors) {
      setDirectors([
        ...(data?.directors || []),
        ...(data?.guarantors ? [data?.guarantors] : [])
      ]);
    }
    if (data?.existing_contracts) {
      setExistingContracts(data?.existing_contracts);
    }
  };

  const onSubmit = async data => {
    try {
      const response = await postAffordabilityApi(data, loanId);
      if (response?.status_code === 200) {
        showToast(response.status_message, {
          type: NotificationType.Success
        });
        if (isHigherAuthority) {
          fetchData();
          setTimeout(() => {
            setAffordabilityActiveStage('approval_form');
          }, 1500);
          updateFilledForms(loanId, {
            complete_affordability: true
          });
        } else {
          setAffordabilityActiveStage('affordability_completed');
        }
      } else {
        showToast('something wrong!', { type: NotificationType.Error });
      }
    } catch (error) {
      console.log(error.message, 'error');
    }
  };

  useEffect(() => {
    if (errors) console.log(errors, 'errors');
  }, [errors]);

  useEffect(() => {
    if (data) setData();
  }, [data]);

  const onUpdate = async () => {
    const payload = getValues();

    try {
      const response = await postAffordabilityApi(payload, loanId);
      if (response.status_code === 200) {
        fetchData();
        setIsUpdate(false);
      } else {
        showToast(response.status_message, { type: NotificationType.Error });
        console.log('error');
      }
    } catch (error) {
      console.log(error, 'error');
      showToast('something wrong!', { type: NotificationType.Error });
    }
  };

  useEffect(() => {
    if (isUpdate) onUpdate();
  }, [isUpdate]);

  return (
    <div className="h-[70vh] overflow-auto max-lg:h-[60vh]">
      <FormProvider {...methods}>
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <div className="max-sm:cols-1 grid grid-cols-3 gap-4 p-[2%] max-lg:grid-cols-1 max-sm:justify-center">
            {affordabilityGrossFields.map(
              (
                i: {
                  key: string;
                  label: string;
                  type:
                    | 'number'
                    | 'email'
                    | 'text'
                    | 'tel'
                    | 'range'
                    | 'password'
                    | 'date';
                  autoFilled: boolean;
                },
                index
              ) => (
                <InputController
                  key={index}
                  metaData={{
                    fieldClass: `${fieldClass} ${i.autoFilled && 'bg-gray-200 text-gray-500 cursor-not-allowed'}`,
                    labelClass: labelClass,
                    key: i.key,
                    placeholder: i.label,
                    isRequired: i.autoFilled ? false : true,
                    name: i.key,
                    label: i.label,
                    type: i.type,
                    isFractional: true,
                    isDisabled: i.autoFilled
                  }}
                />
              )
            )}
          </div>

          <div className="my-4">
            <p className="mb-4 px-[2%] text-[20px] font-semibold text-[#02002E]">
              {'Directors / Guarantors'}{' '}
            </p>
            <div className="grid grid-cols-3 gap-6 p-[2%] max-lg:grid-cols-1">
              {directors.map((i, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="text-lg font-semibold text-gray-800">
                    {index + 1}. {i?.title} {i?.first_name}
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-gray-700">
                        Credit Score:
                      </span>{' '}
                      {i?.credit_score ?? 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Credit Score Updated At:
                      </span>{' '}
                      {i?.credit_score_updated_at ?? 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Risk Score:
                      </span>{' '}
                      {i?.risk_score ?? 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Risk Score Updated At:
                      </span>{' '}
                      {i?.risk_score_updated_at ?? 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="my-4">
            <p className="mb-4 px-[2%] text-[20px] font-semibold text-[#02002E]">
              {'Existing Contracts'}
            </p>
            <div className="max-sm:cols-1 grid grid-cols-3 gap-4 p-[2%] max-lg:grid-cols-1 max-sm:justify-center">
              {existingContracts.length > 0 ? (
                existingContracts.map(i => (
                  <div className="flex items-center justify-between gap-2 rounded-lg border p-4 px-2">
                    <p
                      // onClick={() => alert("view customer details")}
                      className="cursor-pointer"
                    >
                      {`Loan Number: ${i.loan_number} | Outstanding Amount: £ ${i.outstanding_amount}`}
                    </p>
                  </div>
                ))
              ) : (
                <p className="">{'No Existing Contracts'}</p>
              )}
            </div>
          </div>

          <div className="max-sm:cols-1 grid grid-cols-3 gap-4 p-[2%] max-lg:grid-cols-1 max-sm:justify-center">
            {affordabilityGrossAmountFields.map(
              (
                i: {
                  key: string;
                  label: string;
                  type:
                    | 'number'
                    | 'email'
                    | 'text'
                    | 'tel'
                    | 'range'
                    | 'password'
                    | 'date';
                  autoFilled: boolean;
                },
                index
              ) => (
                <InputController
                  key={index}
                  metaData={{
                    fieldClass: `${fieldClass} ${i.autoFilled && 'bg-gray-200 text-gray-500 cursor-not-allowed'}`,
                    labelClass: labelClass,
                    key: i.key,
                    placeholder: i.label,
                    isRequired: i.autoFilled ? false : true,
                    name: i.key,
                    label: i.label,
                    type: i.type,
                    isFractional: true,
                    isDisabled: i.autoFilled
                  }}
                />
              )
            )}
          </div>
          {/* <div className='flex w-full justify-end items-center gap-2'>
            <button
              type='button'
              className='p-4 rounded border-2 border-black '
              onClick={() => setAffordabilityActiveStage('general_form')}
            >
              <BiChevronLeft />
            </button>
            {isHigherAuthority && (
              <button
                className='p-4 rounded border-2 border-black '
                type='submit'
              >
                <BiChevronRight />
              </button>
            ) 
            : (
              <button
                type='submit'
                className='p-4 rounded  bg-[tomato] text-white '
              >
                Submit
              </button>
            )
            }
          </div> */}
        </form>
      </FormProvider>
    </div>
  );
};

export default AffordabilityGrossForm;
