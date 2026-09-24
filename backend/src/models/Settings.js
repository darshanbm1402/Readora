const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    libraryName: {
      type: String,
      default: "Readora Library",
      trim: true,
    },
    issuePeriod: {
      type: Number,
      default: 14,
      min: 1,
    },
    finePerDay: {
      type: Number,
      default: 10,
      min: 0,
    },
    maxBooks: {
      type: Number,
      default: 3,
      min: 1,
    },
    openingTime: {
      type: String,
      default: "09:00",
    },
    closingTime: {
      type: String,
      default: "17:00",
    },
    libraryEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);