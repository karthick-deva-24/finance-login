/**
 * Financity Dashboard Controller
 */

class DashboardController {
  constructor() {
    this.customerChart = null;
    this.ownerChart = null;
    
    this.initGlobalEvents();
  }

  // Bind global navigation and modal event listeners
  initGlobalEvents() {
    // Intercept all button clicks in dashboards except logout and redirect to 404 page
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (btn) {
        const isDashboardBtn = btn.closest("#dashboard-section") || btn.closest("#deposit-modal");
        const isLogoutBtn = btn.id === "btn-logout";
        const isBackToDashboardBtn = btn.id === "btn-error-back";

        if (isDashboardBtn && !isLogoutBtn && !isBackToDashboardBtn) {
          e.preventDefault();
          e.stopPropagation();

          // Hide active modal if open
          const activeModal = document.querySelector(".modal-overlay.active-modal");
          if (activeModal) {
            activeModal.classList.remove("active-modal");
          }

          // Switch to 404 error page view
          window.app.switchView("error-section");
        }
      }
    }, true);

    // Back to Portal Button on 404 page
    const btnErrorBack = document.getElementById("btn-error-back");
    if (btnErrorBack) {
      btnErrorBack.addEventListener("click", () => {
        window.app.switchView("dashboard-section");
      });
    }

    // Logout Button
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        window.app.setSession(null);
        window.app.routeToAuth(true);
      });
    }

    // Deposit Modal Events
    const btnOpenDeposit = document.getElementById("btn-deposit-modal");
    const btnCloseDeposit = document.getElementById("btn-close-deposit");
    const depositModal = document.getElementById("deposit-modal");
    const depositForm = document.getElementById("deposit-form");

    if (btnOpenDeposit && depositModal) {
      btnOpenDeposit.addEventListener("click", () => {
        depositModal.classList.add("active-modal");
      });
    }

    if (btnCloseDeposit && depositModal) {
      btnCloseDeposit.addEventListener("click", () => {
        depositModal.classList.remove("active-modal");
        depositForm.reset();
      });
    }

    if (depositForm) {
      depositForm.addEventListener("submit", (e) => this.handleDepositSubmit(e));
    }

    // Scroll Shortcut
    const btnScrollTx = document.getElementById("btn-scroll-transfers");
    if (btnScrollTx) {
      btnScrollTx.addEventListener("click", () => {
        const anchor = document.getElementById("transfer-records-anchor");
        if (anchor) {
          anchor.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    // Credit Card Flipping
    const ccPerspective = document.getElementById("credit-card-perspective");
    if (ccPerspective) {
      ccPerspective.addEventListener("click", () => {
        ccPerspective.classList.toggle("flipped");
      });
    }

    // Transfer Form Submission
    const transferForm = document.getElementById("transfer-funds-form");
    if (transferForm) {
      transferForm.addEventListener("submit", (e) => this.handleTransferSubmit(e));
    }

    // Owner Search Input
    const ownerSearch = document.getElementById("owner-user-search");
    if (ownerSearch) {
      ownerSearch.addEventListener("input", (e) => this.handleOwnerUserSearch(e.target.value));
    }
  }

  // Orchestrate Dashboard Load
  initDashboard() {
    const user = window.app.currentUser;
    if (!user) return;

    // Set common navigation details
    document.getElementById("nav-username").textContent = user.name;
    document.getElementById("nav-avatar").src = user.avatar;
    
    const roleBadge = document.getElementById("nav-role-badge");
    roleBadge.textContent = user.role === "owner" ? "Platform Owner" : "Customer";

    // Switch view sections
    const custView = document.getElementById("customer-dashboard-view");
    const ownView = document.getElementById("owner-dashboard-view");

    if (user.role === "owner") {
      custView.classList.add("hidden-section");
      ownView.classList.remove("hidden-section");
      this.renderOwnerDashboard();
    } else {
      ownView.classList.add("hidden-section");
      custView.classList.remove("hidden-section");
      this.renderCustomerDashboard();
    }
  }

  /* ==========================================
     Customer Dashboard Implementation
     ========================================== */
  renderCustomerDashboard() {
    const user = window.app.currentUser;
    
    // 1. Update card details
    document.getElementById("card-number-display").textContent = user.cardNumber;
    document.getElementById("card-holder-name").textContent = user.name.toUpperCase();
    
    // 2. Set balances
    const formattedBalance = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(user.balance);
    const balanceElem = document.getElementById("customer-total-balance");
    balanceElem.textContent = formattedBalance;

    // Check if account is frozen and apply layout style warnings
    if (user.status === "frozen") {
      balanceElem.style.color = "var(--danger)";
      balanceElem.innerHTML = `${formattedBalance} <span style="font-size: 1rem; display:block; color:var(--danger)">[ACCOUNT FROZEN]</span>`;
    } else {
      balanceElem.style.color = "";
    }

    // 3. Render Transaction List
    this.renderCustomerTransactions();

    // 4. Render Customer Analytics Chart
    this.renderCustomerChart();
  }

  renderCustomerTransactions() {
    const user = window.app.currentUser;
    const txContainer = document.getElementById("customer-tx-list");
    txContainer.innerHTML = "";

    // Filter relevant transactions (where user is sender or recipient)
    const userTx = window.app.transactions
      .filter(tx => tx.sender === user.email || tx.recipient === user.email)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (userTx.length === 0) {
      txContainer.innerHTML = `<div style="text-align:center; padding: 2rem 0; color:var(--text-muted)">No transactions found for this account.</div>`;
      return;
    }

    userTx.forEach(tx => {
      const isSender = tx.sender === user.email;
      
      // Determine display title
      let displayTitle = "";
      if (tx.sender === "Capital Ingress") {
        displayTitle = "Cash Deposit";
      } else if (isSender) {
        // Find recipient user name
        const recUser = window.app.users.find(u => u.email === tx.recipient);
        displayTitle = `Transfer to ${recUser ? recUser.name : tx.recipient}`;
      } else {
        // Find sender user name
        const sendUser = window.app.users.find(u => u.email === tx.sender);
        displayTitle = `Transfer from ${sendUser ? sendUser.name : tx.sender}`;
      }

      // Formatting variables
      const formattedDate = new Date(tx.timestamp).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const amountFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tx.amount);
      
      // Icon mapping (simplified inline SVG depending on transfer type)
      let svgIcon = "";
      if (tx.sender === "Capital Ingress") {
        svgIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`;
      } else if (isSender) {
        svgIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`;
      } else {
        svgIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><line x1="17" y1="17" x2="7" y2="7"/><polyline points="7 17 7 7 17 7"/></svg>`;
      }

      const txItem = document.createElement("div");
      txItem.className = "transaction-item";
      txItem.innerHTML = `
        <div class="tx-info-block">
          <div class="tx-icon-wrapper">
            ${svgIcon}
          </div>
          <div class="tx-details">
            <span class="tx-title">${displayTitle}</span>
            <span class="tx-time">${formattedDate} • <em>${tx.note}</em></span>
          </div>
        </div>
        <div class="tx-financials">
          <div class="tx-amount ${isSender && tx.sender !== "Capital Ingress" ? "negative" : "positive"}">
            ${isSender && tx.sender !== "Capital Ingress" ? "-" : "+"}${amountFormatted}
          </div>
          <span class="tx-status-pill status-${tx.status}">${tx.status}</span>
        </div>
      `;
      txContainer.appendChild(txItem);
    });
  }

  renderCustomerChart() {
    const ctx = document.getElementById("customer-analytics-chart");
    if (!ctx) return;

    if (this.customerChart) {
      this.customerChart.destroy();
    }

    // Premium styling config
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    this.customerChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Asset Valuations',
          data: [8200, 9400, 11000, 10500, 12800, window.app.currentUser.balance],
          borderColor: '#6366f1',
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#06b6d4',
          pointBorderColor: '#ffffff',
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', font: { family: 'Outfit' } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { family: 'Outfit' } }
          }
        }
      }
    });
  }

  handleDepositSubmit(e) {
    e.preventDefault();
    const user = window.app.currentUser;
    const amount = parseFloat(document.getElementById("deposit-amount").value);

    if (isNaN(amount) || amount <= 0) {
      return;
    }

    // Add balance
    user.balance += amount;
    
    // Log Completed deposit transaction
    const newTx = {
      id: "TX-" + Math.floor(10000 + Math.random() * 90000),
      sender: "Capital Ingress",
      recipient: user.email,
      amount: amount,
      status: "completed",
      timestamp: new Date().toISOString(),
      note: "Automated ACH Node Deposit"
    };

    window.app.transactions.push(newTx);
    window.app.saveUsers();
    window.app.saveTransactions();

    // Close Modal and Redraw
    document.getElementById("deposit-modal").classList.remove("active-modal");
    document.getElementById("deposit-form").reset();
    
    this.renderCustomerDashboard();
  }

  handleTransferSubmit(e) {
    e.preventDefault();
    const user = window.app.currentUser;

    if (user.status === "frozen") {
      return;
    }

    const recipientSearch = document.getElementById("transfer-recipient").value.trim().toLowerCase();
    const amount = parseFloat(document.getElementById("transfer-amount").value);

    if (isNaN(amount) || amount <= 0) {
      return;
    }

    if (amount > user.balance) {
      return;
    }

    // Find recipient by name or email
    const recipient = window.app.users.find(u => 
      u.email === recipientSearch || u.name.toLowerCase() === recipientSearch
    );

    if (!recipient) {
      return;
    }

    if (recipient.email === user.email) {
      return;
    }

    // Create a Pending transaction (requires owner's approval)
    const newTx = {
      id: "TX-" + Math.floor(10000 + Math.random() * 90000),
      sender: user.email,
      recipient: recipient.email,
      amount: amount,
      status: "pending",
      timestamp: new Date().toISOString(),
      note: "Direct Node-to-Node Transfer"
    };

    window.app.transactions.push(newTx);
    window.app.saveTransactions();

    document.getElementById("transfer-funds-form").reset();
    
    this.renderCustomerDashboard();
  }

  /* ==========================================
     Owner Dashboard Implementation
     ========================================== */
  renderOwnerDashboard() {
    // 1. Calculate Key Metrics
    const customers = window.app.users.filter(u => u.role === "customer");
    const totalAUM = customers.reduce((sum, u) => sum + u.balance, 0);
    const totalUsers = customers.length;
    
    const completedTx = window.app.transactions.filter(t => t.status === "completed");
    const totalVolume = completedTx.reduce((sum, t) => sum + t.amount, 0);

    const fAUM = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAUM);
    const fVol = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalVolume);

    document.getElementById("stat-total-aum").textContent = fAUM;
    document.getElementById("stat-total-users").textContent = totalUsers;
    document.getElementById("stat-total-volume").textContent = fVol;

    // 2. Populate registry table
    this.renderCustomerTable(customers);

    // 3. Populate approval queue
    this.renderApprovalQueue();

    // 4. Render Owner Chart
    this.renderOwnerChart();
  }

  renderCustomerTable(customers) {
    const tableBody = document.getElementById("owner-users-table-body");
    tableBody.innerHTML = "";

    if (customers.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted)">No registered customer nodes found.</td></tr>`;
      return;
    }

    customers.forEach(cust => {
      const formattedBalance = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cust.balance);
      const isFrozen = cust.status === "frozen";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div class="table-user">
            <img src="${cust.avatar}" alt="User Profile">
            <div>
              <span class="table-user-name">${cust.name}</span>
              <span class="table-user-email">${cust.email}</span>
            </div>
          </div>
        </td>
        <td><strong>${formattedBalance}</strong></td>
        <td>
          <span class="table-status status-${cust.status}">
            <span class="status-indicator ${isFrozen ? 'red' : 'green'}"></span>
            ${cust.status}
          </span>
        </td>
        <td style="text-align: right">
          <button class="btn-small ${isFrozen ? 'btn-small-success' : 'btn-small-danger'}" data-email="${cust.email}">
            ${isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
          </button>
        </td>
      `;

      // Event listener on Action button
      tr.querySelector("button").addEventListener("click", (e) => {
        const email = e.target.getAttribute("data-email");
        this.toggleCustomerFreeze(email);
      });

      tableBody.appendChild(tr);
    });
  }

  toggleCustomerFreeze(email) {
    const user = window.app.users.find(u => u.email === email);
    if (!user) return;

    user.status = user.status === "frozen" ? "active" : "frozen";
    window.app.saveUsers();
    
    // Refresh
    this.renderOwnerDashboard();
  }

  handleOwnerUserSearch(query) {
    const cleanQuery = query.toLowerCase().trim();
    const customers = window.app.users.filter(u => u.role === "customer");
    
    const filtered = customers.filter(cust => 
      cust.name.toLowerCase().includes(cleanQuery) || 
      cust.email.toLowerCase().includes(cleanQuery) || 
      cust.status.toLowerCase().includes(cleanQuery)
    );

    this.renderCustomerTable(filtered);
  }

  renderApprovalQueue() {
    const queueContainer = document.getElementById("owner-pending-ledger");
    queueContainer.innerHTML = "";

    const pendingTx = window.app.transactions.filter(tx => tx.status === "pending");

    if (pendingTx.length === 0) {
      queueContainer.innerHTML = `<div style="text-align:center; padding: 1.5rem 0; color:var(--text-muted)">No pending transaction approvals.</div>`;
      return;
    }

    pendingTx.forEach(tx => {
      const senderUser = window.app.users.find(u => u.email === tx.sender);
      const recipientUser = window.app.users.find(u => u.email === tx.recipient);
      
      const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tx.amount);

      const div = document.createElement("div");
      div.className = "ledger-item";
      div.innerHTML = `
        <div class="ledger-details">
          <span class="ledger-amount">${formattedAmount}</span>
          <span class="ledger-meta">
            From: <strong>${senderUser ? senderUser.name : tx.sender}</strong>
          </span>
          <span class="ledger-meta">
            To: <strong>${recipientUser ? recipientUser.name : tx.recipient}</strong>
          </span>
          <span class="ledger-meta" style="font-style:italic">"${tx.note}"</span>
        </div>
        <div class="ledger-actions">
          <button class="btn-icon approve-btn" title="Approve Transaction" style="color:var(--success)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
          <button class="btn-icon reject-btn" title="Reject Transaction" style="color:var(--danger)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `;

      // Wire up approval button
      div.querySelector(".approve-btn").addEventListener("click", () => {
        this.processTransaction(tx.id, "approve");
      });

      // Wire up rejection button
      div.querySelector(".reject-btn").addEventListener("click", () => {
        this.processTransaction(tx.id, "reject");
      });

      queueContainer.appendChild(div);
    });
  }

  processTransaction(txId, action) {
    const tx = window.app.transactions.find(t => t.id === txId);
    if (!tx) return;

    if (action === "approve") {
      // Find sender and recipient
      const sender = window.app.users.find(u => u.email === tx.sender);
      const recipient = window.app.users.find(u => u.email === tx.recipient);

      if (!sender || !recipient) {
        return;
      }

      // Re-verify balances just in case
      if (sender.balance < tx.amount) {
        tx.status = "rejected";
      } else {
        // Execute ledger balancing
        sender.balance -= tx.amount;
        recipient.balance += tx.amount;
        tx.status = "completed";
      }
    } else {
      tx.status = "rejected";
    }

    // Save and render
    window.app.saveUsers();
    window.app.saveTransactions();
    this.renderOwnerDashboard();
  }

  renderOwnerChart() {
    const ctx = document.getElementById("owner-analytics-chart");
    if (!ctx) return;

    if (this.ownerChart) {
      this.ownerChart.destroy();
    }

    // Premium styling config
    this.ownerChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Platform Activity Rate',
          data: [12, 19, 3, 5, 2, 3, 8],
          backgroundColor: '#fbbf24',
          borderRadius: 4,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#71717a', font: { family: 'Outfit' } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#71717a', font: { family: 'Outfit' } }
          }
        }
      }
    });
  }
}

// Instantiate dashboard controller
window.dashboardController = new DashboardController();
