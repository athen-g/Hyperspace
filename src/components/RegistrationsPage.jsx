import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import BackgroundLines from './ui/BackgroundLines';
import Contact from './Contact';
import Footer from './Footer';
import { eventsOngoing } from '../../constants/events';
import { registrationQuestions } from '../../constants/registration';
import RegSelect from './ui/RegSelect';
import { useMediaQuery } from 'react-responsive';

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

    /* Resolve the event */
    const event = eventsOngoing.find((e) => e.slug === slug) ?? eventsOngoing[0];

    /* Pick questions for this event */
    const questions =
        registrationQuestions[slug] ?? registrationQuestions['default'];

    /* Form state */
    const [form, setForm] = useState({
        name: '',
        email: '',
        contact: '',
        class: '',
        division: '',
        ...Object.fromEntries(questions.map((q) => [q.id, ''])),
    });

    const [focused, setFocused] = useState(null);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Registration submitted:', form);
        // TODO: wire up to backend / Google Forms / etc.
    };

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
                            <button type="submit" className={`reg-submit-btn ${isMobile768 ? '!w-full flex items-center justify-between px-4' : ''}`}>
                                <span className="reg-submit-btn__text">SEND REQUEST</span>
                                <span className="reg-submit-btn__arrow">→</span>
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            <Contact />
            <Footer />
        </section>
    );
}