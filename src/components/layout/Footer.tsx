
import { Link ,NavLink} from 'react-router-dom';
import Logo from '../../assets/images/Logo.png';

import figure1 from '../../assets/images/figure1.png'
import figure2 from '../../assets/images/figure2.png'
import figure4 from '../../assets/images/figure4.png'
const Footer = () => {
 
  return (
    <>
      <footer className="footer-area1">
        <div className="footer-bottom-img">
          <img src={figure1} alt="figure" width={309} height={235} />
        </div>
        <div className="footer-top-img">
          <img src={figure2} alt="figure" width={369} height={225} />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-xl-4 col-lg-6 col-md-4 col-sm-6">
              <div className="footer-left">
                <div className="footer-logo">
                  <a href="#"><img src={Logo} alt="logo" width={180} height={45} /></a>
                </div>
                <p>We offer B2B Funding Solutions to the Limited company SME’s in the UK. Explore Effortless Funding Options Facilitating Business to business connections
                </p>
                <div className="footer-social">
                  <ul>
                    <li>
                      <a href="#" className="fb"><i className="fab fa-facebook-square" /></a>
                      <a href="#" className="twit"><i className="fab fa-twitter" /></a>
                      <a href="#" className="linkin"><i className="fab fa-linkedin-in" /></a>
                      <a href="#" className="pint"><i className="fab fa-pinterest" /></a>
                      <a href="#" className="skype"><i className="fab fa-skype" /></a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-6 col-md-4 col-sm-6">
              <div className="footer-middle">
                <h2 className="footer-title">Quick Links</h2>
                <div className="row">
                  <div className="col-lg-6 col-md-12">
                    <ul className="footer-list">
                      <li><NavLink to={'/'}><i className="fas fa-angle-right" />Home</NavLink></li>
                      <li><NavLink to={'/about-us'}><i className="fas fa-angle-right" />About</NavLink></li>
                      <li><NavLink to={'/services'}><i className="fas fa-angle-right" />Services</NavLink></li>
                      <li><NavLink to={'/contact-us'}><i className="fas fa-angle-right" />Contact</NavLink></li>
                    </ul>
                  </div>
                  {/* <div class="col-lg-6 col-md-12">
                                    <ul class="footer-list2">
                                        <li><a href="#"><i class="fas fa-angle-right"></i>Wealth Marketing</a></li>
                                        <li><a href="#"><i class="fas fa-angle-right"></i>Our Services</a></li>
                                        <li><a href="#"><i class="fas fa-angle-right"></i>Stats Element</a></li>
                                    </ul>
                                </div> */}
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-6 col-md-4 col-sm-6">
              <div className="footer-right">
                <h2 className="footer-title">Contact</h2>
                <p><span className="fa fa-home" />&nbsp;&nbsp;Capital finserv Limited T/a Capital4business, <br />Unit 2, Bow court, Fletchworthgate,<br /> Canley, CV5 6SP <br /> <span className="fa fa-phone" />&nbsp;&nbsp;020 3691 9423<br /><span className="fa fa-envelope" />&nbsp;&nbsp;info@capital4business.co.uk</p>
                {/* <h2 class="footer-title">Get Updates!</h2>
                            <p>Sign up for our latest news &amp; articles. We won’t give you spam mails.</p>
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Enter your Email">
                                <div class="input-group-append">
                                    <button class="btn btn-outline-secondary" type="button" id="button-addon2"><i class="fas fa-angle-right"></i></button>
                                </div>
                            </div> */}
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-12">
                <div className="copyright-area">
                  <p> © Capital4Business 2024. All Rights Reserved</p>
                  <div className="copyright-img1">
                    <img src={figure4} alt="figure" width={20} height={20} />
                  </div>
                  <div className="copyright-img2">
                    <img src={figure4} alt="figure" width={20} height={20} />
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <p className="nav-item text-center">
                  <NavLink to={'/duty-statement'}>Consumer Duty Statement</NavLink>|
                   <NavLink to={'/data-protection-policy'}>Data Protection Policy</NavLink> |
                   <NavLink to={'/terms-and-conditions'}>Website Terms of Use</NavLink>
                </p>
                <p className="nav-item text-center">Capital Finserv Limited T/a Capital4business Registered in England and Wales. Company Number: 10765922. Authorised and Regulated by the Financial Conduct Authority. FCA Registration Number 780153
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
