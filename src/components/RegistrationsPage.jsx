import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import BackgroundLines from './ui/BackgroundLines';
import Contact from './Contact';
import Footer from './Footer';
import { registrationQuestions } from '../../constants/registration';
import RegSelect from './ui/RegSelect';
import { useMediaQuery } from 'react-responsive';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

/* ─── Reusable animated field wrapper ─── */
function Field({ children, className = '' }) {
    return (
        <div className={`reg-field ${className}`}>
            {children}
        </div>
    );
}

export default function RegistrationsPage() {
    const { slug } = useParams();
    const isMobile768 = useMediaQuery({ query: '(max-width: 768px)' });

    const [event, setEvent] = useState(null);
    const [loadingEvent, setLoadingEvent] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [successData, setSuccessData] = useState(null);

    /* Pick questions for this event */
    const questions =
        registrationQuestions[slug] ?? registrationQuestions['default'];

    /* Form state */
    const [form, setForm] = useState({
        name: '',
        email: '',
        contact: '',
        class: 'COMP',
        division: '1',
        ...Object.fromEntries(questions.map((q) => [q.id, ''])),
    });

    const [focused, setFocused] = useState(null);

    useEffect(() => {
        if (!slug) return;
        const fetchEvent = async () => {
            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (error) throw error;
                setEvent(data);
            } catch (err) {
                console.error('Error fetching event:', err);
            } finally {
                setLoadingEvent(false);
            }
        };
        fetchEvent();
    }, [slug]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!event) return;
        if (!form.name || !form.email || !form.contact) {
            toast.error('Please fill in all required fields.');
            return;
        }

        setSubmitting(false);
        setSubmitting(true);

        try {
            // Map form fields to register-for-event payload:
            // name, email, phone, college, branch, year, event_id, custom_field_data
            const customData = {};
            questions.forEach(q => {
                customData[q.id] = form[q.id];
            });

            const { data, error } = await supabase.functions.invoke('register-for-event', {
                body: {
                    name: form.name,
                    email: form.email,
                    phone: form.contact,
                    college: 'Hyperspace College', // Default or custom
                    branch: form.class,
                    year: parseInt(form.division),
                    event_id: event.id,
                    custom_field_data: customData
                }
            });

            if (error) throw error;

            if (data.alreadyRegistered) {
                toast.success('You have already registered for this event!');
                setSuccessData({ registrationNo: data.registrationNo || 'ALREADY_REGISTERED', status: 'already' });
            } else if (data.waitlisted) {
                toast.success('Event capacity full. You are added to the waitlist!');
                setSuccessData({ status: 'waitlisted' });
            } else if (data.success) {
                toast.success('Registration successful!');
                setSuccessData({ registrationNo: data.registrationNo, status: 'success' });
            } else {
                toast.error(data.error || 'Registration failed.');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Registration failed.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingEvent)
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a', color: '#555', fontSize: '14px', letterSpacing: '2px' }}>
                LOADING EVENT...
            </div>
        );

    if (!event)
        return (
            <h1 className="text-white text-center py-20 font-host text-3xl">
                404 — Event Not Found
            </h1>
        );


    return (
        <section id="registration" className="relative z-10">
            <Header />
            <BackgroundLines />

            {/* ── Hero header (mirrors EventsOngoingTemplate) ── */}
            <div className={`relative z-10 border border-r-0 border-[#666666] bg-[#0e0e0e] ${isMobile768 ? 'w-[93.056%] mx-auto mt-[120px] mb-8' : 'w-[93.056%] mx-auto mt-[90px] mb-0'
                }`}>
                <div className={`flex ${isMobile768 ? 'flex-col items-start gap-4 p-5' : 'justify-between items-center px-[60px] pt-[55px] pb-[45px]'} border-b border-[#2D2D2D]`}>
                    <h1
                        className="
              font-host
              text-white
              font-extrabold
              uppercase
              leading-[0.88]
              tracking-[-0.03em]
              text-[clamp(32px,8vw,128px)]
              max-w-[760px]
              text-left
            "
                    >
                        {event.name}
                    </h1>

                    <div
                        className={`
              font-mono
              text-[13px]
              font-medium
              uppercase
              tracking-[0.11em]
              leading-[1.3]
              text-white
              ${isMobile768 ? 'text-left max-w-full text-white/80' : 'max-w-[450px] text-right'}
            `}
                    >
                        {event.tagline}
                    </div>
                </div>
            </div>

            {/* ── Registration section ── */}
            <div className={`relative z-10 w-[93.056%] mx-auto ${isMobile768 ? 'mb-12 py-6 px-0' : 'mb-[120px] py-[60px] px-[60px]'
                }`}>

                {/* Section label */}
                <p className={`reg-section-label ${isMobile768 ? '!text-[30px] mb-4' : ''}`}>REGISTRATION</p>

                {/* Form card container */}
                <div className={`relative max-w-[925px] mx-auto rounded-3xl transition-colors duration-300 ${isMobile768
                    ? '!p-5 bg-[#0e0e0e] border border-[#666666]'
                    : 'reg-glass-card'
                    }`}>

                    {successData ? (
                        <div style={{ textAlign: 'center', padding: isMobile768 ? '20px' : '40px 20px', fontFamily: 'Inter, sans-serif' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                                {successData.status === 'waitlisted' ? '⏳' : '🎟️'}
                            </div>
                            
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: 800,
                                color: '#fff',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                marginBottom: '8px'
                            }}>
                                {successData.status === 'waitlisted' ? 'Added to Waitlist' : 
                                 successData.status === 'already' ? 'Already Registered' : 'Registration Confirmed'}
                            </h2>

                            <p style={{ color: '#888', fontSize: '14px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                                {successData.status === 'waitlisted' 
                                    ? 'This event is currently at full capacity. We have added you to the waitlist and will notify you if a slot opens up.'
                                    : 'Your registration was processed successfully. A confirmation email with your entry QR code has been sent to your inbox.'}
                            </p>

                            {successData.registrationNo && (
                                <div style={{
                                    display: 'inline-block',
                                    background: '#0d0d0d',
                                    border: '1px solid #333',
                                    borderRadius: '12px',
                                    padding: '16px 32px',
                                    marginBottom: '24px'
                                }}>
                                    <p style={{ margin: '0 0 4px', fontSize: '10px', letterSpacing: '3px', color: '#555', textTransform: 'uppercase' }}>Registration Number</p>
                                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#fff', letterSpacing: '2px', fontFamily: 'monospace' }}>
                                        {successData.registrationNo}
                                    </p>
                                </div>
                            )}

                            <div>
                                <button 
                                    onClick={() => setSuccessData(null)}
                                    style={{
                                        padding: '12px 24px',
                                        background: 'transparent',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        color: '#aaa',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#555' }}
                                    onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = '#333' }}
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>

                            {/* ── Row 1: Name (full width) ── */}
                            <Field>
                                <label className={`reg-label ${isMobile768 ? '!text-[14px]' : ''}`} htmlFor="reg-name">NAME</label>
                                <input
                                    id="reg-name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="JOHN DOE"
                                    value={form.name}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('name')}
                                    onBlur={() => setFocused(null)}
                                    className={`reg-input ${focused === 'name' ? 'reg-input--active' : ''} ${isMobile768 ? '!text-[14px] placeholder:!text-[14px]' : ''}`}
                                />
                            </Field>

                            {/* ── Row 2: Email + Contact ── */}
                            <div className={isMobile768 ? 'flex flex-col gap-4 mb-[32px]' : 'reg-row-2'}>
                                <Field>
                                    <label className={`reg-label ${isMobile768 ? '!text-[14px]' : ''}`} htmlFor="reg-email">EMAIL</label>
                                    <input
                                        id="reg-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="your@email.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        onFocus={() => setFocused('email')}
                                        onBlur={() => setFocused(null)}
                                        className={`reg-input ${focused === 'email' ? 'reg-input--active' : ''} ${isMobile768 ? '!text-[14px] placeholder:!text-[14px]' : ''}`}
                                    />
                                </Field>

                                <Field>
                                    <label className={`reg-label ${isMobile768 ? '!text-[14px]' : ''}`} htmlFor="reg-contact">CONTACT NO.</label>
                                    <input
                                        id="reg-contact"
                                        name="contact"
                                        type="tel"
                                        autoComplete="tel"
                                        placeholder="+91 — 9876543210"
                                        value={form.contact}
                                        onChange={handleChange}
                                        onFocus={() => setFocused('contact')}
                                        onBlur={() => setFocused(null)}
                                        className={`reg-input ${focused === 'contact' ? 'reg-input--active' : ''} ${isMobile768 ? '!text-[14px] placeholder:!text-[14px]' : ''}`}
                                    />
                                </Field>
                            </div>

                            {/* ── Row 3: Class + Division ── */}
                            <div className={isMobile768 ? 'flex flex-col gap-4 mb-[32px]' : 'reg-row-2'}>
                                <Field>
                                    <label className={`reg-label ${isMobile768 ? '!text-[14px]' : ''}`} htmlFor="reg-class">CLASS</label>
                                    <RegSelect
                                        id="reg-class"
                                        name="class"
                                        value={form.class}
                                        onChange={handleChange}
                                        onFocus={() => setFocused('class')}
                                        onBlur={() => setFocused(null)}
                                        className={isMobile768 ? '!text-[14px]' : ''}
                                    >
                                        <option value="COMP">COMP</option>
                                        <option value="ENTC">ENTC</option>
                                        <option value="MECH">MECH</option>
                                        <option value="CIVIL">A&R</option>
                                    </RegSelect>
                                </Field>

                                <Field>
                                    <label className={`reg-label ${isMobile768 ? '!text-[14px]' : ''}`} htmlFor="reg-division">DIVISION</label>
                                    <RegSelect
                                        id="reg-division"
                                        name="division"
                                        value={form.division}
                                        onChange={handleChange}
                                        onFocus={() => setFocused('division')}
                                        onBlur={() => setFocused(null)}
                                        className={isMobile768 ? '!text-[14px]' : ''}
                                    >
                                        {['1', '2', '3', '4'].map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </RegSelect>
                                </Field>
                            </div>

                            {/* ── Dynamic questions ── */}
                            {questions.map((q) => (
                                <Field key={q.id}>
                                    <label className={`reg-label ${isMobile768 ? '!text-[14px]' : ''}`} htmlFor={`reg-${q.id}`}>
                                        {q.label}
                                    </label>

                                    {q.type === 'select' ? (
                                        <RegSelect
                                            id={`reg-${q.id}`}
                                            name={q.id}
                                            value={form[q.id]}
                                            onChange={handleChange}
                                            onFocus={() => setFocused(q.id)}
                                            onBlur={() => setFocused(null)}
                                            className={isMobile768 ? '!text-[14px]' : ''}
                                        >
                                            <option value="">{q.placeholder}</option>
                                            {q.options?.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </RegSelect>
                                    ) : (
                                        <textarea
                                            id={`reg-${q.id}`}
                                            name={q.id}
                                            rows={3}
                                            placeholder={q.placeholder}
                                            value={form[q.id]}
                                            onChange={handleChange}
                                            onFocus={() => setFocused(q.id)}
                                            onBlur={() => setFocused(null)}
                                            className={`reg-input reg-textarea ${focused === q.id ? 'reg-input--active' : ''} ${isMobile768 ? '!text-[14px] placeholder:!text-[14px]' : ''}`}
                                        />
                                    )}
                                </Field>
                            ))}

                            {/* ── Submit ── */}
                            <div className={`reg-submit-row ${isMobile768 ? '!mt-8 flex justify-start' : ''}`}>
                                <button type="submit" disabled={submitting} className={`reg-submit-btn ${isMobile768 ? '!w-full flex items-center justify-between px-4' : ''}`}>
                                    <span className="reg-submit-btn__text">{submitting ? 'PROCESSING...' : 'REGISTER NOW'}</span>
                                    <span className="reg-submit-btn__arrow">→</span>
                                </button>
                            </div>

                        </form>
                    )}
                </div>
            </div>

            <Contact />
            <Footer />
        </section>
    );
}