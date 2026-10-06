const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userid: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["Student", "Staff", "Admin"],
    default: "Student"
  },
  phone: {
    type: String,
    default: ""
  },
  department: {
    type: String,
    default: "General"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
