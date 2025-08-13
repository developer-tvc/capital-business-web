
import FAQSection from '../faq/FaqSection'

const HowItsWorks = () => {
  return (
     <section className="why-choose-us-wrap1">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="choose-us-box1">
               
                <FAQSection/>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="consulation-box1">
                <h2 className="section-title">Free Consultation</h2>
                <p>We're Here to Empower Your Financial Aspirations - Contact Us Today!</p>
                <form className="message-box">
                  <div className="row">
                    <div className="form-group col-lg-12">
                      <input type="text" className="form-control" />
                      <label>Name</label>
                    </div>
                    <div className="form-group col-lg-12">
                      <input type="text" className="form-control" />
                      <label>Email</label>
                    </div>
                    <div className="form-group col-lg-12">
                      <input type="text" className="form-control" />
                      <label>Subject</label>
                    </div>
                    <div className="form-group col-lg-12">
                      <textarea name="comment" id="message" className="form-control" cols={30} rows={4} defaultValue={""} />
                      <label>Message</label>
                    </div>
                    <div className="form-group col-lg-12">
                      <a href="#" className="item-btn">Submit Now</a>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

export default HowItsWorks
