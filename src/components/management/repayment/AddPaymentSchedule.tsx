import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { RxCross2 } from 'react-icons/rx';

import {
  loanFormCommonStyleConstant,
  paymentScheduleFields
} from '../../../utils/constants';
import { dynamicPaymentScheduleSchema } from '../../../utils/Schema';
import FieldRenderer from '../../commonInputs/FieldRenderer';
import Loader from '../../Loader';
import DateController from '../../commonInputs/Date';
import {
  isFriday,
  isMonday,
  isSaturday,
  isSunday,
  isThursday,
  isTuesday,
  isWednesday
} from 'date-fns';

const AddPaymentSchedule = ({
  toggleModal,
  methods,
  pendingAmount,
  editingSchedule
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remainingAmount, setRemainingAmount] = useState(pendingAmount);
  const [weekOptions, setWeekOptions] = useState([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
  ]);

  const fieldRenderer = new FieldRenderer(
    paymentScheduleFields,
    loanFormCommonStyleConstant,
    dynamicPaymentScheduleSchema
  );

  const dynamicPlanMethods = useForm({
    resolver: yupResolver(dynamicPaymentScheduleSchema),
    defaultValues: editingSchedule ? editingSchedule : {} // Initialize with editingSchedule if available
  });

  const {
    handleSubmit,
    // formState: { errors },
    setValue // Destructure setValue from methods
  } = dynamicPlanMethods;

  const onSubmit = data => {
    setIsLoading(true);
    const currentDynamicPlanFields =
      methods.getValues('adjustment_plans') || [];
    const lastAmount = editingSchedule
      ? pendingAmount + editingSchedule.amount
      : pendingAmount;
    if (data.amount > lastAmount) {
      setError(
        'Exceeds pending amount, please check installments and amount entered !!'
      );
      setIsLoading(false);
      return;
    }

    const updatedDynamicPlanFields = editingSchedule
      ? currentDynamicPlanFields.map(item =>
          item.day_of_debit === editingSchedule.day_of_debit ? data : item
        )
      : [...currentDynamicPlanFields, data];

    methods.setValue('adjustment_plans', updatedDynamicPlanFields, {
      shouldValidate: true
    });
    setTimeout(() => {
      setIsLoading(false);
      toggleModal();
    }, 1000);
  };

  const onError = error => {
    console.log('error', error);
  };

  useEffect(() => {
    if (editingSchedule) {
      // Autofill form fields with editingSchedule data
      setValue('amount', editingSchedule.amount);
      setValue('day_of_debit', editingSchedule.day_of_debit);
    }
  }, [editingSchedule, setValue]);

  useEffect(() => {
    if (!editingSchedule) {
      const currentDynamicPlanFields =
        methods.getValues('adjustment_plans') || [];

      const filteredOptions = weekOptions.filter(
        option =>
          !currentDynamicPlanFields.some(item => item.day_of_debit === option)
      );

      setWeekOptions(filteredOptions);
    }
  }, []);

  const watchAmount = dynamicPlanMethods.watch('amount');
  const { watch } = dynamicPlanMethods;
  const watchDynamicPlanFields = watch();

  const dayFunctionMap = {
    monday: isMonday,
    tuesday: isTuesday,
    wednesday: isWednesday,
    thursday: isThursday,
    friday: isFriday,
    saturday: isSaturday,
    sunday: isSunday
  };
  const filterDates = date => {
    const dayFunction =
      dayFunctionMap[watchDynamicPlanFields.day_of_debit?.toLowerCase()];
    return dayFunction ? dayFunction(date) : false;
  };

  useEffect(() => {
    if (watchAmount) {
      const lastAmount = editingSchedule
        ? pendingAmount + editingSchedule.amount - parseInt(watchAmount)
        : pendingAmount - watchAmount;
      setRemainingAmount(lastAmount);
      setError(null);
    }
  }, [watchAmount, pendingAmount]);

  return (
    <FormProvider {...dynamicPlanMethods}>
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
                {'Add Payment Schedule'}
              </p>
              <button
                onClick={toggleModal}
                type="button"
                className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-400"
              >
                <RxCross2 size={24} />
              </button>
            </div>
            <p className="px-4 pr-4">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm">
                    {'Remaining amount to schedule : '}
                    {remainingAmount}
                  </p>
                </div>
              </div>
            </p>
            <form
              onSubmit={handleSubmit(onSubmit, onError)}
              className="px-4 pb-6 text-[#000000]"
            >
              <div className="grid grid-cols-1 gap-4 p-2">
                {fieldRenderer.renderField('day_of_debit', {
                  isDisabled: editingSchedule,
                  options: weekOptions
                })}
              </div>
              <div className="grid grid-cols-1 gap-4 p-2">
                {fieldRenderer.renderField('amount')}
              </div>
              <div className="grid grid-cols-1 gap-4 p-2">
                <DateController
                  key="start_date"
                  metaData={{
                    fieldClass: loanFormCommonStyleConstant.date.fieldClass,
                    labelClass: loanFormCommonStyleConstant.date.labelClass,
                    placeholder: 'Day of Debit',
                    // isRequired: true,
                    name: `start_date`,
                    label: 'Day of Debit',
                    type: 'date',
                    filterDates: filterDates
                  }}
                />
              </div>
              <div>
                {error ? (
                  <p className="text-[12px] text-[tomato]">{error}</p>
                ) : null}
              </div>
              <div className="grid grid-cols-1 gap-4 py-2">
                <input
                  type="submit"
                  value="SUBMIT"
                  disabled={error}
                  className={`w-full rounded border ${error ? 'cursor-not-allowed border-gray-700 bg-gray-600' : 'cursor-pointer border-blue-700 bg-blue-900 hover:bg-blue-800'} px-4 py-2 text-[12px] font-medium text-white`}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default AddPaymentSchedule;
