import React, { useState } from 'react';
import { questions } from '../../utils/data';

const FAQSection: React.FC = () => {
  const [openQuestion, setOpenQuestion] = useState<number>(0);

  const toggleQuestion = (questionIndex: number) => {
    setOpenQuestion(openQuestion === questionIndex ? null : questionIndex);
  };

  return (
  <section className='choose-us-box1'>
     
      <div className="container p-0">
        <h2 className="section-title">How It Works</h2>
                <p>The Capital4business Process<br />
                  Navigating the path to business friendly capital @ Capital4business is effortless:
                </p>
        <div className="accordion">
          {questions.map((question, index) => (
            <div className="card" key={index}>
              <div className="card-header">
                <h4
                  className={`heading-title ${openQuestion === index ? '' : 'collapsed'}`}
                  onClick={() => toggleQuestion(index)}
                >
                  {question.title}
                </h4>
              </div>
              <div
                className={`accordion-body-wrapper ${openQuestion === index ? 'open' : ''}`}
              >
                <div className="card-body">
                  <p>{question.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
