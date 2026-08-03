-- Migration to seed the Kahoot Quiz with the 23 questions provided by the user
-- First, let's ensure we have a default quiz template we can insert these questions into.

insert into public.quizzes (id, title, description)
values ('00000000-0000-0000-0000-000000000000', 'Hyperspace XR SIG Quiz', 'Official question bank covering XR, workshops, guest lectures, and SIG events.')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description;

-- Clear previous questions for this default quiz to prevent duplicates
delete from public.quiz_questions where quiz_id = '00000000-0000-0000-0000-000000000000';

-- Insert the 23 questions
insert into public.quiz_questions (quiz_id, question_text, options, correct_option, time_limit, sort_order)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'What does the acronym "XR" stand for?',
    array['Extended Rendering', 'Extended Reality', 'X-axis Reality', 'External Reality'],
    1, -- B
    20,
    1
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Which of the following best describes Augmented Reality (AR)?',
    array['A completely simulated environment that replaces the real world', 'A technology used exclusively for training pilots', 'A blend where virtual objects can be physically manipulated like real ones', 'Digital content overlaid onto the real world, viewed simultaneously with real surroundings'],
    3, -- D
    20,
    2
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Virtual Reality (VR) is best characterized by which of the following?',
    array['Partial overlay of digital graphics on a live camera feed', 'Full immersion in a computer-generated environment that replaces real-world surroundings', 'Use of a smartphone camera to detect QR codes', 'Real-time subtitles displayed on smart glasses'],
    1, -- B
    20,
    3
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'What distinguishes Mixed Reality (MR) from standard AR?',
    array['MR only works on desktop computers', 'MR anchors virtual objects to the real world and allows real-time interaction between them', 'MR does not require any headset or display device', 'MR is identical to VR in every respect'],
    1, -- B
    20,
    4
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'In the SIH 2025 project by Team VirtuVerse, eye-tracking technology was primarily used to:',
    array['Detect drowsiness in factory workers', 'Authenticate users through iris scanning', 'Track eye strain in gamers', 'Capture customer reactions for EV product design'],
    3, -- D
    20,
    5
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'What does "FOV" refer to in the context of VR/AR headsets?',
    array['Frame Output Voltage', 'Field of View — the extent of the observable environment visible at any moment', 'Frequency of Vibration used in haptics', 'Focal Object Velocity'],
    1, -- B
    20,
    6
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Which game engine was used by students during the SIG''s hands-on workshop to build the archery game?',
    array['Unreal Engine', 'Unity', 'CryEngine', 'Godot'],
    1, -- B
    20,
    7
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Which of these was NOT explicitly mentioned as an application area for AR/VR/XR during the SIG''s introductory session?',
    array['Healthcare', 'Architecture', 'Culinary Arts', 'Manufacturing'],
    2, -- C
    20,
    8
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Who was invited as the guest speaker for the SIG''s expert lecture on Extended Reality?',
    array['Mr. Akshay Rathod, CEO of Firebird VR', 'Mr. Vinay Agastya, Member of Ctruh XR Commerce Studio', 'Mr. Ashwin Jaishanker, Co-founder of AutoVRse', 'Mark Zuckerberg, CEO of Meta'],
    0, -- A
    20,
    9
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'What is the name of the metaversity initiative led by the guest speaker that offers specialized training and internships?',
    array['MetaAcademy.io', 'GuruVR.ai', 'XRVerse.com', 'VirtuLearn.net'],
    1, -- B
    20,
    10
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'During the guest lecture, which educational framework was discussed in relation to structuring VR learning experiences?',
    array['Maslow''s Hierarchy of Needs', 'Bloom''s Taxonomy', 'SWOT Analysis', 'Kirkpatrick''s Model'],
    1, -- B
    20,
    11
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Which Meta platform/app combination was demonstrated during the guest lecture to show how VR devices connect and operate?',
    array['Meta Quest Link and Horizon apps', 'Meta Business Suite and WhatsApp', 'Meta Ads Manager and Instagram', 'Meta Portal and Messenger'],
    0, -- A
    20,
    12
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'What was the complete development scope covered during the workshop, from start to finish?',
    array['Only scripting and debugging', 'Asset importation through to full coding and execution of the game', 'Only 3D modeling of characters', 'Marketing and publishing the game on app stores'],
    1, -- B
    20,
    13
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Which of the following best describes "haptic feedback" in immersive technology?',
    array['Visual cues that indicate battery life', 'Technology that simulates the sense of touch through vibrations or forces', 'A method of voice recognition in VR', 'Audio feedback used to indicate loading times'],
    1, -- B
    20,
    14
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'What term describes the psychological sense of "being physically present" in a virtual environment?',
    array['Immersion', 'Latency', 'Rendering', 'Occlusion'],
    0, -- A
    20,
    15
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'What was the core outcome of the SIG''s very first introductory session, "Initiate Calibration"?',
    array['Distributing prizes to top VR developers', 'Building foundational awareness of AR, VR, MR, and XR concepts and their applications', 'Launching the SIG''s official mobile app', 'Conducting final placements for XR-related jobs'],
    1, -- B
    20,
    16
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'What is "cybersickness" in VR most commonly caused by?',
    array['Overheating of the headset', 'Poor internet connectivity', 'A mismatch between visual motion and the body''s physical sense of motion', 'Excessive brightness settings'],
    2, -- C
    20,
    17
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '"Passthrough" on standalone headsets like Meta Quest allows users to:',
    array['Stream games directly to a PC', 'See a live video feed of their real surroundings while still wearing the headset', 'Transfer files between headset and phone', 'Charge the headset wirelessly'],
    1, -- B
    20,
    18
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'ARKit and ARCore are examples of:',
    array['VR headset hardware manufacturers', 'Software development kits (SDKs) for building AR experiences on iOS and Android respectively', '3D modeling file formats', 'Game engines for console development'],
    1, -- B
    20,
    19
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'The Smart India Hackathon (SIH), the platform on which Team VirtuVerse presented their project, is primarily organized to:',
    array['Provide students a platform to solve real-world problems posed by government ministries and industry', 'Fund startups directly with venture capital', 'Recruit students exclusively for government jobs', 'Certify students in cloud computing'],
    0, -- A
    20,
    20
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Spatial audio in VR/AR is designed to:',
    array['Reduce the file size of audio assets', 'Make sound appear to come from specific directions and distances in 3D space, matching the environment', 'Automatically translate speech into other languages', 'Cancel out background noise from the microphone'],
    1, -- B
    20,
    21
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'What is the full form of SIG?',
    array['Special Interaction Group', 'Scene Immersive Glitch', 'Special Interest Group', 'Student Intellectual Group'],
    2, -- C
    20,
    22
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Will you guys registered for Texture Distortion, our next event?',
    array['Yes', 'YES', 'OH YEAH', 'HELL YEAHHHHHH'],
    3, -- D (HELL YEAHHHHHH)
    20,
    23
  );
