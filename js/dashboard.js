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
    // Intercept all button clicks in dashboards except logout/drawer toggle and redirect to 404 page
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (btn) {
        const isDashboardBtn = btn.closest("#dashboard-section") || btn.closest("#deposit-modal");
        const isLogoutBtn = btn.id === "btn-logout" || btn.id === "btn-drawer-logout";
        const isBackToDashboardBtn = btn.id === "btn-error-back";
        const isDrawerToggleBtn = btn.id === "btn-toggle-drawer" || btn.id === "btn-close-drawer";

        if (isDashboardBtn && !isLogoutBtn && !isBackToDashboardBtn && !isDrawerToggleBtn) {
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

    // Drawer Toggle Events
    const btnToggleDrawer = document.getElementById("btn-toggle-drawer");
    const btnCloseDrawer = document.getElementById("btn-close-drawer");
    const drawerOverlay = document.getElementById("drawer-overlay");
    const sideDrawer = document.getElementById("side-drawer");

    const toggleDrawer = (forceClose = false) => {
      if (!sideDrawer) return;
      if (forceClose || sideDrawer.classList.contains("active")) {
        sideDrawer.classList.remove("active");
        drawerOverlay.classList.remove("active");
      } else {
        sideDrawer.classList.add("active");
        drawerOverlay.classList.add("active");
      }
    };

    if (btnToggleDrawer) {
      btnToggleDrawer.addEventListener("click", () => toggleDrawer());
    }
    if (btnCloseDrawer) {
      btnCloseDrawer.addEventListener("click", () => toggleDrawer(true));
    }
    if (drawerOverlay) {
      drawerOverlay.addEventListener("click", () => toggleDrawer(true));
    }

    // Drawer Logout
    const btnDrawerLogout = document.getElementById("btn-drawer-logout");
    const handleLogoutAction = () => {
      if (window.dashboardController && window.dashboardController.telemetryInterval) {
        clearInterval(window.dashboardController.telemetryInterval);
      }
      window.app.setSession(null);
      window.app.routeToAuth(true);
    };

    if (btnDrawerLogout) {
      btnDrawerLogout.addEventListener("click", () => {
        toggleDrawer(true);
        handleLogoutAction();
      });
    }

    // Drawer Nav Links redirection
    const drawerNavItems = document.querySelectorAll(".drawer-nav-item");
    drawerNavItems.forEach(item => {
      item.addEventListener("click", () => {
        const target = item.getAttribute("data-target");
        toggleDrawer(true);
        
        // Remove active class from all nav items
        drawerNavItems.forEach(i => i.classList.remove("active-nav"));
        item.classList.add("active-nav");

        if (target === "dashboard") {
          window.app.switchView("dashboard-section");
        } else {
          window.app.switchView("error-section");
        }
      });
    });

    // Card Management Slider limit display update
    const cardLimitSlider = document.getElementById("card-limit-slider");
    const cardLimitDisplay = document.getElementById("card-limit-display");
    if (cardLimitSlider && cardLimitDisplay) {
      cardLimitSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        cardLimitDisplay.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
      });
    }

    // System Settings Timeout slider display update
    const systemTimeoutSlider = document.getElementById("system-timeout-slider");
    const systemTimeoutDisplay = document.getElementById("system-timeout-display");
    if (systemTimeoutSlider && systemTimeoutDisplay) {
      systemTimeoutSlider.addEventListener("input", (e) => {
        systemTimeoutDisplay.textContent = `${e.target.value} Min`;
      });
    }

    // Back to Portal Button on 404 page
    const btnErrorBack = document.getElementById("btn-error-back");
    if (btnErrorBack) {
      btnErrorBack.addEventListener("click", () => {
        window.app.switchView("dashboard-section");
        // Reset active nav item to overview
        drawerNavItems.forEach(i => i.classList.remove("active-nav"));
        const overviewItem = document.querySelector(".drawer-nav-item[data-target='dashboard']");
        if (overviewItem) overviewItem.classList.add("active-nav");
      });
    }

    // Logout Button
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        handleLogoutAction();
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

    // Set side drawer profile details
    const drawerUsername = document.getElementById("drawer-username");
    const drawerAvatar = document.getElementById("drawer-avatar");
    const drawerRoleBadge = document.getElementById("drawer-role-badge");

    if (drawerUsername) drawerUsername.textContent = user.name;
    if (drawerAvatar) drawerAvatar.src = user.avatar;
    if (drawerRoleBadge) {
      drawerRoleBadge.textContent = user.role === "owner" ? "Platform Owner" : "Customer";
      if (user.role === "owner") {
        drawerRoleBadge.style.background = "rgba(251, 191, 36, 0.15)";
        drawerRoleBadge.style.color = "var(--accent-primary)";
      } else {
        drawerRoleBadge.style.background = "rgba(99, 102, 241, 0.15)";
        drawerRoleBadge.style.color = "var(--accent-primary)";
      }
    }

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

    // 5. Render Quick Transfer Contacts
    this.renderCustomerContacts();
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

    // 5. Populate Admin security audit logs
    this.renderOwnerSecurityLogs();

    // 6. Init Node Telemetry metrics loop
    this.initOwnerTelemetry();
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
        <td data-label="Client Account">
          <div class="table-user">
            <img src="${cust.avatar}" alt="User Profile">
            <div>
              <span class="table-user-name">${cust.name}</span>
              <span class="table-user-email">${cust.email}</span>
            </div>
          </div>
        </td>
        <td data-label="Available Balance"><strong>${formattedBalance}</strong></td>
        <td data-label="Account Status">
          <span class="table-status status-${cust.status}">
            <span class="status-indicator ${isFrozen ? 'red' : 'green'}"></span>
            ${cust.status}
          </span>
        </td>
        <td data-label="Administrative Action" style="text-align: right">
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

  renderCustomerContacts() {
    const container = document.getElementById("quick-contacts-container");
    if (!container) return;

    container.innerHTML = "";
    
    // Filter users list to get other customer accounts
    const contacts = window.app.users.filter(u => u.email !== window.app.currentUser.email && u.role === "customer");
    
    if (contacts.length === 0) {
      container.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; width: 100%;">No contacts found</div>`;
      return;
    }

    contacts.forEach(contact => {
      const node = document.createElement("div");
      node.className = "contact-node";
      node.innerHTML = `
        <img class="contact-avatar" src="${contact.avatar}" alt="${contact.name}">
        <span class="contact-name">${contact.name.split(" ")[0]}</span>
      `;
      
      node.addEventListener("click", () => {
        const recipientField = document.getElementById("transfer-recipient");
        const amountField = document.getElementById("transfer-amount");
        if (recipientField && amountField) {
          recipientField.value = contact.email;
          amountField.focus();
        }
      });
      
      container.appendChild(node);
    });
  }

  initOwnerTelemetry() {
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
    }

    const cpuVal = document.getElementById("telemetry-cpu-val");
    const cpuBar = document.getElementById("telemetry-cpu-bar");
    const latencyVal = document.getElementById("telemetry-latency-val");
    const latencyBar = document.getElementById("telemetry-latency-bar");
    const memVal = document.getElementById("telemetry-mem-val");
    const memBar = document.getElementById("telemetry-mem-bar");

    const updateMetrics = () => {
      if (!cpuVal) return;
      
      // CPU Load: fluctuate 15% - 35%
      const cpu = Math.floor(15 + Math.random() * 20);
      cpuVal.textContent = `${cpu}%`;
      cpuBar.style.width = `${cpu}%`;
      if (cpu > 30) {
        cpuBar.style.background = "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)";
      } else {
        cpuBar.style.background = "var(--success-gradient)";
      }

      // Latency: fluctuate 30ms - 55ms
      const lat = Math.floor(30 + Math.random() * 25);
      latencyVal.textContent = `${lat}ms`;
      latencyBar.style.width = `${lat}%`;
      if (lat > 50) {
        latencyBar.style.background = "linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)";
      } else {
        latencyBar.style.background = "var(--success-gradient)";
      }

      // Memory: fluctuate 65% - 72%
      const mem = Math.floor(65 + Math.random() * 7);
      memVal.textContent = `${mem}%`;
      memBar.style.width = `${mem}%`;
    };

    updateMetrics();
    this.telemetryInterval = setInterval(updateMetrics, 3000);
  }

  renderOwnerSecurityLogs() {
    const container = document.getElementById("owner-audit-log-container");
    if (!container) return;

    const logs = [
      { time: "15:46:12", desc: "System overseer node gateway synced successfully." },
      { time: "14:20:01", desc: "Double-factor keychain authentication token verified." },
      { time: "11:30:15", desc: "Automated incremental backup of client database generated." },
      { time: "09:15:42", desc: "Client account status query request cleared." },
      { time: "08:00:00", desc: "Daily AUM ledger balancing and cache clearing executed." },
      { time: "06:12:05", desc: "Intrusion prevention scan finished - 0 warnings." }
    ];

    container.innerHTML = "";
    logs.forEach(log => {
      const item = document.createElement("div");
      item.className = "audit-item";
      item.innerHTML = `
        <span class="audit-time">[ ${log.time} ]</span>
        <span class="audit-desc">${log.desc}</span>
      `;
      container.appendChild(item);
    });
  }
}

// Instantiate dashboard controller
window.dashboardController = new DashboardController();
