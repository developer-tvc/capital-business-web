import figure76 from '../../assets/images/figure/figure76.png'
import about6 from '../../assets/images/about/about6.jpg'

const AboutCapital4Business = () => {
  return (
    <section className="about-wrap-layout1">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-6">
              <div className="about-box4">
                <p className="heading-subtitle">About</p>
                <h2 className="heading-title">Capital4Business</h2>
                <p> At Capital4Business, we are the trusted partner for SMEs across the UK, providing tailored funding solutions to meet your business needs. We recognize the importance of seizing opportunities and enabling businesses to access their business needs without any concern. Our dedicated team is committed to service excellence, empowering our clients to achieve growth and success at every step of the journey.</p>
                <div className="about-layout">
                  <div className="media">
                    <div className="item-img about-img2">
                      <img src={figure76} alt="figure" width={44} height={46} />
                    </div>
                    <div className="media-body">
                      <div className="item-content">
                        <h3 className="item-title">Our Mission</h3>
                        <p>Our mission is to empower SMEs in the UK by democratizing access to funding solutions that help businesses thrive. We support small businesses across diverse sectors with flexible financing options, enabling them to expand their reach and offer products and services to a broader customer base. At Capital4Business, your growth is our priority.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6">
              <div className="about-box5">
                <div className="item-img">
                  <img src={about6} alt="about" width={501} height={607} />
                  {/* <div class="background-image1">
                                    <img src="img/figure/figure73.png" alt="figure" width="167" height="167">
                                </div>
                                <div class="background-image2">
                                    <img src="img/figure/figure74.png" alt="figure" width="121" height="104">
                                </div>
                                <div class="background-image3">
                                    <img src="img/figure/figure75.png" alt="figure" width="139" height="417">
                                </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

export default AboutCapital4Business
