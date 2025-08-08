import React from "react";
import Slider from "react-slick";
import "../../assets/css/slick.css";
import "../../assets/css/slick-theme.css";
const Testimonial = () => {
    const settings = {
    arrows: true,
    slidesToShow: 1,
    autoplay: false,
    autoplaySpeed: 2000,
  };

    const testimonials = [
    {
      quote: `“Capital4Business was a game-changer for our company. When we needed urgent funding to expand our operations, they delivered fast and hassle-free solutions. Their team guided us every step of the way. Highly recommended!”`,
      name: "Steven Sjones",
    },
    {
      quote: `“As a small business owner, I struggled to secure funding that fit my needs. Capital4Business not only understood my challenges but also provided customized funding options that fueled our growth. Their expertise and professionalism are unmatched.”`,
      name: "Sara M",
    },
    {
      quote: `“The team at Capital4Business made the entire process seamless. From the initial consultation to securing funds, they were professional, transparent, and efficient. Thanks to them, our expansion project was a success!”`,
      name: "John P",
    },
  ];
  return (
    <section className="testimonial-wrap3">
        <div className="container">
         <div className="testimonial-box3">
      <Slider {...settings}>
        {testimonials.map((item, index) => (
          <div key={index} className="testimonial-content">
            <div className="item-img-round">
              {/* Optional: Add <img src="..." /> here */}
            </div>
            <blockquote className="item-quote">{item.quote}</blockquote>
            <h2 className="heading-title">{item.name}</h2>
            {/* <h3 className="heading-subtitle">CEO Founder</h3> */}
          </div>
        ))}
      </Slider>
    </div>
        </div>
      </section>
  )
}

export default Testimonial
