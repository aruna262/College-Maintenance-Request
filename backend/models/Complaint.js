const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  complaintid: {
    type: Number,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      "Fan",
      "Light",
      "Projector",
      "Bench",
      "Electrical",
      "Plumbing",
      "Air Conditioner",
      "Cleanliness",
      "Other"
    ],
    default: "Electrical"
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending"
  },
  studentid: {
    type: Number,
    required: true
  },
  studentname: {
    type: String,
    default: "Student"
  },
  studentemail: {
    type: String,
    default: ""
  },
  staffid: {
    type: Number,
    default: null
  },
  staffname: {
    type: String,
    default: null
  },
  staffnotes: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Complaint", complaintSchema);
