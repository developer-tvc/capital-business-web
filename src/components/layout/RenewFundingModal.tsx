import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { listCompaniesApiNew } from '../../api/loanServices';
import { managementSliceSelector } from '../../store/managementReducer';
import { NotificationType } from '../../utils/hooks/toastify/enums';
import useToast from '../../utils/hooks/toastify/useToast';
import Loader from '../Loader';

interface EligibleCompany {
  id: string;
  company_id: number;
  company_name: string;
}

interface CompanyUnderReview {
  company_id: string;
  company_name: string;
  loan_status: string;
}

interface RenewFundingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RenewFundingModal: React.FC<RenewFundingModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useSelector(managementSliceSelector);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [eligibleCompanies, setEligibleCompanies] = useState<EligibleCompany[]>([]);
  const [companiesUnderReview, setCompaniesUnderReview] = useState<CompanyUnderReview[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const response = await listCompaniesApiNew({
        filter: { customer_id: user.id }
      });

      if (response?.status_code === 200 && response?.data) {
        setEligibleCompanies(response.data.eligible_companies || []);
        setCompaniesUnderReview(response.data.companies_under_review || []);
        // Auto-select if only one eligible company
        if (response.data.eligible_companies?.length === 1) {
          setSelectedCompanyId(response.data.eligible_companies[0].id);
        }
      } else {
        showToast('Failed to fetch companies', {
          type: NotificationType.Error
        });
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      showToast('Failed to fetch companies', { type: NotificationType.Error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedCompanyId) {
      showToast('Please select a company', { type: NotificationType.Error });
      return;
    }

    const selectedCompany = eligibleCompanies.find(c => c.id === selectedCompanyId);
    if (!selectedCompany) {
      showToast('Invalid company selection', { type: NotificationType.Error });
      return;
    }

    setIsRedirecting(true);

    // Redirect to funding form with company info
    // We'll use location state to pass the renew funding mode and company data
    navigate('/funding-form', {
      state: {
        isRenewFunding: true,
        companyId: selectedCompany.company_id.toString(),
        companyName: selectedCompany.company_name
      }
    });

    onClose();
  };

  const getStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      Inprogress: 'text-[#F5891F]',
      Submitted: 'text-[#1A439A]',
      Agent_Submitted: 'text-[#1A439A]',
      Underwriter_Submitted: 'text-[#1A439A]',
      Manager_Approved: 'text-[#F02E23]',
      Admin_Cash_Dispersed: 'text-[#F02E23]',
      Manager_Rejected: 'text-red-800',
      Admin_Rejected: 'text-red-800',
      Underwriter_Returned: 'text-red-800',
      Moved_To_Legal: 'text-red-800',
      Admin_Cash_Disbursed: 'text-[#1A439A]',
      Amount_Credited: 'text-[#1A439A]',
      Completed: 'text-[#1A439A]',
      Funding_Closed: 'text-[#1A439A]'
    };
    return statusColors[status] || 'text-gray-600';
  };


  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        aria-hidden="true"
        onClick={onClose}
      >
        <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Renew Funding
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Select the company for which you want to renew funding.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-4 rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Loader />
            </div>
          ) : (
            <>
              {/* Eligible Companies for Renew Funding */}
              {eligibleCompanies.length > 0 && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-green-800">
                    Eligible Companies for Renew Funding
                  </h3>
                  <div className="mb-2">
                    <label
                      htmlFor="company-select"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Select a company
                    </label>
                    <select
                      id="company-select"
                      value={selectedCompanyId}
                      onChange={e => setSelectedCompanyId(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select a company</option>
                      {eligibleCompanies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Companies Under Review */}
              {companiesUnderReview.length > 0 && (
                <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-orange-800">
                    Companies Under Review
                  </h3>
                  <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
                    {companiesUnderReview.map(company => (
                      <div
                        key={company.company_id}
                        className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm hover:bg-orange-100 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {company.company_name}
                        </span>
                        <span className={`text-xs font-medium ${getStatusColor(company.loan_status)}`}>
                          Loan is in {company.loan_status}.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No companies message */}
              {eligibleCompanies.length === 0 && companiesUnderReview.length === 0 && (
                <div className="mb-6 rounded-md bg-yellow-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-yellow-800">
                    You have no company
                  </p>
                  <p className="mb-4 text-sm text-yellow-700">
                    To apply for funding, you need to have a registered company.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/funding-form');
                    }}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Apply for New Loan
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              {eligibleCompanies.length > 0 && (
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isRedirecting}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!selectedCompanyId || isRedirecting}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center"
                  >
                    {isRedirecting ? (
                      <>
                        <svg
                          className="mr-2 h-4 w-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Full-page loading overlay for redirection */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white">
          <div className="text-center">
            <Loader />
            <p className="mt-4 text-lg font-medium text-gray-900">
              Preparing your funding application...
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Loading company details...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default RenewFundingModal;
