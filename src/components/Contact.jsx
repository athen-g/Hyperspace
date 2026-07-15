import React from 'react';

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="rule-line">
        <span className="rule-dot"></span>
        <span className="rule-dot"></span>
      </div>
      <div className="contact-container">
        {/* Left Side Info */}
        <div className="contact-info">
          <span className="contact-eyebrow">CONTACT</span>
          <h2 className="contact-title">
            <span className="pink-text">HAVE A</span>
            <span className="white-text">QUESTION IN MIND?</span>
          </h2>

          <div className="contact-connect-box">
            <div className="rule-line">
              <span className="rule-dot"></span>
              <span className="rule-dot"></span>
            </div>
            <span className="contact-connect-label">LET'S CONNECT</span>
            <a href="mailto:hyperspace.wcoe@gmail.com" className="contact-email">
              Contact Us
            </a>
            <div className="rule-line">
              <span className="rule-dot"></span>
              <span className="rule-dot"></span>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="contact-form-wrapper">
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="form-name">NAME</label>
              <input type="text" id="form-name" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="form-email">EMAIL</label>
                <input type="email" id="form-email" required />
              </div>
              <div className="form-group">
                <label htmlFor="form-phone">PHONE</label>
                <input type="tel" id="form-phone" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="form-message">MESSAGE</label>
              <textarea id="form-message" rows="4" required></textarea>
            </div>

            <button type="submit" className="contact-submit-btn">
              SEND REQUEST
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
