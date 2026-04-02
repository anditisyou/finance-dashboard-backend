import mongoose from 'mongoose';

const TRANSACTION_TYPES = ['income', 'expense'];

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: TRANSACTION_TYPES,
      required: [true, 'Transaction type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    // Soft delete support
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient filtering queries
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

// Exclude soft-deleted transactions from all queries by default
transactionSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

// Also exclude soft-deleted from aggregation pipelines by injecting a match stage
transactionSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { deletedAt: null } });
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
