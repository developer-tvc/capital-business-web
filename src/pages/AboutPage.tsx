import { useEffect } from 'react';

import AboutBanner from '../components/about/AboutBanner';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Mainheader';
import AboutCapital4Business from '../components/about/AboutCapital4Business';
import Companycorevalues from '../components/about/Companycorevalues';
import Callback from '../components/about/Callback';
import Testimonial from '../components/about/Testimonial';
const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Header />
      <AboutBanner />
      <AboutCapital4Business/>
      <Companycorevalues/>
      <Callback/>
      <Testimonial/>
      <Footer />
    </>
  );
};

export default AboutPage;
