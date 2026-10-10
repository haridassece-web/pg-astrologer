/**
 * PG ASTROLOGER - USER ACCESS & ROLE CONTROL ENGINE (js/auth.js)
 * Gating system for Admin and Paid users.
 * Restricted features:
 * 1. சுபத்துவம் & சூட்சும வலு கோட்பாடுகள் (subhathuvam)
 * 2. பாவக விதிகள், காரக சாரிகை & முக்காலப் பலன்கள் (bhava-timeline)
 * 3. ஜாதகக் கேள்வி - பதில் (qa)
 * 4. காரகங்கள் & மருத்துவம் (karakas)
 * 5. இணைவு பலன்கள் (combinations)
 */

window.PGAstroAuth = (function() {
  const RESTRICTED_TABS = {
    'subhathuvam': 'சுபத்துவம் & சூட்சும வலு கோட்பாடுகள்',
    'bhava-timeline': 'பாவக விதிகள், காரக சாரிகை & முக்காலப் பலன்கள்',
    'qa': 'ஜாதகக் கேள்வி - பதில்',
    'karakas': 'காரகங்கள் & மருத்துவம்',
    'combinations': 'கிரக இணைவு பலன்கள்'
  };

  const PASSCODES = {
    admin: ['ADMIN123', 'ADMIN', 'PGASTRO', 'MASTER', '1234', 'ADMINISTRATOR', 'ROOT'],
    paid: ['PAID2026', 'PAID', 'VIP', 'PREMIUM', 'USER', 'MEMBER']
  };

  let currentRole = localStorage.getItem('pgastro_user_role') || 'free'; // 'free', 'paid', 'admin'

  function getRole() {
    return currentRole;
  }

  function isAdmin() {
    return currentRole === 'admin';
  }

  function isPaid() {
    return currentRole === 'paid' || currentRole === 'admin';
  }

  function isRestricted(tabId) {
    return !!RESTRICTED_TABS[tabId];
  }

  function hasAccess(tabId) {
    if (!isRestricted(tabId)) return true;
    return isPaid(); // Both Paid and Admin get full access
  }

  function setRole(newRole, autoCloseModal = true) {
    currentRole = newRole;
    localStorage.setItem('pgastro_user_role', newRole);
    updateUI();

    // Trigger re-render of active engines if needed
    const activeTabBtn = document.querySelector('.nav-tab-btn.active, .mobile-nav-item.active');
    const activeTab = activeTabBtn?.dataset?.tab;

    if (activeTab === 'bhava-timeline' && window.PGAstroBhavaEngine) {
      window.PGAstroBhavaEngine.render();
    }
    if (window.PGAstroEngine && window.PGAstroEngine.evaluateCurrentChart) {
      window.PGAstroEngine.evaluateCurrentChart();
    }

    if (autoCloseModal) {
      setTimeout(() => {
        closeAccessModal();
      }, 300);
    }
  }

  function loginWithCode(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    const statusEl = document.getElementById('accessModalStatus');

    if (PASSCODES.admin.includes(cleanCode)) {
      setRole('admin', true);
      if (statusEl) {
        statusEl.style.color = 'var(--emerald-green)';
        statusEl.textContent = '👑 Admin (நிர்வாகி) முழு அணுகல் இயங்கியது!';
      }
      if (window.PGAstroUI && window.PGAstroUI.showToast) {
        window.PGAstroUI.showToast('👑 Admin (நிர்வாகி) முழு அணுகல் இயங்கியது!');
      }
      return { success: true, role: 'admin', message: '👑 Admin (நிர்வாகி) முழு அணுகல் இயங்கியது!' };
    }

    if (PASSCODES.paid.includes(cleanCode)) {
      setRole('paid', true);
      if (statusEl) {
        statusEl.style.color = '#38bdf8';
        statusEl.textContent = '⭐ Paid User அணுகல் இயங்கியது!';
      }
      if (window.PGAstroUI && window.PGAstroUI.showToast) {
        window.PGAstroUI.showToast('⭐ Paid User அணுகல் இயங்கியது!');
      }
      return { success: true, role: 'paid', message: '⭐ Paid User அணுகல் இயங்கியது!' };
    }

    if (statusEl) {
      statusEl.style.color = 'var(--ruby-fire)';
      statusEl.textContent = '❌ தவறான அணுகல் குறியீடு! (Invalid Passcode)';
    }
    if (window.PGAstroUI && window.PGAstroUI.showToast) {
      window.PGAstroUI.showToast('❌ தவறான அணுகல் குறியீடு (Invalid Passcode)');
    }
    return { success: false, message: '❌ தவறான குறியீடு' };
  }

  function updateUI() {
    // 1. Update Header Badge
    const headerBtn = document.getElementById('btnUserAccessHeader');
    if (headerBtn) {
      if (currentRole === 'admin') {
        headerBtn.className = 'btn btn-sm btn-gold';
        headerBtn.innerHTML = '<span>👑</span> <span>Admin (நிர்வாகி)</span>';
      } else if (currentRole === 'paid') {
        headerBtn.className = 'btn btn-sm btn-gold';
        headerBtn.innerHTML = '<span>⭐</span> <span>Paid User</span>';
      } else {
        headerBtn.className = 'btn btn-sm btn-outline-gold';
        headerBtn.innerHTML = '<span>🔒</span> <span>பிரீமியம் / உள்நுழைக</span>';
      }
    }

    // Update Modal Current Role Display if open
    const currentRoleDisplay = document.getElementById('currentAccessRoleBadge');
    if (currentRoleDisplay) {
      if (currentRole === 'admin') {
        currentRoleDisplay.innerHTML = '<span style="color:#ffd700; font-weight: bold;">👑 Admin (நிர்வாகி - முழு அணுகல்)</span>';
      } else if (currentRole === 'paid') {
        currentRoleDisplay.innerHTML = '<span style="color:#38bdf8; font-weight: bold;">⭐ Paid User (கட்டணப் பயனர் அணுகல்)</span>';
      } else {
        currentRoleDisplay.innerHTML = '<span style="color:#94a3b8; font-weight: bold;">👤 Free User (இலவசப் பயனர் - அடிப்படை அணுகல்)</span>';
      }
    }

    // 2. Update Nav Tabs (Lock Badges)
    document.querySelectorAll('.nav-tab-btn, .mobile-nav-item').forEach(btn => {
      const tabId = btn.dataset.tab;
      if (isRestricted(tabId)) {
        let lockSpan = btn.querySelector('.tab-lock-badge');
        if (!hasAccess(tabId)) {
          if (!lockSpan) {
            lockSpan = document.createElement('span');
            lockSpan.className = 'tab-lock-badge';
            lockSpan.innerHTML = '🔒';
            lockSpan.style.cssText = 'margin-left: 4px; font-size: 0.75rem; opacity: 0.85;';
            btn.appendChild(lockSpan);
          } else {
            lockSpan.style.display = 'inline';
          }
          btn.classList.add('tab-restricted');
        } else {
          if (lockSpan) lockSpan.style.display = 'none';
          btn.classList.remove('tab-restricted');
        }
      }
    });

    // 3. Update Restricted Tab Panes
    Object.keys(RESTRICTED_TABS).forEach(tabId => {
      const pane = document.getElementById(`tab_${tabId}`);
      if (!pane) return;
      let lockNotice = pane.querySelector('.pane-lock-overlay');
      if (!hasAccess(tabId)) {
        if (!lockNotice) {
          lockNotice = document.createElement('div');
          lockNotice.className = 'pane-lock-overlay cosmic-card highlight';
          lockNotice.style.cssText = 'margin: 1.5rem 0; padding: 2.2rem 1.5rem; text-align: center; border: 2px dashed rgba(212,175,55,0.45); border-radius: var(--radius-lg); background: rgba(11,15,29,0.92);';
          pane.prepend(lockNotice);
        }
        lockNotice.style.display = 'block';
        lockNotice.innerHTML = `
          <div style="font-size: 2.8rem; margin-bottom: 0.6rem;">🔒</div>
          <h2 style="color: var(--gold-primary); font-size: 1.35rem; margin-bottom: 0.6rem; font-family: var(--font-heading);">
            ${RESTRICTED_TABS[tabId]} - பிரீமியம் & நிர்வாகி வசதி
          </h2>
          <p style="color: var(--text-muted); max-width: 620px; margin: 0 auto 1.5rem; font-size: 0.92rem; line-height: 1.6;">
            இப்பகுதி (<strong>${RESTRICTED_TABS[tabId]}</strong>) கட்டணம் செலுத்திய பயனர்கள் (<strong>Paid User</strong>) மற்றும் நிர்வாகி (<strong>Admin</strong>) கணக்குகளுக்கு மட்டுமே அணுகக்கூடியது.
          </p>
          <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; align-items: center;">
            <button class="btn btn-gold" onclick="window.PGAstroAuth.showAccessModal('${tabId}')">
              <span>🔑</span> அணுகல் குறியீடு / லாக் இன்
            </button>
            <button class="btn btn-secondary" onclick="window.PGAstroAuth.quickSwitchRole('paid')">
              <span>⭐</span> Paid User ஆக மாற்று
            </button>
            <button class="btn btn-secondary" onclick="window.PGAstroAuth.quickSwitchRole('admin')">
              <span>👑</span> Admin (Full Access) மாற்று
            </button>
          </div>
        `;
        // Hide normal pane content if restricted
        const children = Array.from(pane.children);
        children.forEach(child => {
          if (!child.classList.contains('pane-lock-overlay')) {
            if (!child.hasAttribute('data-prev-display')) {
              child.setAttribute('data-prev-display', child.style.display || '');
            }
            child.style.display = 'none';
          }
        });
      } else {
        if (lockNotice) lockNotice.style.display = 'none';
        const children = Array.from(pane.children);
        children.forEach(child => {
          if (!child.classList.contains('pane-lock-overlay')) {
            const prevDisp = child.getAttribute('data-prev-display');
            child.style.display = (prevDisp !== null && prevDisp !== 'none') ? prevDisp : '';
          }
        });
      }
    });

    // 4. Update Tab 1 Q&A Wrapper
    const tab1QAWrapper = document.getElementById('tab1HoroscopeQAWrapper');
    if (tab1QAWrapper) {
      let tab1LockNotice = document.getElementById('tab1QALockNotice');
      if (!hasAccess('qa')) {
        const qaContainer = document.getElementById('tab1HoroscopeQAContainer');
        if (qaContainer) qaContainer.style.display = 'none';
        if (!tab1LockNotice) {
          tab1LockNotice = document.createElement('div');
          tab1LockNotice.id = 'tab1QALockNotice';
          tab1LockNotice.className = 'cosmic-card';
          tab1LockNotice.style.cssText = 'padding: 1.5rem; text-align: center; border: 1px solid rgba(212,175,55,0.3); border-radius: var(--radius-md); margin-top: 1rem;';
          tab1QAWrapper.appendChild(tab1LockNotice);
        }
        tab1LockNotice.style.display = 'block';
        tab1LockNotice.innerHTML = `
          <div style="font-size: 2.2rem; margin-bottom: 0.4rem;">🔒</div>
          <h3 style="color: var(--gold-primary); font-size: 1.1rem; margin-bottom: 0.4rem;">
            14 முக்கிய வாழ்க்கை கேள்வி-பதில் பகுப்பாய்வு (Restricted Content)
          </h3>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">
            ஜாதகக் கேள்வி-பதில் பிரீமியம் வசதி Paid User மற்றும் Admin-க்கு மட்டுமே கிடைக்கும்.
          </p>
          <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-sm btn-gold" onclick="window.PGAstroAuth.showAccessModal('qa')">
              <span>🔑</span> அணுகல் பெற / லாக் இன்
            </button>
            <button class="btn btn-sm btn-secondary" onclick="window.PGAstroAuth.quickSwitchRole('paid')">
              <span>⭐</span> Unlock as Paid User
            </button>
          </div>
        `;
      } else {
        const qaContainer = document.getElementById('tab1HoroscopeQAContainer');
        if (qaContainer) qaContainer.style.display = '';
        if (tab1LockNotice) tab1LockNotice.style.display = 'none';
      }
    }
  }

  function quickSwitchRole(role) {
    setRole(role, true);
    if (window.PGAstroUI && window.PGAstroUI.showToast) {
      const roleName = role === 'admin' ? '👑 Admin (நிர்வாகி)' : role === 'paid' ? '⭐ Paid User (பிரீமியம்)' : '👤 Free User (இலவசம்)';
      window.PGAstroUI.showToast(`அணுகல் நிலை மாற்றப்பட்டது: ${roleName}`);
    }
  }

  function showAccessModal(targetTabKey = null) {
    const modal = document.getElementById('accessModal');
    if (!modal) return;
    
    const subtitleEl = document.getElementById('accessModalSubtitle');
    if (subtitleEl) {
      if (targetTabKey && RESTRICTED_TABS[targetTabKey]) {
        subtitleEl.innerHTML = `🔒 "<strong>${RESTRICTED_TABS[targetTabKey]}</strong>" வசதியை அணுக Paid User அல்லது Admin ஆக உள்நுழையவும்.`;
      } else {
        subtitleEl.innerHTML = 'PG Astrologer கட்டணச் சேவைகள் மற்றும் நிர்வாகி அணுகல் மையம்.';
      }
    }
    
    const statusEl = document.getElementById('accessModalStatus');
    if (statusEl) statusEl.textContent = '';
    
    updateUI();
    modal.classList.add('show');
  }

  function closeAccessModal() {
    const modal = document.getElementById('accessModal');
    if (modal) modal.classList.remove('show');
  }

  function setupAuthEvents() {
    // Header access button
    const headerBtn = document.getElementById('btnUserAccessHeader');
    headerBtn?.addEventListener('click', () => showAccessModal());

    // Modal close button
    const closeBtn = document.getElementById('btnCloseAccessModal');
    closeBtn?.addEventListener('click', closeAccessModal);

    // Backdrop click close
    const accessModal = document.getElementById('accessModal');
    accessModal?.addEventListener('click', (e) => {
      if (e.target === accessModal) {
        closeAccessModal();
      }
    });

    // Passcode submit button
    const submitBtn = document.getElementById('btnSubmitAccessCode');
    const inputEl = document.getElementById('accessPasscodeInput');

    function handleCodeSubmit() {
      if (!inputEl) return;
      loginWithCode(inputEl.value);
    }

    submitBtn?.addEventListener('click', handleCodeSubmit);
    inputEl?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleCodeSubmit();
    });

    // Role switcher buttons inside modal
    document.getElementById('btnSetRoleFree')?.addEventListener('click', () => {
      quickSwitchRole('free');
    });

    document.getElementById('btnSetRolePaid')?.addEventListener('click', () => {
      quickSwitchRole('paid');
    });

    document.getElementById('btnSetRoleAdmin')?.addEventListener('click', () => {
      quickSwitchRole('admin');
    });
  }

  function init() {
    setupAuthEvents();
    updateUI();
  }

  return {
    init: init,
    getRole: getRole,
    isAdmin: isAdmin,
    isPaid: isPaid,
    hasAccess: hasAccess,
    isRestricted: isRestricted,
    setRole: setRole,
    quickSwitchRole: quickSwitchRole,
    loginWithCode: loginWithCode,
    showAccessModal: showAccessModal,
    closeAccessModal: closeAccessModal,
    updateUI: updateUI,
    RESTRICTED_TABS: RESTRICTED_TABS
  };
})();
