/**
 * WORKFLOW DEFINITIONS
 * --------------------
 * The whole project is driven by this one file. Each request type lists the
 * roles that must approve it, in order. To add a new activity or change who
 * approves what, only this file changes - no other code.
 */
module.exports = {
  'Course Registration':     { steps: ['faculty', 'hod'] },
  'Leave Application':       { steps: ['faculty', 'hod'] },
  'Bonafide Certificate':    { steps: ['hod'] },
  'Internship Permission':   { levels: ['UG'], steps: ['faculty', 'hod'] },
  'Thesis Submission':       { levels: ['PG'], steps: ['faculty', 'hod'] },
  'Research Lab Access':     { levels: ['PG'], steps: ['faculty'] }
};
