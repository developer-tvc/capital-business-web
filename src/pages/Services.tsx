

import FAQSection from '../components/faq/FaqSection';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Mainheader';
import ServicesBanner from '../components/services/ServicesBanner';
import WhatWeOffer from '../components/services/WhatWeOffer';
import WhoCanBenifits from '../components/services/WhoCanBenifits';

const Services = () => {

  return (
    <>
      <Header />
      <ServicesBanner/>
      <WhatWeOffer/>
      <WhoCanBenifits/>
      <div className='why-choose-us-wrap1'><FAQSection  /></div>
      
      <Footer />
    </>
  );
};

export default Services;
