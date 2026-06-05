import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { listCompaniesApiNew } from '../../api/loanServices';
import { managementSliceSelector } from '../../store/managementReducer';
import { NotificationType } from '../../utils/hooks/toastify/enums';
import useToast from '../../utils/hooks/toastify/useToast';
import Loader from '../Loader';

interface Company {
  id: string;
  company_id: number;
  company_name: string;
  company_number?: string;
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

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
        setCompanies(response.data);
        // Auto-select if only one company
        if (response.data.length === 1) {
          setSelectedCompanyId(response.data[0].id);
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

    const selectedCompany = companies.find(c => c.id === selectedCompanyId);
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

  const filteredCompanies = companies.filter(company =>
    company.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        aria-hidden="true"
      >
        <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Renew Funding
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Select the company for which you want to renew funding.
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Loader />
            </div>
          ) : (
            <>
              {/* Company Selection */}
              {companies.length > 0 ? (
                <div className="mb-6">
                  <label
                    htmlFor="company-select"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Company
                  </label>
                  {companies.length > 5 ? (
                    <>
                      <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <select
                        id="company-select"
                        value={selectedCompanyId}
                        onChange={e => setSelectedCompanyId(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select a company</option>
                        {filteredCompanies.map(company => (
                          <option key={company.id} value={company.id}>
                            {company.company_name}
                            {company.company_number &&
                              ` (${company.company_number})`}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <select
                      id="company-select"
                      value={selectedCompanyId}
                      onChange={e => setSelectedCompanyId(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select a company</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.company_name}
                          {company.company_number &&
                            ` (${company.company_number})`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
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
                  disabled={!selectedCompanyId || isRedirecting || companies.length === 0}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center"
                  style={{ display: companies.length === 0 ? 'none' : 'flex' }}
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
