import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useRef } from 'react';
import {
  affordabilityExpenses,
  affordabilityExtraFields,
  affordabilityGeneral,
  affordabilityReceipts,
  fieldClass,
  labelClass
} from '../../../utils/constants';
import InputController from '../../commonInputs/Input';
import { FormProvider, useForm } from 'react-hook-form';
import { affordabilityGeneralSchema } from '../../../utils/Schema';
import { postAffordabilityApi } from '../../../api/loanServices';
import DateController from '../../commonInputs/Date';
import { NotificationType } from '../../../utils/hooks/toastify/enums';
import useToast from '../../../utils/hooks/toastify/useToast';
import {
  AffordabilityGeneralField,
  AffordabilityGeneralFormProps,
  affordabilityGeneralType
} from '../../../utils/types';

// import { updateFilledForms } from '../../../utils/helpers';

const AffordabilityGeneralForm = ({
  data,
  setAffordabilityActiveStage,
  loanId,
  fetchData,
  setRef,
  isUpdate,
  setIsUpdate
}: AffordabilityGeneralFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  setRef(formRef);
  const { showToast } = useToast();

  const methods = useForm({
    resolver: yupResolver(affordabilityGeneralSchema)
  });

  const { setValue, handleSubmit, getValues } = methods;

  const setData = () => {
    const dataArray = [
      ...affordabilityGeneral,
      ...affordabilityReceipts,
      ...affordabilityExpenses,
      ...affordabilityExtraFields
    ];
    dataArray.forEach(i => {
      if (i.type === 'number') {
        const value = parseFloat(data[i.key]);
        setValue(i.key as keyof affordabilityGeneralType, value);
      } else if (i.type === 'date') {
        const date = data[i.key];
        setValue(i.key as keyof affordabilityGeneralType, date);
      } else {
        setValue(i.key as keyof affordabilityGeneralType, data[i.key]);
      }
    });
  };

  const onNext = async data => {
    const payload = data;

    try {
      const response = await postAffordabilityApi(payload, loanId);
      if (response.status_code === 200) {
        fetchData();
        setTimeout(() => {
          setAffordabilityActiveStage('gross_form');
        }, 1500);
        // updateFilledForms(loanId, {
        //   complete_affordability: true,
        // });
        showToast(response.status_message, { type: NotificationType.Success });
      } else {
        showToast(response.status_message, { type: NotificationType.Error });
        console.log('error');
      }
    } catch (error) {
      console.log(error, 'error');
      showToast('something wrong!', { type: NotificationType.Error });
    }
  };

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

  useEffect(() => {
    if (data) setData();
  }, [data]);

  // const { watch, setValue, handleSubmit, control } = methods
  return (
    <div className="h-[70vh] overflow-auto max-lg:h-[60vh]">
      <p className="mb-4 px-[2%] text-[20px] font-semibold text-[#02002E]">
        Affordability
      </p>
      <FormProvider {...methods}>
        <form ref={formRef} onSubmit={handleSubmit(onNext)}>
          <div className="max-sm:cols-1 grid grid-cols-3 gap-4 p-[2%] max-lg:grid-cols-1 max-sm:justify-center">
            {affordabilityGeneral.map((i: AffordabilityGeneralField, index) => {
              return i.type == 'date' ? (
                <DateController
                  key={index}
                  metaData={{
                    fieldClass: `${fieldClass} ${i.autoFilled && 'bg-gray-200 text-gray-500 cursor-not-allowed'}`,
                    labelClass: labelClass,
                    // key: i.key,
                    placeholder: i.label,
                    isRequired: i.autoFilled ? false : true,
                    name: i.key,
                    // label: i.label,
                    type: i.type,
                    isDisabled: i.autoFilled
                  }}
                />
              ) : (
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
              );
            })}
          </div>
          <p className="mb-4 px-[2%] text-[20px] font-semibold text-[#02002E]">
            Receipts
          </p>

          <div
            className={
              'max-sm:cols-1 grid grid-cols-3 gap-4 p-[2%] max-lg:grid-cols-1 max-sm:justify-center'
            }
          >
            {affordabilityReceipts.map(
              (i: AffordabilityGeneralField, index) => (
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

          <p className="mb-4 px-[2%] text-[20px] font-semibold text-[#02002E]">
            Expenses
          </p>
          <div className="max-sm:cols-1 grid grid-cols-3 gap-4 p-[2%] max-lg:grid-cols-1 max-sm:justify-center">
            {affordabilityExpenses.map(
              (i: AffordabilityGeneralField, index) => (
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

          <div className="max-sm:cols-1 grid grid-cols-3 gap-4 p-[2%] max-lg:grid-cols-1 max-sm:justify-center">
            {affordabilityExtraFields.map(
              (i: AffordabilityGeneralField, index) => (
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
              className='p-4 rounded border-2 border-black '
              type='submit'
            >
              <BiChevronRight />
            </button>
          </div> */}
        </form>
      </FormProvider>
    </div>
  );
};

export default AffordabilityGeneralForm;
