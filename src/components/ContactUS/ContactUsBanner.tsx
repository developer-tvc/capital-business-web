import { NavLink } from 'react-router-dom'
import figure79 from '../../assets/images/figure/figure79.png'
import figure78 from '../../assets/images/figure/figure79.png'

const ContactUsBanner = () => {
  return (
      <section className="breadcrumb-wrap xs-banner-padding">
        <div className="breadcrumb-img1">
          <img src={figure79} alt="figure" width={223} height={109} />
        </div>
        <div className="breadcrumb-img2">
          <img src={figure78} alt="figure" width={185} height={56} />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb-box">
                <h1 className="page-title">Contact With Us</h1>
                <nav>
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item"><NavLink to={"/"}> Home</NavLink></li>
                    <li className="breadcrumb-item active" >Contact With Us</li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

export default ContactUsBanner
