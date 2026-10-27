const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  const { name, email, password, role, level, rollNo, staffCode } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Please fill all the fields' });
  }
  if (role === 'student' && (!level || !rollNo)) {
    return res.status(400).json({ error: 'Students need a level (UG/PG) and roll number' });
  }
  // faculty and HOD accounts need the department code, so students cannot make them
  if (role !== 'student' && staffCode !== process.env.STAFF_CODE) {
    return res.status(403).json({ error: 'Wrong department staff code' });
  }
  if (await User.findOne({ email })) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  const hashed = await bcrypt.hash(password, 10);
  await User.create({
    name, email, password: hashed, role,
    level: role === 'student' ? level : undefined,
    rollNo: role === 'student' ? rollNo : undefined
  });
  res.status(201).json({ message: 'Registered successfully' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }
  const data = { id: user._id, name: user.name, role: user.role, level: user.level, rollNo: user.rollNo };
  const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: data });
});

module.exports = router;
