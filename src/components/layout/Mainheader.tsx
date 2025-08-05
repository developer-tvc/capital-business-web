import { useEffect, useRef, useState } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { BiArrowBack } from 'react-icons/bi';
import { FaRegBell, FaRegUser } from 'react-icons/fa';
import { IoIosLogIn } from 'react-icons/io';
import { MdHomeFilled } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';

import Logo from '../../assets/images/Logo.png';
import userIcon from '../../assets/svg/user.png';
import { sessionSliceSelector } from '../../store/auth/sessionSlice';
import { authSelector } from '../../store/auth/userSlice';
import { Roles } from '../../utils/enums';
import useAuth from '../../utils/hooks/useAuth';
import HeaderNotification from './HeaderNotification';
import { useMediaQuery } from 'react-responsive';
import Mobilenav from './Mobilenav';
import { PiSignIn } from "react-icons/pi";
import Preloader from './Preloader';

const Navbar = ({
  backHandler,
  isSidebarOpen,
  toggleSidebar
}: {
  backHandler?: () => void;
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  fromUnitsPage?: boolean;
}) => {
  const [nav, setNav] = useState(false);
  const navRef = useRef(null);
  const { role } = useSelector(authSelector);
  const navigate = useNavigate();
  const handleNav = () => {
    if (toggleSidebar) {
      toggleSidebar();
    } else {
      setNav(!nav);
    }
  };

  const navItems = [
    { id: 1, text: 'About Us', path: '/about-us' },
    {
      id: 2,
      text: 'Our Products',
      path: '',
      dropdown: [
        {
          id: '2a',
          text: 'Business Funding',
          path: '/business-funding'
        },
        {
          id: '2b',
          text: 'Business Cash Advance',
          path: '/business-cash-advance'
        }
      ]
    },
    { id: 3, text: 'Our Lending Process', path: '/our-lending-process' },
    { id: 4, text: 'Blog', path: '/blog' },
    { id: 5, text: 'FAQ', path: '/faq' },
    { id: 6, text: 'Contact Us', path: '/contact-us' }
  ];

  const { authenticated, signOut } = useAuth();
  const { signedIn } = useSelector(sessionSliceSelector);

  const getBackgroundColor = () => {
    // List of path endings to check
    const pathEndings = [
      '/about-us',
      '/our-lending-process',
      '/login',
      '/funding-form',
      '/leads',
      '/dashboard',
      '/bulk-upload-funding',
      '/customer',
      '/notification',
      '/approval-list',
      '/underwriter',
      '/referral',
      '/manager',
      '/field-agent',
      '/finance-manager',
      '/blog',
      '/profile',
      '/blog-inner',
      '/contact-us',
      '/faq',
      '/business-funding',
      '/business-cash-advance',
      '/funding',
      '/units',
      '/credit-monitoring',
      '/leads',
      '/subscriptions',
      '/mandate',
      '/application-status',
      '/funding-form',
      '/cash-receipt',
      '/transaction-sorting',
      '/contract',
      '/identity-verification',
      '/gocardless',
      '/edit-approval',
      '/unit-profile',
      '/funding-offer',
      '/disbursement-advice',
      '/affordability',
      '/documents',
      '/pap',
      '/pap-details',
      '/assets',
      '/liabilities',
      '/equity',
      '/income',
      '/expense',
      '/entry',
      '/bp',
      '/bp-groups',
      '/reports/default-user',
      '/reports/customer',
      '/reports/good-standing',
      '/reports/default',
      '/reports/pending-due',
      '/reports/payment',
      '/reports/funding',
      '/reports/outstanding',
      '/reports/summary',
      '/reports/agent-performance',
      '/reports/agent',
      '/reports/contract-expiring',
      '/reports/contract-expired',
      '/reports/snapshot',
      '/reports/referral',
      '/reports/leads-loans',
      '/statements/pl',
      '/statements/trial-balance',
      '/statements/bp-trial-balance',
      '/statements/balance-sheet',
      '/statements/ledger'
    ];

    const staticPathEndings = new Set([
      // for dynamic paths like "/subscriptions/:id"
      '/subscriptions',
      '/mandate',
      '/cash-receipt',
      '/pap-details',
      '/entry',
      '/default',
      '/bulk-upload-funding'
    ]);

    const currentPath = location.pathname;

    // Check if the current path matches any static or dynamic patterns
    for (const ending of staticPathEndings) {
      const dynamicPathPattern = new RegExp(`^${ending}/[a-zA-Z0-9-]+$`);

      if (currentPath === ending) {
        return '#FFFFFF';
      }

      if (dynamicPathPattern.test(currentPath)) {
        return '#FFFFFF';
      }
    }

    for (const ending of `${pathEndings}/`) {
      if (currentPath !== '/' && currentPath.endsWith(ending)) {
        return '#FFFFFF';
      }
    }

    return '#CDD6E9';
  };
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [unReadedNotifications, setUnReadedNotifications] = useState(false);

  const user = useSelector(authSelector);
  const isTabletOrBelow = useMediaQuery({ maxWidth: 768 });
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };
  const toggleNotification = () => {
    setNotificationOpen(!isNotificationOpen);
  };
  useEffect(() => { }, [signedIn]);

  const handleLogout = () => {
    signOut();
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setNav(false);
        setDropdownOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = event => {
      if (isOpen && !event.target.closest('#user-menu-button')) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };

  }, [isOpen]);

  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const position = 'right'; // or 'right'

  const handleToggleMenu = () => {
    setIsOpenSidebar(prev => !prev);
  };

  const handleCloseMenu = () => {
    setIsOpenSidebar(false);
  };




  const [mobisMenuOpen, setmobIsMenuOpen] = useState(false);

  const toggleMeanMenu = () => {
    setmobIsMenuOpen(!mobisMenuOpen);
  };

   const menuRef = useRef(null);
  const placeholderRef = useRef(null);
  const scrollUpRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Back to Top Button Logic
      if (scrollUpRef.current) {
        if (scrollY > 500) {
          scrollUpRef.current.classList.add('back-top');
        } else {
          scrollUpRef.current.classList.remove('back-top');
        }
      }

      // Sticky Header Logic
      if (document.body.classList.contains('sticky-header')) {
        const menu = menuRef.current;
        const placeholder = placeholderRef.current;

        const topHeader = document.getElementById('header-topbar');
        const middleHeader = document.getElementById('header-middlebar');

        const topHeaderH = topHeader?.offsetHeight || 0;
        const middleHeaderH = middleHeader?.offsetHeight || 0;
        const targetScroll = topHeaderH + middleHeaderH;

        if (scrollY > targetScroll) {
          menu?.classList.add('rt-sticky');
          if (placeholder) placeholder.style.height = `${menu.offsetHeight}px`;
        } else {
          menu?.classList.remove('rt-sticky');
          if (placeholder) placeholder.style.height = '0px';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <>
    <Preloader/>
      <header className="header">
        <div id="rt-sticky-placeholder" ref={placeholderRef}></div>
        <div id="header-topbar" className="header-topbar-layout2" >
          <div className="container">
            <div className="row align-items-center">
              <div className="col-xl-2 col-lg-2">
                <div className="logo-area2">
                  <NavLink to={"/"}>  <img src={Logo} alt="logo" className="img-fluid" width={180} height={45} /></NavLink>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6 d-flex justify-content-center">
                <div className="topbar-left topbar-left2">
                  <p className="item-paragraph item-paragraph2">Are you ready to grow up your business?</p>
                  <div className="header-button header-button2">
                    <NavLink to={'/contact-us'}>Contact us today <i className="fas fa-long-arrow-alt-right" /></NavLink>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-lg-4 d-flex justify-content-end">
                <div className="topbar-right2">
                  <ul>
                    <li>
                      <div className="media">
                        <div className="item-icon">
                          <i className="far fa-comments" />
                        </div>
                        <div className="media-body">
                          <div className="item-label">Hotline Number</div>
                          <div className="item-number" style={{ fontSize: '1em' }}>020 3691 9423</div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="header-right-button">
                        <NavLink to={'/funding-form'}><a className="header-btn">Find An Advisor</a></NavLink>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
         <div id="rt-sticky-placeholder" ref={placeholderRef} style={{ height: 0 }}></div>
        <div id="header-menu" className="header-menu menu-layout1" ref={menuRef}>
          <div className="container">
            <div className="row d-flex align-items-center">
              <div className="col-xl-10 col-lg-10 d-flex justify-content-start position-static">
                <nav id="dropdown" className="template-main-menu">
                  <ul>
                    <li>
                      <NavLink to={"/"}>Home</NavLink>
                    </li>
                    <li>
                      <NavLink to={"/about-us"}>
                        About Us
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to={"/services"}>
                        Services
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to={"/contact-us"}>
                       Contact US
                      </NavLink>
                    </li>
                  </ul>
                </nav>
              </div>
              <div className="col-xl-2 col-lg-2 d-flex justify-content-end">
                <div className="header-action-layout1">
                  <ul>
                    <li className="offcanvas-menu-trigger-wrap">
                      <button type="button" className={`offcanvas-menu-btn ${isOpenSidebar ? 'menu-status-close' : 'menu-status-open'}`}
                        onClick={handleToggleMenu}>
                        <span className="btn-icon-wrap">
                          <span />
                          <span />
                          <span />
                        </span>
                      </button>
                    </li>
                    <li> <NavLink to={"/login"} className={"signin-a"}>
                       <PiSignIn /> Sign In
                      </NavLink></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div id="wrapper" className={isOpenSidebar ? 'open' : ''}>
        {/* Offcanvas Mask */}
        {isOpenSidebar && <div className="offcanvas-mask" onClick={handleCloseMenu}></div>}

        {/* Offcanvas Menu */}
        <div
          id="offcanvas-wrap"
          data-position={position}
          className={`offcanvas-panel offcanvas-menu-wrap ${position}`}
          style={{
            transform: isOpenSidebar
              ? 'translateX(0)'
              : position === 'right'
                ? 'translateX(120%)'
                : 'translateX(105%)',
          }}
        >
          <div className="offcanvas-close close-btn" onClick={handleCloseMenu}><i className="fas fa-times"></i></div>
          <div className="offcanvas-content">
            <div className="offcanvas-logo">
              <a href="index.html"><img src={Logo} alt="Logo" width="180" height="45" /></a>
            </div>
            <ul className="offcanvas-menu">
              <li className="nav-item">
                  <NavLink to={"/"}>Home</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={"/about-us"}>
                  About
                </NavLink>
              </li>
              <li className="nav-item">
                 <NavLink to={"/services"}>services</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={"/contact-us"}>Contact</NavLink>
              </li>
              <li className="nav-item">
                 <NavLink to={"/duty-statement"}>Consumer Duty Statement</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={"/data-protection-policy"}>Data Protection Policy</NavLink>
              </li>
              <li className="nav-item">
               <NavLink to={"/terms-and-conditions"}>Website Terms of Use</NavLink> 
              </li>
            </ul>
            <div className="offcanvas-footer">
              <div className="item-title">Follow Me</div>
              <ul className="offcanvas-social">
                <li><a href="#"><i className="fab fa-facebook-f"></i></a></li>
                <li><a href="#"><i className="fab fa-twitter"></i></a></li>
                <li><a href="#"><i className="fab fa-linkedin-in"></i></a></li>
                <li><a href="#"><i className="fab fa-google-plus-g"></i></a></li>
                <li><a href="#"><i className="fab fa-pinterest"></i></a></li>
                <li><a href="#"><i className="fas fa-rss"></i></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className='d-lg-none'>
        <Mobilenav/>
      </div>
     {/* Scroll To Top Button */}
   <div
  className="scrollup"
  ref={scrollUpRef}
  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
>
  <i className="fas fa-angle-double-up"></i>
</div>
    </>
  );
};

export default Navbar;
