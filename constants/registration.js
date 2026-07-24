const registrationQuestions = {
    'commence-synchronization': [
        {
            id: 'attended_before',
            label: 'HAVE YOU ATTENDED ANY HYPERSPACE XR EVENTS BEFORE?',
            type: 'select',
            options: ['YES', 'NO'],
            placeholder: '—',
        },
        {
            id: 'xr_experience',
            label: 'DO YOU HAVE ANY PRIOR EXPERIENCE WITH XR / AR / VR?',
            type: 'select',
            options: ['YES — QUITE A BIT', 'YES — A LITTLE', 'NO — COMPLETE BEGINNER'],
            placeholder: '—',
        },
        {
            id: 'expectations',
            label: 'WHAT DO YOU EXPECT TO LEARN OR GAIN FROM THIS EVENT?',
            type: 'textarea',
            placeholder: 'Your expectations…',
        },
    ],
    // Fallback used when no slug matches
    default: [
        {
            id: 'attended_before',
            label: 'HAVE YOU ATTENDED ANY HYPERSPACE XR EVENTS BEFORE?',
            type: 'select',
            options: ['YES', 'NO'],
            placeholder: '—',
        },
        {
            id: 'how_heard',
            label: 'HOW DID YOU COME TO KNOW ABOUT THIS EVENT?',
            type: 'select',
            options: ['INSTAGRAM', 'FRIENDS / WORD OF MOUTH', 'COLLEGE NOTICE', 'OTHER'],
            placeholder: '—',
        },
        {
            id: 'comments',
            label: 'ANY ADDITIONAL COMMENTS OR QUESTIONS?',
            type: 'textarea',
            placeholder: "Anything else you'd like to share…",
        },
    ],
};

export { registrationQuestions };