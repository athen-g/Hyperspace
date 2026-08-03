-- Migration to seed the Kahoot Quiz with 5 questions for quick demo
insert into public.quizzes (id, title, description, code_slug)
values ('11111111-1111-1111-1111-111111111111', 'Hyperspace XR SIG Demo Quiz', '5-question quick demo bank covering XR concepts.', 'demo')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  code_slug = excluded.code_slug;

-- Clear previous questions for this default quiz
delete from public.quiz_questions where quiz_id = '11111111-1111-1111-1111-111111111111';

-- Insert the 5 questions
insert into public.quiz_questions (quiz_id, question_text, options, correct_option, time_limit, sort_order)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'What does the acronym "XR" stand for?',
    array['Extended Rendering', 'Extended Reality', 'X-axis Reality', 'External Reality'],
    1,
    20,
    1
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Which technology overlays digital graphics onto the real world without physical interaction?',
    array['Virtual Reality', 'Augmented Reality', 'Mixed Reality', 'Holographic Simulation'],
    1,
    20,
    2
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'What defines full immersion in a computer-generated environment that replaces real-world surroundings?',
    array['Augmented Reality', 'Extended Rendering', 'Virtual Reality', 'Mixed Reality'],
    2,
    20,
    3
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'What distinguishes Mixed Reality (MR) from standard AR?',
    array['MR only works on desktops', 'MR anchors virtual objects allowing real-time interaction', 'MR does not require any headset', 'MR is identical to VR in every respect'],
    1,
    20,
    4
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'What does "FOV" stand for in VR/AR displays?',
    array['Frame Output Voltage', 'Field of View', 'Frequency of Vibration', 'Focal Object Velocity'],
    1,
    20,
    5
  );
