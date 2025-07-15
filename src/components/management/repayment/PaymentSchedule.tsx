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
  setRef(formRef);
  const methods = useForm({
    resolver: yupResolver(paymentScheduleSchema)
  });

  const [pendingAmount, setPendingAmount] = useState(0);

  const {
    handleSubmit,
    watch,
    trigger,
    formState: { errors }
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

  const currentDynamicPlanFields = methods.getValues('adjustment_plans') || [];

  const handleDelete = () => {
    methods.setValue('adjustment_plans', []);
  };

  useEffect(() => {}, [watch('adjustment_plans')]);
  const { showToast } = useToast();

  const onSubmit = async data => {
    trigger();

    if (Object.values(errors).length > 0) return;

    const tolerance = 1;
    if (Math.abs(pendingAmount) > tolerance) {
      showToast(
        `Validation failed: Total amount in adjustment plans (${pendingAmount}) does not match the pending due (${totalPendingDueToCollect}).`,
        { type: NotificationType.Error }
      );
      return;
    }

    try {
      const response = await addPaymentScheduleAPI(data, contractId);
      if (response.status_code === 200) {
        setIsUwRepaymentComplete(true);
        showToast(response?.status_message, { type: NotificationType.Success });
      } else {
        showToast('Something went wrong!', { type: NotificationType.Error });
      }
    } catch (error) {
      showToast(error.message, { type: NotificationType.Error });
    }
  };

  const onError = error => {
    showToast('Please check the validation error!', {
      type: NotificationType.Error
    });
    console.log('error', error);
  };

  useEffect(() => {
    if (currentDynamicPlanFields.length > 0) {
      const total_to_be_collected = currentDynamicPlanFields.reduce(
        (acc, curr) => {
          return acc + (curr.amount || 0);
        },
        0
      );
      setPendingAmount(totalPendingDueToCollect - total_to_be_collected);
    } else {
      setPendingAmount(methods.getValues('amount_per_week'));
    }
  }, [currentDynamicPlanFields, handleDelete]);

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
      console.log('Exception', error);
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
                    {methods.getValues('fund_request_amount')}
                  </span>
                </div>
              )}
              {methods.getValues('repayment_amount') && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Repayment Amount:</span>
                  <span className="font-semibold text-black">
                    {methods.getValues('repayment_amount')}
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
                    {methods.getValues('amount_per_week')}
                  </span>
                </div>
              )}
              {
                <div className="flex items-center gap-2">
                  <span className="font-medium">Remaining Amount:</span>
                  <span className="font-semibold text-black">
                    {pendingAmount}
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
              onClick={pendingAmount > 0 ? openModal : undefined}
              className="flex items-center gap-2 rounded bg-white px-4 py-2 shadow transition hover:bg-gray-100"
              style={{
                color: pendingAmount > 0 ? '#1A439A' : 'grey',
                cursor: pendingAmount > 0 ? 'pointer' : 'not-allowed'
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
                        {field.amount || 'N/A'}
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
