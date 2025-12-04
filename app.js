const bankStoreKey = "allInOneMoneyBank";
const employeeKey = "allInOneMoneyBank_employees";
const clientKey = "allInOneMoneyBank_clients";
const transactionKey = "allInOneMoneyBank_transactions";

const salaryMap = {
  Manager: 50000,
  "Assistant Manager": 45000,
  Casher: 25000,
  Officer: 25000,
  "Assistant Officer": 19000,
};

const otpBuffer = {
  employee: null,
  client: null,
};

const bankState = {
  name: "All in One Money Bank",
  admin: { id: "111111", password: "111111", name: "ArunChandran" },
  balance: 10_000_000_000,
  // NEW: Centralized Contact Info to avoid redundancy in HTML files
  contact: {
    head: "Arun Chandran",
    address: "Arankam Kuppam, Pulicat, Ponneri, 601205",
    email: "support@allinonemoneybank.com",
    phone: "+91 90000 00000",
  },
};

// Data is saved permanently in the browser's localStorage
let employees = JSON.parse(localStorage.getItem(employeeKey) ?? "[]");
let clients = JSON.parse(localStorage.getItem(clientKey) ?? "[]");
let transactions = JSON.parse(localStorage.getItem(transactionKey) ?? "[]");

localStorage.setItem(bankStoreKey, JSON.stringify(bankState));

const $ = (selector) => document.querySelector(selector);
const sessionKey = "allInOneMoneyBank_session";
const pageRole = document.body?.dataset?.page ?? "home";

const employeeIdField = $("#employeeId");
const clientIdField = $("#clientId");

const loginForm = $("#loginForm");
const loginStatus = $("#loginStatus");
const adminDashboard = $("#admin-dashboard");
const employeePanel = $("#employee-panel");
const clientPanel = $("#client-panel");
const bankBalanceBtn = $("#bankBalanceBtn");
const bankBalanceDisplay = $("#bankBalanceDisplay");
const employeeList = $("#employeeList");
const clientList = $("#clientList");

const employeeForm = $("#employeeForm");
const employeeSalaryField = $("#employeeSalary");
const employeePasswordField = $("#employeePassword");
const employeeResult = $("#employeeResult");
const employeeSummary = $("#employeeSummary");
const downloadEmployeePdfBtn = $("#downloadEmployeePdf");

const clientForm = $("#clientForm");
const clientResult = $("#clientResult");
const clientSummary = $("#clientSummary");
const downloadClientPdfBtn = $("#downloadClientPdf");

const employeeDashboard = $("#employee-dashboard");

const clientDashboard = $("#client-dashboard");

const clientDetailsView = $("#clientDetailsView");
const clientLookupForm = $("#clientLookupForm");
const clientUpdateForm = $("#clientUpdateForm");
const clientBalanceForm = $("#clientBalanceForm");
const clientBalanceDisplay = $("#clientBalanceDisplay");
const clientTransferMessage = $("#clientTransferMessage");
const clientToBankForm = $("#clientToBankForm");

const clientDetailsSummary = $("#clientDetailsSummary");
const clientTransferForm = $("#clientTransferForm");
const clientTransferStatus = $("#clientTransferStatus");
const statementResults = $("#statementResults"); // Note: This is unused in the new Client tab.
const statementForm = $("#statementForm"); // Note: This is unused in the new Client tab.
const downloadStatementPdfBtn = $("#downloadStatementPdf");

const adminCreditForm = $("#adminCreditForm");
const adminCreditStatus = $("#adminCreditStatus");
const employeeSummaryDisplayArea = $("#employeeSummaryDisplayArea");
const employeeSummaryContent = $("#employeeSummaryContent");
const employeeCreditForm = $("#employeeCreditForm");
const employeeCreditStatus = $("#employeeCreditStatus");

const downloadDebitCardPdfBtn = $("#downloadDebitCardPdf");
const externalTransferForm = $("#externalTransferForm"); // Client Portal External Transfer
const externalTransferStatus = $("#externalTransferStatus");

const adminExternalTransferForm = $("#adminExternalTransferForm");
const adminExternalTransferStatus = $("#adminExternalTransferStatus");

const employeeExternalTransferForm = $("#employeeExternalTransferForm");
const employeeExternalTransferStatus = $("#employeeExternalTransferStatus");

// NEW TRANSACTION REPORT CONSTANTS
const adminReportForm = $("#adminReportForm");
const employeeReportForm = $("#employeeReportForm");
const employeeReportResults = $("#employeeReportResults");
const downloadEmployeeReportPdfBtn = $("#downloadEmployeeReportPdf");

// NEW: Client side statement elements
const clientStatementDaysForm = $("#clientStatementDaysForm");
const clientStatementDaysResult = $("#clientStatementDaysResult");


// NEW: Function to render the contact footer content (Redundancy Fix)
function renderContactFooter() {
  const contactDetails = $(".contact-card .contact-details");
  if (!contactDetails) return;
  
  const { head, address, email, phone } = bankState.contact;
  
  contactDetails.innerHTML = `
    <p><strong>${head}</strong>, Bank Head</p>
    <p>${address}</p>
    <p>Email: ${email} | Phone: ${phone}</p>
  `;
}


function setSession(session) {
  if (!session) return;
  localStorage.setItem(sessionKey, JSON.stringify(session));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(sessionKey));
  } catch (error) {
    console.error("Unable to parse session", error);
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(sessionKey);
}

function requireRole(role) {
  const session = getSession();
  if (!session || session.role !== role) {
    window.location.href = "index.html";
    return null;
  }
  return session;
}

const statementPeriods = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  halfyearly: 182,
  yearly: 365,
};

let currentEmployee = null;
let currentClient = null;
let currentRole = null;
let latestEmployee = null;
let latestClient = null;
let latestStatementLines = [];
let latestReportLines = []; // New buffer for general reports

function saveEmployees() {
  localStorage.setItem(employeeKey, JSON.stringify(employees));
}

function saveClients() {
  localStorage.setItem(clientKey, JSON.stringify(clients));
}

function saveTransactions() {
  localStorage.setItem(transactionKey, JSON.stringify(transactions));
}

function generateEmployeeId() {
  if (!employeeIdField) return "";
  const id = `EMP${(employees.length + 1).toString().padStart(4, "0")}`;
  employeeIdField.value = id;
  return id;
}

function generateClientId() {
  if (!clientIdField) return "";
  const id = `CLT${(clients.length + 1).toString().padStart(4, "0")}`;
  clientIdField.value = id;
  return id;
}

function generateEmployeePassword() {
  const pin = Math.floor(10000 + Math.random() * 90000).toString();
  if (employeePasswordField) {
    employeePasswordField.value = pin;
  }
  return pin;
}

/**
 * Generates all debit card and security details (Card Number, PIN, Expiry, CVV).
 */
function generateCardDetails() {
  // Generate 16-digit Card Number
  let cardNumber = "";
  while (cardNumber.length < 16) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  
  // Generate 5-digit PIN
  const pin = Math.floor(10000 + Math.random() * 90000).toString();

  // Generate 3-digit CVV
  const cvv = Math.floor(100 + Math.random() * 900).toString();

  // Generate Expiry Date (4 years from now, next month)
  const today = new Date();
  const expiryYear = (today.getFullYear() % 100) + 4;
  const expiryMonth = (today.getMonth() + 2).toString().padStart(2, '0');
  const expiryDate = `${expiryMonth}/${expiryYear}`; // MM/YY
  
  // Update fields on the Client Creation form if they exist
  const cardField = $("#clientDebitCard");
  const pinField = $("#clientPin");
  const expiryField = $("#clientDebitCardExpiry");
  const cvvField = $("#clientDebitCardCvv");

  if (cardField) cardField.value = cardNumber;
  if (pinField) pinField.value = pin;
  if (expiryField) expiryField.value = expiryDate;
  if (cvvField) cvvField.value = cvv;
  
  return { cardNumber, pin, expiryDate, cvv };
}


function sendOtp(type, mobileFieldId) {
  const field = $(mobileFieldId);
  // MODIFIED: Use setStatus for better UX instead of just returning and silent error.
  if (!field) {
    setStatus($("#loginStatus"), "Mobile number field is missing.", true); 
    return;
  }
  const mobile = field.value.trim();
  if (!mobile) {
    // OLD: alert("Enter mobile number first.");
    setStatus($("#loginStatus"), "Enter mobile number first.", true); // IMPROVED UX
    return;
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpBuffer[type] = otp;
  // OLD: alert(`OTP sent to ${mobile} (demo OTP: ${otp})`);
  // IMPROVED UX, use a general status element if available
  const statusElement = $("#loginStatus") ?? $("#employeeResult") ?? $("#clientResult") ?? $("#adminCreditStatus");
  setStatus(statusElement, `OTP sent to ${mobile} (demo OTP: ${otp}).`, false); 
}

function verifyOtp(type, inputValue) {
  return otpBuffer[type] && otpBuffer[type] === inputValue.trim();
}

function fileToBase64(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.readAsDataURL(file);
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function showElement(el) {
  if (!el) return;
  el.classList.remove("hidden");
}

function hideElement(el) {
  if (!el) return;
  el.classList.add("hidden");
}

function hideAllDashboards() {
  [adminDashboard, employeeDashboard, clientDashboard].forEach((panel) => {
    if (panel) hideElement(panel);
  });
}

function activateDashboard(role) {
  hideAllDashboards();
  if (role === "admin") {
    showElement(adminDashboard);
  } else if (role === "employee") {
    showElement(employeeDashboard);
  } else if (role === "client") {
    showElement(clientDashboard);
  }
  currentRole = role;
}

function setStatus(el, message, isError = false) {
  if (!el) return;
  el.textContent = message;
  if (isError) {
    el.classList.add("error");
  } else {
    el.classList.remove("error");
  }
}

function buildEmployeeSummary(employee) {
  const imageHtml = employee.image ? `<img src="${employee.image}" alt="${employee.name} photo" class="user-photo"/>` : '';

  return `${imageHtml}Employee ID: ${employee.id}
Name: ${employee.name}
Age: ${employee.age}
Address: ${employee.address}
Email: ${employee.email}
Aadhaar: ${employee.aadhaar}
Mobile: ${employee.mobile}
Position: ${employee.position}
Salary: ${formatCurrency(employee.salary)}
Login Password: ${employee.password}`;
}

// MODIFIED: Added Expiry and CVV
function buildClientSummary(client) {
  const imageHtml = client.image ? `<img src="${client.image}" alt="${client.name} photo" class="user-photo"/>` : '';

  return `${imageHtml}Client ID: ${client.id}
Name: ${client.name}
Age: ${client.age}
DOB: ${client.dob}
Address: ${client.address}
Email: ${client.email}
Aadhaar: ${client.aadhaar}
Mobile: ${client.mobile}
PAN: ${client.pan}
Account Type: ${client.accountType}
Current Balance: ${formatCurrency(client.balance)}
Debit Card No: ${client.debitCard}
Expiry: ${client.cardExpiry}
CVV: ${client.cardCvv}
Security PIN: ${client.pin}`;
}

function renderEmployeeList() {
  if (!employeeList) return;
  employeeList.innerHTML = employees
    .map(
      (emp) => `
        <div class="record-row">
          <strong>${emp.id}</strong>
          <span>${emp.name} (${emp.position})</span>
          <div class="record-actions">
            <button class="btn secondary small" data-view-employee="${emp.id}">View</button>
            <button class="btn secondary small" data-download-employee="${emp.id}">PDF</button>
          </div>
        </div>
      `
    )
    .join("");
}

function renderClientList() {
  if (!clientList) return;
  clientList.innerHTML = clients
    .map(
      (client) => `
        <div class="record-row">
          <strong>${client.id}</strong>
          <span>${client.name} (${formatCurrency(client.balance)})</span>
          <div class="record-actions">
            <button class="btn secondary small" data-view-client="${client.id}">View</button>
            <button class="btn secondary small" data-download-client="${client.id}">PDF</button>
          </div>
        </div>
      `
    )
    .join("");
}

function findClientById(id) {
  return clients.find((c) => c.id === id.trim().toUpperCase());
}

function renderClientDetails() {
  if (!currentClient || !clientDetailsSummary) return;
  clientDetailsSummary.innerHTML = buildClientSummary(currentClient);
}


function showPanel(panelId) {
  document.querySelectorAll("[data-panel]").forEach((btn) => {
    const panel = $(`#${btn.dataset.panel}`);
    if (panel) hideElement(panel);
  });
  const panel = $(`#${panelId}`);
  if (panel) showElement(panel);
}

// Transaction recording utility
function recordTransaction(clientId, type, amount, description) {
  const tx = {
    id: transactions.length + 1,
    clientId,
    type, // 'credit' or 'debit'
    amount,
    description,
    date: new Date().toISOString(),
  };
  transactions.push(tx);
  saveTransactions();
}

/**
 * Filters all transactions by date only (for admin reports).
 * @param {number} days - The number of days back to filter.
 */
function filterAllTransactions(days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return transactions
    .filter((tx) => new Date(tx.date) >= cutoff)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort latest first
}

/**
 * Filters transactions by Client ID or Employee ID (which is stored in the description).
 * @param {string} id - Client ID (CLTxxxx) or Employee ID (EMPxxxx).
 * @param {number} days - The number of days back to filter.
 */
function filterIdTransactions(id, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return transactions.filter(
    (tx) =>
      new Date(tx.date) >= cutoff &&
      (tx.clientId === id || tx.description.includes(id))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Client-specific statement filter (using the old function name for backward compatibility)
function filterTransactions(clientId, period) {
  const days = statementPeriods[period] ?? 30;
  return filterIdTransactions(clientId, days);
}

/**
 * Renders transaction list to HTML and saves lines for PDF.
 * @param {Array<Object>} list - The filtered transaction list.
 * @param {HTMLElement} resultEl - The element to render the HTML list into.
 * @returns {Array<string>} An array of formatted lines for PDF generation.
 */
function renderTransactionList(list, resultEl) {
  let html = list.length === 0 ? "<p class='muted'>No transactions found for the selected period.</p>" : "";
  const lines = [];

  list.forEach((tx) => {
    const date = new Date(tx.date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const typeClass = tx.type === "credit" ? "credit" : "debit";
    const sign = tx.type === "credit" ? "+" : "-";

    html += `
      <div class="transaction-row ${typeClass}">
        <span class="date">${date}</span>
        <span class="description">${tx.description}</span>
        <span class="amount">${sign} ${formatCurrency(tx.amount)}</span>
      </div>
    `;

    lines.push(`Date: ${date} | Type: ${tx.type.toUpperCase()} | Amount: ${formatCurrency(tx.amount)} | Description: ${tx.description}`);
  });

  resultEl.innerHTML = html;
  return lines;
}

// PDF Generation Functions
function downloadPdf(title, lines) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(title, 10, 15);
  doc.setFontSize(11);
  const splitLines = doc.splitTextToSize(lines, 180);
  doc.text(splitLines, 10, 30);
  doc.save(`${title.replace(/\s+/g, "_").toLowerCase()}.pdf`);
}

// IMPLEMENTED: Debit Card PDF Download Function
function downloadDebitCardPdf(client) {
  const { jsPDF } = window.jspdf;
  // Set format to standard credit card size (85.6mm x 53.98mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [85.6, 53.98],
  });
  const cardWidth = 85.6;
  const cardHeight = 53.98;

  // --- Card Design (Front) ---
  // Background (Dark Blue/Purple)
  doc.setFillColor(50, 50, 150);
  doc.rect(0, 0, cardWidth, cardHeight, 'F');

  // Bank Logo/Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(255, 255, 255);
  doc.text(bankState.name.toUpperCase(), 3, 5);

  // Card Chip (Placeholder)
  doc.setFillColor(200, 200, 200);
  doc.circle(5, 15, 3, 'F');

  // Card Number
  doc.setFontSize(8);
  // Format card number with spaces (XXXX XXXX XXXX XXXX)
  const formattedCardNumber = client.debitCard.replace(/(.{4})/g, '$1 ').trim();
  doc.text(formattedCardNumber, 43, 27, { align: 'center' });

  // Card Holder Name
  doc.setFontSize(6);
  doc.text(client.name.toUpperCase(), 3, 38);

  // Expiry Date Label
  doc.setFontSize(4);
  doc.text("VALID\nTHRU", 50, 37.5, { align: 'right' });

  // Expiry Date Value
  doc.setFontSize(6);
  doc.text(client.cardExpiry, 52.5, 39);

  // Card Type (VISA/Mastercard placeholder)
  doc.setFontSize(7);
  doc.text("VISA", cardWidth - 10, cardHeight - 3);

  // --- Card Design (Back) ---
  doc.addPage([cardWidth, cardHeight], 'landscape');
  doc.setFillColor(40, 40, 140);
  doc.rect(0, 0, cardWidth, cardHeight, 'F');

  // Magnetic Stripe (Black Bar)
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 8, cardWidth, 6, 'F');

  // Signature Panel/White Stripe
  doc.setFillColor(255, 255, 255);
  doc.rect(3, 20, cardWidth - 6, 5, 'F');

  // CVV (3-digit code)
  doc.setFontSize(6);
  doc.setTextColor(0, 0, 0);
  doc.text(`CVV: ${client.cardCvv}`, cardWidth - 15, 24, { align: 'right' });

  // PIN (5-digit code - hidden on card, but for reference in this secure PDF)
  doc.setTextColor(255, 255, 255);
  doc.text(`Security PIN (DO NOT SHARE): ${client.pin}`, 3, cardHeight - 5);


  doc.save(`debit_card_${client.id}.pdf`);
}

function downloadEmployeePdf(employee) {
  const lines = buildEmployeeSummary(employee).split("\n");
  lines.push("\n--- Appointment Letter ---\n");
  lines.push(`Dear ${employee.name},`);
  lines.push(
    `We are pleased to offer you the position of ${employee.position} at ${bankState.name}.`
  );
  lines.push(
    `Your monthly salary will be ${formatCurrency(employee.salary)}.`
  );
  lines.push(
    "We look forward to your valuable contribution to our bank. Please sign and return a copy of this letter."
  );
  lines.push("\nSincerely,");
  lines.push(`Arun Chandran, Bank Head`);

  downloadPdf(`Employee_Details_and_Appointment_${employee.id}`, lines);
}

function downloadClientPdf(client) {
  const lines = buildClientSummary(client).split("\n");
  downloadPdf(`Client_Details_${client.id}`, lines);
}

function refreshAutoFields() {
  generateEmployeeId();
  generateClientId();
  generateEmployeePassword();
  generateCardDetails(); // Unified card details generation
}

function initializePageRole() {
  if (pageRole === "home") {
    hideAllDashboards();
  }
  
  // NEW: Render footer on all pages (Redundancy Fix)
  renderContactFooter(); 
  
  const session = requireRole(pageRole);
  if (!session) return;
  if (pageRole === "admin") {
    renderEmployeeList();
    renderClientList();
    refreshAutoFields();
    showElement(adminDashboard);
  } else if (pageRole === "employee") {
    currentEmployee = employees.find((emp) => emp.id === session.id);
    if (!currentEmployee) {
      clearSession();
      window.location.href = "index.html";
      return;
    }
    refreshAutoFields();
    showElement(employeeDashboard);
  } else if (pageRole === "client") {
    currentClient = clients.find((client) => client.id === session.id);
    if (!currentClient) {
      clearSession();
      window.location.href = "index.html";
      return;
    }
    renderClientDetails();
    showElement(clientDashboard);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializePageRole();
});

// Logout logic
document.querySelectorAll(".hero__cta a.btn").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.textContent === "Switch User") {
      clearSession();
      // Let the default navigation happen to index.html
    }
  });
});

// Employee form logic
const employeePositionField = $("#employeePosition");
if (employeePositionField) {
  employeePositionField.addEventListener("change", (event) => {
    const position = event.target.value;
    const salary = salaryMap[position];
    if (employeeSalaryField) {
      employeeSalaryField.value = salary ?? "";
    }
  });
}

const sendEmployeeOtpBtn = $("#sendEmployeeOtp");
if (sendEmployeeOtpBtn) {
  sendEmployeeOtpBtn.addEventListener("click", () => sendOtp("employee", "#employeeMobile"));
}

if (employeeForm) {
  employeeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const employeeOtp = $("#employeeOtp").value;
    if (!verifyOtp("employee", employeeOtp)) {
      setStatus(employeeResult, "OTP verification failed. Please try again.", true);
      return;
    }

    const imageFile = $("#employeeImage").files[0];
    const image = await fileToBase64(imageFile);

    const employee = {
      id: $("#employeeId").value,
      name: $("#employeeName").value,
      age: Number($("#employeeAge").value),
      position: $("#employeePosition").value,
      salary: Number($("#employeeSalary").value),
      password: $("#employeePassword").value,
      mobile: $("#employeeMobile").value,
      aadhaar: $("#employeeAadhaar").value,
      email: $("#employeeEmail").value,
      address: $("#employeeAddress").value,
      image,
      createdAt: new Date().toISOString(),
    };

    employees.push(employee);
    saveEmployees();
    latestEmployee = employee;
    renderEmployeeList();
    employeeSummary.textContent = buildEmployeeSummary(employee);
    showElement(employeeResult);
    // OLD: alert("Employee created successfully.");
    setStatus(employeeResult, "Employee created successfully.", false); // IMPROVED UX
    employeeForm.reset();
    otpBuffer.employee = null;
  });
}

// Client form logic

const sendClientOtpBtn = $("#sendClientOtp");
if (sendClientOtpBtn) {
  sendClientOtpBtn.addEventListener("click", () => sendOtp("client", "#clientMobile"));
}

if (clientForm) {
  clientForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const clientOtp = $("#clientOtp").value;
    if (!verifyOtp("client", clientOtp)) {
      setStatus(clientResult, "OTP verification failed. Please try again.", true);
      return;
    }

    const imageFile = $("#clientImage").files[0];
    const image = await fileToBase64(imageFile);

    const debitCard = $("#clientDebitCard").value;
    const cardExpiry = $("#clientDebitCardExpiry").value;
    const cardCvv = $("#clientDebitCardCvv").value;
    const pin = $("#clientPin").value;

    const client = {
      id: $("#clientId").value,
      accountType: $("#clientAccountType").value,
      name: $("#clientName").value,
      age: Number($("#clientAge").value),
      dob: $("#clientDob").value,
      address: $("#clientAddress").value,
      email: $("#clientEmail").value,
      aadhaar: $("#clientAadhaar").value,
      mobile: $("#clientMobile").value,
      pan: $("#clientPan").value,
      image,
      debitCard,
      cardExpiry,
      cardCvv,
      pin,
      balance: 0,
      createdAt: new Date().toISOString(),
    };

    clients.push(client);
    saveClients();
    latestClient = client;
    renderClientList();
    clientSummary.textContent = buildClientSummary(client);
    showElement(clientResult);
    // OLD: alert("Client created successfully.");
    setStatus(clientResult, "Client created successfully.", false); // IMPROVED UX
    clientForm.reset();
    otpBuffer.client = null;
    refreshAutoFields();
  });
}

if (downloadClientPdfBtn) {
  downloadClientPdfBtn.addEventListener("click", () => {
    if (!latestClient) return;
    downloadClientPdf(latestClient);
  });
}

if (downloadDebitCardPdfBtn) {
  downloadDebitCardPdfBtn.addEventListener("click", () => {
    if (!currentClient) {
      // OLD: alert("Please log in as a client to download the card."); return;
      setStatus(clientTransferStatus ?? externalTransferStatus, "Please log in as a client to download the card.", true); // IMPROVED UX
      return;
    }
    downloadDebitCardPdf(currentClient);
  });
}

// ... (Other event listeners and functions)

if (adminReportForm) {
  adminReportForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const periodKey = $("#adminReportPeriod").value;
    const days = statementPeriods[periodKey];
    if (!days) {
      // OLD: alert("Please select a valid period."); return;
      setStatus($("#adminReportResults"), "Please select a valid report period.", true); // IMPROVED UX
      return;
    }
    const list = filterAllTransactions(days); // Note: admin report shows all transactions
    latestReportLines = renderTransactionList(list, $("#adminReportResults"));
    showElement($("#adminReportResults"));
    downloadPdf("Bank_Transaction_Report", latestReportLines);
  });
}

if (employeeReportForm) {
  employeeReportForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const periodKey = $("#employeeReportPeriod").value;
    const days = statementPeriods[periodKey];
    if (!days) {
      // OLD: alert("Please select a valid period."); return;
      setStatus($("#employeeReportResults"), "Please select a valid report period.", true); // IMPROVED UX
      return;
    }
    const list = filterAllTransactions(days);
    latestReportLines = renderTransactionList(list, employeeReportResults);
    showElement(employeeReportResults);
    downloadPdf("Bank_Transaction_Report", latestReportLines);
  });
                               }
