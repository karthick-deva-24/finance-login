/**
 * Financity Authentication Controller
 */

class AuthController {
  constructor() {
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.loginForm = document.getElementById("login-form");
    this.signupForm = document.getElementById("signup-form");
    
    this.linkToRegister = document.getElementById("link-to-register");
    this.linkToLogin = document.getElementById("link-to-login");
    this.linkForgotPassword = document.getElementById("link-forgot-password");
    this.subtitleText = document.getElementById("auth-subtitle-text");

    // Role elements
    this.loginRole = document.getElementById("login-role");
  }

  bindEvents() {
    // Form toggle events
    this.linkToRegister.addEventListener("click", () => this.toggleForm("signup"));
    this.linkToLogin.addEventListener("click", () => this.toggleForm("login"));
    
    if (this.linkForgotPassword) {
      this.linkForgotPassword.addEventListener("click", () => {
        window.app.switchView("error-section");
      });
    }

    // Form submit events
    this.loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    this.signupForm.addEventListener("submit", (e) => this.handleSignup(e));

    // Dynamic login theme switcher on dropdown change
    if (this.loginRole) {
      this.loginRole.addEventListener("change", (e) => {
        const role = e.target.value;
        document.body.className = role === "owner" ? "owner-theme" : "customer-theme";
      });
    }
  }

  // Switches between Sign In and Sign Up forms
  toggleForm(formType) {
    if (formType === "signup") {
      this.loginForm.classList.add("hidden-section");
      this.signupForm.classList.remove("hidden-section");
      this.subtitleText.textContent = "Create an Account";
    } else {
      this.signupForm.classList.add("hidden-section");
      this.loginForm.classList.remove("hidden-section");
      this.subtitleText.textContent = "Access your secure financial accounts";
    }
  }

  resetForms() {
    this.loginForm.reset();
    this.signupForm.reset();
    
    // Ensure default theme is restored on reset
    document.body.className = "customer-theme";
    this.toggleForm("login");
  }

  // Handle user authentication (accepts any email/password dynamically)
  handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const pass = document.getElementById("login-password").value;
    const selectedRole = this.loginRole ? this.loginRole.value : "customer";

    let user = window.app.users.find(u => u.email === email);

    if (!user) {
      const namePrefix = email.split('@')[0];
      const name = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);
      
      user = {
        name: name,
        email: email,
        password: pass,
        role: selectedRole,
        balance: selectedRole === "customer" ? 12500.00 : 0.00,
        status: "active",
        avatar: selectedRole === "customer"
          ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60"
          : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60"
      };

      if (selectedRole === "customer") {
        let card = "4532 ";
        for (let i = 0; i < 3; i++) {
          card += Math.floor(1000 + Math.random() * 9000) + " ";
        }
        user.cardNumber = card.trim();
        user.cvv = Math.floor(100 + Math.random() * 900).toString();
        user.expiry = "12 / 30";
      }

      window.app.users.push(user);
      window.app.saveUsers();
    } else {
      // If user exists, update password and role to match active selections
      user.password = pass;
      user.role = selectedRole;
      
      if (selectedRole === "customer" && !user.cardNumber) {
        let card = "4532 ";
        for (let i = 0; i < 3; i++) {
          card += Math.floor(1000 + Math.random() * 9000) + " ";
        }
        user.cardNumber = card.trim();
        user.cvv = Math.floor(100 + Math.random() * 900).toString();
        user.expiry = "12 / 30";
      }
      window.app.saveUsers();
    }

    // Provision session and route
    window.app.setSession(user);
    window.app.routeToDashboard(true);
  }

  // Handle user registration
  handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const pass = document.getElementById("signup-password").value;
    const signupRole = document.getElementById("signup-role").value;

    // Create a new user node structure
    const newUser = {
      name: name,
      email: email,
      password: pass,
      role: signupRole,
      balance: signupRole === "customer" ? 10000.00 : 0.00, // Pre-fund new customers
      status: "active",
      avatar: signupRole === "customer" 
        ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60"
        : "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60"
    };

    // Customer accounts generate secure card details
    if (signupRole === "customer") {
      let card = "4532 ";
      for (let i = 0; i < 3; i++) {
        card += Math.floor(1000 + Math.random() * 9000) + " ";
      }
      newUser.cardNumber = card.trim();
      newUser.cvv = Math.floor(100 + Math.random() * 900).toString();
      newUser.expiry = "06 / 31";
    }

    // Add user and save
    window.app.users.push(newUser);
    window.app.saveUsers();

    // Reset forms and redirect to login page
    this.resetForms();
    
    // Autofill details on login page
    document.getElementById("login-email").value = email;
    document.getElementById("login-password").value = pass;
    if (this.loginRole) {
      this.loginRole.value = signupRole;
    }
    document.body.className = signupRole === "owner" ? "owner-theme" : "customer-theme";
  }
}

// Instantiate auth controller
window.authController = new AuthController();
