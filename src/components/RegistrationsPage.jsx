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
import { parseEdgeFunctionError } from '../lib/functions';
import toast from 'react-hot-toast';
import { eventsOngoing } from '../../constants/events';
import { useAuth } from '../hooks/useAuth';

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

    // Pull static metadata (name, tagline) from constants by slug
    const constantsEvent = eventsOngoing.find(e => e.slug === slug) ?? null;

    const [event, setEvent] = useState(null);
    const [loadingEvent, setLoadingEvent] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [readRulebook, setReadRulebook] = useState(false);

    const rulebookUrl = constantsEvent?.rulebook_url || event?.rulebook_url || 'https://drive.google.com/file/d/1s_Zbe7DRIBg6IFnCTTLWX_j7m_rfLs53/view?usp=sharing';

    /* Pick questions for this event */
    const questions =
        registrationQuestions[slug] ?? registrationQuestions['default'];

    /* Form state */
    const [form, setForm] = useState({
        name: '',
        email: '',
        contact: '',
        prn: '',
        college: "MES's Wadia College of Engineering",
        year: '',
        branch: '',
        division: '',
        newsletter: false,
        ...Object.fromEntries(questions.map((q) => [q.id, ''])),
    });

    const handleCheckbox = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.checked }));

    const [focused, setFocused] = useState(null);

    useEffect(() => {
        if (!slug) return;
        const fetchEvent = async () => {
            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('slug', slug)
                    .maybeSingle();

                if (!error && data) {
                    setEvent(data);
                } else if (constantsEvent) {
                    setEvent({
                        id: constantsEvent.id ?? 2,
                        slug: constantsEvent.slug,
                        name: constantsEvent.name,
                        title: constantsEvent.name,
                        tagline: constantsEvent.tagline,
                        rulebook_url: constantsEvent.rulebook_url
                    });
                }
            } catch (err) {
                console.error('Error fetching event:', err);
                if (constantsEvent) {
                    setEvent({
                        id: constantsEvent.id ?? 2,
                        slug: constantsEvent.slug,
                        name: constantsEvent.name,
                        title: constantsEvent.name,
                        tagline: constantsEvent.tagline,
                        rulebook_url: constantsEvent.rulebook_url
                    });
                }
            } finally {
                setLoadingEvent(false);
            }
        };
        fetchEvent();

        // Reset title on unmount
        return () => { document.title = 'Hyperspace XR SIG'; };
    }, [slug]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!event) return;
        if (!form.name || !form.email || !form.contact || !form.prn || !form.college || !form.year || !form.branch || !form.division) {
            toast.error('Please fill in all required fields.');
            return;
        }

        // Validate compulsory event questions (e.g. Blender specs requirement)
        for (const q of questions) {
            if (q.required && (!form[q.id] || form[q.id].trim() === '')) {
                toast.error(q.id === 'blender_specs' ? 'Please select whether your laptop meets the Blender specifications.' : 'Please answer all required questions.');
                return;
            }
        }

        // Rulebook validation
        if (!readRulebook) {
            toast.error('You must read and confirm the rulebook before registering.');
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
                    college: form.college,
                    branch: form.branch,
                    year: parseInt(form.year),
                    prn: form.prn,
                    division: form.division,
                    newsletter_opt_in: form.newsletter,
                    event_id: event.id,
                    custom_field_data: customData
                }
            });

            if (error) {
                const errMsg = await parseEdgeFunctionError(error);
                throw new Error(errMsg);
            }

            if (data.alreadyRegistered) {
                toast.success('You have already registered for this event!');
                setSuccessData({ registrationNo: data.registrationNo || 'ALREADY_REGISTERED', status: 'already' });
            } else if (data.waitlisted) {
                const isManual = data.waitlistReason === 'manual' || slug === 'texture-distortion';
                toast.success(isManual ? 'Added to waitlist for review!' : 'Event capacity full. You are added to the waitlist!');
                setSuccessData({ status: 'waitlisted', waitlistReason: isManual ? 'manual' : 'capacity' });
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
                        {constantsEvent?.name ?? event.name}
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
                        {constantsEvent?.tagline ?? event.tagline}
                    </div>
                </div>
            </div>

            {/* ── Registration section ── */}
            <div className={`relative z-10 w-[93.056%] mx-auto ${isMobile768 ? 'mb-12 py-6 px-0' : 'mb-[120px] py-[60px] px-[60px]'
                }`}>

                {/* ── Super Admin Direct Attendance Override Control Panel ── */}
                <SuperAdminAttendancePanel eventId={event?.id} eventSlug={slug} />

                {/* Section label */}
                <p className={`reg-section-label ${isMobile768 ? '!text-[30px] mb-4' : ''}`}>REGISTRATION</p>

                {/* Form card container */}
                <div className={`relative max-w-[925px] mx-auto rounded-3xl transition-colors duration-300 ${isMobile768
                    ? '!p-5 bg-[#0e0e0e] border border-[#666666]'
                    : 'reg-glass-card'
                    }`}>

                    {successData ? (
                        <div style={{ textAlign: 'center', padding: isMobile768 ? '20px' : '40px 20px', fontFamily: 'Inter, sans-serif' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                {successData.status === 'waitlisted' ? (
                                    <div className="w-16 h-16 rounded-full bg-[#E91E63]/10 border border-[#E91E63]/40 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-[#E91E63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: 800,
                                color: '#fff',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                marginBottom: '12px'
                            }}>
                                {successData.status === 'waitlisted' ? 'Added to Waitlist' : 
                                 successData.status === 'already' ? 'Already Registered' : 'Registration Confirmed'}
                            </h2>

                            <p style={{ color: '#aaa', fontSize: '14px', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                                {successData.status === 'waitlisted' 
                                    ? (successData.waitlistReason === 'manual' || slug === 'texture-distortion'
                                        ? 'You have been added to the waitlist. Our team will check seat and system availability for the event and will get back to you by email. Confirmation of your registration should take only a few hours. Thank you very much for your interest and patience.'
                                        : 'This event is currently at full capacity. We have added you to the waitlist and will notify you if a slot opens up.')
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
                                <label className={`reg-label ${isMobile768 ? '!text-[14px]' : ''}`} htmlFor="reg-name">FULL NAME *</label>
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
                                    <label className={`reg-label ${isMobile768 ? '!text-[14px]' : ''}`} htmlFor="reg-email">EMAIL ADDRESS *</label>
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
                                    <label className={`reg-label ${isMobile768 ? '!text-[14px]' : ''}`} htmlFor="reg-contact">CONTACT NO. *</label>
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

                            {/* ── Row 3: PRN ── */}
                            <Field>
                                <label className={`reg-label ${isMobile768 ? '!text-[14px]' : ''}`} htmlFor="reg-prn">PRN *</label>
                                <input
                                    id="reg-prn"
                                    name="prn"
                                    type="text"
                                    placeholder="F24000000"
                                    value={form.prn}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('prn')}
                                    onBlur={() => setFocused(null)}
                                    className={`reg-input ${focused === 'prn' ? 'reg-input--active' : ''} ${isMobile768 ? '!text-[14px] placeholder:!text-[14px]' : ''}`}
                                />
                            </Field>

                            {/* ── College Input Field ── */}
                            <Field>
                                <label className={`reg-label ${isMobile768 ? '!text-[14px]' : ''}`} htmlFor="reg-college">COLLEGE *</label>
                                <input
                                    id="reg-college"
                                    name="college"
                                    type="text"
                                    placeholder="MES's Wadia College of Engineering"
                                    value={form.college}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('college')}
                                    onBlur={() => setFocused(null)}
                                    className={`reg-input ${focused === 'college' ? 'reg-input--active' : ''} ${isMobile768 ? '!text-[14px] placeholder:!text-[14px]' : ''}`}
                                />
                            </Field>

                            {/* ── Row 4: Year + Branch ── */}
                            <div className={isMobile768 ? 'flex flex-col gap-4 mb-[32px]' : 'reg-row-2'}>
                                <Field>
                                    <label className={`reg-label ${isMobile768 ? '!text-[14px]' : ''}`} htmlFor="reg-year">CURRENT YEAR OF STUDY *</label>
                                    <RegSelect
                                        id="reg-year"
                                        name="year"
                                        value={form.year}
                                        onChange={handleChange}
                                        onFocus={() => setFocused('year')}
                                        onBlur={() => setFocused(null)}
                                        className={isMobile768 ? '!text-[14px]' : ''}
                                    >
                                        <option value="">— SELECT YEAR —</option>
                                        <option value="1">FIRST YEAR</option>
                                        <option value="2">SECOND YEAR</option>
                                        <option value="3">THIRD YEAR</option>
                                        <option value="4">FOURTH YEAR (FINAL YEAR)</option>
                                    </RegSelect>
                                </Field>

                                <Field>
                                    <label className={`reg-label ${isMobile768 ? '!text-[14px]' : ''}`} htmlFor="reg-branch">BRANCH *</label>
                                    <RegSelect
                                        id="reg-branch"
                                        name="branch"
                                        value={form.branch}
                                        onChange={handleChange}
                                        onFocus={() => setFocused('branch')}
                                        onBlur={() => setFocused(null)}
                                        className={isMobile768 ? '!text-[14px]' : ''}
                                    >
                                        <option value="">— SELECT BRANCH —</option>
                                        <option value="Computer Engineering">COMPUTER ENGINEERING</option>
                                        <option value="Mechanical Engineering">MECHANICAL ENGINEERING</option>
                                        <option value="Electronics & Telecommunications">ELECTRONICS &amp; TELECOMMUNICATIONS</option>
                                        <option value="Automation & Robotics">AUTOMATION &amp; ROBOTICS</option>
                                    </RegSelect>
                                </Field>
                            </div>

                            {/* ── Row 5: Division ── */}
                            <Field>
                                <label className={`reg-label ${isMobile768 ? '!text-[14px]' : ''}`} htmlFor="reg-division">DIVISION *</label>
                                <RegSelect
                                    id="reg-division"
                                    name="division"
                                    value={form.division}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('division')}
                                    onBlur={() => setFocused(null)}
                                    className={isMobile768 ? '!text-[14px]' : ''}
                                >
                                    <option value="">— SELECT DIVISION —</option>
                                    {['1', '2', '3', '4'].map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </RegSelect>
                            </Field>

                            {/* ── Dynamic questions ── */}
                            {questions.map((q) => (
                                <Field key={q.id}>
                                    <label className={`reg-label ${isMobile768 ? '!text-[14px]' : ''}`} htmlFor={`reg-${q.id}`}>
                                        {q.id === 'blender_specs' ? (
                                            <>
                                                DOES YOUR LAPTOP MEET THE <a href={rulebookUrl} className="underline text-[#E91E63] font-bold hover:text-[#FF4081] transition-colors" target="_blank" rel="noopener noreferrer">MINIMUM SPECIFICATIONS</a> TO RUN BLENDER? *
                                            </>
                                        ) : (
                                            q.label
                                        )}
                                    </label>

                                    {q.type === 'select' ? (
                                        <>
                                            <RegSelect
                                                id={`reg-${q.id}`}
                                                name={q.id}
                                                value={form[q.id]}
                                                onChange={handleChange}
                                                onFocus={() => setFocused(q.id)}
                                                onBlur={() => setFocused(null)}
                                                required={q.required}
                                                className={isMobile768 ? '!text-[14px]' : ''}
                                            >
                                                <option value="">{q.placeholder}</option>
                                                {q.options?.map((opt) => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </RegSelect>
                                            {q.id === 'blender_specs' && (
                                                <p style={{ marginTop: '8px', fontSize: '11px', color: '#888', fontStyle: 'italic', fontFamily: 'monospace', letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: '1.4' }}>
                                                    * EVEN IF YOUR LAPTOP DOES NOT MEET THE REQUIREMENTS, FEEL FREE TO CONTACT THE HYPERSPACE TEAM. WE CAN MAKE ARRANGEMENTS FOR YOU.
                                                </p>
                                            )}
                                        </>
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
                                            required={q.required}
                                            className={`reg-input reg-textarea ${focused === q.id ? 'reg-input--active' : ''} ${isMobile768 ? '!text-[14px] placeholder:!text-[14px]' : ''}`}
                                        />
                                    )}
                                </Field>
                            ))}

                            {/* ── Newsletter opt-in ── */}
                            <div className={`flex items-start gap-3 ${isMobile768 ? 'mb-6 mt-2' : 'mb-8 mt-4'}`}>
                                <div
                                    id="reg-newsletter-box"
                                    onClick={() => setForm(prev => ({ ...prev, newsletter: !prev.newsletter }))}
                                    role="checkbox"
                                    aria-checked={form.newsletter}
                                    tabIndex={0}
                                    onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && setForm(prev => ({ ...prev, newsletter: !prev.newsletter }))}
                                    className="reg-checkbox-box"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        minWidth: '20px',
                                        border: `1.5px solid ${form.newsletter ? '#E91E63' : '#555'}`,
                                        borderRadius: '4px',
                                        background: form.newsletter ? '#E91E63' : 'transparent',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                        marginTop: '2px',
                                        flexShrink: 0,
                                    }}
                                >
                                    {form.newsletter && (
                                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                            <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <label
                                    htmlFor="reg-newsletter-box"
                                    onClick={() => setForm(prev => ({ ...prev, newsletter: !prev.newsletter }))}
                                    className={`font-mono uppercase tracking-[0.05em] text-[#ABABAB] cursor-pointer select-none ${isMobile768 ? 'text-[11px]' : 'text-[12px]'}`}
                                    style={{ lineHeight: 1.5 }}
                                >
                                    SUBSCRIBE TO THE HYPERSPACE XR NEWSLETTER - BE THE FIRST TO KNOW ABOUT UPCOMING EVENTS, WORKSHOPS, AND OPPORTUNITIES.
                                </label>
                            </div>

                            {/* ── Rulebook confirmation checkbox ── */}
                            <div
                                className={`flex items-start gap-3 border rounded-lg cursor-pointer select-none transition-all duration-200 ${isMobile768 ? 'mb-6 mt-4 p-3' : 'mb-8 mt-6 p-4'} ${readRulebook ? 'border-[#E91E63] bg-[#E91E63]/10' : 'border-[#E91E63]/50 bg-[#E91E63]/5'}`}
                                onClick={() => setReadRulebook(!readRulebook)}
                            >
                                <div
                                    id="reg-rulebook-box"
                                    role="checkbox"
                                    aria-checked={readRulebook}
                                    tabIndex={0}
                                    onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && setReadRulebook(!readRulebook)}
                                    className="reg-checkbox-box"
                                    style={{
                                        width: '22px',
                                        height: '22px',
                                        minWidth: '22px',
                                        border: `2px solid ${readRulebook ? '#E91E63' : '#E91E63'}`,
                                        borderRadius: '4px',
                                        background: readRulebook ? '#E91E63' : 'transparent',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                        marginTop: '2px',
                                        flexShrink: 0,
                                    }}
                                >
                                    {readRulebook && (
                                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                            <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <label
                                    htmlFor="reg-rulebook-box"
                                    className={`font-mono uppercase tracking-[0.05em] text-white cursor-pointer select-none ${isMobile768 ? 'text-[12px]' : 'text-[13px]'}`}
                                    style={{ lineHeight: 1.5, fontWeight: 600 }}
                                >
                                    I CONFIRM THAT I HAVE READ AND UNDERSTOOD THE <a href={rulebookUrl} className="underline text-[#E91E63] font-bold hover:text-[#FF4081] transition-colors" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>RULEBOOK</a> FOR THIS EVENT. *
                                </label>
                            </div>

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