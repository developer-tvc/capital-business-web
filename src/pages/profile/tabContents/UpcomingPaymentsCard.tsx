import React from 'react';
import password from '../../../assets/svg/credit-card.svg';

const UpcomingPaymentsCard = ({
  incompletedEmiDates,
  isDropdownOpen
}) => (
  <div className="mx-4 grid grid-cols-2 gap-5 px-1 pt-4">
    {isDropdownOpen && (
      <>
        {incompletedEmiDates?.map((item, index) => (
          <React.Fragment key={`upcoming-${index}`}>
            <div className="text-black">
              <div className="flex gap-4 max-sm:grid">
                <div className="inline-block h-[46px] w-[46px] rounded-lg bg-[#d5dceb] p-3 text-white">
                  <img src={password} alt="icon" />
                </div>
                <div className="text-sm font-medium">
                  {item.status || 'Upcoming Payment'}
                  <div className="mt-1 text-xs font-normal text-gray-400">
                    {item.emi_date}
                  </div>
                </div>
              </div>
            </div>
            <div className={`flex justify-end font-medium ${item.status === 'Due' ? 'text-red-500' : 'text-black'}`}>
               {typeof item.amount === 'number' ? item.amount.toFixed(2) : item.amount}
            </div>
          </React.Fragment>
        ))}
      </>
    )}
  </div>
);

export default UpcomingPaymentsCard;
