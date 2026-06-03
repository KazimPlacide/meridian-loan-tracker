// ── APP ───────────────────────────────────────────────────────────────────────
(function () {
  let currentView = 'dashboard';
  let allLoansFilter = 'all';
  let editingLoanId = null;

  // ── INIT ─────────────────────────────────────────────────────────────────
  function init() {
    const session = Auth.getSession();
    if (session) showApp(session);
    else showLogin();
    bindEvents();
  }

  // ── ROUTING ──────────────────────────────────────────────────────────────
  function showLogin() {
    document.getElementById('page-login').classList.add('active');
    document.getElementById('page-app').classList.remove('active');
  }

  function showApp(session) {
    document.getElementById('page-login').classList.remove('active');
    document.getElementById('page-app').classList.add('active');
    populateSidebar(session);
    navigateTo('dashboard');
  }

  function populateSidebar(session) {
    const initials = session.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    document.getElementById('sidebar-avatar').textContent = initials;
    document.getElementById('sidebar-name').textContent = session.displayName;
    document.getElementById('sidebar-role').textContent = session.role === 'admin' ? 'Administrator' : 'Loan Officer · @' + session.username;
    if (session.role === 'admin') {
      document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    }
  }

  function navigateTo(view) {
    currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('view-' + view).classList.add('active');
    const navEl = document.querySelector('[data-view="' + view + '"]');
    if (navEl) navEl.classList.add('active');
    const titles = { dashboard: 'Dashboard', loans: 'All Loans', 'my-loans': 'My Loans', officers: 'Officers' };
    document.getElementById('topbar-title').textContent = titles[view] || '';
    closeSidebar();
    renderView(view);
  }

  // ── RENDER VIEWS ─────────────────────────────────────────────────────────
  function renderView(view) {
    if (view === 'dashboard') renderDashboard();
    else if (view === 'loans') renderAllLoans();
    else if (view === 'my-loans') renderMyLoans();
    else if (view === 'officers') renderOfficers();
  }

  function renderDashboard() {
    const session = Auth.getSession();
    const total = loans.length;
    const disbursed = loans.filter(l => l.stage === 5).length;
    const pending = loans.filter(l => l.stage < 2).length;
    const totalAmt = loans.reduce((s, l) => s + l.amount, 0);
    document.getElementById('stats-grid').innerHTML = `
      <div class="stat-card"><div class="stat-label">Total loans</div><div class="stat-val blue">${total}</div></div>
      <div class="stat-card"><div class="stat-label">Disbursed</div><div class="stat-val green">${disbursed}</div></div>
      <div class="stat-card"><div class="stat-label">Pending / new</div><div class="stat-val amber">${pending}</div></div>
      <div class="stat-card"><div class="stat-label">Portfolio (XCD)</div><div class="stat-val">${totalAmt.toLocaleString()}</div></div>
    `;
    const recent = [...loans].sort((a, b) => b.id - a.id).slice(0, 5);
    document.getElementById('recent-loans').innerHTML = renderLoanList(recent);
  }

  function renderAllLoans() {
    const chips = ['all', ...STAGES];
    const chipLabels = ['All', ...STAGES];
    document.getElementById('filter-chips').innerHTML = chips.map((c, i) =>
      `<button class="chip${allLoansFilter === c ? ' active' : ''}" data-filter="${c}">${chipLabels[i]}</button>`
    ).join('');
    document.querySelectorAll('#filter-chips .chip').forEach(btn =>
      btn.addEventListener('click', () => { allLoansFilter = btn.dataset.filter; renderAllLoans(); })
    );
    applySearchAndRender('all-loans-list', 'search-all', allLoansFilter);
    document.getElementById('search-all').addEventListener('input', () =>
      applySearchAndRender('all-loans-list', 'search-all', allLoansFilter)
    );
  }

  function renderMyLoans() {
    const session = Auth.getSession();
    applySearchAndRender('my-loans-list', 'search-my', 'all', session.username);
    document.getElementById('search-my').addEventListener('input', () =>
      applySearchAndRender('my-loans-list', 'search-my', 'all', session.username)
    );
  }

  function applySearchAndRender(containerId, searchId, stageFilter, officerFilter) {
    const q = (document.getElementById(searchId).value || '').toLowerCase();
    let list = loans;
    if (officerFilter) list = list.filter(l => l.officerUsername === officerFilter);
    if (stageFilter && stageFilter !== 'all') list = list.filter(l => STAGES[l.stage] === stageFilter);
    if (q) list = list.filter(l =>
      l.customerName.toLowerCase().includes(q) ||
      l.accountNo.toLowerCase().includes(q) ||
      l.officerName.toLowerCase().includes(q) ||
      l.officerUsername.toLowerCase().includes(q)
    );
    document.getElementById(containerId).innerHTML = list.length
      ? renderLoanList(list)
      : `<div class="empty-state"><i class="ti ti-file-off"></i><p>No loans found</p></div>`;
  }

  function renderOfficers() {
    const rows = USERS.filter(u => u.role === 'officer').map(u => {
      const count = loans.filter(l => l.officerUsername === u.username).length;
      const disbursedCount = loans.filter(l => l.officerUsername === u.username && l.stage === 5).length;
      const initials = u.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      return `<tr>
        <td><div class="officer-cell">
          <div class="officer-avatar">${initials}</div>
          <div>
            <div style="font-weight:600">${u.displayName}</div>
            <div style="font-size:11px;color:var(--gray-400)">@${u.username}</div>
          </div>
        </div></td>
        <td>${u.branch}</td>
        <td>${count}</td>
        <td>${disbursedCount}</td>
      </tr>`;
    }).join('');
    document.getElementById('officers-list').innerHTML = `
      <div class="officers-table-wrap">
        <table class="officers-table">
          <thead><tr><th>Officer</th><th>Branch</th><th>Active loans</th><th>Disbursed</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  // ── LOAN CARD HTML ────────────────────────────────────────────────────────
  function renderLoanList(list) {
    return `<div class="loan-list">${list.map(loanCard).join('')}</div>`;
  }

  function loanCard(loan) {
    const pipelineHTML = STAGES.map((s, i) => {
      const done = i < loan.stage;
      const current = i === loan.stage;
      const nodeCls = done ? 'done' : current ? 'current' : 'upcoming';
      const labelCls = done ? 'done' : current ? 'current' : '';
      const icon = done ? '<i class="ti ti-check" style="font-size:10px"></i>' : `<span>${i + 1}</span>`;
      const line = i < STAGES.length - 1
        ? `<div class="pip-line${done ? ' done' : ' upcoming'}"></div>`
        : '';
      return `<div class="pip-node ${nodeCls}" title="${STAGE_LABELS_FULL[i]}">${icon}</div>${line}`;
    }).join('');

    const labelHTML = STAGES.map((s, i) => {
      const cls = i < loan.stage ? 'done' : i === loan.stage ? 'current' : '';
      return `<div class="pip-label ${cls}">${s}</div>`;
    }).join('');

    const badgeCls = STAGE_BADGES[loan.stage];
    const badgeLabel = STAGE_LABELS_FULL[loan.stage];

    return `<div class="loan-card" data-id="${loan.id}">
      <div class="lc-top">
        <div class="lc-identity">
          <div class="lc-avatar">${initials(loan.customerName)}</div>
          <div>
            <div class="lc-name">${loan.customerName}</div>
            <div class="lc-meta">${loan.accountNo} &nbsp;·&nbsp; ${loan.type}</div>
          </div>
        </div>
        <div class="lc-right">
          <div class="lc-amount">XCD ${loan.amount.toLocaleString()}</div>
          <span class="badge ${badgeCls}">${badgeLabel}</span>
        </div>
      </div>
      <div class="pipeline">
        <div class="pipeline-track">${pipelineHTML}</div>
        <div class="pipeline-labels">${labelHTML}</div>
      </div>
      <div class="lc-footer">
        <div class="lc-foot-item"><i class="ti ti-user" aria-hidden="true"></i>${loan.officerName} <span style="color:var(--gray-400)">(@${loan.officerUsername})</span></div>
        <div class="lc-foot-item"><i class="ti ti-building" aria-hidden="true"></i>${loan.branch}</div>
        <div class="lc-foot-item"><i class="ti ti-calendar" aria-hidden="true"></i>${loan.createdAt}</div>
        ${loan.notes ? `<div class="lc-foot-item"><i class="ti ti-notes" aria-hidden="true"></i>${loan.notes}</div>` : ''}
      </div>
    </div>`;
  }

  function initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  // ── MODAL ─────────────────────────────────────────────────────────────────
  function openModal(loan) {
    editingLoanId = loan ? loan.id : null;
    const session = Auth.getSession();
    document.getElementById('modal-title').textContent = loan ? 'Update loan' : 'New loan application';
    document.getElementById('m-name').value = loan ? loan.customerName : '';
    document.getElementById('m-acct').value = loan ? loan.accountNo : '';
    document.getElementById('m-officer').value = loan ? loan.officerName : session.displayName;
    document.getElementById('m-branch').value = loan ? loan.branch : session.branch;
    document.getElementById('m-amount').value = loan ? loan.amount : '';
    document.getElementById('m-type').value = loan ? loan.type : 'Personal';
    document.getElementById('m-stage').value = loan ? loan.stage : '0';
    document.getElementById('m-notes').value = loan ? loan.notes : '';
    document.getElementById('loan-modal').classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('loan-modal').classList.add('hidden');
    editingLoanId = null;
  }

  function saveLoan() {
    const session = Auth.getSession();
    const officerName = document.getElementById('m-officer').value.trim();
    // resolve username from officer name if possible
    const matchedUser = USERS.find(u => u.displayName.toLowerCase() === officerName.toLowerCase());
    const data = {
      customerName: document.getElementById('m-name').value.trim(),
      accountNo: document.getElementById('m-acct').value.trim(),
      officerName: officerName,
      officerUsername: matchedUser ? matchedUser.username : session.username,
      branch: document.getElementById('m-branch').value,
      amount: parseInt(document.getElementById('m-amount').value) || 0,
      type: document.getElementById('m-type').value,
      stage: parseInt(document.getElementById('m-stage').value),
      notes: document.getElementById('m-notes').value.trim(),
    };
    if (!data.customerName || !data.accountNo || !data.officerName) return;
    if (editingLoanId) updateLoan(editingLoanId, data);
    else addLoan(data);
    closeModal();
    renderView(currentView);
  }

  // ── SIDEBAR MOBILE ────────────────────────────────────────────────────────
  function openSidebar() { document.getElementById('sidebar').classList.add('open'); }
  function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); }

  // ── EVENTS ────────────────────────────────────────────────────────────────
  function bindEvents() {
    // login
    document.getElementById('btn-login').addEventListener('click', handleLogin);
    document.getElementById('login-password').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });

    // logout
    document.getElementById('btn-logout').addEventListener('click', () => { Auth.logout(); showLogin(); });

    // nav
    document.querySelectorAll('.nav-item').forEach(item =>
      item.addEventListener('click', e => { e.preventDefault(); navigateTo(item.dataset.view); })
    );

    // modal
    document.getElementById('btn-new-loan').addEventListener('click', () => openModal(null));
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-save').addEventListener('click', saveLoan);
    document.getElementById('loan-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

    // loan card click (delegate)
    document.addEventListener('click', e => {
      const card = e.target.closest('.loan-card');
      if (card) {
        const loan = loans.find(l => l.id === parseInt(card.dataset.id));
        if (loan) openModal(loan);
      }
    });

    // sidebar mobile
    document.getElementById('hamburger').addEventListener('click', openSidebar);
    document.getElementById('sidebar-close').addEventListener('click', closeSidebar);
  }

  function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const session = Auth.login(username, password);
    const err = document.getElementById('login-error');
    if (!session) {
      err.textContent = 'Invalid username or password. Please try again.';
      err.classList.remove('hidden');
    } else {
      err.classList.add('hidden');
      showApp(session);
    }
  }

  init();
})();
