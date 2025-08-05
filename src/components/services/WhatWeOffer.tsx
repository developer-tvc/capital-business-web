
import { servicesfeaturesData } from "../../utils/data"
const WhatWeOffer = () => {
  return (
    <section className="about-wrap-layout1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="consulting-service1">
                <h2 className="section-title">What We Offer
                </h2>
                <p>
                  <b>Our Financing Solutions</b><br />
                  Our unsecured business fundings provide a hassle-free funding solution tailored for limited companies. With the flexibility to borrow up to <b>£25,000 without securing assets</b>, we aim to make funding accessible for businesses of all sizes. Here's how our solutions stand out
                </p>
                <p><b>Key Features of Our Unsecured Business fundings
                  </b></p>
              </div>
            </div>
            {servicesfeaturesData.map((feature, index) => (
        <div className="col-lg-6 col-md-6" key={index}>
          <div className="about-box4">
            <div className="about-layout" style={{ height: '250px' }}>
              <div className="media">
                <div className="media-body">
                  <div className="item-content">
                    <h3 className="item-title">{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
          </div>
        </div>
      </section>
  )
}

export default WhatWeOffer
