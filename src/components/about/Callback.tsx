import blog4 from '../../assets/images/blog/blog4.jpg'
import figure11 from '../../assets/images/figure/figure11.png'
const Callback = () => {
  return (
   <section className="call-back-wrap call-back-wrap2">
        <div className="container">
          <div className="row no-gutters">
            <div className="col-lg-5">
              <div className="call-back-box1">
                <h3 className="section-title">Request a Call Back</h3>
                <form className="message-box">
                  <div className="row">
                    <div className="form-group col-lg-12">
                      <input type="text" className="form-control" placeholder="Name" />
                    </div>
                    <div className="form-group col-lg-12">
                      <input type="text" className="form-control" placeholder="Email" />
                    </div>
                    <div className="form-group col-lg-12">
                      <input type="text" className="form-control" placeholder="Phone" />
                    </div>
                    <div className="form-group col-lg-12">
                      <textarea name="comment" id="message" className="form-control" placeholder="Message" cols={30} rows={4} defaultValue={""} />
                    </div>
                    <div className="form-group col-lg-12">
                      <a href="" className="item-btn">Submit Now</a>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="call-back-box2">
                <div className="item-img">
                  <img src={blog4} alt="blog" width={690} height={582} />
                  <div className="call-img">
                    <img src={figure11} alt="figure" width={145} height={295} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

export default Callback
