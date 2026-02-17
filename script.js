// script.js - Hospital Management System FULL CODE

// ─────────────────────────────
// Authentication
// ─────────────────────────────
function registerAdmin(event) {
    event.preventDefault();

    const username = document.getElementById("reg-username")?.value;
    const password = document.getElementById("reg-password")?.value;

    if (!username || !password) return;

    localStorage.setItem("adminUsername", username);
    localStorage.setItem("adminPassword", password);

    showToast("Registration successful! Please login.");
    setTimeout(() => window.location.href = "index.html", 1500);
}

function loginAdmin(event) {
    event.preventDefault();

    const username = document.getElementById("username")?.value;
    const password = document.getElementById("password")?.value;

    const storedUser = localStorage.getItem("adminUsername");
    const storedPass = localStorage.getItem("adminPassword");

    if (username === storedUser && password === storedPass) {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "dashboard.html";
    } else {
        showToast("Invalid username or password", "error");
    }
}

function isLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
}

function logoutAdmin() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "index.html";
}

// ─────────────────────────────
// LocalStorage Data
// ─────────────────────────────
let doctors = JSON.parse(localStorage.getItem("doctors")) || [];
let patients = JSON.parse(localStorage.getItem("patients")) || [];
let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
let bills = JSON.parse(localStorage.getItem("bills")) || [];

function saveData() {
    localStorage.setItem("doctors", JSON.stringify(doctors));
    localStorage.setItem("patients", JSON.stringify(patients));
    localStorage.setItem("appointments", JSON.stringify(appointments));
    localStorage.setItem("bills", JSON.stringify(bills));
}

// ─────────────────────────────
// Toast
// ─────────────────────────────
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.style.background = type === "error" ? "#dc3545" : "#28a745";
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

// ─────────────────────────────
// Confirm Delete Modal
// ─────────────────────────────
let deleteCallback = null;

function showConfirmDelete(callback) {
    deleteCallback = callback;
    const modal = document.getElementById("confirmModal");
    if (modal) modal.style.display = "flex";
}

function confirmDelete(confirmed) {
    const modal = document.getElementById("confirmModal");
    if (modal) modal.style.display = "none";

    if (confirmed && typeof deleteCallback === "function") {
        deleteCallback();
    }
    deleteCallback = null;
}

// ─────────────────────────────
// Module Switcher
// ─────────────────────────────
function showModule(moduleName) {
    const content = document.getElementById("content");
    if (!content) return;

    content.innerHTML = "";

    if (moduleName === "dashboard") renderDashboard(content);
    else if (moduleName === "doctors") renderDoctorsModule(content);
    else if (moduleName === "patients") renderPatientsModule(content);
    else if (moduleName === "appointments") renderAppointmentsModule(content);
    else if (moduleName === "billing") renderBillingModule(content);
    else if (moduleName === "reports") renderReportsModule(content);
}

// ─────────────────────────────
// Dashboard
// ─────────────────────────────

    function renderDashboard(container) {
    const activeDoctors = doctors.filter(d => d.status !== "Inactive").length;
    const inactiveDoctors = doctors.filter(d => d.status === "Inactive").length;

    const malePatients = patients.filter(p => p.gender === "Male").length;
    const femalePatients = patients.filter(p => p.gender === "Female").length;

    const totalAppointments = appointments.length;

    const pendingAppointments = appointments.filter(a => a.status === "Pending").length;
    const confirmedAppointments = appointments.filter(a => a.status === "Confirmed").length;
    const completedAppointments = appointments.filter(a => a.status === "Completed").length;
    const cancelledAppointments = appointments.filter(a => a.status === "Cancelled").length;

    const paidBills = bills.filter(b => b.status === "Paid").length;
    const unpaidBills = bills.filter(b => b.status === "Unpaid").length;

    container.innerHTML = `
        <h2>Dashboard Overview</h2>

        <div class="summary-cards">
            <div class="card">
                <h3>${doctors.length}</h3>
                <p>Total Doctors</p>
            </div>
            <div class="card">
                <h3>${patients.length}</h3>
                <p>Total Patients</p>
            </div>
            <div class="card">
                <h3>${appointments.length}</h3>
                <p>Total Appointments</p>
            </div>
            <div class="card">
                <h3>${bills.length}</h3>
                <p>Total Bills</p>
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-card">
                <h3>Doctors Status</h3>
                <canvas id="doctorChart"></canvas>
            </div>

            <div class="chart-card">
                <h3>Patients Gender</h3>
                <canvas id="patientChart"></canvas>
            </div>

            <div class="chart-card">
                <h3>Appointments Status</h3>
                <canvas id="appointmentChart"></canvas>
            </div>

            <div class="chart-card">
                <h3>Billing Status</h3>
                <canvas id="billingChart"></canvas>
            </div>
        </div>
    `;

    setTimeout(() => {
        renderCharts(
            activeDoctors, inactiveDoctors,
            malePatients, femalePatients,
            pendingAppointments, confirmedAppointments, completedAppointments, cancelledAppointments,
            paidBills, unpaidBills
        );
    }, 200);
}

let doctorChartInstance, patientChartInstance, appointmentChartInstance, billingChartInstance;

function renderCharts(activeDoctors, inactiveDoctors,
    malePatients, femalePatients,
    pendingAppointments, confirmedAppointments, completedAppointments, cancelledAppointments,
    paidBills, unpaidBills) {

    // Destroy previous charts (fix bug on reload)
    if (doctorChartInstance) doctorChartInstance.destroy();
    if (patientChartInstance) patientChartInstance.destroy();
    if (appointmentChartInstance) appointmentChartInstance.destroy();
    if (billingChartInstance) billingChartInstance.destroy();

    // Doctors Chart
    const doctorCtx = document.getElementById("doctorChart");
    if (doctorCtx) {
        doctorChartInstance = new Chart(doctorCtx, {
            type: "doughnut",
            data: {
                labels: ["Active", "Inactive"],
                datasets: [{
                    data: [activeDoctors, inactiveDoctors],
                    backgroundColor: ["#28a745", "#dc3545"]
                }]
            }
        });
    }

    // Patients Chart
    const patientCtx = document.getElementById("patientChart");
    if (patientCtx) {
        patientChartInstance = new Chart(patientCtx, {
            type: "pie",
            data: {
                labels: ["Male", "Female"],
                datasets: [{
                    data: [malePatients, femalePatients],
                    backgroundColor: ["#0d6efd", "#ff4d94"]
                }]
            }
        });
    }

    // Appointment Chart
    const appointmentCtx = document.getElementById("appointmentChart");
    if (appointmentCtx) {
        appointmentChartInstance = new Chart(appointmentCtx, {
            type: "bar",
            data: {
                labels: ["Pending", "Confirmed", "Completed", "Cancelled"],
                datasets: [{
                    label: "Appointments",
                    data: [pendingAppointments, confirmedAppointments, completedAppointments, cancelledAppointments],
                    backgroundColor: ["#ffc107", "#17a2b8", "#28a745", "#dc3545"]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // Billing Chart
    const billingCtx = document.getElementById("billingChart");
    if (billingCtx) {
        billingChartInstance = new Chart(billingCtx, {
            type: "polarArea",
            data: {
                labels: ["Paid", "Unpaid"],
                datasets: [{
                    data: [paidBills, unpaidBills],
                    backgroundColor: ["#20c997", "#ff6b6b"]
                }]
            }
        });
    }
}



// ─────────────────────────────
// Doctors Module
// ─────────────────────────────
function renderDoctorsModule(container) {
    container.innerHTML = `
        <h2>Manage Doctors</h2>
        <form id="doctorForm">
            <input type="text" id="docName" placeholder="Doctor Name" required>
            <input type="text" id="docSpec" placeholder="Specialization" required>
            <input type="tel" id="docContact" placeholder="Contact" required>
            <input type="email" id="docEmail" placeholder="Email" required>
            <select id="docGender" required>
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
            </select>
            <input type="number" id="docExp" placeholder="Experience (years)" min="0" required>
            <button type="submit">Add Doctor</button>
        </form>

        <div class="table-container">
            <table id="doctorsTable">
                <thead>
                    <tr>
                        <th>Name</th><th>Specialization</th><th>Contact</th><th>Email</th>
                        <th>Gender</th><th>Experience</th><th>Status</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `;

    document.getElementById("doctorForm").addEventListener("submit", handleAddOrUpdateDoctor);
    renderDoctorsTable();
}

function renderDoctorsTable(filter = "") {
    const tbody = document.querySelector("#doctorsTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    doctors
        .map((doc, i) => ({ doc, i }))
        .filter(({ doc }) => !filter || Object.values(doc).some(v => String(v).toLowerCase().includes(filter.toLowerCase())))
        .forEach(({ doc, i }) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${doc.name}</td>
                <td>${doc.specialization}</td>
                <td>${doc.contact}</td>
                <td>${doc.email}</td>
                <td>${doc.gender}</td>
                <td>${doc.experience}</td>
                <td>
                    <button class="toggle-btn-status ${doc.status === "Inactive" ? "inactive" : "active"}"
                            onclick="toggleDoctorStatus(${i})">
                        ${doc.status}
                    </button>
                </td>
                <td>
                    <button class="btn" onclick="editDoctor(${i})"><i class="fas fa-edit"></i></button>
                    <button class="btn" onclick="deleteItem('doctors', ${i})"><i class="fas fa-trash"></i></button>
                </td>
            `;

            tbody.appendChild(row);
        });
}

function handleAddOrUpdateDoctor(e) {
    e.preventDefault();

    const isEdit = window.currentEditDoctorIndex !== undefined;

    const data = {
        name: document.getElementById("docName").value.trim(),
        specialization: document.getElementById("docSpec").value.trim(),
        contact: document.getElementById("docContact").value.trim(),
        email: document.getElementById("docEmail").value.trim(),
        gender: document.getElementById("docGender").value,
        experience: document.getElementById("docExp").value,
        status: isEdit ? doctors[window.currentEditDoctorIndex].status : "Active"
    };

    if (isEdit) {
        doctors[window.currentEditDoctorIndex] = data;
        delete window.currentEditDoctorIndex;
        showToast("Doctor updated successfully!");
    } else {
        doctors.push(data);
        showToast("Doctor added successfully!");
    }

    saveData();
    document.getElementById("doctorForm").reset();
    renderDoctorsTable(document.getElementById("searchInput").value || "");
}

window.editDoctor = function (index) {
    const d = doctors[index];
    if (!d) return;

    document.getElementById("docName").value = d.name;
    document.getElementById("docSpec").value = d.specialization;
    document.getElementById("docContact").value = d.contact;
    document.getElementById("docEmail").value = d.email;
    document.getElementById("docGender").value = d.gender;
    document.getElementById("docExp").value = d.experience;

    window.currentEditDoctorIndex = index;
};

window.toggleDoctorStatus = function (index) {
    if (!doctors[index]) return;

    doctors[index].status = doctors[index].status === "Active" ? "Inactive" : "Active";
    saveData();
    renderDoctorsTable(document.getElementById("searchInput").value || "");
};

// ─────────────────────────────
// Patients Module
// ─────────────────────────────
function renderPatientsModule(container) {
    container.innerHTML = `
        <h2>Manage Patients</h2>
        <form id="patientForm">
            <input type="text" id="patName" placeholder="Patient Name" required>
            <input type="number" id="patAge" placeholder="Age" required>
            <select id="patGender" required>
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
            </select>
            <input type="tel" id="patContact" placeholder="Contact" required>
            <input type="text" id="patAddress" placeholder="Address" required>
            <input type="text" id="patDisease" placeholder="Disease" required>
            <button type="submit">Add Patient</button>
        </form>

        <div class="table-container">
            <table id="patientsTable">
                <thead>
                    <tr>
                        <th>Name</th><th>Age</th><th>Gender</th><th>Contact</th>
                        <th>Address</th><th>Disease</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `;

    document.getElementById("patientForm").addEventListener("submit", handleAddOrUpdatePatient);
    renderPatientsTable();
}

function renderPatientsTable(filter = "") {
    const tbody = document.querySelector("#patientsTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    patients
        .map((pat, i) => ({ pat, i }))
        .filter(({ pat }) => !filter || Object.values(pat).some(v => String(v).toLowerCase().includes(filter.toLowerCase())))
        .forEach(({ pat, i }) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${pat.name}</td>
                <td>${pat.age}</td>
                <td>${pat.gender}</td>
                <td>${pat.contact}</td>
                <td>${pat.address}</td>
                <td>${pat.disease}</td>
                <td>
                    <button class="btn" onclick="editPatient(${i})"><i class="fas fa-edit"></i></button>
                    <button class="btn" onclick="deleteItem('patients', ${i})"><i class="fas fa-trash"></i></button>
                </td>
            `;

            tbody.appendChild(row);
        });
}

function handleAddOrUpdatePatient(e) {
    e.preventDefault();

    const isEdit = window.currentEditPatientIndex !== undefined;

    const data = {
        name: document.getElementById("patName").value.trim(),
        age: document.getElementById("patAge").value,
        gender: document.getElementById("patGender").value,
        contact: document.getElementById("patContact").value.trim(),
        address: document.getElementById("patAddress").value.trim(),
        disease: document.getElementById("patDisease").value.trim()
    };

    if (isEdit) {
        patients[window.currentEditPatientIndex] = data;
        delete window.currentEditPatientIndex;
        showToast("Patient updated successfully!");
    } else {
        patients.push(data);
        showToast("Patient added successfully!");
    }

    saveData();
    document.getElementById("patientForm").reset();
    renderPatientsTable(document.getElementById("searchInput").value || "");
}

window.editPatient = function (index) {
    const p = patients[index];
    if (!p) return;

    document.getElementById("patName").value = p.name;
    document.getElementById("patAge").value = p.age;
    document.getElementById("patGender").value = p.gender;
    document.getElementById("patContact").value = p.contact;
    document.getElementById("patAddress").value = p.address;
    document.getElementById("patDisease").value = p.disease;

    window.currentEditPatientIndex = index;
};

// ─────────────────────────────
// Appointments Module
// ─────────────────────────────
function renderAppointmentsModule(container) {
    container.innerHTML = `
        <h2>Manage Appointments</h2>
        <form id="appointmentForm">
            <input type="text" id="appPatient" placeholder="Patient Name" required>
            <input type="text" id="appDoctor" placeholder="Doctor Name" required>
            <input type="date" id="appDate" required>
            <input type="time" id="appTime" required>
            <button type="submit">Add Appointment</button>
        </form>

        <div class="table-container">
            <table id="appointmentsTable">
                <thead>
                    <tr>
                        <th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `;

    document.getElementById("appointmentForm").addEventListener("submit", handleAddOrUpdateAppointment);
    renderAppointmentsTable();
}

function renderAppointmentsTable(filter = "") {
    const tbody = document.querySelector("#appointmentsTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    appointments
        .map((app, i) => ({ app, i }))
        .filter(({ app }) => !filter || Object.values(app).some(v => String(v).toLowerCase().includes(filter.toLowerCase())))
        .forEach(({ app, i }) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${app.patient}</td>
                <td>${app.doctor}</td>
                <td>${app.date}</td>
                <td>${app.time}</td>
                <td>
                    <button class="toggle-btn-status ${app.status === "Completed" ? "active" : "inactive"}"
                            onclick="toggleAppointmentStatus(${i})">
                        ${app.status}
                    </button>
                </td>
                <td>
                    <button class="btn" onclick="deleteItem('appointments', ${i})"><i class="fas fa-trash"></i></button>
                </td>
            `;

            tbody.appendChild(row);
        });
}

function handleAddOrUpdateAppointment(e) {
    e.preventDefault();

    const data = {
        patient: document.getElementById("appPatient").value.trim(),
        doctor: document.getElementById("appDoctor").value.trim(),
        date: document.getElementById("appDate").value,
        time: document.getElementById("appTime").value,
        status: "Pending"
    };

    appointments.push(data);
    saveData();

    showToast("Appointment added successfully!");
    document.getElementById("appointmentForm").reset();
    renderAppointmentsTable(document.getElementById("searchInput").value || "");
}

window.toggleAppointmentStatus = function (index) {
    if (!appointments[index]) return;

    const statusCycle = ["Pending", "Confirmed", "Completed", "Cancelled"];
    let currentIndex = statusCycle.indexOf(appointments[index].status);
    appointments[index].status = statusCycle[(currentIndex + 1) % statusCycle.length];

    saveData();
    renderAppointmentsTable(document.getElementById("searchInput").value || "");
};

// ─────────────────────────────
// Billing Module
// ─────────────────────────────
function renderBillingModule(container) {
    container.innerHTML = `
        <h2>Billing Management</h2>
        <form id="billForm">
            <input type="text" id="billPatient" placeholder="Patient Name" required>
            <input type="text" id="billTreatment" placeholder="Treatment" required>
            <input type="number" id="billAmount" placeholder="Amount" required>
            <button type="submit">Generate Bill</button>
        </form>

        <div class="table-container">
            <table id="billsTable">
                <thead>
                    <tr>
                        <th>Patient</th><th>Treatment</th><th>Amount</th><th>Status</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `;

    document.getElementById("billForm").addEventListener("submit", handleAddBill);
    renderBillsTable();
}

function renderBillsTable(filter = "") {
    const tbody = document.querySelector("#billsTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    bills
        .map((bill, i) => ({ bill, i }))
        .filter(({ bill }) => !filter || Object.values(bill).some(v => String(v).toLowerCase().includes(filter.toLowerCase())))
        .forEach(({ bill, i }) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${bill.patient}</td>
                <td>${bill.treatment}</td>
                <td>₹${bill.amount}</td>
                <td>
                    <button class="toggle-btn-status ${bill.status === "Paid" ? "active" : "inactive"}"
                            onclick="toggleBillStatus(${i})">
                        ${bill.status}
                    </button>
                </td>
                <td>
                    <button class="btn" onclick="deleteItem('bills', ${i})"><i class="fas fa-trash"></i></button>
                </td>
            `;

            tbody.appendChild(row);
        });
}

function handleAddBill(e) {
    e.preventDefault();

    const data = {
        patient: document.getElementById("billPatient").value.trim(),
        treatment: document.getElementById("billTreatment").value.trim(),
        amount: document.getElementById("billAmount").value,
        status: "Unpaid"
    };

    bills.push(data);
    saveData();

    showToast("Bill generated successfully!");
    document.getElementById("billForm").reset();
    renderBillsTable(document.getElementById("searchInput").value || "");
}

window.toggleBillStatus = function (index) {
    if (!bills[index]) return;

    bills[index].status = bills[index].status === "Paid" ? "Unpaid" : "Paid";
    saveData();
    renderBillsTable(document.getElementById("searchInput").value || "");
};

// ─────────────────────────────
// REPORTS MODULE (DOWNLOAD PATIENT DATA)
// ─────────────────────────────

function renderReportsModule(container) {
    container.innerHTML = `
        <h2>Patients Reports</h2>

        <p style="margin-bottom:15px;font-weight:600;color:#444;">
            Download / Print all patient records.
        </p>

        <div style="display:flex;gap:15px;flex-wrap:wrap;margin-bottom:20px;">
            <button class="download-btn" onclick="downloadPatientsReportCSV()">
                <i class="fas fa-file-csv"></i> Download CSV
            </button>

            <button class="download-btn" onclick="downloadPatientsReportPDF()">
                <i class="fas fa-file-pdf"></i> Download PDF
            </button>

            <button class="download-btn" onclick="printPatientsReport()">
                <i class="fas fa-print"></i> Print Report
            </button>
        </div>

        <div class="table-container" style="margin-top:20px;">
            <table id="patientsReportTable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Contact</th>
                        <th>Address</th>
                        <th>Disease</th>
                    </tr>
                </thead>
                <tbody>
                    ${patients.map(p => `
                        <tr>
                            <td>${p.name}</td>
                            <td>${p.age}</td>
                            <td>${p.gender}</td>
                            <td>${p.contact}</td>
                            <td>${p.address}</td>
                            <td>${p.disease}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

// ✅ CSV DOWNLOAD
window.downloadPatientsReportCSV = function () {
    if (patients.length === 0) {
        showToast("No patient records available!", "error");
        return;
    }

    let csvContent = "Name,Age,Gender,Contact,Address,Disease\n";

    patients.forEach(p => {
        csvContent += `${p.name},${p.age},${p.gender},${p.contact},${p.address},${p.disease}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Patients_Report.csv";
    a.click();

    window.URL.revokeObjectURL(url);
    showToast("CSV report downloaded successfully!");
};

// ✅ PDF DOWNLOAD
window.downloadPatientsReportPDF = function () {
    if (patients.length === 0) {
        showToast("No patient records available!", "error");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Hospital Management System", 20, 20);

    doc.setFontSize(13);
    doc.text("Patients Report", 20, 30);

    doc.setFontSize(10);

    let y = 45;
    doc.text("Name", 20, y);
    doc.text("Age", 55, y);
    doc.text("Gender", 70, y);
    doc.text("Contact", 95, y);
    doc.text("Disease", 150, y);

    y += 10;

    patients.forEach((p, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.text(String(p.name), 20, y);
        doc.text(String(p.age), 55, y);
        doc.text(String(p.gender), 70, y);
        doc.text(String(p.contact), 95, y);
        doc.text(String(p.disease), 150, y);

        y += 10;
    });

    doc.save("Patients_Report.pdf");
    showToast("PDF report downloaded successfully!");
};

// ✅ PRINT REPORT
window.printPatientsReport = function () {
    if (patients.length === 0) {
        showToast("No patient records available!", "error");
        return;
    }

    let printWindow = window.open("", "", "width=900,height=650");

    printWindow.document.write(`
        <html>
        <head>
            <title>Patients Report</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }
                h2 {
                    text-align: center;
                    margin-bottom: 20px;
                    color: #0d6efd;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                th, td {
                    border: 1px solid #ccc;
                    padding: 10px;
                    text-align: left;
                }
                th {
                    background: #0d6efd;
                    color: white;
                }
            </style>
        </head>
        <body>
            <h2>Hospital Management System - Patients Report</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Contact</th>
                        <th>Address</th>
                        <th>Disease</th>
                    </tr>
                </thead>
                <tbody>
                    ${patients.map(p => `
                        <tr>
                            <td>${p.name}</td>
                            <td>${p.age}</td>
                            <td>${p.gender}</td>
                            <td>${p.contact}</td>
                            <td>${p.address}</td>
                            <td>${p.disease}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);

    showToast("Print preview opened!");
};


// ─────────────────────────────
// Delete Helper
// ─────────────────────────────
window.deleteItem = function (module, index) {
    showConfirmDelete(() => {
        if (module === "doctors") doctors.splice(index, 1);
        if (module === "patients") patients.splice(index, 1);
        if (module === "appointments") appointments.splice(index, 1);
        if (module === "bills") bills.splice(index, 1);

        saveData();
        showToast("Item deleted!");

        globalSearch();
    });
};

// ─────────────────────────────
// Global Search
// ─────────────────────────────
window.globalSearch = function () {
    const term = document.getElementById("searchInput")?.value.trim() || "";
    const title = document.querySelector("#content h2")?.textContent.toLowerCase() || "";

    if (title.includes("doctor")) renderDoctorsTable(term);
    else if (title.includes("patient")) renderPatientsTable(term);
    else if (title.includes("appointment")) renderAppointmentsTable(term);
    else if (title.includes("bill")) renderBillsTable(term);
};

// ─────────────────────────────
// Sidebar Toggle
// ─────────────────────────────
function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleSidebar");

    if (!sidebar || !toggleBtn) return;

    toggleBtn.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle("show");
        } else {
            sidebar.classList.toggle("collapsed");
        }
    });
}

// ─────────────────────────────
// Initialization
// ─────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

    // Login/Register Page
    document.getElementById("loginForm")?.addEventListener("submit", loginAdmin);
    document.getElementById("registerForm")?.addEventListener("submit", registerAdmin);

    // Dashboard
    if (document.querySelector(".dashboard")) {

        if (!isLoggedIn()) {
            window.location.href = "index.html";
            return;
        }

        initSidebar();
        showModule("dashboard");

        document.getElementById("searchInput")?.addEventListener("input", globalSearch);

        document.querySelectorAll("#confirmModal button").forEach(btn => {
            btn.addEventListener("click", () => {
                confirmDelete(btn.textContent.toLowerCase().includes("yes"));
            });
        });
    }
});
