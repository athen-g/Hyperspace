import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import Button from './Button';

// ── Replace these three values with your EmailJS credentials ──────────────────
const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || 'YOUR_PUBLIC_KEY';
// ─────────────────────────────────────────────────────────────────────────────

const Contact = () => {
  const formRef = useRef(null);
  const [focused,  setFocused]  = useState(null);
  const [status,   setStatus]   = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');
    setErrorMsg('');

    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        { publicKey: EMAILJS_PUBLIC_KEY }
      );
      setStatus('success');
      formRef.current.reset();
    } catch (err) {
      console.error('EmailJS error:', err);
      setErrorMsg(err?.text || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

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
          <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-grid-container">
              {/* Row 1: Name */}
              <div className={`form-group contact-grid-full ${focused === 'name' ? 'contact-field--active' : ''}`}>
                <label htmlFor="form-name">NAME</label>
                <input
                  type="text"
                  id="form-name"
                  name="from_name"
                  placeholder="Jane Smith"
                  required
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                />
              </div>

              {/* Row 2: Email & Phone */}
              <div className={`form-group border-r border-light-grey ${focused === 'email' ? 'contact-field--active' : ''}`}>
                <label htmlFor="form-email">EMAIL</label>
                <input
                  type="email"
                  id="form-email"
                  name="from_email"
                  placeholder="your@email.com"
                  required
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                />
              </div>
              <div className={`form-group ${focused === 'phone' ? 'contact-field--active' : ''}`}>
                <label htmlFor="form-phone">PHONE</label>
                <input
                  type="tel"
                  id="form-phone"
                  name="phone"
                  placeholder="+00 0123456789"
                  onFocus={() => setFocused('phone')}
                  onBlur={() => setFocused(null)}
                />
              </div>

              {/* Row 4: Message */}
              <div className={`form-group contact-grid-full ${focused === 'message' ? 'contact-field--active' : ''}`}>
                <label htmlFor="form-message">MESSAGE</label>
                <textarea
                  id="form-message"
                  name="message"
                  rows="4"
                  placeholder="My message is..."
                  required
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused(null)}
                ></textarea>
              </div>
            </div>

            {/* Status feedback */}
            {status === 'success' && (
              <p style={{ color: 'var(--color-accent-cyan)', marginTop: '1rem', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                ✓ Message sent! We'll get back to you soon.
              </p>
            )}
            {status === 'error' && (
              <p style={{ color: 'var(--color-accent-pink)', marginTop: '1rem', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                ✗ {errorMsg}
              </p>
            )}

            <Button
              label={status === 'loading' ? 'SENDING…' : 'SEND REQUEST'}
              className='bottom-0 mt-24'
              disabled={status === 'loading'}
            />
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
