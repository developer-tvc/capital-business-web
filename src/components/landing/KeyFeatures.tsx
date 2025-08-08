
import { ourkeyfeatures } from '../../utils/data';

import figure57 from '../../assets/images/figure/figure57.png'
import figure58 from '../../assets/images/figure/figure57.png'
const KeyFeatures = () => {
    return (
        <section className="consulting-service-wrap2">
            <div className="container">
                <div className="background-image1">
                    <img src={figure57} alt="png" width={164} height={461} />
                </div>
                <div className="background-image2">
                    <img src={figure58} alt="png" width={257} height={752} />
                </div>
                <p className="section-subtitle">What We Offer</p>
                <div className="row gutters-50">
                    <div className="col-lg-5">
                        <div className="consulting-top1">
                            <h2 className="section-title">Key Features of Our Unsecured Business fundings</h2>
                        </div>
                    </div>
                    <div className="col-lg-7">
                        <div className="consulting-top2">
                            <p> Our unsecured business fundings provide a hassle-free funding solution tailored for limited companies. With the flexibility to borrow up to £25,000 without securing assets, we aim to make funding accessible for businesses of all sizes. Here's how our solutions stand out:
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container">
                <div className='row'>

                    {ourkeyfeatures.map((features, index) => (
                        <div className="col-lg-4 col-md-6" key={index}>
                            <div className="consulting-service4" style={{ height: '320px' }}>
                                <h3 className="heading-title">{features.headingTitle}
                                </h3>
                                <div className="item-img">
                                    <img src={features.image} alt="figure" />
                                </div>
                                <p>  {features.description} </p>
                                <div className="consulting-button">
                                    <a href={features.link} className="consulting-btn"><i className="fas fa-long-arrow-alt-right" /></a>
                                </div>
                            </div>
                        </div>
                    ))}


                </div>
            </div>
        </section>
    )
}

export default KeyFeatures
