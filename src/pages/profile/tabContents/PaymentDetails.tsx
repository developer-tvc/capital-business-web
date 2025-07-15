import { useEffect, useState } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

import {
  getPaymentApi,
  loanSummaryByCustomer
} from '../../../api/loanServices';
import Loader from '../../../components/Loader';
import { NotificationType } from '../../../utils/hooks/toastify/enums';
import useToast from '../../../utils/hooks/toastify/useToast';
import PaymentHistory from './PaymentHistoryCard';
import PaymentCard from './PaymentInfoCard';
import { Roles } from '../../../utils/enums';
import { useSelector } from 'react-redux';
import { authSelector } from '../../../store/auth/userSlice';
import { managementSliceSelector } from '../../../store/managementReducer';

const PaymentDetails: React.FC<{ loanId: string }> = ({ loanId }) => {
  const { showToast } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [payments, setPayments] = useState(undefined);
  const [summary, setSummary] = useState(undefined);
  const [loader, setLoader] = useState(false);
  const [openLoanId, setOpenLoanId] = useState([]);
  const { role } = useSelector(authSelector);
  const authUser = useSelector(authSelector);
  const managementUser = useSelector(managementSliceSelector).user;
  const user = [Roles.Customer, Roles.Leads].includes(role as Roles)
    ? authUser
    : managementUser;

  const customerId: string = String(user?.id);

  useEffect(() => {
    const fetchSummaryByCustomer = async () => {
      try {
        const res = await loanSummaryByCustomer(customerId);
        if (res.status_code >= 200 && res.status_code < 300) {
          setSummary(res.data);
        } else {
          showToast(res.status_message, { type: NotificationType.Error });
        }
      } catch (error) {
        console.error('Error fetching loan summary', error);
      }
    };

    if (customerId) fetchSummaryByCustomer();
  }, [customerId]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const res = await getPaymentApi(loanId);
        if (res.status_code >= 200 && res.status_code < 300) {
          setPayments(res.data);
        } else {
          showToast(res.status_message, { type: NotificationType.Error });
        }
      } catch (error) {
        console.error('Error fetching payments', error);
      }
    };

    if (loanId) fetchPaymentData();
  }, [loanId]);

  const SummaryCard = ({
    title,
    value
  }: {
    title: string;
    value: string | number;
  }) => (
    <div className="rounded-md border bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-1 text-2xl font-bold text-black">{value}</p>
    </div>
  );

  return (
    <div>
      {loader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}
      {![Roles.Customer, Roles.Leads].includes(role as Roles) &&
        summary?.summary && (
          <>
            <h2 className="px-4 text-lg font-bold text-gray-800">SUMMARY</h2>
            <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-2 lg:grid-cols-5">
              <SummaryCard
                title="Total Number of Loans"
                value={summary.summary.total_loans}
              />
              <SummaryCard
                title="Total Loan Amount"
                value={`£${summary.summary.total_amount}`}
              />
              <SummaryCard
                title="Total Number of Installments"
                value={summary.summary.total_installments}
              />
              <SummaryCard
                title="Remaining Installments"
                value={summary.summary.total_remaining_installments}
              />
              <SummaryCard
                title="Gocardless missed Installments"
                value={summary.summary.total_gocardless_missed_installments}
              />
            </div>
          </>
        )}

      {payments ? (
        // Single loan (payments API case)
        <div className="px-4 py-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
            {/* Left Side - Payment Info */}
            <div className="flex h-full flex-col">
              <PaymentCard
                payments={payments?.funding_payments}
                loanId={loanId}
                setLoader={setLoader}
                loanIds={payments?.loan_id}
                hideBorder={false}
              />
            </div>

            {/* Right Side - Payment History */}
            <div
              className={`flex h-full flex-col border bg-white shadow-sm transition-all duration-300 ${
                isDropdownOpen ? 'max-h-[343px]' : 'max-h-[64px]'
              } overflow-hidden`}
            >
              <div className="flex items-center justify-between p-4">
                <p className="text-lg font-semibold text-gray-800">
                  Payment History
                </p>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center text-sm text-gray-500"
                >
                  Activity{' '}
                  {isDropdownOpen ? (
                    <IoIosArrowUp className="ml-1" />
                  ) : (
                    <IoIosArrowDown className="ml-1" />
                  )}
                </button>
              </div>

              {isDropdownOpen && (
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  <PaymentHistory
                    paymentHistory={payments?.funding_payment_history}
                    paymentMissHistory={
                      payments?.funding_payments[0].gocardless_missed_emi_dates
                    }
                    isDropdownOpen={isDropdownOpen}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : summary?.loans?.length > 0 ? (
        // Multiple loans
        <div className="space-y-6 px-4 py-4">
          {summary.loans.map(loan => {
            const loanKey = loan.loan_number.toString();
            const isOpen = openLoanId.includes(loanKey);
            return (
              <div
                key={loanKey}
                className={`overflow-hidden rounded-md border bg-white shadow-sm transition-all duration-300 ${
                  isOpen ? 'max-h-[1000px]' : 'max-h-[72px]'
                }`}
              >
                {/* Collapsible Header */}
                <div className="flex items-center justify-between border-b p-4">
                  <p className="text-lg font-semibold text-gray-800">
                    Loan Number:{' '}
                    <span className="text-primary-600 font-bold">
                      {loan.loan_number}
                    </span>
                  </p>
                  <button
                    onClick={() =>
                      setOpenLoanId(prev =>
                        prev.includes(loanKey)
                          ? prev.filter(id => id !== loanKey)
                          : [...prev, loanKey]
                      )
                    }
                    className="flex items-center text-sm text-gray-500"
                  >
                    Activity{' '}
                    {isOpen ? (
                      <IoIosArrowUp className="ml-1" />
                    ) : (
                      <IoIosArrowDown className="ml-1" />
                    )}
                  </button>
                </div>
                {isOpen && (
                  <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2 lg:items-stretch">
                    {/* Payment Info */}
                    <div className="flex h-full flex-col border bg-white shadow-sm">
                      <PaymentCard
                        hideBorder={true}
                        payments={[
                          {
                            loan_number: loan.loan_number,
                            funding_amount: loan.loan_amount,
                            instalment_paid: loan.instalment_paid,
                            remaining_instalment: loan.remaining_instalment,
                            total_instalment: loan.total_instalment,
                            status: 'Active',
                            next_due: loan.funding_payment_history?.[0]?.amount,
                            due_date: loan.funding_payment_history?.[0]?.date,
                            gocardless_missed_emis: loan.gocardless_missed_emis
                          }
                        ]}
                        loanId={loanKey}
                        setLoader={setLoader}
                        loanIds={loan.loan_number}
                      />
                    </div>
                    <div className="flex h-full flex-col border bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b p-4">
                        <p className="text-lg font-semibold text-gray-800">
                          Payment History
                        </p>
                      </div>
                      <div className="max-h-[280px] flex-1 overflow-y-auto px-4 pb-4">
                        <PaymentHistory
                          paymentHistory={loan.funding_payment_history}
                          isDropdownOpen
                          paymentMissHistory={
                            loan?.gocardless_missed_emi_dates
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-6 py-4 text-center text-gray-600">
          No data available
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;
