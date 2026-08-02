const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please fill in all fields'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({
      email: normalizedEmail
    });

    if (userExists) {
      return res.status(400).json({
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error.message);

    return res.status(400).json({
      message: error.message
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (user && await user.matchPassword(password)) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id)
      });
    }

    return res.status(401).json({
      message: 'Invalid email or password'
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error.message);

    return res.status(500).json({
      message: error.message
    });
  }
};


const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password');

    return res.json(user);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getMe
};