import React from 'react';

import figure69 from '../../assets/images/figure/figure69.png';
import figure70 from '../../assets/images/figure/figure70.png';
import { NavLink } from 'react-router-dom';

const BannerBottom = () => {
  return (
          <section className="banner-wrap2">
        <div className="container">
          <div className="background-image1">
            <img src={figure69} alt="banner" width={183} height={137} />
          </div>
          <div className="background-image2">
            <img src={figure70} alt="banner" width={404} height={180} />
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="banner-box2">
                <div className="media">
                  <h2 className="section-title">Empowering Growth, Financing Futures ... Contact With Us </h2>
                  <div className="media-body">
                    <div className="item-button">
                    <NavLink to={'/contact-us'} className="item-btn"> Request a Call Back<i className="fas fa-long-arrow-alt-right" /></NavLink> 
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

export default BannerBottom
