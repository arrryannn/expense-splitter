const mongoose = require('mongoose');

const splitDetailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true
    },
    description: {
      type: String,
      required: [true, 'Expense description is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    category: {
      type: String,
      enum: ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Shopping', 'Other'],
      default: 'Other'
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    splitType: {
      type: String,
      enum: ['equal', 'exact', 'percentage'],
      default: 'equal'
    },
    splitAmong: [splitDetailSchema],
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Expense', expenseSchema);