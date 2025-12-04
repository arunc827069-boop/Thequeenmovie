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
  if (!field) return;
  const mobile = field.value.trim();
  if (!mobile) {
    alert("Enter mobile number first.");
    return;
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpBuffer[type] = otp;
  alert(`OTP sent to ${mobile} (demo OTP: ${otp})`);
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
Account Type: ${client.accountType}
PAN: ${client.pan}
Debit Card: ${client.debitCard}
Expiry: ${client.cardExpiry}
CVV: ${client.cardCvv}
Security PIN: ${client.pin}
Balance: ${formatCurrency(client.balance)}`;
}

function buildAppointmentLetter(employee) {
  return `ALL IN ONE MONEY BANK
Offer of Employment

Date: ${new Date().toLocaleDateString()}

Dear ${employee.name},

We are pleased to appoint you as ${employee.position} at All in One Money Bank.

Employee ID: ${employee.id}
Reporting To: Bank Head, Arun Chandran
Salary Package: ${formatCurrency(employee.salary)} (per month)

Your appointment is effective immediately. Kindly report to headquarters with original documents within 7 days.

Regards,
All in One Money Bank`;
}

function showPanel(panelId) {
  [employeePanel, clientPanel].forEach((panel) => hideElement(panel));
  const panel = document.getElementById(panelId);
  if (panel) {
    showElement(panel);
  }
}

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
    doc.setFillColor(50, 40, 70);
    doc.roundedRect(0, 0, cardWidth, cardHeight, 3, 3, 'F');

    // Bank Name
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(5);
    doc.text("ALL IN ONE MONEY BANK", 5, 5);

    // Chip Icon (Simulated)
    doc.setFillColor(200, 180, 100);
    doc.roundedRect(5, 10, 8, 6, 1, 1, 'F');

    // Card Number (Formatted)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const formattedCardNumber = client.debitCard.match(/.{1,4}/g).join(' ');
    doc.text(formattedCardNumber, cardWidth / 2, cardHeight / 2 + 5, { align: 'center' });
    
    // Card Holder Name
    doc.setFontSize(5);
    doc.setFont("helvetica", "normal");
    doc.text("CARD HOLDER", 5, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text(client.name.toUpperCase(), 5, 43);

    // Expiry Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(4);
    doc.text("VALID\nTHRU", 60, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text(client.cardExpiry, 65, 43);
    
    // Logo (Simulated)
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(255, 165, 0);
    doc.setFontSize(10);
    doc.text("VISA", 75, 45);
    
    // --- Card Design (Back - New Page) ---
    doc.addPage(cardWidth, cardHeight, 'landscape');
    
    // Background (Dark Blue/Purple)
    doc.setFillColor(50, 40, 70);
    doc.roundedRect(0, 0, cardWidth, cardHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);

    // Magnetic Stripe (Simulated)
    doc.setFillColor(30, 30, 30);
    doc.rect(0, 5, cardWidth, 8, 'F');

    // Signature Panel (Simulated)
    doc.setFillColor(200, 200, 200);
    doc.rect(5, 20, 70, 8, 'F');
    
    // CVV
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0); // Black text on signature panel
    doc.setFontSize(6);
    doc.text(client.cardCvv, 75, 25, { align: 'right' });
    
    // Security Warning
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(4);
    doc.text("Security Code (CVV): This card is for demonstration purposes only. Do not share.", 5, 45);

    doc.save(`Debit_Card_${client.id}.pdf`);
}

function findClientById(id) {
  return clients.find((c) => c.id === id);
}

function recordTransaction(clientId, type, amount, description) {
  const entry = {
    id: crypto.randomUUID(),
    clientId,
    type,
    amount,
    description,
    date: new Date().toISOString(),
  };
  transactions.push(entry);
  saveTransactions();
  return entry;
}

/**
 * Filters ALL transactions in the bank for a given period in days.
 * @param {number} days - The number of days back to filter.
 */
function filterAllTransactions(days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return transactions.filter(
    (tx) => new Date(tx.date) >= cutoff
  ).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort latest first
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
        (tx) => new Date(tx.date) >= cutoff && 
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
 * @param {Array} list - The list of transaction objects.
 * @param {HTMLElement} resultEl - The element to render the HTML list into.
 * @param {string} idPrefix - The prefix for the transaction ID (e.g., 'Client' or 'Bank').
 */
function renderTransactionLines(list, resultEl, idPrefix = 'Client') {
  if (!list.length) {
    resultEl.textContent = `No ${idPrefix} transactions for this period.`;
    // Clear both buffers just in case
    latestReportLines = [];
    latestStatementLines = [];
    // Hide download button for Employee report if no results
    if (idPrefix !== 'Client') {
        hideElement(downloadEmployeeReportPdfBtn);
    }
    return [];
  }
  const lines = list.map(
    (tx) =>
      `${new Date(tx.date).toLocaleString()} | ${tx.type.toUpperCase()} | ${formatCurrency(
        tx.amount
      )} | A/C: ${tx.clientId} | ${tx.description}`
  );
  resultEl.innerHTML = `<ul>${lines
    .map((line) => `<li>${line}</li>`)
    .join("")}</ul>`;
    
  if (idPrefix === 'Client') {
    latestStatementLines = lines; // Use for client tab
  } else {
    latestReportLines = lines; // Use for admin/employee reports
    showElement(downloadEmployeeReportPdfBtn); // Show download button for Employee report
  }
  return lines;
}

function renderStatementLines(list) {
  // This is kept for backward compatibility with the old client statement form if it were still active, 
  // but now the new clientStatementDaysResult is used
  return renderTransactionLines(list, statementResults, 'Client'); 
}


// Unified login
if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = $("#loginId").value.trim();
    const password = $("#loginPassword").value.trim();
    if (!id || !password) {
      setStatus(loginStatus, "Please enter both ID and password.", true);
      return;
    }
    if (id === bankState.admin.id) {
      if (password === bankState.admin.password) {
        setSession({ role: "admin", id });
        window.location.href = "admin.html";
      } else {
        setStatus(loginStatus, "Incorrect password for admin.", true);
      }
      return;
    }
    const employee = employees.find((emp) => emp.id === id);
    if (employee) {
      if (password === employee.password) {
        setSession({ role: "employee", id: employee.id });
        window.location.href = "employee.html";
      } else {
        setStatus(loginStatus, "Incorrect employee password.", true);
      }
      return;
    }
    const client = clients.find((c) => c.id === id);
    if (client) {
      if (password === client.pin) {
        setSession({ role: "client", id: client.id });
        window.location.href = "client.html";
      } else {
        setStatus(loginStatus, "Incorrect client PIN.", true);
      }
      return;
    }
    setStatus(loginStatus, "Account not found. Please check your ID.", true);
  });
}

// Admin buttons
document.querySelectorAll("[data-panel]").forEach((btn) => {
  btn.addEventListener("click", () => showPanel(btn.dataset.panel));
});

if (bankBalanceBtn) {
  bankBalanceBtn.addEventListener("click", () => {
    setStatus(
      bankBalanceDisplay,
      `Bank Own Account Balance: ${formatCurrency(bankState.balance)}`
    );
  });
}

// Employee form logic
const employeePositionSelect = $("#employeePosition");
if (employeePositionSelect) {
  employeePositionSelect.addEventListener("change", (event) => {
    const position = event.target.value;
    if (employeeSalaryField) {
      employeeSalaryField.value = position ? salaryMap[position] : "";
    }
  });
}

const sendEmployeeOtpBtn = $("#sendEmployeeOtp");
if (sendEmployeeOtpBtn) {
  sendEmployeeOtpBtn.addEventListener("click", () =>
    sendOtp("employee", "#employeeMobile")
  );
}

if (employeeForm) {
  employeeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const position = $("#employeePosition").value;
    const otpInput = $("#employeeOtp").value;
    if (!verifyOtp("employee", otpInput)) {
      alert("Invalid OTP. Please verify employee mobile.");
      return;
    }
    const image = await fileToBase64($("#employeeImage").files[0]);

    const employee = {
      id: employeeIdField.value,
      position,
      name: $("#employeeName").value,
      age: $("#employeeAge").value,
      address: $("#employeeAddress").value,
      email: $("#employeeEmail").value,
      aadhaar: $("#employeeAadhaar").value,
      mobile: $("#employeeMobile").value,
      salary: Number($("#employeeSalary").value),
      password: $("#employeePassword").value,
      image,
      createdAt: new Date().toISOString(),
    };
    employees.push(employee);
    saveEmployees();
    latestEmployee = employee;
    renderEmployeeList();
    employeeSummary.textContent = buildEmployeeSummary(employee);
    showElement(employeeResult);
    alert("Employee created successfully.");
    employeeForm.reset();
    otpBuffer.employee = null;
    refreshAutoFields();
  });
}

if (downloadEmployeePdfBtn) {
  downloadEmployeePdfBtn.addEventListener("click", () => {
    if (!latestEmployee) return;
    downloadEmployeePdf(latestEmployee);
  });
}

// Client form logic
const sendClientOtpBtn = $("#sendClientOtp");
if (sendClientOtpBtn) {
  sendClientOtpBtn.addEventListener("click", () =>
    sendOtp("client", "#clientMobile")
  );
}

if (clientForm) {
  clientForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const otpInput = $("#clientOtp").value;
    if (!verifyOtp("client", otpInput)) {
      alert("Invalid OTP. Please verify client mobile.");
      return;
    }
    const image = await fileToBase64($("#clientImage").files[0]);

    // Capture Debit Card fields
    const debitCard = $("#clientDebitCard").value;
    const cardExpiry = $("#clientDebitCardExpiry").value;
    const cardCvv = $("#clientDebitCardCvv").value;
    const pin = $("#clientPin").value;
    
    const client = {
      id: clientIdField.value,
      accountType: $("#clientAccountType").value,
      name: $("#clientName").value,
      age: $("#clientAge").value,
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
    alert("Client created successfully.");
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
            alert("Please log in as a client to download the card.");
            return;
        }
        downloadDebitCardPdf(currentClient);
    });
}

employeeList?.addEventListener("click", (event) => {
  const button = event.target.closest(
    "button[data-view-employee], button[data-download-employee]"
  );
  if (!button) return;
  const id =
    button.getAttribute("data-view-employee") ??
    button.getAttribute("data-download-employee");
  const employee = employees.find((emp) => emp.id === id);
  if (!employee) return;
  if (button.hasAttribute("data-view-employee")) {
    employeeSummaryContent.innerHTML = buildEmployeeSummary(employee).replace(
      /\n/g,
      "<br/>"
    );
    showElement(employeeSummaryDisplayArea);
  } else {
    downloadEmployeePdf(employee);
  }
});

clientList?.addEventListener("click", (event) => {
  const button = event.target.closest(
    "button[data-view-client], button[data-download-client]"
  );
  if (!button) return;
  const id =
    button.getAttribute("data-view-client") ??
    button.getAttribute("data-download-client");
  const client = clients.find((c) => c.id === id);
  if (!client) return;
  if (button.hasAttribute("data-view-client")) {
    alert(buildClientSummary(client));
  } else {
    downloadClientPdf(client);
  }
});

// Client lookup and updates (employee tools)
if (clientLookupForm) {
  clientLookupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = $("#lookupClientId").value.trim();
    const client = findClientById(id);
    if (!client) {
      setStatus(clientDetailsView, "Client not found.", true);
      hideElement(clientDetailsView);
      hideElement(clientUpdateForm);
      return;
    }
    // Populate update form
    $("#updateClientName").value = client.name;
    $("#updateClientDob").value = client.dob;
    $("#updateClientAddress").value = client.address;
    $("#updateClientMobile").value = client.mobile;
    $("#updateClientEmail").value = client.email;
    $("#updateClientPin").value = "";

    // Show details
    clientDetailsView.innerHTML = buildClientSummary(client).replace(
      /\n/g,
      "<br/>"
    );
    showElement(clientDetailsView);
    showElement(clientUpdateForm);
    latestClient = client;
  });
}

if (clientUpdateForm) {
  clientUpdateForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!latestClient) return;

    // Update fields
    latestClient.name = $("#updateClientName").value.trim();
    latestClient.dob = $("#updateClientDob").value.trim();
    latestClient.address = $("#updateClientAddress").value.trim();
    latestClient.mobile = $("#updateClientMobile").value.trim();
    latestClient.email = $("#updateClientEmail").value.trim();

    const newPin = $("#updateClientPin").value.trim();
    if (newPin) {
      latestClient.pin = newPin;
      alert(`Client PIN updated to: ${newPin}`);
    }

    const newImageFile = $("#updateClientImage").files[0];
    if (newImageFile) {
      latestClient.image = await fileToBase64(newImageFile);
      alert("Client photo updated.");
    }

    saveClients();
    setStatus(clientDetailsView, "Client details updated successfully!", false);
    clientDetailsView.innerHTML = buildClientSummary(latestClient).replace(
      /\n/g,
      "<br/>"
    );
    renderClientList();
  });
}

if (clientBalanceForm) {
  clientBalanceForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = $("#balanceClientId").value.trim();
    const client = findClientById(id);
    if (!client) {
      setStatus(clientBalanceDisplay, "Client not found.", true);
      return;
    }
    setStatus(
      clientBalanceDisplay,
      `Client Balance: ${formatCurrency(client.balance)}`
    );
  });
}

if (clientToBankForm) {
  clientToBankForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = $("#transferClientId").value.trim();
    const amount = Number($("#transferAmount").value);
    const client = findClientById(id);
    if (!client) {
      setStatus(clientTransferMessage, "Client not found.", true);
      return;
    }
    if (amount <= 0 || amount > client.balance) {
      setStatus(clientTransferMessage, "Invalid amount.", true);
      return;
    }
    client.balance -= amount;
    bankState.balance += amount;
    saveClients();
    localStorage.setItem(bankStoreKey, JSON.stringify(bankState));
    recordTransaction(
      client.id,
      "debit",
      amount,
      "Transfer to bank own account (Employee action)"
    );
    setStatus(
      clientTransferMessage,
      `Transferred ${formatCurrency(amount)} to bank account.`
    );
    renderClientList();
  });
}

// Admin-to-Client Money Transfer (Credit)
if (adminCreditForm) {
  adminCreditForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const clientId = $("#creditClientId").value.trim();
    const amount = Number($("#creditAmount").value);
    const client = findClientById(clientId);
    const adminId = bankState.admin.id;

    if (!client) {
      setStatus(adminCreditStatus, "Client not found.", true);
      return;
    }
    if (amount <= 0) {
      setStatus(adminCreditStatus, "Invalid amount.", true);
      return;
    }

    client.balance += amount;
    bankState.balance -= amount;

    saveClients();
    localStorage.setItem(bankStoreKey, JSON.stringify(bankState));

    recordTransaction(
      client.id,
      "credit",
      amount,
      `Credit from Admin (${adminId})`
    );

    setStatus(
      adminCreditStatus,
      `Credited ${formatCurrency(amount)} to ${client.name} (${client.id}). New Balance: ${formatCurrency(client.balance)}`
    );
    renderClientList();
    adminCreditForm.reset();
  });
}

// Employee-to-Client Money Transfer (Deposit/Credit)
if (employeeCreditForm) {
  employeeCreditForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const clientId = $("#employeeCreditClientId").value.trim();
    const amount = Number($("#employeeCreditAmount").value);
    const client = findClientById(clientId);
    const employeeId = currentEmployee ? currentEmployee.id : 'N/A'; 

    if (!client) {
      setStatus(employeeCreditStatus, "Client not found.", true);
      return;
    }
    if (amount <= 0) {
      setStatus(employeeCreditStatus, "Invalid amount.", true);
      return;
    }
    
    client.balance += amount;
    bankState.balance -= amount; 

    saveClients();
    localStorage.setItem(bankStoreKey, JSON.stringify(bankState));

    recordTransaction(
      client.id,
      "credit",
      amount,
      `Cash Deposit by Employee (${employeeId})`
    );

    setStatus(
      employeeCreditStatus,
      `Deposited ${formatCurrency(amount)} to ${client.name} (${client.id}). New Balance: ${formatCurrency(client.balance)}`
    );
    renderClientList();
    employeeCreditForm.reset();
  });
}

// Client-to-Client Transfer (Internal)
if (clientTransferForm) {
  clientTransferForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!currentClient) return;

    const receiverId = $("#transferReceiverId").value.trim();
    const amount = Number($("#transferAmount").value);
    const receiver = findClientById(receiverId);

    if (!receiver) {
      setStatus(clientTransferStatus, "Receiver Client ID not found.", true);
      return;
    }
    if (currentClient.id === receiver.id) {
      setStatus(clientTransferStatus, "Cannot transfer to the same account.", true);
      return;
    }
    if (amount <= 0 || amount > currentClient.balance) {
      setStatus(clientTransferStatus, "Insufficient balance or invalid amount.", true);
      return;
    }

    currentClient.balance -= amount;
    receiver.balance += amount;

    saveClients();

    recordTransaction(
      currentClient.id,
      "debit",
      amount,
      `Internal transfer to ${receiver.name} (${receiverId})`
    );
    recordTransaction(
      receiver.id,
      "credit",
      amount,
      `Internal transfer from ${currentClient.name} (${currentClient.id})`
    );

    setStatus(
      clientTransferStatus,
      `Transferred ${formatCurrency(amount)} to ${receiver.name}. New Balance: ${formatCurrency(currentClient.balance)}`
    );
    renderClientDetails();
    clientTransferForm.reset();
  });
}

// Client Portal: External Bank Transfer (Other Bank)
if (externalTransferForm) {
    externalTransferForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!currentClient) return;

        const receiverAccount = $("#externalReceiverAccount").value.trim();
        const ifscCode = $("#externalIfscCode").value.trim().toUpperCase();
        const receiverName = $("#externalReceiverName").value.trim();
        const amount = Number($("#externalTransferAmount").value);
        
        // Simple validation 
        if (amount <= 0 || amount > currentClient.balance) {
            setStatus(externalTransferStatus, "Insufficient balance or invalid amount.", true);
            return;
        }
        if (ifscCode.length !== 11) {
            setStatus(externalTransferStatus, "Invalid IFSC Code length.", true);
            return;
        }

        // Process Transfer: Debit client, money leaves the system to an external bank
        currentClient.balance -= amount;
        bankState.balance -= amount; // Money is leaving the bank's total system

        saveClients();
        localStorage.setItem(bankStoreKey, JSON.stringify(bankState));

        // Record transaction
        recordTransaction(
            currentClient.id,
            "debit",
            amount,
            `External Transfer to ${receiverName} (A/C: ${receiverAccount}, IFSC: ${ifscCode})`
        );

        // Update display
        setStatus(
            externalTransferStatus,
            `Successfully transferred ${formatCurrency(amount)} to ${receiverName} (External Bank). New Balance: ${formatCurrency(currentClient.balance)}`
        );
        renderClientDetails(); 
        externalTransferForm.reset();
    });
}

// Admin Initiate Client External Transfer
if (adminExternalTransferForm) {
    adminExternalTransferForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const senderId = $("#adminExternalSenderId").value.trim();
        const receiverAccount = $("#adminExternalReceiverAccount").value.trim();
        const ifscCode = $("#adminExternalIfscCode").value.trim().toUpperCase();
        const receiverName = $("#adminExternalReceiverName").value.trim();
        const amount = Number($("#adminExternalTransferAmount").value);
        const adminId = bankState.admin.id;

        const senderClient = findClientById(senderId);

        if (!senderClient) {
            setStatus(adminExternalTransferStatus, "Sender Client ID not found.", true);
            return;
        }
        if (amount <= 0 || amount > senderClient.balance) {
            setStatus(adminExternalTransferStatus, "Insufficient balance or invalid amount.", true);
            return;
        }
        if (ifscCode.length !== 11) {
            setStatus(adminExternalTransferStatus, "Invalid IFSC Code length.", true);
            return;
        }

        // Process Transfer: Debit client, money leaves the bank's system
        senderClient.balance -= amount;
        bankState.balance -= amount; 

        saveClients();
        localStorage.setItem(bankStoreKey, JSON.stringify(bankState));

        // Record transaction
        recordTransaction(
            senderClient.id,
            "debit",
            amount,
            `External Transfer to ${receiverName} (A/C: ${receiverAccount}, IFSC: ${ifscCode}) - Initiated by Admin (${adminId})`
        );

        // Update display
        setStatus(
            adminExternalTransferStatus,
            `Successfully transferred ${formatCurrency(amount)} from ${senderClient.id} to ${receiverName} (External Bank). New Client Balance: ${formatCurrency(senderClient.balance)}`
        );
        adminExternalTransferForm.reset();
        renderClientList(); // Refresh list to show updated balance
    });
}


// Employee Initiate Client External Transfer
if (employeeExternalTransferForm) {
    employeeExternalTransferForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!currentEmployee) return;

        const senderId = $("#employeeExternalSenderId").value.trim();
        const receiverAccount = $("#employeeExternalReceiverAccount").value.trim();
        const ifscCode = $("#employeeExternalIfscCode").value.trim().toUpperCase();
        const receiverName = $("#employeeExternalReceiverName").value.trim();
        const amount = Number($("#employeeExternalTransferAmount").value);
        const employeeId = currentEmployee.id;

        const senderClient = findClientById(senderId);

        if (!senderClient) {
            setStatus(employeeExternalTransferStatus, "Sender Client ID not found.", true);
            return;
        }
        if (amount <= 0 || amount > senderClient.balance) {
            setStatus(employeeExternalTransferStatus, "Insufficient balance or invalid amount.", true);
            return;
        }
        if (ifscCode.length !== 11) {
            setStatus(employeeExternalTransferStatus, "Invalid IFSC Code length.", true);
            return;
        }

        // Process Transfer: Debit client, money leaves the bank's system
        senderClient.balance -= amount;
        bankState.balance -= amount; 

        saveClients();
        localStorage.setItem(bankStoreKey, JSON.stringify(bankState));

        // Record transaction
        recordTransaction(
            senderClient.id,
            "debit",
            amount,
            `External Transfer to ${receiverName} (A/C: ${receiverAccount}, IFSC: ${ifscCode}) - Initiated by Employee (${employeeId})`
        );

        // Update display
        setStatus(
            employeeExternalTransferStatus,
            `Successfully transferred ${formatCurrency(amount)} from ${senderClient.id} to ${receiverName} (External Bank). New Client Balance: ${formatCurrency(senderClient.balance)}`
        );
        employeeExternalTransferForm.reset();
        renderClientList(); // Refresh list to show updated balance
    });
}

// ** NEW ADMIN REPORT LOGIC **
if (adminReportForm) {
    adminReportForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const periodKey = $("#adminReportPeriod").value;
        const days = statementPeriods[periodKey];
        
        if (!days) {
            alert("Please select a valid period.");
            return;
        }

        const list = filterAllTransactions(days);
        // Note: adminReportResults is a hidden div only used to satisfy the renderTransactionLines function's requirement.
        const resultsEl = document.getElementById("adminReportResults"); 
        
        // Render the results (which also saves to latestReportLines)
        const lines = renderTransactionLines(list, resultsEl, 'Bank');

        if (lines.length > 0) {
             // Automatic download as requested by user
             downloadPdf(
                `Bank_Total_Transactions_${periodKey}`,
                lines.join("\n")
             );
        } else {
             alert(`No bank transactions found for the last ${days} days.`);
        }
    });
}

// ** NEW EMPLOYEE REPORT LOGIC **
if (employeeReportForm) {
    employeeReportForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const id = $("#employeeReportId").value.trim().toUpperCase();
        const days = Number($("#employeeReportDays").value);
        
        if (!days || days <= 0) {
            alert("Please enter a valid number of days.");
            return;
        }
        
        const list = filterIdTransactions(id, days);
        
        renderTransactionLines(list, employeeReportResults, id.startsWith('CLT') ? 'Client' : 'ID');
    });
}

if (downloadEmployeeReportPdfBtn) {
    downloadEmployeeReportPdfBtn.addEventListener("click", () => {
        const id = $("#employeeReportId").value.trim();
        if (!latestReportLines.length) {
            alert("Please view a transaction report first.");
            return;
        }
        downloadPdf(
            `${id}_Transactions_Report`,
            latestReportLines.join("\n")
        );
    });
}

// ** NEW CLIENT STATEMENT DAYS LOGIC **
if (clientStatementDaysForm) {
    clientStatementDaysForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!currentClient) return;

        const days = Number($("#clientStatementDaysInput").value);

        if (!days || days <= 0) {
            alert("Please enter a valid number of days.");
            return;
        }
        
        // Use filterIdTransactions for client's own history
        const list = filterIdTransactions(currentClient.id, days);
        renderTransactionLines(list, clientStatementDaysResult, 'Client');
    });
}

function renderClientDetails() {
  if (!currentClient || !clientDetailsSummary) return;
  // This now renders the image based on the modified buildClientSummary
  clientDetailsSummary.innerHTML = buildClientSummary(currentClient).replace(
    /\n/g,
    "<br/>"
  );
}

document.querySelectorAll("[data-client-tab]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-client-tab]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".client-tab").forEach((tab) => {
      tab.classList.add("hidden");
    });
    const tabId = `#clientTab${btn.dataset.clientTab.charAt(0).toUpperCase() + btn.dataset.clientTab.slice(1)}`;
    showElement($(tabId));
    if (btn.dataset.clientTab === 'details') {
      renderClientDetails();
    }
  });
});

if (statementForm) {
    // Note: This block now handles the old statement form, which is no longer in client.html
    // but the functionality is replaced by clientStatementDaysForm. Keeping this block 
    // empty or removed is fine since the HTML form is gone.
}

if (downloadStatementPdfBtn) {
  downloadStatementPdfBtn.addEventListener("click", () => {
    if (!currentClient) return;
    if (!latestStatementLines.length) {
      alert("View a statement first by entering the number of days.");
      return;
    }
    downloadPdf(
      `${currentClient.id}_Statement`,
      latestStatementLines.join("\n")
    );
  });
}

function renderEmployeeList() {
  if (!employeeList) return;
  if (!employees.length) {
    employeeList.innerHTML = '<p class="muted">No employees yet.</p>';
    return;
  }
  employeeList.innerHTML = employees
    .map(
      (emp) => `
        <div class="record-row">
          <div>
            <strong>${emp.name} (${emp.id})</strong>
            <p>${emp.position} · Salary ${formatCurrency(emp.salary)}</p>
            <p class="record-meta">Email: ${emp.email} · Mobile: ${emp.mobile}</p>
            <p class="record-meta">Login Password: ${emp.password}</p>
          </div>
          <div class="record-actions">
            <button class="btn secondary mini" data-view-employee="${emp.id}">View</button>
            <button class="btn primary mini" data-download-employee="${emp.id}">Appointment PDF</button>
          </div>
        </div>`
    )
    .join("");
}

function renderClientList() {
  if (!clientList) return;
  if (!clients.length) {
    clientList.innerHTML = '<p class="muted">No clients yet.</p>';
    return;
  }
  clientList.innerHTML = clients
    .map(
      (client) => `
        <div class="record-row">
          <div>
            <strong>${client.name} (${client.id})</strong>
            <p>${client.accountType} · Balance ${formatCurrency(client.balance)}</p>
            <p class="record-meta">Debit Card: **** **** **** ${client.debitCard.slice(-4)}</p>
          </div>
          <div class="record-actions">
            <button class="btn secondary mini" data-view-client="${client.id}">View</button>
            <button class="btn primary mini" data-download-client="${client.id}">Details PDF</button>
          </div>
        </div>`
    )
    .join("");
}

function downloadEmployeePdf(employee) {
  const lines = buildEmployeeSummary(employee).replace(
    /<\/?[^>]+(>|$)/g,
    ""
  );
  downloadPdf(
    `Employee_Appointment_${employee.id}`,
    lines + "\n\n" + buildAppointmentLetter(employee)
  );
}

function downloadClientPdf(client) {
  const lines = buildClientSummary(client).replace(/<\/?[^>]+(>|$)/g, "");
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
    return;
  }
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
document.querySelectorAll(".hero__cta .btn").forEach((btn) => {
  if (btn.textContent === "Switch User") {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      clearSession();
      window.location.href = "index.html";
    });
  }
});
