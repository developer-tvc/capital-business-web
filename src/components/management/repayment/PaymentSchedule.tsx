import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { RiDeleteBinLine } from 'react-icons/ri';

import {
  getPaymentScheduleAPI,
  addPaymentScheduleAPI
} from '../../../api/loanServices';
import { NotificationType } from '../../../utils/hooks/toastify/enums';
import useToast from '../../../utils/hooks/toastify/useToast';
import { paymentScheduleSchema } from '../../../utils/Schema';
import AddRepayment from './AddPaymentSchedule';
import { IoMdAdd } from 'react-icons/io';
import useAuth from '../../../utils/hooks/useAuth';
import { MdEdit } from 'react-icons/md';

const PaymentSchedule = ({ loanId, setRef, setIsUwRepaymentComplete }) => {
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if (formRef.current) {
      setRef(formRef);
    }
  }, [setRef]);
  
  useEffect(() => {
    // Component mounted
  }, []);
  
  const methods = useForm({
    resolver: yupResolver(paymentScheduleSchema)
  });

  const [pendingAmount, setPendingAmount] = useState(0);

  const {
    handleSubmit,
    watch,
    trigger
  } = methods;

  const { authenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contractId, SetContractId] = useState(null);
  const [totalPendingDueToCollect, SetTotalPendingDueToCollect] = useState(0);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const openModal = () => {
    if (pendingAmount > 0) {
      setIsModalOpen(true);
      setEditingSchedule(null);
    }
  };
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (pendingAmount) {
      setPendingAmount(Math.round(pendingAmount * 100) / 100); // Rounds to 2 decimal places
    }
  }, [pendingAmount]);

  const currentDynamicPlanFields = watch('adjustment_plans') || [];

  const handleDelete = () => {
    methods.setValue('adjustment_plans', []);
  };

  useEffect(() => {}, [watch('adjustment_plans')]);
  const { showToast } = useToast();

  const onError = (formErrors) => {
    console.log('Form Validation Errors:', formErrors);
    
    // Helper to extract the first error message from the nested errors object
    const getFirstError = (errorsObj) => {
      if (!errorsObj) return null;
      if (typeof errorsObj === 'string') return errorsObj;
      if (errorsObj.message) return errorsObj.message;
      
      for (const key in errorsObj) {
        const result = getFirstError(errorsObj[key]);
        if (result) return result;
      }
      return null;
    };

    const errorMessage = getFirstError(formErrors);
    showToast(errorMessage || "Validation failed. Please check the required fields.", { 
      type: NotificationType.Error,
      autoClose: 6000 
    });

    // Automatically open the edit modal for the first entry with a validation error
    if (formErrors.adjustment_plans) {
      const plans = methods.getValues('adjustment_plans') || [];
      // Find the first index that has an error in the adjustment_plans array
      const errorIndex = formErrors.adjustment_plans.findIndex((err: any) => err !== undefined && err !== null);
      
      if (errorIndex !== -1 && plans[errorIndex]) {
        setTimeout(() => {
          setEditingSchedule(plans[errorIndex]);
          setIsModalOpen(true);
        }, 2000);
      }
    }
  };

  const onSubmit = async (data) => {
    // 1. Trigger Yup validation
    const isValid = await trigger();
    if (!isValid) {
      // trigger() populates errors in the background, but we already have onError for when handleSubmit fails.
      // This onSubmit trigger is a fallback.
      return;
    }

    // 2. Comprehensive manual guard: check all plans for missing/invalid start_date
    const schedulePlans = data.adjustment_plans || [];
    
    let invalidPlan = null;
    const hasInvalidDate = schedulePlans.some(plan => {
      const dateVal = plan.start_date;
      const isInvalid = (
        dateVal === null || 
        dateVal === undefined || 
        dateVal === "" || 
        dateVal === "null" || 
        dateVal === "1970-01-01"
      );
      if (isInvalid) {
        invalidPlan = plan;
      }
      return isInvalid;
    });

    if (hasInvalidDate) {
      showToast("One or more payment schedules are missing a valid Date of Debit. Please select a date for all schedules.", { 
        type: NotificationType.Error,
        autoClose: 6000
      });
      
      // Automatically open the edit modal for the first invalid plan after a short delay
      if (invalidPlan) {
        setTimeout(() => {
          setEditingSchedule(invalidPlan);
          setIsModalOpen(true);
        }, 1000);
      }
      return;
    }

    // 3. Rounding Logic
    const weeklyInstallmentValue = methods.getValues('amount_per_week');
    const weeklyInstallment = parseFloat(Number(weeklyInstallmentValue || 0).toFixed(2));
    
    const adjustmentPlansWithRoundedAmounts = schedulePlans.map(plan => ({
      ...plan,
      amount: parseFloat(Number(plan.amount).toFixed(2))
    }));
    
    const total = adjustmentPlansWithRoundedAmounts.reduce((sum, plan) => sum + plan.amount, 0);
    const totalRounded = parseFloat(total.toFixed(2));
    const difference = parseFloat((weeklyInstallment - totalRounded).toFixed(2));
    
    // Adjust the last schedule's amount to match weekly installment exactly
    if (Math.abs(difference) > 0.001 && adjustmentPlansWithRoundedAmounts.length > 0) {
      const lastIndex = adjustmentPlansWithRoundedAmounts.length - 1;
      adjustmentPlansWithRoundedAmounts[lastIndex].amount = parseFloat(
        (adjustmentPlansWithRoundedAmounts[lastIndex].amount + difference).toFixed(2)
      );
    }

    const tolerance = 1;
    if (Math.abs(pendingAmount) > tolerance) {
      showToast(
        `Validation failed: Total amount in adjustment plans does not match the pending due (${totalPendingDueToCollect}).`,
        { type: NotificationType.Error }
      );
      return;
    }

    try {
      const payload = {
        adjustment_plans: adjustmentPlansWithRoundedAmounts
      };
      
      const response = await addPaymentScheduleAPI(payload, contractId);
      
      if (response.status_code === 200) {
        setIsUwRepaymentComplete(true);
        showToast(response?.status_message || "Repayment schedule updated successfully", { type: NotificationType.Success });
      } else {
        showToast(response?.status_message || 'Something went wrong!', { type: NotificationType.Error });
      }
    } catch (error) {
      showToast(error.message || "Failed to update repayment schedule", { type: NotificationType.Error });
    }
  };

  useEffect(() => {
    if (currentDynamicPlanFields.length > 0) {
      const total_to_be_collected = currentDynamicPlanFields.reduce(
        (acc, curr) => {
          return acc + parseFloat((curr.amount || 0).toFixed(2));
        },
        0
      );
      const roundedTotal = parseFloat(total_to_be_collected.toFixed(2));
      const remaining = parseFloat((totalPendingDueToCollect - roundedTotal).toFixed(2));
      setPendingAmount(remaining);
    } else {
      setPendingAmount(totalPendingDueToCollect);
    }
  }, [currentDynamicPlanFields, handleDelete, totalPendingDueToCollect]);

  const fetchDataFromApi = async (loanId: string) => {
    try {
      const PaymentScheduleApiResponse = await getPaymentScheduleAPI(loanId);
      
      if (PaymentScheduleApiResponse?.status_code === 200) {
        SetTotalPendingDueToCollect(
          PaymentScheduleApiResponse.data.amount_per_week
        );
        methods.reset(PaymentScheduleApiResponse.data);
        
      } else {
        showToast(PaymentScheduleApiResponse.status_message, {
          type: NotificationType.Error
        });
      }
    } catch (error) {
      console.log(error,"error");
      showToast('something wrong!', { type: NotificationType.Error });
    }
  };

  useEffect(() => {
    if (totalPendingDueToCollect) setPendingAmount(totalPendingDueToCollect);
  }, [totalPendingDueToCollect]);

  const handleDeleteASchedule = deletingSchedule => {
    const currentDynamicPlanFields =
      methods.getValues('adjustment_plans') || [];
    const updatedDynamicPlanFields = currentDynamicPlanFields.filter(
      item => item.day_of_debit !== deletingSchedule.day_of_debit
    );

    methods.setValue('adjustment_plans', updatedDynamicPlanFields, {
      shouldValidate: true
    });
  };

  useEffect(() => {
    SetContractId(loanId);
    if (authenticated && loanId) {
      fetchDataFromApi(loanId);
    }
  }, [loanId]);

  return (
    <>
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left Section - Payment Details */}
          <div className="w-full">
            <h2 className="border-b pb-3 text-lg font-semibold text-black max-sm:text-base">
              Payment Schedule
            </h2>
            <div className="mt-3 flex flex-wrap gap-6 text-sm text-gray-700">
              {methods.getValues('fund_request_amount') && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Approved Amount:</span>
                  <span className="font-semibold text-black">
                    {Number(methods.getValues('fund_request_amount'))?.toFixed(2)}
                  </span>
                </div>
              )}
              {methods.getValues('repayment_amount') && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Repayment Amount:</span>
                  <span className="font-semibold text-black">
                    {Number(methods.getValues('repayment_amount'))?.toFixed(2)}
                  </span>
                </div>
              )}
              {methods.getValues('fund_request_duration_weeks') && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Duration:</span>
                  <span className="font-semibold text-black">
                    {methods.getValues('fund_request_duration_weeks')}
                  </span>
                </div>
              )}
              {methods.getValues('amount_per_week') && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Amount per week:</span>
                  <span className="font-semibold text-black">
                    {Number(methods.getValues('amount_per_week'))?.toFixed(2)}
                  </span>
                </div>
              )}
              {
                <div className="flex items-center gap-2">
                  <span className="font-medium">Remaining Amount:</span>
                  <span className="font-semibold text-black">
                    {Number(pendingAmount)?.toFixed(2)}
                  </span>
                </div>
              }
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={e => {
                e.preventDefault();
                handleDelete();
              }}
              className="flex items-center gap-2 rounded bg-white px-4 py-2 shadow transition hover:bg-gray-100"
            >
              <RiDeleteBinLine size={16} className="text-[#840000]" />
              <span className="hidden text-sm text-[#840000] md:inline">
                Delete
              </span>
            </button>
            <button
              onClick={pendingAmount > 0.01 ? openModal : undefined}
              className="flex items-center gap-2 rounded bg-white px-4 py-2 shadow transition hover:bg-gray-100"
              style={{
                color: pendingAmount > 0.01 ? '#1A439A' : 'grey',
                cursor: pendingAmount > 0.01 ? 'pointer' : 'not-allowed'
              }}
            >
              <IoMdAdd size={16} />
              <span className="hidden text-sm md:inline">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Schedule List Section */}
      <div className="h-[75%] flex-1 overflow-y-auto rounded-lg border bg-white p-4 max-sm:h-[64vh]">
        <FormProvider {...methods}>
          <form
            ref={formRef}
            onSubmit={handleSubmit(onSubmit, onError)}
            className="w-full"
          >
            {currentDynamicPlanFields.map((field, index) => (
              <div key={index} className="mb-4">
                <div className="rounded-lg border bg-gray-50 p-4 shadow-sm">
                  {/* Grid Layout for Schedule Details */}
                  <div className="grid grid-cols-1 gap-8 pt-5 md:grid-cols-3 lg:grid-cols-[repeat(2,1fr)_0.2fr]">
                    <div>
                      <div className="text-[12px] text-gray-500">
                        Day of Debit
                      </div>
                      <div className="text-[14px] font-semibold text-black">
                        {field.day_of_debit || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[12px] text-gray-500">Amount</div>
                      <div className="text-[14px] font-semibold text-black">
                        {Number(field.amount)?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={e => {
                        e.preventDefault();
                        setIsModalOpen(true);
                        setEditingSchedule(field);
                      }}
                      className="flex items-center justify-center rounded bg-white p-2 text-[#1A439A] shadow transition hover:bg-gray-100"
                    >
                      <MdEdit size={16} />
                    </button>

                    <button
                      onClick={e => {
                        e.preventDefault();
                        handleDeleteASchedule(field);
                      }}
                      className="flex items-center justify-center rounded bg-white p-2 text-[#840000] shadow transition hover:bg-gray-100"
                    >
                      <RiDeleteBinLine size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button type="submit" hidden>Submit</button>
            
            {/* Submit Payment Schedule Button */}
            {currentDynamicPlanFields.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSubmit(onSubmit, onError)()}
                  className="rounded bg-blue-900 px-6 py-2 text-sm font-medium text-white hover:bg-blue-800"
                >
                  Submit Payment Schedule
                </button>
              </div>
            )}
          </form>
        </FormProvider>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AddRepayment
          editingSchedule={editingSchedule}
          pendingAmount={pendingAmount}
          toggleModal={closeModal}
          methods={methods}
        />
      )}
    </>
  );
};

export default PaymentSchedule;
