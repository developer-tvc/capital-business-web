import { useState } from 'react';
// optional: for icons
import Logo from '../../assets/images/Logo.png';
import close from '../../assets/images/close-x-svgrepo-com.svg';
import { NavLink } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

const Mobilenav = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  

  return (
    <div className="mean-container">
      <div className="mean-bar">
        <div className="mobile-menu-nav-back">
          <a className="logo-mobile" href="index.html">
            <img src={Logo} alt="logo" className="img-fluid" width={130} />
          </a>
         

        </div>

        <a
          href="#nav"
          className="meanmenu-reveal"
          onClick={e => {
            e.preventDefault();
            toggleMenu();
          }}
        >
          {menuOpen ? (
            <img src={close} width="22px" />
          ) : (
            <div>
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </a>

        <nav className="mean-nav">
          <ul
            style={{ display: menuOpen ? 'block' : 'none' }}
            className={menuOpen ? 'slide-down' : ''}
          >
            <li>
              <NavLink to={'/'}>Home</NavLink>
            </li>
            <li>
              <NavLink to={'/about-us'}>About Us</NavLink>
            </li>
            <li>
              <NavLink to={'/services'}>Services</NavLink>
            </li>
            <li className="mean-last">
              <NavLink to={'/contact-us'}>Contact</NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Mobilenav;
