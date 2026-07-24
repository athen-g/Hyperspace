import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import BackgroundLines from './ui/BackgroundLines';
import Contact from './Contact';
import Footer from './Footer';
import { eventsOngoing } from '../../constants/events';
import { registrationQuestions } from '../../constants/registration';
import RegSelect from './ui/RegSelect';
import { supabase } from '../lib/supabase';

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
        class: 'COMP', // set default option
        division: '1',  // set default option
        ...Object.fromEntries(questions.map((q) => [q.id, ''])),
    });

    const [focused, setFocused] = useState(null);
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status === 'loading') return;

        // Basic validation
        if (!form.name || !form.email || !form.contact) {
            setErrorMsg('Please fill in all core fields.');
            setStatus('error');
            return;
        }

        setStatus('loading');
        setErrorMsg('');

        try {
            // Separate static fields from dynamic question answers
            const { name, email, contact, class: cls, division } = form;
            const extraAnswers = {};
            questions.forEach((q) => {
                extraAnswers[q.id] = form[q.id] || '';
            });

            const { error } = await supabase.from('registrations').insert({
                event_slug: slug || event.slug,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                contact: contact.trim(),
                class: cls,
                division: division,
                extra_answers: extraAnswers,
            });

            if (error) {
                if (error.code === '23505') {
                    throw new Error('You have already registered for this event!');
                }
                throw error;
            }

            setStatus('success');
            // Reset dynamic fields & details, keeping structure
            setForm({
                name: '',
                email: '',
                contact: '',
                class: 'COMP',
                division: '1',
                ...Object.fromEntries(questions.map((q) => [q.id, ''])),
            });
        } catch (err) {
            console.error('Registration error:', err);
            setErrorMsg(err.message || 'Failed to submit registration. Please try again.');
            setStatus('error');
        }
    };

    if (!event)
        return (
            <h1 className="text-white text-center py-20 font-host text-3xl">
                404 — Event Not Found
            </h1>
        );

    return (
        <section id="registration">
            <Header />
            <BackgroundLines />

            {/* ── Hero header (mirrors EventsOngoingTemplate) ── */}
            <div className="relative z-10 w-[93.056%] mx-auto mt-[90px] mb-0 border border-r-0 border-[#666666] bg-[#0e0e0e]">
                <div className="flex justify-between items-center px-[60px] pt-[55px] pb-[45px] border-b border-[#2D2D2D]">
                    <h1
                        className="
              max-w-[760px]
              font-host
              text-white
              text-[clamp(44px,6vw,128px)]
              font-extrabold
              uppercase
              leading-[0.88]
              tracking-[-0.03em]
            "
                    >
                        {event.name}
                    </h1>

                    <div
                        className="
              max-w-[450px]
              text-right
              font-mono
              text-[13px]
              font-medium
              uppercase
              tracking-[0.11em]
              leading-[1.1]
              text-white
            "
                    >
                        {event.tagline}
                    </div>
                </div>
            </div>

            {/* ── Registration section ── */}
            <div className="relative z-10 w-[93.056%] mx-auto mb-[120px] py-[60px] px-[60px]">

                {/* Section label */}
                <p className="reg-section-label">REGISTRATION</p>

                {/* Liquid-glass form card */}
                <div className="reg-glass-card">

                    <form onSubmit={handleSubmit} noValidate>

                        {/* ── Row 1: Name (full width) ── */}
                        <Field>
                            <label className="reg-label" htmlFor="reg-name">NAME</label>
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
                                className={`reg-input ${focused === 'name' ? 'reg-input--active' : ''}`}
                            />
                        </Field>

                        {/* ── Row 2: Email + Contact ── */}
                        <div className="reg-row-2">
                            <Field>
                                <label className="reg-label" htmlFor="reg-email">EMAIL</label>
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
                                    className={`reg-input ${focused === 'email' ? 'reg-input--active' : ''}`}
                                />
                            </Field>

                            <Field>
                                <label className="reg-label" htmlFor="reg-contact">CONTACT NO.</label>
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
                                    className={`reg-input ${focused === 'contact' ? 'reg-input--active' : ''}`}
                                />
                            </Field>
                        </div>

                        {/* ── Row 3: Class + Division ── */}
                        <div className="reg-row-2">
                            <Field>
                                <label className="reg-label" htmlFor="reg-class">CLASS</label>
                                <RegSelect
                                    id="reg-class"
                                    name="class"
                                    value={form.class}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('class')}
                                    onBlur={() => setFocused(null)}
                                >
                                    <option value="COMP">COMP</option>
                                    <option value="ENTC">ENTC</option>
                                    <option value="MECH">MECH</option>
                                    <option value="CIVIL">A&R</option>
                                </RegSelect>
                            </Field>

                            <Field>
                                <label className="reg-label" htmlFor="reg-division">DIVISION</label>
                                <RegSelect
                                    id="reg-division"
                                    name="division"
                                    value={form.division}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('division')}
                                    onBlur={() => setFocused(null)}
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
                                <label className="reg-label" htmlFor={`reg-${q.id}`}>
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
                                        className={`reg-input reg-textarea ${focused === q.id ? 'reg-input--active' : ''}`}
                                    />
                                )}
                            </Field>
                        ))}

                        {/* Status feedback */}
                        {status === 'success' && (
                            <p style={{ color: 'var(--color-accent-cyan)', marginBottom: '1.5rem', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '0.85rem', letterSpacing: '0.05em', textAlign: 'center' }}>
                                ✓ Registered successfully! We've received your request.
                            </p>
                        )}
                        {status === 'error' && (
                            <p style={{ color: 'var(--color-accent-pink)', marginBottom: '1.5rem', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '0.85rem', letterSpacing: '0.05em', textAlign: 'center' }}>
                                ✗ {errorMsg}
                            </p>
                        )}

                        {/* ── Submit ── */}
                        <div className="reg-submit-row">
                            <button type="submit" className="reg-submit-btn" disabled={status === 'loading'}>
                                <span className="reg-submit-btn__text">
                                    {status === 'loading' ? 'REGISTERING...' : 'SEND REQUEST'}
                                </span>
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