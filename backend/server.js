require("dotenv").config(); // Load .env variables FIRST

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");
const Complaint = require("./models/Complaint");

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/CampusMaintenance";

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================
// MongoDB Connection
// ============================================================
console.log("⏳ Connecting to MongoDB...");
console.log("   URI:", MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("╔═══════════════════════════════════════════╗");
    console.log("║  ✅ MongoDB Connected Successfully!       ║");
    console.log("║  📦 Database : CampusMaintenance          ║");
    console.log(`║  🌐 URI      : ${MONGO_URI.substring(0, 34)}...  ║`);
    console.log("╚═══════════════════════════════════════════╝");
    await seedInitialAccounts();
  })
  .catch((error) => {
    console.error("╔═══════════════════════════════════════════╗");
    console.error("║  ❌ MongoDB Connection FAILED!            ║");
    console.error("╚═══════════════════════════════════════════╝");
    console.error("Error:", error.message);
    console.error("👉 Make sure MongoDB is running OR check your MONGO_URI in .env");
    process.exit(1); // Stop server if DB fails
  });

// Seed default Admin, Staff, and Sample Complaints if empty
async function seedInitialAccounts() {
  try {
    const adminCount = await User.countDocuments({ role: "Admin" });
    if (adminCount === 0) {
      await User.create({
        userid: 1001,
        name: "Campus Administrator",
        email: "admin@college.edu",
        password: "admin123",
        role: "Admin",
        department: "Maintenance Management",
        phone: "9876543200"
      });
      console.log("✅ Seeded default Admin: admin@college.edu / admin123");
    }

    const staffCount = await User.countDocuments({ role: "Staff" });
    if (staffCount === 0) {
      await User.create([
        {
          userid: 2001,
          name: "Kumar (Electrical Staff)",
          email: "staff@college.edu",
          password: "staff123",
          role: "Staff",
          department: "Electrical",
          phone: "9876543210"
        },
        {
          userid: 2002,
          name: "Suresh (Civil & Plumbing Staff)",
          email: "suresh@college.edu",
          password: "staff123",
          role: "Staff",
          department: "Plumbing",
          phone: "9876543211"
        }
      ]);
      console.log("✅ Seeded default Staff: staff@college.edu / staff123");
    }

    const complaintCount = await Complaint.countDocuments();
    if (complaintCount === 0) {
      await Complaint.create([
        {
          complaintid: 101,
          type: "Fan",
          location: "Block A - Room 204",
          description: "Ceiling fan making loud noise and not rotating at normal speed.",
          priority: "Medium",
          status: "Pending",
          studentid: 3001,
          studentname: "Maha Sri",
          studentemail: "student@college.edu"
        },
        {
          complaintid: 102,
          type: "Projector",
          location: "CS Lab 2 - Floor 3",
          description: "Projector HDMI display flickering constantly during class.",
          priority: "High",
          status: "In Progress",
          studentid: 3001,
          studentname: "Maha Sri",
          studentemail: "student@college.edu",
          staffid: 2001,
          staffname: "Kumar (Electrical Staff)"
        }
      ]);
      console.log("✅ Seeded sample Complaints");
    }
  } catch (err) {
    console.error("Error during initial seeding:", err);
  }
}

// ----------------------------------------------------
// Health Check Route
// ----------------------------------------------------
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Campus Maintenance Request System API is running smoothly!",
    endpoints: {
      auth: ["/register", "/login", "/staff/login", "/admin/login"],
      complaints: ["/complaint", "/complaints", "/complaints/student/:id", "/complaints/staff/:id", "/complaint/:id"],
      users: ["/users/students", "/users/staff"]
    }
  });
});

// ----------------------------------------------------
// Authentication & User Routes
// ----------------------------------------------------

// 1. Student Registration
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required!"
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists!"
      });
    }

    const userid = Date.now();
    const newUser = new User({
      userid,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "Student", // Student role is automatically assigned
      phone: phone || "",
      department: department || "General"
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Student registration successful! You can now log in.",
      user: {
        userid: newUser.userid,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message
    });
  }
});

// 2. Student / Universal Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required!"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password!"
      });
    }

    res.json({
      success: true,
      message: `${user.role} Login Successful!`,
      user: {
        userid: user.userid,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message
    });
  }
});

// 3. Staff Login
app.post("/staff/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required!"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim(), role: "Staff" });
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid staff credentials! Please verify email and password."
      });
    }

    res.json({
      success: true,
      message: "Staff Login Successful!",
      user: {
        userid: user.userid,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error("Staff Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during staff login",
      error: error.message
    });
  }
});

// 4. Admin Login
app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required!"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim(), role: "Admin" });
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials! Please verify email and password."
      });
    }

    res.json({
      success: true,
      message: "Admin Login Successful!",
      user: {
        userid: user.userid,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during admin login",
      error: error.message
    });
  }
});

// 5. Get All Students (Admin)
app.get("/users/students", async (req, res) => {
  try {
    const students = await User.find({ role: "Student" }).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Get All Staff (Admin/System)
app.get("/users/staff", async (req, res) => {
  try {
    const staff = await User.find({ role: "Staff" }).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: staff.length, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Add New Staff Member (Admin)
app.post("/users/staff", async (req, res) => {
  try {
    const { name, email, password, phone, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required for staff!"
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists!"
      });
    }

    const newStaff = new User({
      userid: Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "Staff",
      phone: phone || "",
      department: department || "General Maintenance"
    });

    await newStaff.save();

    res.status(201).json({
      success: true,
      message: "Staff member added successfully!",
      staff: {
        userid: newStaff.userid,
        name: newStaff.name,
        email: newStaff.email,
        department: newStaff.department,
        phone: newStaff.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// Complaint Management Routes
// ----------------------------------------------------

// 8. Add Complaint (Student)
app.post("/complaint", async (req, res) => {
  try {
    const { type, location, description, priority, studentid, studentname, studentemail } = req.body;

    if (!type || !location || !description || !studentid) {
      return res.status(400).json({
        success: false,
        message: "Type, location, description, and studentid are required!"
      });
    }

    const complaintid = Math.floor(100000 + Math.random() * 900000); // 6-digit reference number

    const newComplaint = new Complaint({
      complaintid,
      type,
      location: location.trim(),
      description: description.trim(),
      priority: priority || "Medium",
      status: "Pending",
      studentid: Number(studentid),
      studentname: studentname || "Student",
      studentemail: studentemail || ""
    });

    await newComplaint.save();

    res.status(201).json({
      success: true,
      message: "Maintenance complaint submitted successfully!",
      complaint: newComplaint
    });
  } catch (error) {
    console.error("Create Complaint Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating complaint",
      error: error.message
    });
  }
});

// 9. Get Dashboard Statistics (Admin / Staff Overview)
app.get("/complaints/stats", async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: "Pending" });
    const inProgress = await Complaint.countDocuments({ status: "In Progress" });
    const completed = await Complaint.countDocuments({ status: "Completed" });

    res.json({
      success: true,
      stats: { total, pending, inProgress, completed }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 10. Get All Complaints (Admin)
app.get("/complaints", async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error("Get All Complaints Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching complaints",
      error: error.message
    });
  }
});

// 11. Get Complaints for Specific Student
app.get("/complaints/student/:id", async (req, res) => {
  try {
    const studentid = Number(req.params.id);
    const complaints = await Complaint.find({ studentid }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error("Get Student Complaints Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching student complaints",
      error: error.message
    });
  }
});

// 12. Get Complaints Assigned to Specific Staff
app.get("/complaints/staff/:id", async (req, res) => {
  try {
    const staffid = Number(req.params.id);
    const complaints = await Complaint.find({ staffid }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error("Get Staff Complaints Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching staff complaints",
      error: error.message
    });
  }
});

// 13. Get Single Complaint Details
app.get("/complaint/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let complaint;

    if (!isNaN(id)) {
      complaint = await Complaint.findOne({ complaintid: Number(id) });
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      complaint = await Complaint.findById(id);
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found!"
      });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 14. Update Complaint Status & Notes (Staff / Admin)
app.put("/complaint/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { status, staffnotes } = req.body;

    const updateFields = { updatedAt: Date.now() };
    if (status) updateFields.status = status;
    if (staffnotes !== undefined) updateFields.staffnotes = staffnotes;

    let complaint;
    if (!isNaN(id)) {
      complaint = await Complaint.findOneAndUpdate(
        { complaintid: Number(id) },
        updateFields,
        { new: true }
      );
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      complaint = await Complaint.findByIdAndUpdate(
        id,
        updateFields,
        { new: true }
      );
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found for update!"
      });
    }

    res.json({
      success: true,
      message: `Complaint status updated to '${complaint.status}' successfully!`,
      complaint
    });
  } catch (error) {
    console.error("Update Complaint Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating complaint",
      error: error.message
    });
  }
});

// 15. Assign Staff to Complaint (Admin)
app.put("/complaint/assign/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { staffid, staffname } = req.body;

    if (!staffid || !staffname) {
      return res.status(400).json({
        success: false,
        message: "staffid and staffname are required for assignment!"
      });
    }

    const updateFields = {
      staffid: Number(staffid),
      staffname: staffname.trim(),
      status: "In Progress", // Assigning automatically marks as In Progress
      updatedAt: Date.now()
    };

    let complaint;
    if (!isNaN(id)) {
      complaint = await Complaint.findOneAndUpdate(
        { complaintid: Number(id) },
        updateFields,
        { new: true }
      );
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      complaint = await Complaint.findByIdAndUpdate(
        id,
        updateFields,
        { new: true }
      );
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found for assignment!"
      });
    }

    res.json({
      success: true,
      message: `Complaint assigned to ${staffname} and marked 'In Progress'!`,
      complaint
    });
  } catch (error) {
    console.error("Assign Staff Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error assigning staff",
      error: error.message
    });
  }
});

// 16. Delete Complaint (Admin)
app.delete("/complaint/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let deleted;

    if (!isNaN(id)) {
      deleted = await Complaint.findOneAndDelete({ complaintid: Number(id) });
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Complaint.findByIdAndDelete(id);
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found for deletion!"
      });
    }

    res.json({
      success: true,
      message: "Complaint deleted successfully!"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  🚀 Campus Maintenance Backend Running!`);
  console.log(`  📍 Server Address: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
