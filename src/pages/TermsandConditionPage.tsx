import React from 'react'

import Footer from "../components/layout/Footer"
import Header from '../components/layout/Mainheader';
import TermsandconditionsBanner from '../components/termsandcondition/TermsandconditionsBanner';
import TermsandconditionsInner from '../components/termsandcondition/TermsandconditionsInner';
const TermsandConditionPage = () => {
  return (<>
    <Header/>
    <TermsandconditionsBanner/>
    <TermsandconditionsInner/>
    <Footer/>
  </>
    
  )
}

export default TermsandConditionPage
