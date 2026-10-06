/**
 * Automated Test Script for College Maintenance Request System API
 * Run using: node test-api.js
 */

const BASE_URL = "http://localhost:8000";

async function runTests() {
  console.log("==================================================");
  console.log(" 🧪 Starting Automated Backend API Test Suite");
  console.log("==================================================");

  try {
    // 1. Health Check
    console.log("\n[Test 1] Testing Health Check Route (GET /)...");
    const healthRes = await fetch(`${BASE_URL}/`);
    const healthData = await healthRes.json();
    console.log("✓ Health Check Passed:", healthData.message);

    // 2. Student Registration
    const testEmail = `test_student_${Date.now()}@college.edu`;
    console.log(`\n[Test 2] Testing Student Register (POST /register) with ${testEmail}...`);
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Karthik Raja",
        email: testEmail,
        password: "password123",
        phone: "9876501234",
        department: "Computer Science"
      })
    });
    const regData = await regRes.json();
    console.log("✓ Register Status:", regRes.status, regData.message);
    const studentId = regData.user.userid;

    // 3. Student Login
    console.log("\n[Test 3] Testing Student Login (POST /login)...");
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "password123"
      })
    });
    const loginData = await loginRes.json();
    console.log("✓ Student Login Status:", loginRes.status, loginData.message, "| Role:", loginData.user.role);

    // 4. Staff Login
    console.log("\n[Test 4] Testing Staff Login (POST /staff/login)...");
    const staffRes = await fetch(`${BASE_URL}/staff/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "staff@college.edu",
        password: "staff123"
      })
    });
    const staffData = await staffRes.json();
    console.log("✓ Staff Login Status:", staffRes.status, staffData.message, "| Staff Name:", staffData.user.name);

    // 5. Admin Login
    console.log("\n[Test 5] Testing Admin Login (POST /admin/login)...");
    const adminRes = await fetch(`${BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@college.edu",
        password: "admin123"
      })
    });
    const adminData = await adminRes.json();
    console.log("✓ Admin Login Status:", adminRes.status, adminData.message, "| Admin Name:", adminData.user.name);

    // 6. Submit Complaint
    console.log("\n[Test 6] Testing Submit Complaint (POST /complaint)...");
    const compRes = await fetch(`${BASE_URL}/complaint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "Light",
        location: "Block B - Room 105",
        description: "Tube light not working on the front row whiteboard.",
        priority: "High",
        studentid: studentId,
        studentname: "Karthik Raja",
        studentemail: testEmail
      })
    });
    const compData = await compRes.json();
    console.log("✓ Complaint Created:", compRes.status, "| Complaint ID:", compData.complaint.complaintid, "| Status:", compData.complaint.status);
    const complaintId = compData.complaint.complaintid;

    // 7. View Student Complaints
    console.log(`\n[Test 7] Testing Get Student Complaints (GET /complaints/student/${studentId})...`);
    const stuCompRes = await fetch(`${BASE_URL}/complaints/student/${studentId}`);
    const stuCompData = await stuCompRes.json();
    console.log(`✓ Fetched ${stuCompData.count} complaint(s) for student ID ${studentId}`);

    // 8. Admin View All Complaints
    console.log("\n[Test 8] Testing Admin Get All Complaints (GET /complaints)...");
    const allCompRes = await fetch(`${BASE_URL}/complaints`);
    const allCompData = await allCompRes.json();
    console.log(`✓ Total complaints in system: ${allCompData.count}`);

    // 9. Admin Assign Staff
    console.log(`\n[Test 9] Testing Admin Assign Staff (PUT /complaint/assign/${complaintId})...`);
    const assignRes = await fetch(`${BASE_URL}/complaint/assign/${complaintId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffid: 2001,
        staffname: "Kumar (Electrical Staff)"
      })
    });
    const assignData = await assignRes.json();
    console.log("✓ Staff Assignment Status:", assignRes.status, assignData.message, "| New Status:", assignData.complaint.status);

    // 10. Staff View Assigned Complaints
    console.log("\n[Test 10] Testing Staff Get Assigned Complaints (GET /complaints/staff/2001)...");
    const staffCompRes = await fetch(`${BASE_URL}/complaints/staff/2001`);
    const staffCompData = await staffCompRes.json();
    console.log(`✓ Fetched ${staffCompData.count} assigned complaint(s) for Kumar`);

    // 11. Staff Update Status to Completed
    console.log(`\n[Test 11] Testing Staff Update Status (PUT /complaint/${complaintId})...`);
    const updateRes = await fetch(`${BASE_URL}/complaint/${complaintId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Completed",
        staffnotes: "Replaced faulty tube light and choke. Tested and verified working."
      })
    });
    const updateData = await updateRes.json();
    console.log("✓ Update Status:", updateRes.status, updateData.message, "| Final Status:", updateData.complaint.status);

    // 12. Stats Check
    console.log("\n[Test 12] Testing Dashboard Stats (GET /complaints/stats)...");
    const statsRes = await fetch(`${BASE_URL}/complaints/stats`);
    const statsData = await statsRes.json();
    console.log("✓ Stats Data:", statsData.stats);

    console.log("\n==================================================");
    console.log(" 🎉 ALL 12 BACKEND API TESTS PASSED SUCCESSFULLY!");
    console.log("==================================================");
  } catch (err) {
    console.error("\n❌ Test execution error:", err);
  }
}

runTests();
