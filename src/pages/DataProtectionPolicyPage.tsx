import DataprotectionpolicyBanner from "../components/dataprotectionpolicy/DataprotectionpolicyBanner";
import DataprotectionpolicyInner from "../components/dataprotectionpolicy/DataprotectionpolicyInner";

import Footer from "../components/layout/Footer"
import Header from '../components/layout/Mainheader';


const DutyStatementPage = () => {
  return (
  <>
    <Header/>
    <DataprotectionpolicyBanner/>
    <DataprotectionpolicyInner/>
    <Footer/>
  </>
  
  )
}

export default DutyStatementPage
