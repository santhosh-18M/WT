const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const getAdminEmails = () => {
  const rawValue = process.env.ADMIN_EMAILS || '';

  return rawValue
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const getGovEmails = () => {
  const rawValue = process.env.GOV_EMAILS || '';

  return rawValue
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const getGovSecretCode = () => process.env.GOV_SECRET_CODE || '123456';

const signupUser = async (req, res) => {
  try {
    const { name, email, password, accountType = 'people', secretCode = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedEmail = email.toLowerCase();
    let role = 'user';

    if (accountType === 'gov') {
      if (secretCode !== getGovSecretCode()) {
        return res.status(400).json({ message: 'Invalid government secret code' });
      }

      role = 'gov';
    } else if (getAdminEmails().includes(normalizedEmail)) {
      role = 'admin';
    } else if (getGovEmails().includes(normalizedEmail)) {
      role = 'gov';
    }

    const createdUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role
    });

    return res.status(201).json({
      message: 'Signup successful',
      token: createToken(createdUser),
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role || 'user'
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      message: 'Login successful',
      token: createToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

module.exports = {
  signupUser,
  loginUser
};
