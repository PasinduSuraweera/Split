const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Settlement', settlementSchema);