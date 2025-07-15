import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { customerLoanApi } from '../../api/loanServices';
import form from '../../assets/svg/form.svg';
import {
  FundingFromCurrentStatus,
  FundingFromStatusEnum
} from '../../utils/enums';
import { NotificationType } from '../../utils/hooks/toastify/enums';
import useToast from '../../utils/hooks/toastify/useToast';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { FaArrowLeftLong, FaArrowRightLong } from 'react-icons/fa6';

const badgeClasses = {
  Inprogress: `bg-[#f8e2ca] text-[#F5891F] `,
  Submitted: ` bg-[#c7d0e3] text-[#1A439A]`,
  Agent_Submitted: ` bg-[#c7d0e3]  text-[#1A439A]`,
  Underwriter_Submitted: ` bg-[#c7d0e3]  text-[#1A439A]`,
  Admin_Cash_Disbursed: ` bg-[#c7d0e3]  text-[#1A439A]`,
  Amount_Credited: ` bg-[#c7d0e3]  text-[#1A439A]`,
  Completed: ` bg-[#c7d0e3]  text-[#1A439A]`,
  Funding_Closed: ` bg-[#c7d0e3]  text-[#1A439A]`,
  Manager_Approved: ` bg-[#f3ccc9] text-[#F02E23] `,
  Admin_Cash_Dispersed: ` bg-[#f3ccc9] text-[#F02E23] `,
  Manager_Rejected: ` bg-red-100 text-red-800 `,
  Admin_Rejected: ` bg-red-100 text-red-800 `,
  Underwriter_Returned: `  bg-red-100 text-red-800 `,
  Moved_To_Legal: `  bg-red-100 text-red-800 `
};

const StatusSection = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [funding, setFunding] = useState([]);

  const fetchTrustId = async () => {
    try {
      const trustIdStatusApiResponse = await customerLoanApi(null);
      if (Object.keys(trustIdStatusApiResponse?.data).length === 0) {
        return;
      } else if (
        trustIdStatusApiResponse.status_code >= 200 &&
        trustIdStatusApiResponse.status_code < 300
      ) {
        setFunding(trustIdStatusApiResponse?.data);
      } else {
        showToast(trustIdStatusApiResponse.status_message, {
          type: NotificationType.Error
        });
      }
    } catch (error) {
      console.log('Exception', error);
      showToast('Something went wrong!', { type: NotificationType.Error });
    }
  };

  useEffect(() => {
    fetchTrustId();
  }, []);

  return (
    <div className="relative">
      <div className="container mx-auto -mt-12 max-sm:mt-0 lg:px-12">
        <Swiper
          modules={[Navigation, Autoplay]}
          loop={true}
          navigation={{
            prevEl: '.swiper-button-prev',
            nextEl: '.swiper-button-next'
          }}
          className="mySwiper"
          autoplay={{
            delay: 10000,
            reverseDirection: true,
            disableOnInteraction: true
          }}
        >
          {funding?.map(fund => (
            <SwiperSlide key={fund.id}>
              <div
                className="my-4 flex w-auto cursor-pointer flex-wrap items-center rounded-md bg-white p-4 px-20 shadow-md"
                onClick={() => navigate(`/funding-form/${fund.id}`)}
              >
                <div className="mr-1 pr-2">
                  <div className="inline-block h-[35px] w-[35px] rounded-lg bg-[#d5dceb] p-[10px] text-white">
                    <img src={form} className="w-[36px]" />
                  </div>
                </div>
                <div className="relative flex-1">
                  <div className="text-[13px] font-semibold text-[#02002E]">
                    {`Your Application status ${fund?.unit?.company_name ? `[ ${fund.unit.company_name} ]` : ''}`}
                  </div>

                  {fund.loan_status?.current_status !==
                    FundingFromCurrentStatus.Inprogress && (
                    <div className="text-[12px] font-light text-[#929292]">
                      {'Expected Completion Date:'}{' '}
                      <span className="text-[12px] font-light text-[#000000]">
                        {fund.expected_completion_date}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <span
                    className={`mb-6 inline-flex rounded-full px-3 text-xs leading-5 max-sm:mb-2 max-sm:px-2 ${badgeClasses[fund.loan_status?.current_status]}`}
                  >
                    {FundingFromStatusEnum?.[fund.loan_status?.current_status]}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <FaArrowLeftLong className="swiper-button-prev z-10 flex !h-[36px] !w-[36px] items-center justify-center rounded-full border-4 border-[#8f9fc8] p-1 text-[#8f9fc8] hover:border-color-text-secondary hover:text-color-text-secondary" />
          <FaArrowRightLong className="swiper-button-next z-10 flex !h-[36px] !w-[36px] items-center justify-center rounded-full border-4 border-[#8f9fc8] p-1 text-[#8f9fc8] hover:border-color-text-secondary hover:text-color-text-secondary" />
        </Swiper>
      </div>
    </div>
  );
};

export default StatusSection;
