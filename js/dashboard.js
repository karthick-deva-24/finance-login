/* =======================================================
   APEXPULSE PLATFORM CORE DASHBOARD ENGINE (js/dashboard.js)
   ======================================================= */

window.dashboardApp = (() => {
  let userRole = null;
  let activeUser = null;
  let charts = {};

  // Color constants for Chart.js
  const COLORS = {
    primary: '#1b056a',
    primaryLight: '#031561',
    primaryGlow: 'rgba(27, 5, 106, 0.1)',
    blue: '#3B82F6',
    blueLight: '#60A5FA',
    blueGlow: 'rgba(59, 130, 246, 0.1)',
    green: '#10B981',
    yellow: '#F59E0B',
    purple: '#8B5CF6',
    textDark: '#64748B',
    textBlack: '#0F172A',
    gridColor: '#E2E8F0',
    darkGridColor: '#334155'
  };

  // --- Seed Data Store ---
  const MOCK_DATA = {
    members: [
      { name: 'Sarah Connor', email: 'sarah@resistance.org', phone: '+1 (555) 304-9844', role: 'Athlete', status: 'active', date: '2026-05-12' },
      { name: 'Bruce Wayne', email: 'bruce@gotham.net', phone: '+1 (555) 777-1939', role: 'Athlete', status: 'active', date: '2026-05-20' },
      { name: 'Diana Prince', email: 'diana@themyscira.gov', phone: '+1 (555) 888-0001', role: 'Athlete', status: 'active', date: '2026-05-24' },
      { name: 'Clark Kent', email: 'clark@dailyplanet.com', phone: '+1 (555) 902-8347', role: 'Athlete', status: 'pending', date: '2026-06-01' },
      { name: 'Barry Allen', email: 'barry@centralcity.pd', phone: '+1 (555) 201-9874', role: 'Athlete', status: 'active', date: '2026-06-02' },
      { name: 'Tony Stark', email: 'tony@starkintl.com', phone: '+1 (555) 300-4000', role: 'Athlete', status: 'inactive', date: '2026-04-15' }
    ],
    trainers: [
      { name: 'Coach Carter', specialty: 'Basketball & Tactical Cardio', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=150&q=80', activeCount: '14 Athletes' },
      { name: 'Coach Serena', specialty: 'Tennis Endurance & Agility', image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=150&q=80', activeCount: '22 Athletes' },
      { name: 'Coach Arnold', specialty: 'Heavy Hypertrophy & Powerlifting', image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=150&q=80', activeCount: '19 Athletes' }
    ],
    programs: [
      { title: 'Tactical Agility Protocol', type: 'Cardio Stream', difficulty: 4, duration: '45 min', calories: '550 kcal', level: 'Intermediate', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80' },
      { title: 'Iron Hypertrophy Phase 3', type: 'Weight Lifting', difficulty: 5, duration: '75 min', calories: '600 kcal', level: 'Advanced', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80' },
      { title: 'Aerobic Threshold Build', type: 'Cardio Speed', difficulty: 3, duration: '60 min', calories: '480 kcal', level: 'Intermediate', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=300&q=80' }
    ],
    userActivities: [
      { date: '2026-06-03 08:30', type: 'Speed Sprint Drill', duration: 45, burn: '520 kcal', complexity: 'Intermediate' },
      { date: '2026-06-02 17:15', type: 'Hypertrophy Powerlifting', duration: 60, burn: '480 kcal', complexity: 'Advanced' },
      { date: '2026-05-31 09:00', type: 'Aerobic Threshold Swim', duration: 50, burn: '440 kcal', complexity: 'Intermediate' }
    ],
    meals: [
      { time: '08:15', name: 'High-Protein Shake + Oats', carbs: '65g', prot: '40g', fat: '12g', cals: '520 kcal' },
      { time: '13:00', name: 'Grilled Chicken Breasts + Jasmine Rice', carbs: '85g', prot: '55g', fat: '10g', cals: '650 kcal' },
      { time: '16:30', name: 'Mixed Almonds + Protein Bar', carbs: '25g', prot: '20g', fat: '18g', cals: '340 kcal' },
      { time: '19:45', name: 'Baked Salmon Steak + Steamed Broccoli', carbs: '45g', prot: '25g', fat: '28g', cals: '510 kcal' }
    ],
    achievements: [
      { icon: 'fa-solid fa-trophy', title: 'Centurion Burner', desc: 'Burn over 1,000 kcal in a single day.', date: 'May 28, 2026' },
      { icon: 'fa-solid fa-fire', title: 'Apex Streak', desc: 'Achieved a 7-day training consistency.', date: 'June 01, 2026' },
      { icon: 'fa-solid fa-dumbbell', title: 'Heavy Lifter Medal', desc: 'Successfully tracked 15 strength sessions.', date: 'June 03, 2026' }
    ],
    notifications: [
      { icon: 'fa-user-plus', color: 'orange', title: 'New athlete enrolled', desc: 'Barry Allen registered from Central City.', time: '5 mins ago' },
      { icon: 'fa-heart-pulse', color: 'blue', title: 'Biometrics Threshold Synced', desc: 'Athlete Sarah Connor exceeded target rate.', time: '1 hour ago' },
      { icon: 'fa-circle-check', color: 'green', title: 'Invoice verified', desc: 'Subscription renewal from Coach serena completed.', time: '3 hours ago' },
      { icon: 'fa-triangle-exclamation', color: 'yellow', title: 'System telemetry reboot', desc: 'Core wearable cloud api connection refreshed.', time: 'Yesterday' }
    ]
  };

  // --- Initialize Storage ---
  const initLocalStorageData = () => {
    if (!localStorage.getItem('apex_members')) {
      localStorage.setItem('apex_members', JSON.stringify(MOCK_DATA.members));
    }
    if (!localStorage.getItem('apex_trainers')) {
      localStorage.setItem('apex_trainers', JSON.stringify(MOCK_DATA.trainers));
    }
    if (!localStorage.getItem('apex_programs')) {
      localStorage.setItem('apex_programs', JSON.stringify(MOCK_DATA.programs));
    }
    if (!localStorage.getItem('apex_user_activities')) {
      localStorage.setItem('apex_user_activities', JSON.stringify(MOCK_DATA.userActivities));
    }
    if (!localStorage.getItem('apex_user_meals')) {
      localStorage.setItem('apex_user_meals', JSON.stringify(MOCK_DATA.meals));
    }
    const storedAch = localStorage.getItem('apex_achievements');
    if (!storedAch || storedAch.includes('🏆') || storedAch.includes('🔥') || storedAch.includes('🏋')) {
      localStorage.setItem('apex_achievements', JSON.stringify(MOCK_DATA.achievements));
    }
    if (!localStorage.getItem('apex_notifications')) {
      localStorage.setItem('apex_notifications', JSON.stringify(MOCK_DATA.notifications));
    }
  };

  // --- Display Visual Toast Notifications ---
  const spawnToast = (title, message, type = 'success') => {};

  // --- Count-up Stat Numbers Animation ---
  const animateCountUp = (elementId, targetValue, duration = 1.5, format = '') => {
    const el = document.getElementById(elementId);
    if (!el) return;

    let obj = { val: 0 };
    gsap.to(obj, {
      val: targetValue,
      duration: duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (format === 'cals') {
          el.textContent = Math.floor(obj.val).toLocaleString();
        } else if (format === 'percent') {
          el.textContent = Math.floor(obj.val) + '%';
        } else if (format === 'currency') {
          el.textContent = '$' + Math.floor(obj.val).toLocaleString();
        } else {
          el.textContent = Math.floor(obj.val).toLocaleString();
        }
      }
    });
  };

  // --- Navigation Tab Switching Logic ---
  const setupNavTabs = () => {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const targetTab = item.getAttribute('data-tab');
        if (!targetTab) return;

        // Toggle active navigation buttons
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Toggle target pages
        const sections = document.querySelectorAll('.page-section');
        sections.forEach(sec => sec.classList.remove('active'));

        const activeSection = document.getElementById(`sect-${targetTab}`);
        if (activeSection) {
          activeSection.classList.add('active');

          // Trigger GSAP entrance animations for elements inside the section with clearProps
          gsap.from(activeSection.querySelectorAll('.info-card, .chart-card, .table-card, .stat-card, .profile-header-card, .settings-section'), {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power3.out',
            clearProps: "all"
          });
        }

        // Close sidebar on mobile
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
          overlay.classList.remove('open');
        }
      });
    });
  };

  // --- Theme Toggle Control ---
  const setupThemeToggle = () => {
    const toggle = document.getElementById('darkToggle');
    if (!toggle) return;

    const currentTheme = localStorage.getItem('apex_theme') || 'light';
    if (currentTheme === 'dark') {
      document.body.classList.add('dark-mode');
      toggle.classList.add('on');
      toggle.querySelector('i').className = 'fa-solid fa-moon';
    }

    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      toggle.classList.toggle('on');
      const icon = toggle.querySelector('i');

      const isDark = document.body.classList.contains('dark-mode');
      if (isDark) {
        icon.className = 'fa-solid fa-moon';
        localStorage.setItem('apex_theme', 'dark');
        spawnToast('Theme Synced', 'Dark Mode Activated', 'info');
      } else {
        icon.className = 'fa-solid fa-sun';
        localStorage.setItem('apex_theme', 'light');
        spawnToast('Theme Synced', 'Light Mode Activated', 'info');
      }

      // Re-trigger color adjustments in charts
      updateChartsTheme(isDark);
    });
  };

  const updateChartsTheme = (isDark) => {
    const gridColor = isDark ? COLORS.darkGridColor : COLORS.gridColor;
    const textColor = isDark ? COLORS.blueLight : COLORS.textDark;

    Object.keys(charts).forEach(key => {
      const chart = charts[key];
      if (chart.options.scales && chart.options.scales.x) {
        chart.options.scales.x.grid.color = gridColor;
        chart.options.scales.x.ticks.color = textColor;
      }
      if (chart.options.scales && chart.options.scales.y) {
        chart.options.scales.y.grid.color = gridColor;
        chart.options.scales.y.ticks.color = textColor;
      }
      chart.update();
    });
  };

  // --- Sidebar Mobile Toggle Handler ---
  const setupMobileSidebar = () => {
    const btn = document.getElementById('navbarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('sidebarCloseBtn');

    if (!btn || !sidebar || !overlay) return;

    btn.addEventListener('click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('open');
    });

    const closeSidebar = () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    };

    overlay.addEventListener('click', closeSidebar);
    if (closeBtn) {
      closeBtn.addEventListener('click', closeSidebar);
    }
  };

  // --- Render Dynamic Lists (Members, Programs, Roster, Meal logs) ---
  const renderAllTables = () => {
    const listMembers = JSON.parse(localStorage.getItem('apex_members')) || [];
    const listTrainers = JSON.parse(localStorage.getItem('apex_trainers')) || [];
    const listPrograms = JSON.parse(localStorage.getItem('apex_programs')) || [];
    const listNotifs = JSON.parse(localStorage.getItem('apex_notifications')) || [];

    // --- Admin Views ---
    if (userRole === 'admin') {
      // 1. Dashboard Table: Recent Members
      const recentTbody = document.getElementById('recentMembersList');
      if (recentTbody) {
        recentTbody.innerHTML = '';
        listMembers.slice(0, 5).forEach((m, idx) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>
              <div class="table-avatar">
                <div class="avatar-circle" style="background:var(--gradient-primary)">${m.name.charAt(0)}</div>
                <div>
                  <div class="avatar-name">${m.name}</div>
                  <div class="avatar-email">${m.email}</div>
                </div>
              </div>
            </td>
            <td><span class="role-badge user">${m.role}</span></td>
            <td>${m.phone}</td>
            <td><span class="status-badge ${m.status}">${m.status}</span></td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="window.dashboardApp.manageMember('${m.email}')">Manage</button>
            </td>
          `;
          recentTbody.appendChild(row);
        });
      }

      // 2. Members tab: Full Members list
      const fullTbody = document.getElementById('allMembersList');
      if (fullTbody) {
        fullTbody.innerHTML = '';
        listMembers.forEach((m) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>
              <div class="table-avatar">
                <div class="avatar-circle" style="background:var(--gradient-blue)">${m.name.charAt(0)}</div>
                <div class="avatar-name">${m.name}</div>
              </div>
            </td>
            <td>${m.email}</td>
            <td><span class="role-badge user">${m.role}</span></td>
            <td>${m.phone}</td>
            <td><span class="status-badge ${m.status}">${m.status}</span></td>
            <td>
              <button class="btn btn-secondary btn-sm" style="color:var(--danger); border-color:rgba(239,68,68,0.2)" onclick="window.dashboardApp.deleteMember('${m.email}')"><i class="fa-regular fa-trash-can"></i></button>
            </td>
          `;
          fullTbody.appendChild(row);
        });
      }

      // 3. Trainers grid
      const trainersGrid = document.getElementById('trainersGrid');
      if (trainersGrid) {
        trainersGrid.innerHTML = '';
        listTrainers.forEach(t => {
          const card = document.createElement('div');
          card.className = 'info-card text-center';
          card.innerHTML = `
            <img src="${t.image}" alt="${t.name}" style="width:70px; height:70px; border-radius:50%; margin:0 auto 12px; object-fit:cover;">
            <h3 class="workout-name">${t.name}</h3>
            <p class="workout-category">${t.specialty}</p>
            <div class="status-badge active" style="margin-top:10px;">${t.activeCount}</div>
          `;
          trainersGrid.appendChild(card);
        });
      }

      // 4. Workout Programs grid
      const progGrid = document.getElementById('programsGrid');
      if (progGrid) {
        progGrid.innerHTML = '';
        listPrograms.forEach(p => {
          const card = document.createElement('div');
          card.className = 'workout-card';
          card.innerHTML = `
            <div class="workout-card-header">
              <div class="workout-icon" style="background:var(--gradient-primary)"><i class="fa-solid fa-dumbbell"></i></div>
              <div class="workout-meta">
                <div class="workout-name">${p.title}</div>
                <div class="workout-category">${p.type}</div>
              </div>
            </div>
            <div class="workout-stats">
              <div class="w-stat">
                <div class="w-stat-value">${p.duration}</div>
                <div class="w-stat-label">Duration</div>
              </div>
              <div class="w-stat">
                <div class="w-stat-value">${p.calories}</div>
                <div class="w-stat-label">Est. Burn</div>
              </div>
              <div class="w-stat">
                <div class="w-stat-value">${p.level}</div>
                <div class="w-stat-label">Level</div>
              </div>
            </div>
          `;
          progGrid.appendChild(card);
        });
      }

      // 5. Sports Categories grid
      const catsGrid = document.getElementById('categoriesGrid');
      if (catsGrid) {
        catsGrid.innerHTML = `
          <div class="info-card text-center">
            <div class="stat-icon-wrap blue" style="margin:0 auto 12px;"><i class="fa-solid fa-running"></i></div>
            <h3 class="workout-name">Aerobics &amp; Cardio</h3>
            <p class="workout-category">2 Programs &bull; 34 Active Athletes</p>
          </div>
          <div class="info-card text-center">
            <div class="stat-icon-wrap orange" style="margin:0 auto 12px;"><i class="fa-solid fa-dumbbell"></i></div>
            <h3 class="workout-name">Strength Training</h3>
            <p class="workout-category">3 Programs &bull; 62 Active Athletes</p>
          </div>
          <div class="info-card text-center">
            <div class="stat-icon-wrap green" style="margin:0 auto 12px;"><i class="fa-solid fa-heart-pulse"></i></div>
            <h3 class="workout-name">Recovery &amp; Yoga</h3>
            <p class="workout-category">1 Program &bull; 19 Active Athletes</p>
          </div>
        `;
      }
    }

    // --- Athlete/User Views ---
    if (userRole === 'user') {
      const listUserActivities = JSON.parse(localStorage.getItem('apex_user_activities')) || [];
      const listMeals = JSON.parse(localStorage.getItem('apex_user_meals')) || [];
      const listAchievements = JSON.parse(localStorage.getItem('apex_achievements')) || [];

      // 1. Progress timeline
      const timeline = document.getElementById('progressTimelineList');
      if (timeline) {
        timeline.innerHTML = '';
        listUserActivities.slice(0, 3).forEach((a) => {
          const item = document.createElement('div');
          item.className = 'activity-item';
          item.innerHTML = `
            <div class="activity-icon" style="background:var(--gradient-blue)"><i class="fa-solid fa-circle-check"></i></div>
            <div class="activity-info">
              <div class="activity-title">Completed ${a.type}</div>
              <div class="activity-meta">Burned ${a.burn} in ${a.duration} mins.</div>
            </div>
            <div class="activity-time">${a.date}</div>
          `;
          timeline.appendChild(item);
        });
      }

      // 2. Activity logs table
      const actTbody = document.getElementById('userActivitiesList');
      if (actTbody) {
        actTbody.innerHTML = '';
        listUserActivities.forEach((a) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${a.date}</td>
            <td><strong>${a.type}</strong></td>
            <td>${a.duration} min</td>
            <td><span class="status-badge active">${a.burn}</span></td>
            <td>${a.complexity}</td>
          `;
          actTbody.appendChild(row);
        });
      }

      // 3. User Workouts Grid
      const userWorkGrid = document.getElementById('userWorkoutsGrid');
      if (userWorkGrid) {
        userWorkGrid.innerHTML = '';
        listPrograms.forEach(p => {
          const card = document.createElement('div');
          card.className = 'workout-card';
          card.innerHTML = `
            <div class="workout-card-header">
              <div class="workout-icon" style="background:var(--gradient-blue)"><i class="fa-solid fa-person-running"></i></div>
              <div class="workout-meta">
                <div class="workout-name">${p.title}</div>
                <div class="workout-category">${p.type}</div>
              </div>
            </div>
            <div class="workout-stats">
              <div class="w-stat">
                <div class="w-stat-value">${p.duration}</div>
                <div class="w-stat-label">Duration</div>
              </div>
              <div class="w-stat">
                <div class="w-stat-value">${p.calories}</div>
                <div class="w-stat-label">Energy</div>
              </div>
              <div class="w-stat">
                <div class="w-stat-value">${p.level}</div>
                <div class="w-stat-label">Difficulty</div>
              </div>
            </div>
          `;
          userWorkGrid.appendChild(card);
        });
      }

      // 4. Meals Tracker
      const mealsList = document.getElementById('mealsList');
      if (mealsList) {
        mealsList.innerHTML = '';
        listMeals.forEach(m => {
          const item = document.createElement('div');
          item.className = 'activity-item';
          item.innerHTML = `
            <div class="activity-icon" style="background:linear-gradient(135deg,#10B981,#34D399)"><i class="fa-solid fa-bowl-food"></i></div>
            <div class="activity-info">
              <div class="activity-title">${m.name}</div>
              <div class="activity-meta">Carbs: ${m.carbs} &bull; Protein: ${m.prot} &bull; Fat: ${m.fat}</div>
            </div>
            <div class="activity-time">${m.time} &bull; ${m.cals}</div>
          `;
          mealsList.appendChild(item);
        });
      }

      // 5. Trophy achievements grid
      const achGrid = document.getElementById('achievementsGrid');
      if (achGrid) {
        achGrid.innerHTML = '';
        listAchievements.forEach(ac => {
          const card = document.createElement('div');
          card.className = 'achievement-card';
          card.innerHTML = `
            <div class="achievement-badge" style="background:rgba(27, 5, 106,0.12); color:var(--primary);"><i class="${ac.icon}"></i></div>
            <div class="achievement-info">
              <h3 class="achievement-name">${ac.title}</h3>
              <p class="achievement-desc">${ac.desc}</p>
            </div>
            <div class="achievement-date">${ac.date}</div>
          `;
          achGrid.appendChild(card);
        });
      }
    }

    // --- Dynamic Notifications Panel ---
    const notifsBox = document.getElementById('notificationsCard');
    if (notifsBox) {
      notifsBox.innerHTML = '';
      const container = document.createElement('div');
      container.className = 'activity-list';
      listNotifs.forEach(n => {
        let grad = 'var(--gradient-primary)';
        if (n.color === 'blue') grad = 'var(--gradient-blue)';
        if (n.color === 'green') grad = 'linear-gradient(135deg, #10B981, #34D399)';
        if (n.color === 'yellow') grad = 'linear-gradient(135deg, #F59E0B, #FCD34D)';

        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
          <div class="activity-icon" style="background:${grad}"><i class="fa-solid ${n.icon}"></i></div>
          <div class="activity-info">
            <div class="activity-title">${n.title}</div>
            <div class="activity-meta">${n.desc}</div>
          </div>
          <div class="activity-time">${n.time}</div>
        `;
        container.appendChild(item);
      });
      notifsBox.appendChild(container);
    }

    // --- Dashboard Recents Table: Add event feeds ---
    const actsList = document.getElementById('recentActivitiesList');
    if (actsList) {
      actsList.innerHTML = `
        <div class="activity-item">
          <div class="activity-icon" style="background:var(--gradient-blue)"><i class="fa-solid fa-running"></i></div>
          <div class="activity-info">
            <div class="activity-title">Sarah Connor completed HIIT Program</div>
            <div class="activity-meta">Duration: 45 min &bull; Energy: 520 kcal</div>
          </div>
          <div class="activity-time">10m ago</div>
        </div>
        <div class="activity-item">
          <div class="activity-icon" style="background:var(--gradient-primary)"><i class="fa-solid fa-dumbbell"></i></div>
          <div class="activity-info">
            <div class="activity-title">Bruce Wayne logged Powerlifting Session</div>
            <div class="activity-meta">Coached by Trainer Serena</div>
          </div>
          <div class="activity-time">42m ago</div>
        </div>
        <div class="activity-item">
          <div class="activity-icon" style="background:linear-gradient(135deg, #10B981, #34D399)"><i class="fa-solid fa-medal"></i></div>
          <div class="activity-info">
            <div class="activity-title">Diana Prince unlocked <i class="fa-solid fa-trophy" style="color:var(--primary); margin-right:4px;"></i> Centurion Trophy</div>
            <div class="activity-meta">Exceeded 1,200 calories target.</div>
          </div>
          <div class="activity-time">2 hours ago</div>
        </div>
      `;
    }

    const eventsList = document.getElementById('upcomingEventsList');
    if (eventsList) {
      eventsList.innerHTML = `
        <div class="activity-item">
          <div class="activity-icon" style="background:var(--gradient-primary)"><i class="fa-solid fa-calendar-day"></i></div>
          <div class="activity-info">
            <div class="activity-title">Cardio Threshold Sprint Testing</div>
            <div class="activity-meta">Led by Coach Carter &bull; 8 Athletes attending</div>
          </div>
          <div class="activity-time">14:00 Today</div>
        </div>
        <div class="activity-item">
          <div class="activity-icon" style="background:var(--gradient-blue)"><i class="fa-solid fa-clock"></i></div>
          <div class="activity-info">
            <div class="activity-title">Hypertrophy Load Tuning</div>
            <div class="activity-meta">Track progress in iron room.</div>
          </div>
          <div class="activity-time">09:30 Tomorrow</div>
        </div>
      `;
    }
  };

  // --- Chart.js Initializers ---
  const initCharts = () => {
    const isDark = document.body.classList.contains('dark-mode');
    const gridColor = isDark ? COLORS.darkGridColor : COLORS.gridColor;

    if (userRole === 'admin') {
      // 1. Membership Growth Line Chart
      const memCtx = document.getElementById('membershipGrowthChart');
      if (memCtx) {
        charts.growth = new Chart(memCtx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Active Athletes Enrolled',
              data: [420, 680, 890, 1020, 1140, 1240],
              borderColor: COLORS.primary,
              backgroundColor: 'rgba(255, 107, 53, 0.1)',
              tension: 0.4,
              fill: true,
              borderWidth: 3
            }, {
              label: 'Target Estimation Limit',
              data: [500, 700, 900, 1100, 1200, 1300],
              borderColor: COLORS.blue,
              borderDash: [5, 5],
              fill: false,
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { color: gridColor }, ticks: { font: { family: 'Poppins' } } },
              y: { grid: { color: gridColor }, ticks: { font: { family: 'Poppins' } } }
            },
            plugins: { legend: { labels: { font: { family: 'Poppins' } } } }
          }
        });
      }

      // 2. Revenue Analytics Bar Chart
      const revCtx = document.getElementById('revenueAnalyticsChart');
      if (revCtx) {
        charts.revenue = new Chart(revCtx, {
          type: 'bar',
          data: {
            labels: ['Q1-25', 'Q2-25', 'Q3-25', 'Q4-25', 'Q1-26', 'Q2-26'],
            datasets: [{
              label: 'Revenue Analytics',
              data: [12000, 18500, 24000, 31000, 29000, 48000],
              backgroundColor: COLORS.blue,
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { display: false } },
              y: { grid: { color: gridColor } }
            }
          }
        });
      }

      // 3. Sports Participation Doughnut Chart
      const sportCtx = document.getElementById('sportsParticipationChart');
      if (sportCtx) {
        charts.participation = new Chart(sportCtx, {
          type: 'doughnut',
          data: {
            labels: ['Cardio Athletics', 'Strength Training', 'Recovery & Yoga'],
            datasets: [{
              data: [34, 62, 19],
              backgroundColor: [COLORS.blue, COLORS.primary, COLORS.green],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right' } }
          }
        });
      }

      // 4. Weekly Activity Graph (Analytics tab)
      const weeklyCtx = document.getElementById('weeklyActivityChart');
      if (weeklyCtx) {
        charts.weekly = new Chart(weeklyCtx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Platform Logins',
              data: [780, 890, 840, 920, 1100, 1200, 950],
              borderColor: COLORS.primary,
              tension: 0.3
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      // 5. Monthly Performance Analytics Bar Chart (Analytics tab)
      const monthlyCtx = document.getElementById('monthlyPerformanceChart');
      if (monthlyCtx) {
        charts.monthly = new Chart(monthlyCtx, {
          type: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Completed Programs',
              data: [210, 340, 410, 380, 520, 680],
              backgroundColor: COLORS.green
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }

    if (userRole === 'user') {
      // 1. Workout Progress Line Chart (User)
      const uCtx = document.getElementById('userWorkoutProgressChart');
      if (uCtx) {
        charts.userProgress = new Chart(uCtx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Minutes Trained',
              data: [45, 60, 0, 50, 75, 90, 30],
              borderColor: COLORS.blue,
              backgroundColor: COLORS.blueGlow,
              fill: true,
              borderWidth: 3,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { color: gridColor } },
              y: { grid: { color: gridColor } }
            }
          }
        });
      }

      // 2. Calories Burned Chart (User)
      const ucCtx = document.getElementById('userCaloriesBurnedChart');
      if (ucCtx) {
        charts.userCalories = new Chart(ucCtx, {
          type: 'bar',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Active Burn (kcal)',
              data: [380, 520, 0, 440, 650, 742, 280],
              backgroundColor: COLORS.primary,
              borderRadius: 6
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      // 3. Activity Distribution Doughnut Chart (User)
      const uadCtx = document.getElementById('userActivityDistributionChart');
      if (uadCtx) {
        charts.userActDist = new Chart(uadCtx, {
          type: 'doughnut',
          data: {
            labels: ['Running & Speed', 'Iron Lift', 'Aerobic Swim'],
            datasets: [{
              data: [50, 35, 15],
              backgroundColor: [COLORS.blue, COLORS.primary, COLORS.green],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right' } }
          }
        });
      }

      // 4. Fitness Improvement Graph (Progress tab)
      const ufiCtx = document.getElementById('userFitnessScoreChart');
      if (ufiCtx) {
        charts.userFitness = new Chart(ufiCtx, {
          type: 'line',
          data: {
            labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6'],
            datasets: [{
              label: 'Endurance Index Score',
              data: [72, 74, 76.5, 78, 80.5, 82],
              borderColor: COLORS.green,
              tension: 0.3
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      // 5. Weekly Performance Analytics Graph (Progress tab)
      const uwpCtx = document.getElementById('userWeeklyPerformanceChart');
      if (uwpCtx) {
        charts.userPerformance = new Chart(uwpCtx, {
          type: 'bar',
          data: {
            labels: ['Cardio Speed', 'Iron Lift', 'Aerobic Swim'],
            datasets: [{
              label: 'Sessions Done',
              data: [4, 6, 2],
              backgroundColor: COLORS.primary
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }
  };

  // --- Dynamic Dashboard Searching (Client Side) ---
  const setupTableSearch = () => {
    // 1. Admin dashboard recents search
    const dbSearch = document.getElementById('recentMembersSearch');
    if (dbSearch) {
      dbSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#recentMembersList tr');
        rows.forEach(row => {
          const text = row.innerText.toLowerCase();
          row.style.display = text.includes(query) ? '' : 'none';
        });
      });
    }

    // 2. Admin members management search
    const memSearch = document.getElementById('membersManageSearch');
    if (memSearch) {
      memSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#allMembersList tr');
        rows.forEach(row => {
          const text = row.innerText.toLowerCase();
          row.style.display = text.includes(query) ? '' : 'none';
        });
      });
    }

    // 3. Global Navbar search
    const globSearch = document.getElementById('globalSearch');
    if (globSearch) {
      globSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        spawnToast('Global Search', `Filtering index targets for: "${query}"`, 'info');
      });
    }
  };

  // --- Dynamic Table Sorting ---
  let sortDirection = {};
  const sortTable = (columnKey) => {
    const list = JSON.parse(localStorage.getItem('apex_members')) || [];
    sortDirection[columnKey] = !sortDirection[columnKey];

    list.sort((a, b) => {
      let valA = a[columnKey] || '';
      let valB = b[columnKey] || '';
      if (typeof valA === 'string') {
        return sortDirection[columnKey] 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
      return sortDirection[columnKey] ? valA - valB : valB - valA;
    });

    localStorage.setItem('apex_members', JSON.stringify(list));
    renderAllTables();
    spawnToast('Sorting Configured', `Re-indexed list sorted by: ${columnKey.toUpperCase()}`, 'info');
  };

  // --- Settings Form Syncing (Profile Updates) ---
  const setupSettingsForms = () => {
    // Admin profile settings form
    const adminForm = document.getElementById('adminSettingsForm');
    if (adminForm) {
      adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('adminNameInput').value.trim();
        const newPhone = document.getElementById('adminPhoneInput').value.trim();



        activeUser.username = newName;
        activeUser.phone = newPhone;
        localStorage.setItem(`apex_profile_${activeUser.email}`, JSON.stringify(activeUser));

        updateProfileDisplays();
        spawnToast('Profile Modified', 'Administrative details saved successfully.', 'success');
      });
    }

    // Athlete Profile Settings Form
    const userForm = document.getElementById('userSettingsForm');
    if (userForm) {
      // Load current profile fields
      document.getElementById('userNameInput').value = activeUser.username || '';
      document.getElementById('userPhoneInput').value = activeUser.phone || '';

      userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('userNameInput').value.trim();
        const newPhone = document.getElementById('userPhoneInput').value.trim();



        activeUser.username = newName;
        activeUser.phone = newPhone;
        localStorage.setItem(`apex_profile_${activeUser.email}`, JSON.stringify(activeUser));

        updateProfileDisplays();
        spawnToast('Profile Synced', 'Athlete details saved successfully.', 'success');
      });
    }

    // Athlete body metrics update
    const bodyForm = document.getElementById('userBodyForm');
    if (bodyForm) {
      bodyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const weight = document.getElementById('userWeightInput').value;
        const height = document.getElementById('userHeightInput').value;

        document.getElementById('profWeight').textContent = weight + ' kg';
        document.getElementById('profHeight').textContent = height + ' cm';

        spawnToast('Metrics Uploaded', `Body composition index updated to ${weight}kg`, 'success');
      });
    }
  };

  const updateProfileDisplays = () => {
    if (!activeUser) return;
    const nameStr = activeUser.username;
    const emailStr = activeUser.email;
    const char = nameStr.charAt(0).toUpperCase();

    // Side nav profiles
    const sideName = document.getElementById('sidebarName');
    const sideAv = document.getElementById('sidebarAvatar');
    if (sideName) sideName.textContent = nameStr;
    if (sideAv) sideAv.textContent = char;

    // Top Nav Profiles
    const navName = document.getElementById('navName');
    const navAv = document.getElementById('navAvatar');
    const navEmail = document.getElementById('navEmail');
    if (navName) navName.textContent = nameStr;
    if (navAv) navAv.textContent = char;
    if (navEmail) navEmail.textContent = emailStr;

    // View inputs
    const settingsAvatar = document.getElementById('settingsAvatar');
    const settingsName = document.getElementById('settingsName');
    const settingsEmail = document.getElementById('settingsEmail');

    if (settingsAvatar) settingsAvatar.textContent = char;
    if (settingsName) settingsName.textContent = nameStr;
    if (settingsEmail) settingsEmail.textContent = emailStr;

    // User Big Card fields
    const profileAvatarBig = document.getElementById('profileAvatarBig');
    const profileNameBig = document.getElementById('profileNameBig');
    const profileEmailBig = document.getElementById('profileEmailBig');

    if (profileAvatarBig) profileAvatarBig.textContent = char;
    if (profileNameBig) profileNameBig.textContent = nameStr;
    if (profileEmailBig) profileEmailBig.textContent = emailStr;
  };

  // --- Toggle Buttons micro interactions ---
  const setupInterfaceToggles = () => {
    document.querySelectorAll('.toggle-switch').forEach(sw => {
      sw.addEventListener('click', () => {
        sw.classList.toggle('on');
        const isActive = sw.classList.contains('on');
        spawnToast('Option Modified', `Interface element state switched to ${isActive ? 'ON' : 'OFF'}`, 'info');
      });
    });
  };

  return {
    init: (role) => {
      userRole = role;
      activeUser = AUTH.getActiveUser();

      // Setup mock data store
      initLocalStorageData();

      // Trigger GSAP screen loader fadeout
      setTimeout(() => {
        const loader = document.getElementById(role === 'admin' ? 'adminLoader' : 'userLoader');
        if (loader) {
          gsap.to(loader, {
            opacity: 0,
            duration: 0.4,
            onComplete: () => {
              loader.style.display = 'none';
              // Trigger stagger entry animations for dashboard widgets with clearProps
              gsap.from('.stat-card', {
                scale: 0.8,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'back.out(1.5)',
                clearProps: "all"
              });
            }
          });
        }
      }, 1000);

      // Populate dashboard statistics count-ups
      if (role === 'admin') {
        animateCountUp('valTotalUsers', 1240);
        animateCountUp('valTotalTrainers', 180);
        animateCountUp('valTotalPrograms', 12);
        animateCountUp('valMonthlyRevenue', 48000, 2, 'currency');
        animateCountUp('valActiveMembers', 980);
      } else {
        animateCountUp('valCalories', 742, 1.5, 'cals');
        animateCountUp('valSessions', 5);
        animateCountUp('valFitnessScore', 82);
        animateCountUp('valWeeklyProgress', 75, 1.5, 'percent');
        animateCountUp('valAchievements', 3);
      }

      // Sync user profile labels
      updateProfileDisplays();

      // Setup dynamic events and components
      setupNavTabs();
      setupThemeToggle();
      setupMobileSidebar();
      renderAllTables();
      initCharts();
      setupTableSearch();
      setupSettingsForms();
      setupInterfaceToggles();

      // Add VanillaTilt inside dashboard if tilt available
      if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
          max: 6,
          speed: 300,
          glare: true,
          "max-glare": 0.05
        });
      }

      // Add Event listeners to general buttons
      const logout = document.getElementById('logoutBtn');
      if (logout) {
        logout.addEventListener('click', () => {
          spawnToast('Session Terminated', 'Signing out of ApexPulse environment...', 'warning');
          setTimeout(() => AUTH.logout(), 1000);
        });
      }

      // Notification bell → navigate to Notifications tab
      const navNotifyBtn = document.getElementById('navNotifyBtn');
      if (navNotifyBtn) {
        navNotifyBtn.addEventListener('click', () => {
          const notifNavItem = document.querySelector('.nav-item[data-tab="notifications"]');
          if (notifNavItem) notifNavItem.click();
        });
      }
    },

    // --- Action triggers & Toasts ---
    sortTable: (key) => sortTable(key),

    addNewMember: () => {
      window.location.href = '404.html';
    },

    deleteMember: (email) => {
      window.location.href = '404.html';
    },

    addNewTrainer: () => {
      window.location.href = '404.html';
    },

    addNewProgram: () => {
      window.location.href = '404.html';
    },

    generateReport: (type) => {
      window.location.href = '404.html';
    },

    exportReport: () => {
      window.location.href = '404.html';
    },

    // --- Athlete Actions ---
    syncWatch: () => {
      window.location.href = '404.html';
    },

    logWorkout: () => {
      window.location.href = '404.html';
    },

    logMeal: () => {
      window.location.href = '404.html';
    },

    completeTodayWorkout: (btn) => {
      window.location.href = '404.html';
    },

    changeFocus: () => {
      window.location.href = '404.html';
    }
  };
})();
