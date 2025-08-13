import 'swiper/css';
import 'swiper/css/navigation';

import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { bannerSlides } from '../../utils/data';
import { applyNewLoan } from '../../utils/helpers';
import { NotificationType } from '../../utils/hooks/toastify/enums';
import useToast from '../../utils/hooks/toastify/useToast';
// import useAuth from '../../utils/hooks/useAuth';
import ConfirmModal from '../fundingForms/modals/ConfirmModal';
import Loader from '../Loader';
import '../../assets/vendor/nivo-slider/nivo-slider.css';
import bannerbg1 from '../../assets/images/figure/figure98.png';
import bannerbg2 from '../../assets/images/figure/figure99.png';
const BannerSection: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  // const { authenticated } = useAuth();
  // const [isEligibleNewLoan, setIsEligibleNewLoan] = useState<{
  //   isApplicableForNewLoan: boolean;
  //   loanCount: number;
  // }>(null);
  const [newLoanModalOpen, setNewLoanModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const fadeInUp = {
    hidden: { opacity: 0, y: 200 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut', }
    }

  };
  const fadeInUpDelay = {
    hidden: { opacity: 0, y: 200 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 }
    }

  };


  const bannerbg1animation = {
    hidden: { opacity: 0, scale: 0, },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1, ease: 'easeOut', delay: 0.3 }
    }

  };

  const bannerbg2animation = {
    hidden: {  x:100,scale: 0, }, // x: 20 = move to right
    visible: {
      x: 0,
      scale: 1,
      transition: { duration: 1, ease: 'easeOut', delay: 0.4 }
    }
  };

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        // const eligibility = await chkCustNewLoan();
        // setIsEligibleNewLoan(eligibility);
      } catch (error) {
        console.error('Failed to check eligibility:', error);
        // setIsEligibleNewLoan(null); // or handle error state
      }
    };

    checkEligibility();
  }, []);

  const handleNewLoan = async () => {
    try {
      await applyNewLoan(navigate);
    } catch {
      showToast('Failed to apply for a new Funding', {
        type: NotificationType.Error
      });
    }
  };

  const handleNewLoanModal = () => {
    setIsLoading(!newLoanModalOpen);
    setNewLoanModalOpen(prevState => !prevState);
  };

  return (
    <>
      {isLoading && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
        >
          <Loader />
        </div>
      )}
      <div className="bg-color-primary xs-banner-padding">
        <Swiper
          modules={[Autoplay, Pagination,]}
          loop={true}
          className="slider-area2 Swiper"
          autoplay={{
            delay: 5000, // Set delay to 10 seconds (10000ms)#1A439A
            reverseDirection: true,
            disableOnInteraction: true // Autoplay will not stop after user interactions
          }}
          pagination={{
            clickable: true,
            el: '.swiper-pagination' // target class for custom dot placement (optional)
          }}
        >
          {bannerSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              {/* <div className="container mx-auto px-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-2 lg:items-center">
                  <motion.div
                    aria-hidden="true"
                    initial="hidden"
                    whileInView="visible"
                    variants={fadeInLeft}
                  >
                    <div className="mt-16 max-sm:order-2 max-sm:mt-4">
                      <p className="font-Poppins max-w-sm text-center text-[26px] max-sm:mt-4 max-sm:text-[17px] md:text-left md:text-[20px] lg:text-[28px]">
                        <a className="text-[#454545]">{slide.title}</a>{' '}
                        <a className="text-[#F02E23]">{slide.title2}</a>
                      </p>
                      <p className="text-center font-Playfair font-medium leading-tight text-[#1A439A] max-sm:text-[24px] md:text-left md:text-[30px] lg:text-[45px] xl:text-[64px]">
                        {slide.description}
                        <br />
                        {slide.description1}
                        <br />
                        <a className="font-bold text-[#F02E23]">{'Funding'}</a>
                      </p>

                      <>
                        <div className="flex justify-center pt-12 max-sm:pt-4 md:justify-start">
                          {authenticated ? (
                            isEligibleNewLoan?.isApplicableForNewLoan && (
                              <button
                                onClick={handleNewLoanModal}
                                className="bg-[#F02E23] px-10 py-3 text-white hover:bg-[#c8504a] max-sm:py-2 max-sm:text-[12px]"
                              >
                                {slide.description5}
                              </button>
                            )
                          ) : (
                            // : isEligibleNewLoan?.loanCount == 1 ? (
                            //   <button
                            //     onClick={() => {
                            //       navigate(`/funding-form`);
                            //     }}
                            //     className="bg-[#F02E23] px-10 py-3 text-white hover:bg-[#c8504a] max-sm:py-2 max-sm:text-[12px]"
                            //   >
                            //     {slide.description3}
                            //   </button>
                            // ) : (
                            //   <></>
                            // )
                            <button
                              onClick={() => {
                                navigate(`/funding-form`);
                              }}
                              className="transform bg-[#F02E23] px-10 py-3 text-white transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-[#c8504a] max-sm:py-2 max-sm:text-[12px]"
                            >
                              {slide.description3}
                            </button>
                          )}
                        </div>
                      </>

                      <div className="flex justify-center text-[12px] max-sm:mb-16 max-sm:mt-4 max-sm:pt-1 md:mb-16 md:mt-6 md:justify-start md:pt-8 lg:justify-start lg:pl-4 xl:mb-16 xl:mt-12">
                        {slide.description4}
                      </div>
                      <></>
                    </div>
                  </motion.div>
                  <div aria-hidden="true" className="max-sm:order-1">
                    <div className="relative">
                      <img
                        src={slide.image}
                        alt="Your Image"
                        className="-z-0 block w-full max-sm:h-[250px] md:h-[350px] xl:h-[475px]"
                      />
                     
                    </div>
                  </div>
                </div>
              </div> */}

              <img src={slide.image} />
              <div className="nivo-caption" style={{ display: "block" }}>
                <div className="slider-content s-tb slide-1">
                  <div className="text-left title-container s-tb-c">
                    <div className="container">

                      <p className="item-subtitle">{slide.title}</p>
                      <motion.div
                        aria-hidden="true"
                        initial="hidden"
                        whileInView="visible"
                        variants={fadeInUp}
                      >
                        <h2 className="item-title">{slide.title2}</h2>
                      </motion.div>
                      <motion.div
                        aria-hidden="true"
                        initial="hidden"
                        whileInView="visible"
                        variants={fadeInUpDelay}
                      >
                        <div className="item-paragraph">{slide.description}</div>
                      </motion.div>

                      <div className="slider-button">
                        <a href="" className="slider-btn">Free Consulting<i className="fas fa-long-arrow-alt-right"></i></a>
                      </div>
                      <div className="social-site">
                        <ul>
                          <li><span>Follow Us On :</span><a href="#"><i className="fab fa-facebook-square"></i></a></li>
                          <li> <a href="#"><i className="fab fa-twitter"></i></a></li>
                          <li><a href="#"><i className="fab fa-linkedin-in"></i></a></li>
                          <li><a href="#"><i className="fab fa-pinterest"></i></a></li>
                          <li><a href="#"><i className="fab fa-skype"></i></a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <motion.div
                aria-hidden="true"
                initial="hidden"
                whileInView="visible"
                variants={bannerbg1animation}
              >
                <div className="slider-bg-img1" >
                  <img src={bannerbg1} alt="figure" width="772" height="366" />
                </div>

              </motion.div>

              <div>
                <motion.div
                 aria-hidden="true"
                  initial="hidden"
                  whileInView="visible"
                  variants={bannerbg2animation}
                    viewport={{ once: true }}
                >
                  <div className="slider-bg-img2">
                    <img src={bannerbg2} alt="figure" width="211" height="96" />
                  </div>
                </motion.div>

              </div>

            </SwiperSlide>
          ))}
          <div className="swiper-pagination !bottom-0 mt-8 flex justify-center" />
        </Swiper>
      </div>
      {newLoanModalOpen && (
        <ConfirmModal
          isOpen={newLoanModalOpen}
          onSubmit={handleNewLoan}
          onClose={handleNewLoanModal}
          head="Confirm New Funding Application"
          content="Are you sure you want to proceed with applying for new funding?"
        />
      )}
    </>
  );
};

export default BannerSection;
