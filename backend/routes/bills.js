const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const auth = require('../middleware/auth');

// Create bill
router.post('/', auth, async (req, res) => {
  const { description, amount, participants, group } = req.body;
  const splits = participants.map(userId => ({
    user: userId,
    amount: amount / participants.length,
  }));
  try {
    const bill = new Bill({
      description,
      amount,
      participants,
      splits,
      group: group || null,
      createdBy: req.user.id,
    });
    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Read all bills
router.get('/', auth, async (req, res) => {
  try {
    const bills = await Bill.find().populate('participants group createdBy');
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update bill
router.put('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete bill
router.delete('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json({ message: 'Bill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;