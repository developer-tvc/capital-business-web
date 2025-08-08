import React from 'react'
import figure64 from '../../assets/images/figure/figure64.png'
import service9 from '../../assets/images/service/service9.jpg'
const LandingAboutUs = () => {
  return (
      <section className="about-finnaco-wrap2">
        <div className="container">
          <div className="background-image">
            <img src={figure64} alt="figure" width={174} height={173} />
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="about-box3">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="item-img">
                      <img src={service9} alt="service" width={690} height={835} />
                      <div className="shape-box">
                        <div className="item-shape">
                          <div className="item-icon"><i className="fas fa-phone-alt" /></div>
                          <ul className="item-estimate">
                            <li>Let's call us to get a free estimate</li>
                            <li><span>020 3691 9423</span></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="about-box8">
                      <h2 className="heading-title">Who We Are</h2>
                      <p> At Capital4Business, we are the trusted partner for SMEs across the UK, providing tailored funding solutions to meet your business needs. We recognize the importance of seizing opportunities and enabling businesses to access their business needs without any concern. Our dedicated team is committed to service excellence, empowering our clients to achieve growth and success at every step of the journey.</p>
                      <div className="media">
                        <ul className="about-list">
                          <li style={{color: 'black'}}><b><i className="fas fa-star" />Founder Friendly Capital</b></li>
                          <li style={{color: 'black'}}><b><i className="fas fa-star" />Fee based Solutions</b></li>
                          <li style={{color: 'black'}}><b><i className="fas fa-star" />Simplified Application Process</b></li>
                          {/* <li><i class="fas fa-check"></i>Web Development</li> */}
                        </ul>
                        {/* <div class="media-body">
                                                <div class="grubh-img">
                                                    <img src="img/figure/figure63.png" alt="figure" width="136" height="137">
                                                </div>
                                            </div> */}
                      </div><br />
                      <h2 className="heading-title">Our Mission</h2>
                      <p className="item-paragraph">Our mission is to empower SMEs in the UK by democratizing access to funding solutions that help businesses thrive. We support small businesses across diverse sectors with flexible financing options, enabling them to expand their reach and offer products and services to a broader customer base. At Capital4Business, your growth is our priority.</p>
                      {/* <div class="media">
                                            <div class="about-img">
                                                <img src="img/about/about2.png" alt="about" width="110" height="110">
                                            </div>
                                            <div class="media-body2">
                                                <h3 class="item-title">Michard Wizer</h3>
                                                <h4 class="item-subtitle">CEO & Founder</h4>
                                            </div>
                                        </div> */}
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

export default LandingAboutUs
