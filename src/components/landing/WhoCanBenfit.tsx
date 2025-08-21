
import figure55 from '../../assets/images/figure/figure55.png'
import { whocanbenifits } from '../../utils/data'
function WhoCanBenfit() {
  return (
    <section className="case-wrap-layout1">
        <div className="background-image">
          <img src={figure55} alt="figure" width={362} height={347} />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="case-box1">
                <p className="section-subtitle" />
                <h2 className="section-title">Who Can Benefit</h2>
                <p>Our financing solutions are designed for SMEs with big ambitions. Whether you’re a retail business looking to scale or an SME striving for market leadership, Capital4Business is here to unlock your growth potential.</p>
              </div>
            </div>
           {whocanbenifits.map((data,index)=>(
                   <div className="col-lg-4 col-md-6 col-sm-6" key={index}>
              <div className="case-box2">
                <div className="case-img">
                  <a href="#"><img src={data.img} alt="service" width={530} height={370} /></a>
                  <div className="item-content">
                    {/* <p class="case-subtitle">Business Strategy</p>
                                    <h3 class="case-title">Investment Planning</h3> */}
                  </div>
                  <div className="item-shape-box">
                    <div className="item-shape">
                      <div className="item-icon"><a href={data.link}><i className="fas fa-link" /></a></div>
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

export default WhoCanBenfit
