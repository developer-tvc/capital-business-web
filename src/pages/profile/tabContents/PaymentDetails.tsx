import { useEffect, useState } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

import {
  getLoanStatement,
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
import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';
import { UserOptions } from 'jspdf-autotable';
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

  const isCustomer = role === Roles.Customer;

  const customerId: string = String(isCustomer ? authUser?.id : user?.id);
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

    const shouldFetch = (isCustomer && customerId) || (!isCustomer && user?.id);

    if (shouldFetch) {
      fetchSummaryByCustomer();
    }
  }, [isCustomer, customerId, user?.id]);

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

    const getImageBase64 = (url: string): Promise<string> => {
    return fetch(url)
      .then(res => res.blob())
      .then(
        blob =>
          new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          })
      );
  };

  const generateLoanStatementPDF = async (loanId: string) => {
    try {
      const result = await getLoanStatement(loanId);
      const data = result.data;

      const doc = new jsPDF();
      const company = data.company_info?.[0];
      let currentY = 10;

      // Centered Logo
      if (company?.logo) {
        const logoBase64 = await getImageBase64(company.logo);
        doc.addImage(logoBase64, 'JPEG', 70, currentY, 70, 20);
      }

      doc.setFontSize(10);
      doc.text(`Date: ${data.date}`, 200, 10, { align: 'right' });

      currentY += 25;

      // Company Name centered
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(data.company_name || '', 105, currentY, { align: 'center' });

      currentY += 8;

      const tableStyle: UserOptions = {
        styles: {
          fontSize: 9,
          textColor: [0, 0, 0],
          halign: 'center'
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center'
        },
        theme: 'grid',
        tableLineColor: [0, 0, 0] as [number, number, number],
        tableLineWidth: 0.1
      };

      autoTable(doc, {
        startY: currentY,
        head: [['Contract No', 'Advance Amount', 'Payback Amount']],
        body: [
          [
            data.loan_number,
            `£${data.advance_amount}`,
            `£${data.payback_amount}`
          ]
        ],
        ...tableStyle
      });

      currentY = doc.lastAutoTable.finalY + 2;

      // Repayment Terms Table 1
      autoTable(doc, {
        startY: currentY,
        head: [['Start Date', 'Weekly Repayment Amount', 'End Date']],
        body: [
          [data.start_date, `£${data.weekly_repayment_amount}`, data.end_date]
        ],
        ...tableStyle
      });

      // Repayment Terms Table 2
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY,
        head: [
          [
            'No of Weekly Instalments',
            'Installment Amount',
            'Weekly Repayment Day(s)'
          ]
        ],
        body: [
          [
            data.no_of_weeks || '1',
            `£${data.weekly_repayment_amount}`,
            data.weekly_repayment_days?.join(', ') || 'Thursday'
          ]
        ],
        ...tableStyle
      });

      currentY = doc.lastAutoTable.finalY + 5;

      // Statement Table
      const statementBody = data.statement_data.map((item, i) => [
        (i + 1).toString(),
        item.date,
        item.day,
        item.narration,
        item.debit ? `£${item.debit}` : '',
        item.credit ? `£${item.credit}` : '',
        `£${item.balance}`
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [
          ['S. No', 'Date', 'Day', 'Narration', 'Debit', 'Credit', 'Balance']
        ],
        body: statementBody,
        styles: { fontSize: 9, textColor: [0, 0, 0] },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold' as const,
          halign: 'center' as const
        },
        columnStyles: {
          4: { halign: 'right' as const },
          5: { halign: 'right' as const },
          6: { halign: 'right' as const }
        },
        theme: 'grid' as const,

        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.1,
        didDrawCell: data => {
          const { cell, doc } = data;
          const { x, y, width, height } = cell;

          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5); // Set desired thickness

          // Force draw all 4 borders for every cell
          doc.line(x, y, x + width, y); // Top border
          doc.line(x + width, y, x + width, y + height); // Right border
          doc.line(x + width, y + height, x, y + height); // Bottom border
          doc.line(x, y + height, x, y); // Left border (reversed to avoid overlaps)
        }
      });

      currentY = doc.lastAutoTable.finalY + 10;

      // ✅ Dynamic Footer from company address
      if (company) {
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');

        const addressLines = [
          company.address_line1,
          company.address_line2,
          company.address_line3
        ].filter(Boolean); // Exclude empty or null lines

        addressLines.forEach((line, index) => {
          doc.text(line, 105, 285 + index * 5, { align: 'center' });
        });
      }

      // Save PDF
      doc.save(`${data.company_name}_Statement.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div>

       <div className="mb-4 flex items-center justify-between pr-5">
        <h2 className="text-xl font-semibold">Payment History</h2>
        {payments && (
          <div>
            <button
              onClick={() => generateLoanStatementPDF(loanId)}
              className="rounded bg-blue-500 px-4 py-2 text-white shadow"
            >
              Download Statement
            </button>
          </div>
        )}
      </div>
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
                          paymentMissHistory={loan?.gocardless_missed_emi_dates}
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
