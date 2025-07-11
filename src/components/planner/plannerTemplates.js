export const plannerTemplates = {
  'study-focus': {
    name: 'Study Focus',
    events: [
      { activity: 'Deep Work Session 1', category: 'study', start_time: '09:00', end_time: '11:00', reminder_enabled: true, color: 'border-l-indigo-500' },
      { activity: 'Break & Snack', category: 'break', start_time: '11:00', end_time: '11:30', reminder_enabled: false, color: 'border-l-green-500' },
      { activity: 'Review & Notes', category: 'study', start_time: '11:30', end_time: '12:30', reminder_enabled: false, color: 'border-l-blue-500' },
      { activity: 'Lunch', category: 'personal', start_time: '12:30', end_time: '13:30', reminder_enabled: false, color: 'border-l-sky-500' },
      { activity: 'Skill Development', category: 'skill-dev', start_time: '13:30', end_time: '15:00', reminder_enabled: true, color: 'border-l-violet-500' },
    ]
  },
  'balanced-day': {
    name: 'Balanced Day',
    events: [
      { activity: 'Morning Exercise', category: 'body-care', start_time: '08:00', end_time: '09:00', reminder_enabled: false, color: 'border-l-orange-500' },
      { activity: 'Work Block 1', category: 'study', start_time: '09:30', end_time: '12:00', reminder_enabled: true, color: 'border-l-indigo-500' },
      { activity: 'Lunch & Walk', category: 'personal', start_time: '12:00', end_time: '13:00', reminder_enabled: false, color: 'border-l-lime-500' },
      { activity: 'Work Block 2', category: 'study', start_time: '13:00', end_time: '15:30', reminder_enabled: true, color: 'border-l-indigo-500' },
      { activity: 'Personal Project', category: 'skill-dev', start_time: '16:00', end_time: '17:00', reminder_enabled: false, color: 'border-l-violet-500' },
      { activity: 'Dinner', category: 'personal', start_time: '18:00', end_time: '19:00', reminder_enabled: false, color: 'border-l-sky-500' },
      { activity: 'Relax & Unwind', category: 'break', start_time: '20:00', end_time: '22:00', reminder_enabled: false, color: 'border-l-green-500' },
    ]
  },
  'content-creator': {
    name: 'Content Creator',
    events: [
      { activity: 'Brainstorm Ideas', category: 'content', start_time: '10:00', end_time: '11:00', reminder_enabled: false, color: 'border-l-yellow-500' },
      { activity: 'Scripting / Writing', category: 'content', start_time: '11:00', end_time: '13:00', reminder_enabled: true, color: 'border-l-pink-500' },
      { activity: 'Lunch', category: 'personal', start_time: '13:00', end_time: '14:00', reminder_enabled: false, color: 'border-l-sky-500' },
      { activity: 'Recording / Filming', category: 'content', start_time: '14:00', end_time: '16:00', reminder_enabled: true, color: 'border-l-red-500' },
      { activity: 'Editing Session', category: 'content', start_time: '16:00', end_time: '18:00', reminder_enabled: false, color: 'border-l-purple-500' },
      { activity: 'Engage with Community', category: 'personal', start_time: '18:00', end_time: '18:30', reminder_enabled: false, color: 'border-l-rose-500' },
    ]
  },
  'fitness-foundation': {
    name: 'Fitness Foundation',
    events: [
      { activity: 'Morning Cardio', category: 'body-care', start_time: '07:00', end_time: '07:45', reminder_enabled: false, color: 'border-l-orange-500' },
      { activity: 'Healthy Breakfast', category: 'personal', start_time: '08:00', end_time: '08:30', reminder_enabled: false, color: 'border-l-lime-500' },
      { activity: 'Meal Prep', category: 'shop', start_time: '11:00', end_time: '12:00', reminder_enabled: false, color: 'border-l-blue-500' },
      { activity: 'Lunch', category: 'personal', start_time: '12:30', end_time: '13:15', reminder_enabled: false, color: 'border-l-lime-500' },
      { activity: 'Afternoon Walk', category: 'break', start_time: '15:00', end_time: '15:30', reminder_enabled: false, color: 'border-l-green-500' },
      { activity: 'Strength Training', category: 'body-care', start_time: '17:30', end_time: '18:45', reminder_enabled: true, color: 'border-l-red-500' },
      { activity: 'Stretching & Foam Roll', category: 'body-care', start_time: '18:45', end_time: '19:15', reminder_enabled: false, color: 'border-l-teal-500' },
    ]
  }
};