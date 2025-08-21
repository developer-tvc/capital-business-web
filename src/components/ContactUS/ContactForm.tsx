

const ContactForm = () => {
  return (
     <section className="contact-wrap2">
        <div className="container">
          <div className="row gutters-40">
            <div className="col-lg-12">
              <div className="contact-box3">
                <div className="contact-bg-image">
                  <img src="img/figure/figure94.png" alt="figure" width={266} height={214} />
                </div>
                <div className="item-heading">
                  <h2 className="item-title">We Love To Hear From You</h2>
                  <p>Please call or email contact form and we will be happy to assist you.</p>
                </div>
                <form className="message-box">
                  <div className="row gutters-10">
                    <div className="col-lg-6 form-group">
                      <input type="text" className="form-control" name="fname" placeholder="First Name*" data-error="First Name is required" required />
                      <div className="help-block with-errors" />
                    </div>
                    <div className="col-lg-6 form-group">
                      <input type="text" className="form-control" name="lname" placeholder="Last Name*" data-error="Last Name is required" required />
                      <div className="help-block with-errors" />
                    </div>
                    <div className="col-lg-6 form-group">
                      <input type="email" className="form-control" name="email" placeholder="Email*" data-error="Email is required" required />
                      <div className="help-block with-errors" />
                    </div>
                    <div className="col-lg-6 form-group">
                      <input type="text" className="form-control" name="phone" placeholder="Phone*" data-error="Phone is required" required />
                      <div className="help-block with-errors" />
                    </div>
                    <div className="col-lg-12 form-group">
                      <input type="text" className="form-control" name="subject" placeholder="Subject*" data-error="Subject is required" required />
                      <div className="help-block with-errors" />
                    </div>
                    <div className="col-lg-12 form-group">
                      <textarea name="message" id="message" className="form-control" placeholder="Comments" cols={30} rows={6} data-error="Message Name is required" required defaultValue={""} />
                      <div className="help-block with-errors" />
                    </div>
                    <div className="col-lg-12 form-group">
                      <button type="submit" className="item-btn">Send message</button>
                    </div>
                  </div>
                  <div className="form-response" />
                </form>
              </div>
            </div>
           
          </div>
        </div>
      </section>
  )
}

export default ContactForm
