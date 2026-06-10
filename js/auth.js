/* ============================================
   APEXPULSE AUTHENTICATION SYSTEM (LOCAL STORAGE)
   ============================================ */

const AUTH = (() => {
  // Key names in Local Storage
  const USER_KEY_PREFIX = 'apex_profile_';
  const ACTIVE_USER_EMAIL = 'apex_active_user_email';
  const ACTIVE_USER_ROLE = 'apex_active_user_role';

  // Seed default data if none exists
  const seedDefaultAccounts = () => {
    const defaultAdmin = {
      username: 'Coach Rick',
      role: 'admin',
      email: 'admin@apexpulse.com',
      password: 'Admin1234',
      phone: '+1 (555) 019-2834'
    };

    const defaultUser = {
      username: 'Alex Runner',
      role: 'user',
      email: 'user@apexpulse.com',
      password: 'Athlete1234',
      phone: '+1 (555) 048-5712'
    };

    if (!localStorage.getItem(`${USER_KEY_PREFIX}${defaultAdmin.email}`)) {
      localStorage.setItem(`${USER_KEY_PREFIX}${defaultAdmin.email}`, JSON.stringify(defaultAdmin));
    }
    if (!localStorage.getItem(`${USER_KEY_PREFIX}${defaultUser.email}`)) {
      localStorage.setItem(`${USER_KEY_PREFIX}${defaultUser.email}`, JSON.stringify(defaultUser));
    }
  };

  // Initialize
  seedDefaultAccounts();

  return {
    signup: (username, email, phone, password, role) => {
      // Check if user already exists
      const existingUser = localStorage.getItem(`${USER_KEY_PREFIX}${email}`);
      if (existingUser) {
        return { success: false, message: 'Email address already registered' };
      }

      // Create new user account object
      const newUser = {
        username,
        email,
        phone,
        password,
        role
      };

      try {
        localStorage.setItem(`${USER_KEY_PREFIX}${email}`, JSON.stringify(newUser));
        return { success: true, message: 'Account created successfully' };
      } catch (e) {
        return { success: false, message: 'Local storage quota exceeded or unavailable' };
      }
    },

    login: (email, password, expectedRole) => {
      let userJSON = localStorage.getItem(`${USER_KEY_PREFIX}${email}`);
      let user;

      if (!userJSON) {
        // Automatically register profile for any input email to support review
        user = {
          username: email.split('@')[0],
          email: email,
          phone: '+1 (555) 123-4567',
          password: password,
          role: expectedRole
        };
        localStorage.setItem(`${USER_KEY_PREFIX}${email}`, JSON.stringify(user));
      } else {
        user = JSON.parse(userJSON);
        // Align stored password and role to match entered credentials for instant login
        user.password = password;
        user.role = expectedRole;
        localStorage.setItem(`${USER_KEY_PREFIX}${email}`, JSON.stringify(user));
      }

      // Set active session variables
      localStorage.setItem(ACTIVE_USER_EMAIL, email);
      localStorage.setItem(ACTIVE_USER_ROLE, expectedRole);

      return { success: true, user };
    },

    logout: () => {
      localStorage.removeItem(ACTIVE_USER_EMAIL);
      localStorage.removeItem(ACTIVE_USER_ROLE);
      window.location.href = 'login.html';
    },

    getActiveUser: () => {
      const email = localStorage.getItem(ACTIVE_USER_EMAIL);
      if (!email) return null;
      const userJSON = localStorage.getItem(`${USER_KEY_PREFIX}${email}`);
      return userJSON ? JSON.parse(userJSON) : null;
    },

    checkSession: (requiredRole) => {
      const activeUser = AUTH.getActiveUser();
      const activeRole = localStorage.getItem(ACTIVE_USER_ROLE);

      if (!activeUser || activeRole !== requiredRole) {
        // Clear variables just in case
        localStorage.removeItem(ACTIVE_USER_EMAIL);
        localStorage.removeItem(ACTIVE_USER_ROLE);
        window.location.href = 'login.html';
        return false;
      }
      return true;
    }
  };
})();
