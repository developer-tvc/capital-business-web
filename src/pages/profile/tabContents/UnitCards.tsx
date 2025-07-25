import { useEffect, useState } from 'react';

import { listCompaniesApi } from '../../../api/loanServices';
import build from '../../../assets/svg/unit-company.svg';
import Loader from '../../../components/Loader';
import usePagination from '../../../components/management/common/usePagination';
import { ApplicationStatusBadgeClasses } from '../../../utils/data';
import { NotificationType } from '../../../utils/hooks/toastify/enums';
import useToast from '../../../utils/hooks/toastify/useToast';

const UnitCard = ({
  customerId,
  setSelectedCompanyId,
  setSelectedMenu,
  setMenuHistory
}) => {
  const { showToast } = useToast();
  const { data, handleFilter, userPaginateException } =
    usePagination(listCompaniesApi);

  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setIsLoading(false);
      setCompanies(data);
    }
  }, [data]);

  useEffect(() => {
    if (userPaginateException) {
      showToast(userPaginateException as string, {
        type: NotificationType.Error
      });
      setIsLoading(false);
    }
  }, [userPaginateException]);

  // const handleCardClick = id => {
  //   setSelectedCompanyId(id);
  //   setSelectedMenu('unitProfile');
  // };

  const handleCardClick = id => {
    setSelectedCompanyId(id);
    // const selectedFUnding = data.find(item => item.id === id);

    // setSelectedCompanyId(selectedFUnding.unit.id);

    setMenuHistory(prev => {
      const updatedHistory = [...prev];

      // Check if the second item exists and if it contains an array
      if (updatedHistory.length >= 2) {
        const secondItem = updatedHistory[1];

        // Find the key of the second item dynamically
        const key = Object.keys(secondItem)[0]; // This grabs the first key of the second item

        if (Array.isArray(secondItem[key])) {
          // Only push "fundingDetails" if it is not already in the array
          if (!secondItem[key].includes('unitProfile')) {
            secondItem[key].push('unitProfile');
          }
        }
      }

      return updatedHistory;
    });

    setSelectedMenu('unitProfile');
  };

  useEffect(() => {
    if (customerId) {
      setIsLoading(true);
      handleFilter({ customer_id: customerId });
    }
  }, [customerId]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}
      <div className="mt-8 h-full w-full overflow-y-auto pr-8">
        <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1 max-md:grid-cols-1">
          {companies.length > 0 ? (
            companies.map((item, index) => (
              <div
                key={index}
                className="flex flex-col justify-between gap-2 rounded-lg border border-gray-400/40 bg-white p-4 shadow-md"
              >
                <div className="bg-white-300 mb-2 flex flex-wrap items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 hidden items-center justify-center rounded-full border-4 border-white bg-[#E8E8E8] p-3 text-xl font-semibold text-[#1A439A] sm:flex">
                      <img src={build} className="h-5 w-5" />
                    </div>
                    <div className="text-[12px] font-medium leading-6">
                      <p className="font-semibold text-[#929292]">
                        {'Company Name'}
                      </p>
                      {item.company_name || 'Company Name'}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <a className="text-[13px] text-[#929292]">
                      {'Current Status'}
                    </a>
                    <span
                      className={`ml-2 inline-flex rounded-full px-3 text-xs leading-5 ${
                        ApplicationStatusBadgeClasses[item.company_status] ||
                        'bg-green-200 text-[#3cb861]'
                      }`}
                    >
                      {item.company_status}
                    </span>
                  </div>
                </div>

                <hr />

                <div className="mt-2 grid grid-cols-2 gap-4 text-[13px] text-gray-800">
                  <p className="mb-2 grid">
                    <strong>{'Business Type:'}</strong>{' '}
                    {item.business_type || 'N/A'}
                  </p>
                  <p className="mb-2 grid">
                    <strong>{'Business/Shop Name:'}</strong>{' '}
                    {item.trading_style || 'N/A'}
                  </p>
                  <p className="mb-2 grid">
                    <strong>{'Company Number:'}</strong>{' '}
                    {item.company_number || 'N/A'}
                  </p>
                  <p className="mb-2 grid">
                    <strong>{'Funding Purpose:'}</strong>{' '}
                    {item.funding_purpose || 'N/A'}
                  </p>
                  {item.other_funding_purpose && (
                    <p className="col-span-2 mb-2">
                      <strong>{'Other Funding Purpose:'}</strong>{' '}
                      {item.other_funding_purpose}
                    </p>
                  )}

                  <p className="mb-2 grid">
                    <strong>{' ID:'}</strong> {item.id || 'N/A'}
                  </p>
                  <p className="mb-2 grid">
                    <strong>{' Updated Date:'}</strong>{' '}
                    {item.updated_date || 'N/A'}
                  </p>
                </div>
                <div className="flex justify-end">
                  <a
                    onClick={() => handleCardClick(item.id)}
                    className="text-[#929292] hover:cursor-pointer hover:text-[#1A439A]"
                  >
                    {'View'}
                  </a>
                </div>
              </div>
            ))
          ) : (
            <h1>{'No Data found'}</h1>
          )}
        </div>
      </div>
    </>
  );
};

export default UnitCard;
