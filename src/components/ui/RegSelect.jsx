import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * RegSelect — animated custom dropdown for the registration form.
 *
 * Props:
 *   id         — html id for the hidden input (for label association)
 *   name       — form field name
 *   value      — controlled value
 *   onChange   — called with a synthetic-like event: { target: { name, value } }
 *   onFocus    — called when dropdown opens
 *   onBlur     — called when dropdown closes
 *   children   — <option> elements (value + text content)
 *   className  — extra classes on the trigger button
 */
export default function RegSelect({
    id,
    name,
    value,
    onChange,
    onFocus,
    onBlur,
    children,
    className = '',
}) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const listboxId = useId();

    /* ── Parse <option> children into { value, label } ── */
    const options = React.Children.toArray(children)
        .filter((c) => c.type === 'option')
        .map((c) => ({ value: c.props.value, label: c.props.children }));

    const selectedLabel =
        options.find((o) => o.value === value)?.label ?? options[0]?.label ?? '';

    /* ── Close on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                onBlur?.();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onBlur]);

    /* ── Keyboard nav ── */
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') { setOpen(false); onBlur?.(); }
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const idx = options.findIndex((o) => o.value === value);
            const next = options[(idx + 1) % options.length];
            onChange?.({ target: { name, value: next.value } });
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const idx = options.findIndex((o) => o.value === value);
            const prev = options[(idx - 1 + options.length) % options.length];
            onChange?.({ target: { name, value: prev.value } });
        }
    };

    const select = (opt) => {
        onChange?.({ target: { name, value: opt.value } });
        setOpen(false);
        onBlur?.();
    };

    /* ── Animation variants ── */
    const panelVariants = {
        hidden: { opacity: 0, y: -6, scaleY: 0.92, transformOrigin: 'top' },
        visible: {
            opacity: 1, y: 0, scaleY: 1,
            transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
        },
        exit: {
            opacity: 0, y: -4, scaleY: 0.94,
            transition: { duration: 0.16, ease: 'easeIn' },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -6 },
        visible: (i) => ({
            opacity: 1, x: 0,
            transition: { delay: i * 0.04, duration: 0.18, ease: 'easeOut' },
        }),
    };

    return (
        <div ref={containerRef} className="reg-select-wrapper" style={{ position: 'relative' }}>

            {/* Hidden native input keeps the value accessible for form submission */}
            <input type="hidden" id={id} name={name} value={value} />

            {/* ── Trigger button ── */}
            <button
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listboxId}
                onKeyDown={handleKeyDown}
                onClick={() => {
                    const next = !open;
                    setOpen(next);
                    next ? onFocus?.() : onBlur?.();
                }}
                className={`reg-input reg-select-trigger ${open ? 'reg-select-trigger--open' : ''} ${className}`}
            >
                <span className="reg-select-trigger__label">{selectedLabel}</span>
                <motion.span
                    className="reg-select-trigger__chevron"
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    aria-hidden
                >
                    ▾
                </motion.span>
            </button>

            {/* ── Animated dropdown panel ── */}
            <AnimatePresence>
                {open && (
                    <motion.ul
                        id={listboxId}
                        role="listbox"
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="reg-select-panel"
                    >
                        {options.map((opt, i) => (
                            <motion.li
                                key={opt.value}
                                role="option"
                                aria-selected={opt.value === value}
                                custom={i}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                onClick={() => select(opt)}
                                className={`reg-select-option ${opt.value === value ? 'reg-select-option--selected' : ''}`}
                            >
                                {opt.value === value && (
                                    <span className="reg-select-option__check" aria-hidden>✓</span>
                                )}
                                {opt.label}
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
