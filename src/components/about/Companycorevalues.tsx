import React from 'react'
import { aboutcompanycorevalues } from '../../utils/data'
const Companycorevalues = () => {
  return (
     <section className="company-value-wrap">
        <div className="container">
          <div className="item-content">
            <h2 className="section-title">Company Core Values</h2>
            <p> Your success is our mission, every step of the way.</p>
          </div>
          <div className="row">
           {aboutcompanycorevalues.map((item,index)=>(
              <div className="col-lg-6" key={index}>
              <div className="company-value-box">
                <div className="media">
                  <div className="item-img">
                    <img src={item.img} alt="about" width={235} height={251} />
                  </div>
                  <div className="media-body">
                    <h3 className="heading-title">{item.headingtitle}</h3>
                    <p>{item.p}</p>
                    <div className="item-button">
                      <a href={item.link} className="item-btn">Read More<i className="fas fa-long-arrow-alt-right" /></a>
                    </div>
                    <div className="item-number">{(index + 1).toString().padStart(2, '0')}</div>
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

export default Companycorevalues
