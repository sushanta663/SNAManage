const router = require('express').Router();
const Request = require('../models/Request');
const workflows = require('../workflows');
const auth = require('../middleware/auth');

// request types a student can raise (filtered by UG/PG)
router.get('/types', auth('student'), (req, res) => {
  const list = Object.keys(workflows)
    .filter((t) => !workflows[t].levels || workflows[t].levels.includes(req.user.level))
    .map((t) => ({ type: t, steps: workflows[t].steps }));
  res.json(list);
});

// STEP 1 of the workflow: student submits
router.post('/', auth('student'), async (req, res) => {
  const { type, title, description } = req.body;
  const wf = workflows[type];
  if (!wf || !title) return res.status(400).json({ error: 'Type and title are required' });
  if (wf.levels && !wf.levels.includes(req.user.level)) {
    return res.status(400).json({ error: type + ' is not available for ' + req.user.level + ' students' });
  }
  const request = await Request.create({
    student: req.user.id, studentName: req.user.name, rollNo: req.user.rollNo, level: req.user.level,
    type, title, description, steps: wf.steps,
    history: [{ by: req.user.name, role: 'student', action: 'submitted' }]
  });
  res.status(201).json(request);
});

router.get('/mine', auth('student'), async (req, res) => {
  res.json(await Request.find({ student: req.user.id }).sort({ createdAt: -1 }));
});

// requests waiting for THIS person: still pending and the current step is their role
router.get('/pending', auth('faculty', 'hod'), async (req, res) => {
  const all = await Request.find({ status: 'pending' }).sort({ createdAt: 1 });
  res.json(all.filter((r) => r.steps[r.currentStep] === req.user.role));
});

router.get('/all', auth('hod'), async (req, res) => {
  res.json(await Request.find().sort({ createdAt: -1 }));
});

router.get('/stats', auth(), async (req, res) => {
  const all = req.user.role === 'student'
    ? await Request.find({ student: req.user.id })
    : await Request.find();
  res.json({
    total: all.length,
    pending: all.filter((r) => r.status === 'pending').length,
    approved: all.filter((r) => r.status === 'approved').length,
    rejected: all.filter((r) => r.status === 'rejected').length,
    waiting: all.filter((r) => r.status === 'pending' && r.steps[r.currentStep] === req.user.role).length
  });
});

// MOVE THE WORKFLOW FORWARD: approve -> next step (or finished), reject -> stops
router.post('/:id/decision', auth('faculty', 'hod'), async (req, res) => {
  const { action, remark } = req.body;
  const r = await Request.findById(req.params.id);
  if (!r) return res.status(404).json({ error: 'Request not found' });
  if (r.status !== 'pending') return res.status(400).json({ error: 'This request is already closed' });
  if (r.steps[r.currentStep] !== req.user.role) {
    return res.status(403).json({ error: 'It is not your turn to approve this request' });
  }

  if (action === 'approve') {
    r.history.push({ by: req.user.name, role: req.user.role, action: 'approved', remark });
    r.currentStep += 1;
    if (r.currentStep >= r.steps.length) r.status = 'approved';
  } else if (action === 'reject') {
    if (!remark) return res.status(400).json({ error: 'Please write a reason for rejecting' });
    r.history.push({ by: req.user.name, role: req.user.role, action: 'rejected', remark });
    r.status = 'rejected';
  } else {
    return res.status(400).json({ error: 'Action must be approve or reject' });
  }
  await r.save();
  res.json(r);
});

module.exports = router;
