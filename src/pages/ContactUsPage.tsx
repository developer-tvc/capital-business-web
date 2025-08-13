import { useEffect } from 'react';

// import ContactUs from '../components/ContactUs';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Mainheader';
import ContactUsBanner from '../components/ContactUS/ContactUsBanner';
import ContactUsTop from '../components/ContactUS/ContactUsTop';
import ContactForm from '../components/ContactUS/ContactForm';
import ContactUsMap from '../components/ContactUS/ContactUsMap';
import NeedAnyHelp from '../components/ContactUS/NeedAnyHelp';

const ContactUsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Header />
      {/* <ContactUs /> */}
      <ContactUsBanner/>
      <ContactUsTop/>
      <ContactForm/>
      <ContactUsMap/>
      <NeedAnyHelp/>
      <Footer />
    </>
  );
};

export default ContactUsPage;
