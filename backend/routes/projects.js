const router = require('express').Router();
const Project = require('../models/Project');
const Allocation = require('../models/Allocation');
const auth = require('../middleware/auth');

// ---------- allocation routes (kept above /:id routes) ----------

router.get('/allocations/mine', auth('student'), async (req, res) => {
  res.json(await Allocation.find({ student: req.user.id }).sort({ createdAt: -1 }));
});

// faculty sees applications to their own projects, HOD sees faculty-approved ones
router.get('/allocations/pending', auth('faculty', 'hod'), async (req, res) => {
  const filter = req.user.role === 'faculty'
    ? { status: 'applied', faculty: req.user.id }
    : { status: 'faculty-approved' };
  res.json(await Allocation.find(filter).sort({ createdAt: 1 }));
});

router.get('/allocations/final', auth('faculty', 'hod'), async (req, res) => {
  res.json(await Allocation.find({ status: 'allocated' }).sort({ createdAt: -1 }));
});

// two-step approval: faculty (applied -> faculty-approved), HOD (faculty-approved -> allocated)
router.post('/allocations/:id/decision', auth('faculty', 'hod'), async (req, res) => {
  const { action, remark } = req.body;
  const a = await Allocation.findById(req.params.id);
  if (!a) return res.status(404).json({ error: 'Application not found' });

  const myStatus = req.user.role === 'faculty' ? 'applied' : 'faculty-approved';
  if (a.status !== myStatus) return res.status(400).json({ error: 'This application is not waiting for you' });
  if (req.user.role === 'faculty' && String(a.faculty) !== String(req.user.id)) {
    return res.status(403).json({ error: 'This is not your project' });
  }

  if (action === 'approve') {
    if (req.user.role === 'faculty') {
      const project = await Project.findById(a.project);
      const filled = await Allocation.countDocuments({ project: a.project, status: { $in: ['faculty-approved', 'allocated'] } });
      if (filled >= project.slots) return res.status(400).json({ error: 'All slots of this project are filled' });
      a.status = 'faculty-approved';
    } else {
      a.status = 'allocated';
    }
  } else if (action === 'reject') {
    if (!remark) return res.status(400).json({ error: 'Please write a reason for rejecting' });
    a.status = 'rejected';
    a.remark = remark;
  } else {
    return res.status(400).json({ error: 'Action must be approve or reject' });
  }
  await a.save();
  res.json(a);
});

// ---------- project routes ----------

router.get('/', auth(), async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  const taken = await Allocation.find({ status: { $in: ['faculty-approved', 'allocated'] } });
  res.json(projects.map((p) => ({
    ...p.toObject(),
    filled: taken.filter((a) => String(a.project) === String(p._id)).length
  })));
});

router.post('/', auth('faculty'), async (req, res) => {
  const { title, description, level, slots } = req.body;
  if (!title || !level || !slots) return res.status(400).json({ error: 'Title, level and slots are required' });
  const project = await Project.create({
    title, description, level, slots, faculty: req.user.id, facultyName: req.user.name
  });
  res.status(201).json(project);
});

router.post('/:id/apply', auth('student'), async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (project.level !== req.user.level) {
    return res.status(400).json({ error: 'This project is only for ' + project.level + ' students' });
  }
  const active = await Allocation.findOne({ student: req.user.id, status: { $in: ['applied', 'faculty-approved', 'allocated'] } });
  if (active) return res.status(400).json({ error: 'You already have an active project application' });

  const filled = await Allocation.countDocuments({ project: project._id, status: { $in: ['faculty-approved', 'allocated'] } });
  if (filled >= project.slots) return res.status(400).json({ error: 'No slots left in this project' });

  const a = await Allocation.create({
    project: project._id, projectTitle: project.title,
    faculty: project.faculty, facultyName: project.facultyName,
    student: req.user.id, studentName: req.user.name, rollNo: req.user.rollNo
  });
  res.status(201).json(a);
});

module.exports = router;
