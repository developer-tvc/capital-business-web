
import {whyChooseus} from '../../utils/data';
const WhyChooseUs = () => {
  return (
   <section className="about-wrap-layout1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="consulting-service1">
                <h2 className="section-title">Why Choose Capital4Business?
                </h2>
                <p>At Capital4Business, we’re committed to helping your business thrive with funding solutions designed for your success. Whether you need to support cash flow or fuel expansion, our unsecured fundings provide the flexibility and speed you need to move forward confidently.
                </p>
              </div>
            </div>
          {whyChooseus.map((data,index)=>(
            <div className="col-lg-4 col-md-6" key={index}>
              <div className="about-box4">                                        
                <div className="about-layout">
                  <div className="media">                                               
                    <div className="media-body">
                      <div className="item-content">
                        <h3 className="item-title">{data.headingTitle}</h3>
                        <p> {data.description}</p>
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

export default WhyChooseUs
