import React from 'react'
import blog9 from '../../assets/images/blog/blog9.jpg'
const NeedAnyHelp = () => {
  return (
   <section className="banner-wrap1 banner-wrap7">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="banner-box1">
                <div className="item-img">
                  <img src={blog9} alt="blog" width={506} height={200} />
                </div>
                <div className="bannar-details">
                  <h3 className="heading-title">Need Any Financial Help!</h3>
                  <div className="contact-box2">
                    <div className="item-icon-box">
                      <div className="item-icon"><i className="far fa-comments" /></div>   
                      <div className="banner-content">
                        <div className="item-hotline">Hotline</div>
                        <div className="item-number">020 3691 9423</div>
                      </div>
                    </div>
                    <div className="item-icon-box item-icon-box2">
                      <div className="item-icon"><i className="far fa-envelope" /></div>   
                      <div className="banner-content">
                        <div className="item-hotline">Send Us Email</div>
                        <div className="item-number">info@capital4business.co.uk</div>
                      </div>
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

export default NeedAnyHelp
