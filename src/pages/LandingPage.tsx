import { useSelector } from 'react-redux';


import BannerSection from '../components/landing/BannerSection';
import MobileDownloadButton from '../components/landing/MobileDownloadButton';

import PaymentBox from '../components/landing/PaymentBox';

import ShareLinkSection from '../components/landing/ShareLinkSection';
import StatusSection from '../components/landing/StatusSection';

import Footer from '../components/layout/Footer';
import Header from '../components/layout/Mainheader';
import { authSelector } from '../store/auth/userSlice';
import { Roles } from '../utils/enums';
import useAuth from '../utils/hooks/useAuth';
import BannerBottom from '../components/landing/BannerBottom';
import LandingAboutUs from '../components/landing/LandingAboutUs';
import KeyFeatures from '../components/landing/KeyFeatures';
import WhyChooseUs from '../components/landing/WhyChooseUs';
import HowItsWorks from '../components/landing/HowItsWorks';
import WhoCanBenfit from '../components/landing/WhoCanBenfit';

const LandingPage = () => {
  const { authenticated } = useAuth();
  const { role } = useSelector(authSelector);

  return (
    <>



      <Header />
      <BannerSection />
      <BannerBottom />
      <LandingAboutUs />
      <MobileDownloadButton />
      <KeyFeatures />
      {authenticated &&
        (role === Roles.Customer ? (
          <>
            <PaymentBox />
            <ShareLinkSection />
          </>
        ) : (
          <StatusSection />
        ))}
      <WhyChooseUs />
      <HowItsWorks />
      <WhoCanBenfit/>
      <Footer />
    </>
  );
};

export default LandingPage;
