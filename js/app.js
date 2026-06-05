/**
 * Stackly Core Application State & Routing Engine
 */

// Centralized mock data storage
const INITIAL_USERS = [
  {
    name: "Alex Mercer",
    email: "customer@stackly.com",
    password: "password123",
    role: "customer",
    balance: 14250.00,
    status: "active",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60",
    cardNumber: "4532 8931 2049 4892",
    cvv: "893",
    expiry: "12 / 30"
  },
  {
    name: "Sarah Connor",
    email: "sarah@stackly.com",
    password: "password123",
    role: "customer",
    balance: 8700.00,
    status: "active",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60",
    cardNumber: "4532 1102 9384 1029",
    cvv: "294",
    expiry: "08 / 29"
  },
  {
    name: "Markus Kane",
    email: "frozen@stackly.com",
    password: "password123",
    role: "customer",
    balance: 2500.00,
    status: "frozen", // Demonstrates the freeze functionality
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60",
    cardNumber: "4532 7741 8329 0192",
    cvv: "402",
    expiry: "04 / 28"
  },
  {
    name: "Chief Overseer",
    email: "owner@stackly.com",
    password: "password123",
    role: "owner",
    balance: 0,
    status: "active",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60"
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: "TX-98271",
    sender: "sarah@stackly.com",
    recipient: "customer@stackly.com",
    amount: 450.00,
    status: "completed",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    note: "Consulting Fee Settlement"
  },
  {
    id: "TX-98240",
    sender: "customer@stackly.com",
    recipient: "sarah@stackly.com",
    amount: 1200.00,
    status: "completed",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    note: "Server Infrastructure Rental"
  },
  {
    id: "TX-98104",
    sender: "customer@stackly.com",
    recipient: "sarah@stackly.com",
    amount: 1500.00,
    status: "pending", // Owner can approve or reject this
    timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    note: "Project Launch Bonus"
  }
];

class StacklyApp {
  constructor() {
    this.users = [];
    this.transactions = [];
    this.currentUser = null;
    
    this.initDatabase();
    this.initPreloader();
  }

  // Set up local state engine using localStorage
  initDatabase() {
    const cachedUsers = localStorage.getItem("stackly_users");
    const cachedTx = localStorage.getItem("stackly_tx");
    const cachedSession = localStorage.getItem("stackly_session");

    if (cachedUsers) {
      this.users = JSON.parse(cachedUsers);
    } else {
      this.users = [...INITIAL_USERS];
      this.saveUsers();
    }

    if (cachedTx) {
      this.transactions = JSON.parse(cachedTx);
    } else {
      this.transactions = [...INITIAL_TRANSACTIONS];
      this.saveTransactions();
    }

    if (cachedSession) {
      const email = cachedSession;
      this.currentUser = this.users.find(u => u.email === email) || null;
    }
  }

  saveUsers() {
    localStorage.setItem("stackly_users", JSON.stringify(this.users));
  }

  saveTransactions() {
    localStorage.setItem("stackly_tx", JSON.stringify(this.transactions));
  }

  setSession(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem("stackly_session", user.email);
    } else {
      localStorage.removeItem("stackly_session");
    }
  }

  // Preloader sequence showing custom scanning logs
  initPreloader() {
    const preloader = document.getElementById("preloader");
    const loaderText = document.getElementById("loader-status-text");

    const steps = [
      { text: "ESTABLISHING SECURE CHANNEL...", delay: 600 },
      { text: "VERIFYING PORTFOLIO SECURITY...", delay: 1200 },
      { text: "RETRIEVING FINANCIAL DATA...", delay: 1800 },
      { text: "STACKLY SECURE GATEWAY ACTIVE", delay: 2300 }
    ];

    steps.forEach(step => {
      setTimeout(() => {
        if (loaderText) loaderText.textContent = step.text;
      }, step.delay);
    });

    setTimeout(() => {
      preloader.classList.add("fade-out");
      
      // Determine starting view based on current user session
      if (this.currentUser) {
        this.routeToDashboard(false);
      } else {
        this.routeToAuth(false);
      }
    }, 2600);
  }

  // Trigger loading screen with customized step sequence (simulating network ledger syncing)
  triggerLoadScreen(statusText, durationMs, callback) {
    const preloader = document.getElementById("preloader");
    const loaderText = document.getElementById("loader-status-text");
    
    preloader.classList.remove("fade-out");
    if (loaderText) loaderText.textContent = statusText;

    setTimeout(() => {
      preloader.classList.add("fade-out");
      if (callback) callback();
    }, durationMs);
  }

  // Seamless Page Routing
  switchView(activeViewId) {
    const sections = document.querySelectorAll(".view-section");
    sections.forEach(section => {
      section.classList.remove("active-view");
    });

    const activeSection = document.getElementById(activeViewId);
    if (activeSection) {
      activeSection.classList.add("active-view");
    }
  }

  routeToAuth(withPreloader = true) {
    if (withPreloader) {
      this.triggerLoadScreen("TERMINATING SECURE SESSION...", 1200, () => {
        // Change body class back to customer by default
        document.body.className = "customer-theme";
        
        // Show auth view
        this.switchView("auth-section");
        
        // Refresh auth forms
        if (window.authController) {
          window.authController.resetForms();
        }
      });
    } else {
      document.body.className = "customer-theme";
      this.switchView("auth-section");
    }
  }

  routeToDashboard(withPreloader = true) {
    if (!this.currentUser) return this.routeToAuth(false);

    const targetTheme = this.currentUser.role === "owner" ? "owner-theme" : "customer-theme";
    const loadMsg = this.currentUser.role === "owner" 
      ? "ACCESSING PLATFORM OVERSEER PORTAL..." 
      : "SYNCHRONIZING VAULT BALANCES...";

    if (withPreloader) {
      this.triggerLoadScreen(loadMsg, 1500, () => {
        document.body.className = targetTheme;
        this.switchView("dashboard-section");
        
        // Render current dashboard components
        if (window.dashboardController) {
          window.dashboardController.initDashboard();
        }
      });
    } else {
      document.body.className = targetTheme;
      this.switchView("dashboard-section");
      
      if (window.dashboardController) {
        window.dashboardController.initDashboard();
      }
    }
  }
}

// Instantiate global app core
window.app = new StacklyApp();
