import DutystatementBanner from "../components/dutystatement/DutystatementBanner";
import DutystatementInner from "../components/dutystatement/DutystatementInner";
import Footer from "../components/layout/Footer"
import Header from '../components/layout/Mainheader';


const DutyStatementPage = () => {
  return (
  <>
    <Header/>
    <DutystatementBanner/>
    <DutystatementInner/>
    <Footer/>
  </>
  
  )
}

export default DutyStatementPage
