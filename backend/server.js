const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/split-bill-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const User = require('./models/User');
const Friend = require('./models/Friend');
const Bill = require('./models/Bill');

// Auth Middleware
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  console.log('Received token:', token);
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded.user || {}; // Fallback if structure differs
    if (!req.user.id) return res.status(400).json({ message: 'Invalid token payload' });
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Routes
// Register and Login (existing)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashedPassword });
    await user.save();
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Friend
app.post('/api/friends/add', auth, async (req, res) => {
  const { email } = req.body;
  console.log('Request body:', req.body);
  console.log('User ID:', req.user.id);
  try {
    const friend = await User.findOne({ email });
    if (!friend) return res.status(404).json({ message: 'Friend not found' });
    if (await Friend.findOne({ userId: req.user.id, friendId: friend.id }))
      return res.status(400).json({ message: 'Friend already added' });
    const newFriend = new Friend({ userId: req.user.id, friendId: friend.id });
    await newFriend.save();
    res.json({ success: true, message: 'Friend added' });
  } catch (err) {
    console.error('Error details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Split Bill
app.post('/api/bills/split', auth, upload.single('billImage'), async (req, res) => {
  const { amount, friends, splitAmount } = req.body;
  console.log('Request body:', req.body);
  console.log('File:', req.file);
  console.log('User ID:', req.user.id);
  try {
    const bill = new Bill({
      userId: req.user.id,
      amount: parseFloat(amount),
      friends: JSON.parse(friends), // Store as array of emails
      splitAmount: parseFloat(splitAmount),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });
    await bill.save();
    res.json({ success: true, message: 'Bill split successfully' });
  } catch (err) {
    console.error('Error details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Friends
app.get('/api/friends', auth, async (req, res) => {
  try {
    const friends = await Friend.find({ userId: req.user.id }).populate('friendId', 'name email');
    const friendData = friends.map(f => ({ name: f.friendId.name || 'Unknown', email: f.friendId.email || 'No email' }));
    res.json({ success: true, friends: friendData });
  } catch (err) {
    console.error('Error fetching friends:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search Friends
app.get('/api/friends/search', auth, async (req, res) => {
  const { query } = req.query;
  try {
    const friends = await User.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') },
      ],
    }).select('name email');
    res.json({ success: true, friends });
  } catch (err) {
    console.error('Error searching friends:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove Friend
app.delete('/api/friends/remove', auth, async (req, res) => {
  const { friendEmail } = req.body;
  console.log('Removing friend with email:', friendEmail);
  try {
    const friend = await Friend.findOne({ userId: req.user.id, friendId: await User.findOne({ email: friendEmail }).select('_id') });
    if (!friend) return res.status(404).json({ message: 'Friend not found' });
    await Friend.deleteOne({ _id: friend._id });
    res.json({ success: true, message: 'Friend removed' });
  } catch (err) {
    console.error('Error removing friend:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Bill History
app.get('/api/bills/history', auth, async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.user.id })
      .select('amount splitAmount friends imageUrl createdAt');
    res.json({ success: true, bills });
  } catch (err) {
    console.error('Error fetching bill history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Bill Stats
app.get('/api/bills/stats', auth, async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.user.id }).select('amount splitAmount');
    if (bills.length === 0) {
      return res.json({ success: true, totalSpent: 0, billsSplit: 0, averageSplit: 0 });
    }
    const totalSpent = bills.reduce((sum, bill) => sum + bill.splitAmount, 0).toFixed(2); // Your share per bill
    const billsSplit = bills.length;
    const averageSplit = bills.reduce((sum, bill) => sum + bill.splitAmount, 0) / billsSplit;
    res.json({ success: true, totalSpent, billsSplit, averageSplit: averageSplit.toFixed(2) });
  } catch (err) {
    console.error('Error fetching bill stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Delete Bill
app.delete('/api/bills/delete', auth, async (req, res) => {
  const { billId } = req.body;
  console.log('Deleting bill with ID:', billId);
  try {
    const bill = await Bill.findOne({ _id: billId, userId: req.user.id });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    await Bill.deleteOne({ _id: billId });
    res.json({ success: true, message: 'Bill deleted' });
  } catch (err) {
    console.error('Error deleting bill:', err);
    res.status(500).json({ message: 'Server error' });
  }
});