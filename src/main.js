import './style.css';
import { initAuth, registerUser, loginUser, logoutUser, updateUsername } from './auth';
import { addExpense, subscribeToExpenses, deleteExpense, updateExpense, setMonthlyBudget, subscribeToBudget } from './db';
import { renderLogin, renderSignup, renderDashboard } from './ui';
import Chart from 'chart.js/auto';

const app = document.querySelector('#app');

// State
let currentUser = null;
let expensesCleanup = null;
let budgetCleanup = null;
let currentEditingId = null;
let currentBudgetLimit = null;
let currentChartYear = new Date().getFullYear();

// Theme Management
const getPreferredTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};

// Initialize Theme
setTheme(getPreferredTheme());

// Initialization
const init = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');

  if (mode === 'login') {
    await logoutUser();
    // Clean up URL to avoid repeated logouts on refresh
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  initAuth((user) => {
    currentUser = user;
    if (user) {
      showDashboard(user);
    } else {
      showLogin();
    }
  });
};

init();


// Navigation Functions
function showLogin() {
  if (expensesCleanup) expensesCleanup();
  if (budgetCleanup) budgetCleanup();
  app.innerHTML = renderLogin();

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      await loginUser(email, password);
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    showSignup();
  });

  // Theme Toggle Logic
  const themeInput = document.getElementById('theme-toggle-input');
  if (themeInput) {
    themeInput.checked = document.documentElement.getAttribute('data-theme') === 'dark';
    themeInput.addEventListener('change', (e) => setTheme(e.target.checked ? 'dark' : 'light'));
  }
}

function showSignup() {
  app.innerHTML = renderSignup();

  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const username = e.target.username.value; // Get username
    try {
      await registerUser(username, email, password);
      // Reload to ensure displayName is updated in the UI
      window.location.reload();
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    showLogin();
  });

  // Theme Toggle Logic
  const themeInput = document.getElementById('theme-toggle-input');
  if (themeInput) {
    themeInput.checked = document.documentElement.getAttribute('data-theme') === 'dark';
    themeInput.addEventListener('change', (e) => setTheme(e.target.checked ? 'dark' : 'light'));
  }
}

function showDashboard(user) {
  app.innerHTML = renderDashboard(user);

  // Theme Toggle Logic
  const themeInput = document.getElementById('theme-toggle-input');
  const updateThemeState = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    themeInput.checked = currentTheme === 'dark';
  };
  updateThemeState();

  themeInput.addEventListener('change', (e) => {
    const newTheme = e.target.checked ? 'dark' : 'light';
    setTheme(newTheme);
  });

  // Personalized greeting by time of day
  const greetingEl = document.getElementById('header-greeting');
  if (greetingEl) {
    const hour = new Date().getHours();
    const tod = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const firstName = user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'there';
    greetingEl.textContent = `Good ${tod}, ${firstName} 👋`;
  }

  // Live date pill
  const datePillWrap = document.getElementById('header-date-pill');
  if (datePillWrap) {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    datePillWrap.innerHTML = `<span class="date-pill"><i class="bi bi-calendar3"></i> ${formatted}</span>`;
  }

  // Setup Logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error(error);
    }
  });

  // Setup Profile Modal
  const profileModal = document.getElementById('edit-profile-modal');
  const profileBtn = document.getElementById('profile-btn');
  const closeProfileBtn = document.getElementById('close-profile-modal-btn');
  const profileForm = document.getElementById('edit-profile-form');
  
  const profileView = document.getElementById('profile-view-mode');
  const enableEditBtn = document.getElementById('enable-edit-profile-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-profile-btn');

  if (profileBtn && profileModal) {
    profileBtn.addEventListener('click', () => {
      profileModal.classList.add('active');
      // Always reset to view mode on open
      if (profileView) profileView.style.display = 'block';
      if (profileForm) profileForm.style.display = 'none';
      
      const currentUsernameDisplay = document.getElementById('current-username-display');
      if (currentUsernameDisplay) {
         currentUsernameDisplay.textContent = user.displayName || 'No name set';
      }
      if (profileForm && profileForm.username) {
         profileForm.username.value = user.displayName || '';
      }
    });
  }

  if (closeProfileBtn) {
    closeProfileBtn.addEventListener('click', () => {
      profileModal.classList.remove('active');
    });
  }

  if (profileModal) {
    profileModal.addEventListener('click', (e) => {
      if (e.target === profileModal) {
        profileModal.classList.remove('active');
      }
    });
  }

  if (enableEditBtn && profileForm && profileView) {
    enableEditBtn.addEventListener('click', () => {
      profileView.style.display = 'none';
      profileForm.style.display = 'block';
    });
  }

  if (cancelEditBtn && profileForm && profileView) {
    cancelEditBtn.addEventListener('click', () => {
      profileView.style.display = 'block';
      profileForm.style.display = 'none';
    });
  }

  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newUsername = e.target.username.value.trim();
      if (!newUsername) return;

      const submitBtn = profileForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Saving...';
      submitBtn.disabled = true;

      try {
        await updateUsername(user, newUsername);

        user.displayName = newUsername;

        // Update Header Greeting
        const greetingEl = document.getElementById('header-greeting');
        if (greetingEl) {
          const hour = new Date().getHours();
          let tod = 'evening 🌙';
          if (hour < 12) tod = 'morning 🌅';
          else if (hour < 17) tod = 'afternoon ☀️';
          
          greetingEl.textContent = `Good ${tod}, ${newUsername}`;
        }
        
        const displayUsernameEl = document.getElementById('current-username-display');
        if (displayUsernameEl) displayUsernameEl.textContent = newUsername;
        
        if (profileView) profileView.style.display = 'block';
        if (profileForm) profileForm.style.display = 'none';

        profileModal.classList.remove('active');
      } catch (error) {
        console.error("Error updating profile:", error);
        alert(`Failed to update profile: ${error.message}`);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Setup Add Expense/Income Modals
  const modal = document.getElementById('add-expense-modal');
  const addExpenseBtn = document.getElementById('add-expense-btn');
  const addIncomeBtn = document.getElementById('add-income-btn');
  const closeBtn = document.getElementById('close-modal-btn');
  const form = document.getElementById('add-expense-form');

  const openModal = (type) => {
    modal.classList.add('active');
    const titleEl = document.querySelector('#add-expense-modal h3');
    const submitBtn = document.querySelector('#add-expense-form button[type="submit"]');

    if (type === 'income') {
      titleEl.textContent = 'Add New Income';
      submitBtn.textContent = 'Add Income';
      form.type.value = 'income';
    } else {
      titleEl.textContent = 'Add New Expense';
      submitBtn.textContent = 'Add Expense';
      form.type.value = 'expense';
    }
  };

  if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', () => {
      openModal('expense');
    });
  }

  if (addIncomeBtn) {
    addIncomeBtn.addEventListener('click', () => {
      openModal('income');
    });
  }

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    form.reset();
    currentEditingId = null;
    document.querySelector('#add-expense-modal h3').textContent = 'Add New Expense';
    document.querySelector('#add-expense-form button[type="submit"]').textContent = 'Add Expense';
  });

  // Close modal on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // FAB Speed Dial Logic
  const fabContainer = document.getElementById('fab-container');
  const fabMainBtn = document.getElementById('fab-main-btn');
  const fabAddIncome = document.getElementById('fab-add-income-btn');
  const fabAddExpense = document.getElementById('fab-add-expense-btn');

  if (fabMainBtn) {
    fabMainBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fabContainer.classList.toggle('fab-open');
    });
  }

  if (fabAddIncome) {
    fabAddIncome.addEventListener('click', () => {
      openModal('income');
      fabContainer.classList.remove('fab-open');
    });
  }

  if (fabAddExpense) {
    fabAddExpense.addEventListener('click', () => {
      openModal('expense');
      fabContainer.classList.remove('fab-open');
    });
  }

  // Close FAB when clicking outside
  document.addEventListener('click', (e) => {
    if (fabContainer && !fabContainer.contains(e.target)) {
      fabContainer.classList.remove('fab-open');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const expense = {
      description: e.target.description.value,
      amount: parseFloat(e.target.amount.value),
      category: e.target.category.value,
      date: e.target.date.value,
      type: e.target.type.value // 'income' or 'expense'
    };

    try {
      if (currentEditingId) {
        await updateExpense(currentEditingId, expense);
      } else {
        await addExpense(user.uid, expense);
      }
      modal.classList.remove('active');
      form.reset();

      // Reset Edit State
      currentEditingId = null;
      document.querySelector('#add-expense-modal h3').textContent = 'Add New Transaction';
      document.querySelector('#add-expense-form button[type="submit"]').textContent = 'Add Transaction';
    } catch (error) {
      console.error("Error saving expense: ", error);
      alert("Failed to save transaction");
    }
  });

  // Load Expenses
  const listContainer = document.getElementById('expenses-list');
  const totalAmountEl = document.getElementById('total-amount');
  const filterSelect = document.getElementById('date-filter');
  const searchInput = document.getElementById('transaction-search');

  let isSelectionMode = false;
  let selectedIds = [];

  const bulkSelectBtn = document.getElementById('bulk-select-btn');
  if (bulkSelectBtn) {
    bulkSelectBtn.addEventListener('click', () => {
      isSelectionMode = !isSelectionMode;
      selectedIds = [];
      bulkSelectBtn.classList.toggle('active', isSelectionMode);
      bulkSelectBtn.innerHTML = isSelectionMode ? '<i class="bi bi-x-lg me-1"></i> Cancel' : '<i class="bi bi-check2-square me-1"></i> Select';
      renderExpenses();
      updateBulkBar();
    });
  }

  const updateBulkBar = () => {
    let bar = document.getElementById('bulk-actions-bar');
    if (selectedIds.length === 0) {
      if (bar) bar.remove();
      return;
    }

    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'bulk-actions-bar';
      bar.className = 'bulk-actions-bar';
      document.body.appendChild(bar);
    }

    bar.innerHTML = `
      <div class="bulk-bar-content">
        <span class="selected-count">${selectedIds.length} items selected</span>
        <div class="bulk-btns">
          <button id="bulk-delete-btn" class="btn-bulk-delete"><i class="bi bi-trash me-1"></i> Delete</button>
          <button id="bulk-cancel-btn" class="btn-bulk-cancel">Cancel</button>
        </div>
      </div>
    `;

    document.getElementById('bulk-delete-btn').addEventListener('click', async () => {
      if (confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`)) {
        for (const id of selectedIds) {
          await deleteExpense(id);
        }
        isSelectionMode = false;
        selectedIds = [];
        bulkSelectBtn.innerHTML = '<i class="bi bi-check2-square me-1"></i> Select';
        renderExpenses();
        updateBulkBar();
      }
    });

    document.getElementById('bulk-cancel-btn').addEventListener('click', () => {
      isSelectionMode = false;
      selectedIds = [];
      bulkSelectBtn.innerHTML = '<i class="bi bi-check2-square me-1"></i> Select';
      renderExpenses();
      updateBulkBar();
    });
  };

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      // Re-render expenses but keep charts logic as is
      renderExpenses();
    });
  }

  let allExpenses = [];

  // Chart Instances
  let pieChart = null;
  let barChart = null;
  let incomeExpenseChart = null;

  // Chart Tab Switching Logic
  const tabHeader = document.querySelector('.charts-tab-header');
  if (tabHeader) {
    const tabBtns = tabHeader.querySelectorAll('.chart-tab-btn');
    const chartCards = document.querySelectorAll('.charts-container .chart-card');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        // Update Buttons
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update year stepper visibility
        const yearStepper = document.getElementById('chart-year-stepper');
        if (yearStepper) {
          yearStepper.style.display = (targetTab === 'trends' || targetTab === 'comparison') ? 'flex' : 'none';
        }

        // Update Cards
        chartCards.forEach(card => {
          card.classList.remove('active');
          if (card.id === `tab-${targetTab}`) {
            card.classList.add('active');
          }
        });
      });
    });
  }

  // Set initial year label
  const chartYearLabel = document.getElementById('chart-year-label');
  if (chartYearLabel) {
    chartYearLabel.textContent = currentChartYear;
  }

  const chartPrevYearBtn = document.getElementById('chart-prev-year');
  if (chartPrevYearBtn) {
    chartPrevYearBtn.addEventListener('click', () => {
      currentChartYear--;
      if (chartYearLabel) chartYearLabel.textContent = currentChartYear;
      renderExpenses();
    });
  }

  const chartNextYearBtn = document.getElementById('chart-next-year');
  if (chartNextYearBtn) {
    chartNextYearBtn.addEventListener('click', () => {
      currentChartYear++;
      if (chartYearLabel) chartYearLabel.textContent = currentChartYear;
      renderExpenses();
    });
  }

  const updateCharts = (currentExpenses, allExpenses) => {
    const pieCtx = document.getElementById('pie-chart');
    const barCtx = document.getElementById('bar-chart');

    // 1. Pie Chart Logic (Uses current filtered data)
    const categoryCounts = {};
    currentExpenses.forEach(exp => {
      if (categoryCounts[exp.category]) categoryCounts[exp.category] += exp.amount;
      else categoryCounts[exp.category] = exp.amount;
    });

    // Milder Pastel Palette matching the theme
    // Expanded to 12 colors for the bar chart
    // Color Hunt Palettes (#C599B6, #E6B2BA, #FAD0C4, #FFF7F3) and (#FF8F8F, #FFF1CB, #C2E2FA, #B7A3E3)
    const pastelColors = [
      '#FF8F8F', // Soft Red
      '#C2E2FA', // Soft Blue
      '#B7A3E3', // Soft Purple
      '#C599B6', // Muted Purple
      '#E6B2BA', // Muted Pink
      '#FAD0C4', // Muted Peach
      '#FFF1CB', // Warm Cream
      '#FFF7F3'  // Soft White
    ];

    const pieData = {
      labels: Object.keys(categoryCounts),
      datasets: [{
        data: Object.values(categoryCounts),
        backgroundColor: pastelColors,
        borderWidth: 2,
        borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
        hoverOffset: 4
      }]
    };

    if (pieChart) pieChart.destroy();
    pieChart = new Chart(pieCtx, {
      type: 'doughnut',
      data: pieData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 10,
              font: {
                family: "'Outfit', sans-serif",
                size: 13,
                weight: '500'
              },
              color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
            }
          }
        },
        cutout: '70%',
        layout: {
          padding: 0
        },
        elements: {
          arc: {
            borderRadius: 8
          }
        }
      }
    });

    // 2. Bar Chart Logic (Calendar Year: Jan - Dec)
    const monthlyTotals = {};
    const monthsInYear = [];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 12; i++) {
      const monthYear = `${currentChartYear}-${String(i + 1).padStart(2, '0')}`;
      monthlyTotals[monthYear] = 0;
      monthsInYear.push({ key: monthYear, label: shortMonths[i] });
    }

    allExpenses.forEach(exp => {
      // Only count expenses for Monthly Spending
      if (exp.type === 'income') return;

      const d = new Date(exp.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyTotals.hasOwnProperty(key)) {
        monthlyTotals[key] += exp.amount;
      }
    });

    const barData = {
      labels: monthsInYear.map(m => m.label),
      datasets: [{
        label: 'Monthly Spending',
        data: monthsInYear.map(m => monthlyTotals[m.key]),
        backgroundColor: pastelColors, /* Use the colorful palette */
        borderRadius: 6,
        barPercentage: 0.9,
        categoryPercentage: 0.9
      }]
    };

    if (barChart) barChart.destroy();
    barChart = new Chart(barCtx, {
      type: 'bar',
      data: barData,
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false, /* Fix spacing/aspect ratio */
        layout: {
          padding: {
            bottom: 0,
            top: 0
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { display: false, drawBorder: false },
            ticks: { autoSkip: false, font: { family: "'Outfit', sans-serif" } }
          },
          x: {
            grid: { display: false, drawBorder: false },
            ticks: { font: { family: "'Outfit', sans-serif" } }
          }
        },
        plugins: { legend: { display: false } }
      }
    });

    // 3. Income vs Expenses Chart Logic (Line Chart)
    const incomeExpenseCtx = document.getElementById('income-expense-chart');
    if (incomeExpenseCtx) {
      const monthlyIncome = {};
      const monthlyExpenses = {};

      // Initialize with 0 for calendar year
      monthsInYear.forEach(m => {
        monthlyIncome[m.key] = 0;
        monthlyExpenses[m.key] = 0;
      });

      allExpenses.forEach(trans => {
        const d = new Date(trans.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        if (monthlyIncome.hasOwnProperty(key)) {
          if (trans.type === 'income') {
            monthlyIncome[key] += trans.amount;
          } else {
            monthlyExpenses[key] += trans.amount;
          }
        }
      });

      const incomeExpenseData = {
        labels: monthsInYear.map(m => m.label),
        datasets: [
          {
            label: 'Income',
            data: monthsInYear.map(m => monthlyIncome[m.key]),
            borderColor: '#10b981', // Success Green
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Expenses',
            data: monthsInYear.map(m => monthlyExpenses[m.key]),
            borderColor: '#ef4444', // Danger Red
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      };

      if (incomeExpenseChart) incomeExpenseChart.destroy();
      incomeExpenseChart = new Chart(incomeExpenseCtx, {
        type: 'line',
        data: incomeExpenseData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                font: { family: "'Outfit', sans-serif" }
              }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: "'Outfit', sans-serif" } }
            },
            y: {
              beginAtZero: true,
              grid: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
              ticks: { font: { family: "'Outfit', sans-serif" } }
            }
          }
        }
      });
    }
  };

  // State for filtering & pagination
  let selectedCategoryFilter = null;
  let visibleCount = 8;

  const renderExpenses = () => {
    let filterValue = filterSelect.value;

    // Default to current month if 'all' is selected but we want current month on login
    // However, if the user explicitly chooses 'all', we should show all.
    // The issue is that filterSelect.value is 'all' before updateFilterOptions runs.

    let dateFilteredExpenses = allExpenses;

    // 1. Filter by Date (Base Filter)
    if (filterValue !== 'all') {
      dateFilteredExpenses = allExpenses.filter(exp => {
        return exp.date.startsWith(filterValue);
      });
    }

    // Calculate Totals (Based on Date Filter)
    const incomeTotal = dateFilteredExpenses
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const expenseTotal = dateFilteredExpenses
      .filter(t => t.type !== 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const balance = incomeTotal - expenseTotal;

    // Update Overview Cards
    const balanceEl = document.getElementById('balance-amount');
    const incomeEl = document.getElementById('income-amount');
    const expensesEl = document.getElementById('total-amount');

    if (balanceEl) balanceEl.textContent = `₹ ${balance.toFixed(2)}`;
    if (incomeEl) incomeEl.textContent = `₹ ${incomeTotal.toFixed(2)}`;
    if (expensesEl) expensesEl.textContent = `₹ ${expenseTotal.toFixed(2)}`;

    // Update Charts (Based on Date Filter - ONLY Expenses for Pie, ALL for Line/Bar)
    const expenseOnlyData = dateFilteredExpenses.filter(t => t.type !== 'income');
    updateCharts(expenseOnlyData, allExpenses);

    // Update Insights (Based on Date Filter)
    updateInsights(allExpenses, filterValue);

    // 2. Filter by Category (Secondary Filter for List)
    let listData = dateFilteredExpenses;
    if (selectedCategoryFilter) {
      listData = dateFilteredExpenses.filter(exp => exp.category === selectedCategoryFilter);
    }

    // Update Recent Transactions Header (Simplified)
    const transactionsHeader = document.querySelector('main h3'); // "Recent Transactions"
    if (transactionsHeader) {
      if (selectedCategoryFilter) {
        transactionsHeader.textContent = `Recent Transactions - ${selectedCategoryFilter}`;
      } else {
        transactionsHeader.textContent = 'Recent Transactions';
      }
    }

    listContainer.innerHTML = '';

    // Search Filtering
    const searchInput = document.getElementById('transaction-search');

    // Add listener for resetting visibleCount on typing (only once)
    if (searchInput && !searchInput.dataset.paginationBound) {
      searchInput.addEventListener('input', () => {
        visibleCount = 8;
        renderExpenses();
      });
      searchInput.dataset.paginationBound = "true";
    }

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    if (searchTerm) {
      listData = listData.filter(exp =>
        exp.description.toLowerCase().includes(searchTerm) ||
        exp.category.toLowerCase().includes(searchTerm)
      );
    }

    // Determine slice for pagination
    const totalTransactions = listData.length;
    const paginatedData = listData.slice(0, visibleCount);

    if (paginatedData.length === 0) {
      if (searchTerm) {
        listContainer.innerHTML = `
          <div class="empty-state" style="padding: 2rem;">
            <i class="bi bi-search" style="font-size: 2.5rem; color: var(--text-secondary); opacity: 0.5;"></i>
            <p style="margin-top: 1rem; color: var(--text-secondary);">No transactions match "${searchTerm}"</p>
          </div>
        `;
      } else {
        listContainer.innerHTML = renderEmptyExpenses();
        const emptyStateBtn = document.getElementById('empty-state-add-btn');
        if (emptyStateBtn) {
          emptyStateBtn.addEventListener('click', () => openModal('expense'));
        }
      }
    }

    // Category Totals for Expense Breakdown (Based on Date Filter)
    const categoryTotals = {};
    expenseOnlyData.forEach(expense => {
      if (categoryTotals[expense.category]) {
        categoryTotals[expense.category] += expense.amount;
      } else {
        categoryTotals[expense.category] = expense.amount;
      }
    });

    paginatedData.forEach(expense => {
      // Ensure number
      expense.amount = parseFloat(expense.amount);
      const isIncome = expense.type === 'income';

      const amountClass = isIncome ? 'text-success' : 'text-danger';
      const sign = isIncome ? '+' : '-';

      const el = document.createElement('div');
      el.className = 'expense-item';
      el.dataset.id = expense.id;

      // Icon & Color Logic (Reused from breakdown for consistency)
      let colorClass = 'bg-secondary';
      let iconClass = 'bi-wallet2';
      const lowerCat = expense.category.toLowerCase();

      if (lowerCat.includes('food')) { iconClass = 'bi-basket'; colorClass = 'bg-warning'; }
      else if (lowerCat.includes('transport')) { iconClass = 'bi-car-front'; colorClass = 'bg-info'; }
      else if (lowerCat.includes('utility') || lowerCat.includes('bill')) { iconClass = 'bi-lightning-charge'; colorClass = 'bg-warning'; }
      else if (lowerCat.includes('game') || lowerCat.includes('entertainment')) { iconClass = 'bi-controller'; colorClass = 'bg-primary'; }
      else if (lowerCat.includes('health')) { iconClass = 'bi-heart-pulse'; colorClass = 'bg-danger'; }
      else if (lowerCat.includes('shop')) { iconClass = 'bi-bag'; colorClass = 'bg-primary'; }
      else if (lowerCat.includes('home') || lowerCat.includes('rent')) { iconClass = 'bi-house-door'; colorClass = 'bg-info'; }
      else if (isIncome) { iconClass = 'bi-cash-coin'; colorClass = 'bg-success'; }

      const renderItemNormal = () => {
        const isSelected = selectedIds.includes(expense.id);
        el.className = `expense-item ${isSelectionMode ? 'selection-mode' : ''} ${isSelected ? 'selected' : ''}`;

        el.innerHTML = `
          ${isSelectionMode ? `
            <div class="selection-check">
              <input type="checkbox" ${isSelected ? 'checked' : ''}>
            </div>
          ` : ''}
          <div class="expense-icon-box ${colorClass} bg-opacity-10 text-body">
              <i class="bi ${iconClass}"></i>
          </div>
          
          <div class="expense-details">
              <div class="expense-title clickable-edit">${expense.description}</div>
              <div class="expense-date">${new Date(expense.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
          </div>

          <div class="expense-category-badge clickable-edit">
              ${expense.category}
          </div>

          <div class="expense-amount ${amountClass} clickable-edit">${sign} ₹ ${expense.amount.toFixed(2)}</div>
          
          <div class="expense-actions">
              <button class="btn-icon btn-edit" title="Edit"><i class="bi bi-pencil-fill" style="font-size: 0.8rem;"></i></button>
              <button class="btn-icon btn-delete" title="Delete"><i class="bi bi-trash-fill" style="font-size: 0.8rem;"></i></button>
          </div>
        `;

        if (isSelectionMode) {
          el.addEventListener('click', (e) => {
            // If click was on checkbox, handled by change listener
            // Otherwise, toggle checkbox manually
            if (e.target.tagName !== 'INPUT') {
              const checkbox = el.querySelector('input[type="checkbox"]');
              checkbox.checked = !checkbox.checked;
              toggleSelection(expense.id, checkbox.checked);
            }
          });
          el.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
            toggleSelection(expense.id, e.target.checked);
          });
        }

        const toggleSelection = (id, checked) => {
          if (checked) {
            if (!selectedIds.includes(id)) selectedIds.push(id);
          } else {
            selectedIds = selectedIds.filter(sid => sid !== id);
          }
          el.classList.toggle('selected', checked);
          updateBulkBar();
        };

        // Modal Edit
        el.querySelector('.btn-edit').addEventListener('click', () => {
          currentEditingId = expense.id;
          form.description.value = expense.description;
          form.amount.value = expense.amount;
          form.category.value = expense.category;
          form.date.value = expense.date;
          form.type.value = expense.type || 'expense';
          document.querySelector('#add-expense-modal h3').textContent = 'Edit Transaction';
          document.querySelector('#add-expense-form button[type="submit"]').textContent = 'Update Transaction';
          modal.classList.add('active');
        });

        // Delete
        el.querySelector('.btn-delete').addEventListener('click', async () => {
          if (confirm('Are you sure you want to delete this transaction?')) {
            await deleteExpense(expense.id);
          }
        });

        // Inline Edit Trigger
        el.querySelectorAll('.clickable-edit').forEach(trigger => {
          trigger.addEventListener('click', renderItemEdit);
        });
      };

      const renderItemEdit = () => {
        el.classList.add('editing');
        el.innerHTML = `
          <div class="expense-edit-form">
            <input type="text" class="edit-desc" value="${expense.description}" placeholder="Description">
            <select class="edit-cat custom-select">
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Utilities">Utilities</option>
              <option value="Shopping">Shopping</option>
              <option value="Health">Health</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Home">Home</option>
              <option value="Salary">Salary</option>
              <option value="Freelance">Freelance</option>
              <option value="Investments">Investments</option>
              <option value="Others">Others</option>
            </select>
            <div class="edit-amt-wrap">
              <span>₹</span>
              <input type="number" class="edit-amt" value="${expense.amount}" step="0.01">
            </div>
            <div class="edit-actions">
              <button class="save-inline-btn" title="Save"><i class="bi bi-check-lg"></i></button>
              <button class="cancel-inline-btn" title="Cancel"><i class="bi bi-x-lg"></i></button>
            </div>
          </div>
        `;

        const descInput = el.querySelector('.edit-desc');
        const catInput = el.querySelector('.edit-cat');
        const amtInput = el.querySelector('.edit-amt');

        catInput.value = expense.category;

        el.querySelector('.cancel-inline-btn').addEventListener('click', () => {
          el.classList.remove('editing');
          renderItemNormal();
        });

        el.querySelector('.save-inline-btn').addEventListener('click', async () => {
          const updated = {
            ...expense,
            description: descInput.value,
            category: catInput.value,
            amount: parseFloat(amtInput.value)
          };
          delete updated.id; // Don't save ID in doc
          await updateExpense(expense.id, updated);
          // Re-render handled by subscription
        });

        descInput.focus();
      };

      renderItemNormal();
      listContainer.appendChild(el);
    });

    // Add Show More button if there are more transactions
    if (visibleCount < totalTransactions) {
      const showMoreContainer = document.createElement('div');
      showMoreContainer.className = 'show-more-container';
      showMoreContainer.innerHTML = `
        <button class="btn-show-more">
          <span>Show More</span>
          <i class="bi bi-chevron-down"></i>
        </button>
      `;

      showMoreContainer.querySelector('button').addEventListener('click', () => {
        visibleCount += 8;
        renderExpenses();
      });

      listContainer.appendChild(showMoreContainer);
    }

    // Handle Filter Status / Back Button in Header
    const filterStatusContainer = document.getElementById('filter-status');
    if (filterStatusContainer) {
      filterStatusContainer.innerHTML = ''; // Clear previous
      if (selectedCategoryFilter) {
        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn-secondary btn-sm';
        clearBtn.style.padding = '0.2rem 0.6rem';
        clearBtn.style.fontSize = '0.75rem';
        clearBtn.innerHTML = '<i class="bi bi-x-circle me-1"></i> ' + selectedCategoryFilter;
        clearBtn.title = 'Clear Filter';
        clearBtn.addEventListener('click', () => {
          selectedCategoryFilter = null;
          renderExpenses();
        });
        filterStatusContainer.appendChild(clearBtn);
      }
    }

    // Render Category Breakdown (Expenses Only) - NEW PRO STYLE
    const categoryContainer = document.getElementById('category-breakdown');
    if (categoryContainer) {
      categoryContainer.innerHTML = '';

      // Calculate Total Expenses again to be sure (for percentages)
      const totalExp = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

      const categoryList = document.createElement('div');
      categoryList.className = 'category-list';
      categoryList.style.display = 'flex';
      categoryList.style.flexDirection = 'column';
      categoryList.style.gap = '1rem';

      Object.keys(categoryTotals).forEach(category => {
        const catTotal = categoryTotals[category];
        const percent = totalExp > 0 ? (catTotal / totalExp) * 100 : 0;

        // Icon Mapping (Bootstrap Icons)
        let iconClass = 'bi-wallet2';
        const lowerCat = category.toLowerCase();
        let colorClass = 'bg-secondary';

        if (lowerCat.includes('food')) { iconClass = 'bi-basket'; colorClass = 'bg-warning'; }
        else if (lowerCat.includes('transport')) { iconClass = 'bi-car-front'; colorClass = 'bg-info'; }
        else if (lowerCat.includes('utility') || lowerCat.includes('bill')) { iconClass = 'bi-lightning-charge'; colorClass = 'bg-warning'; }
        else if (lowerCat.includes('game') || lowerCat.includes('entertainment')) { iconClass = 'bi-controller'; colorClass = 'bg-primary'; }
        else if (lowerCat.includes('health')) { iconClass = 'bi-heart-pulse'; colorClass = 'bg-danger'; }
        else if (lowerCat.includes('shop')) { iconClass = 'bi-bag'; colorClass = 'bg-primary'; }
        else if (lowerCat.includes('home') || lowerCat.includes('rent')) { iconClass = 'bi-house-door'; colorClass = 'bg-info'; }

        const item = document.createElement('div');
        item.className = `category-list-item ${selectedCategoryFilter === category ? 'selected-category' : ''}`;

        // Add click listener for filtering
        item.addEventListener('click', () => {
          if (selectedCategoryFilter === category) {
            selectedCategoryFilter = null; // Toggle off
          } else {
            selectedCategoryFilter = category; // Set filter
          }
          visibleCount = 8; // Reset pagination on category toggle
          renderExpenses(); // Re-render
        });

        item.innerHTML = `
            <div class="d-flex align-items-center mb-1 justify-content-between">
                <div class="d-flex align-items-center gap-2">
                    <div class="item-icon ${colorClass} bg-opacity-10 text-body p-2 rounded" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
                         <i class="bi ${iconClass}"></i>
                    </div>
                    <span class="expense-category-badge" style="font-size: 0.7rem; padding: 0.25rem 0.6rem;">${category}</span>
                </div>
                <div class="text-end">
                    <div class="fw-bold">₹ ${catTotal.toFixed(2)}</div>
                    <div class="small text-secondary">${percent.toFixed(1)}%</div>
                </div>
            </div>
         `;
        categoryList.appendChild(item);
      });

      const card = document.createElement('div');
      card.className = 'breakdown-card w-100'; // Custom class for distinct styling

      // Breakdown Header with Optional Clear Button
      const headerDiv = document.createElement('div');
      headerDiv.className = 'd-flex justify-content-between align-items-center mb-3';
      headerDiv.innerHTML = `<h3 class="m-0">Expense Breakdown</h3>`;


      card.appendChild(headerDiv);
      card.appendChild(categoryList);

      categoryContainer.innerHTML = ''; // Clear previous
      categoryContainer.appendChild(card);
    }
  };

  const updateFilterOptions = () => {
    const currentSelection = filterSelect.value;
    const dates = new Set();

    // Always ensure current month is in the set even if no transactions
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    dates.add(currentMonthKey);

    allExpenses.forEach(exp => {
      const d = new Date(exp.date);
      if (!isNaN(d.getTime())) {
        dates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
    });

    const sortedDates = Array.from(dates).sort().reverse();

    filterSelect.innerHTML = '<option value="all">All Time</option>';
    sortedDates.forEach(dateStr => {
      const [year, month] = dateStr.split('-');
      const dateObj = new Date(year, month - 1);
      const label = dateObj.toLocaleDateString('default', { month: 'long', year: 'numeric' });

      const option = document.createElement('option');
      option.value = dateStr;
      option.textContent = label;
      filterSelect.appendChild(option);
    });

    // On first load or if no valid selection, default to current month
    if (!currentSelection || currentSelection === '') {
      filterSelect.value = currentMonthKey;
    } else if (Array.from(filterSelect.options).some(opt => opt.value === currentSelection)) {
      // Restore selection if it still exists
      filterSelect.value = currentSelection;
    } else {
      filterSelect.value = currentMonthKey;
    }
  };

  filterSelect.addEventListener('change', () => {
    filterSelect.dataset.userChanged = "true";
    visibleCount = 8; // Reset pagination on month change
    const selectedMonth = filterSelect.value;

    if (selectedMonth !== 'all') {
      currentBudgetMonth = selectedMonth;
      updateBudgetMonthLabel();
      updateBudgetUI();
    }

    renderExpenses();
  });


  // Budget Logic
  const getYearMonth = (date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  };

  let currentBudgetMonth = getYearMonth(new Date());
  const INITIAL_MONTH = currentBudgetMonth;
  let allBudgets = {};

  const budgetMonthLabel = document.getElementById('budget-month-label');
  const budgetPrevBtn = document.getElementById('budget-prev-month');
  const budgetNextBtn = document.getElementById('budget-next-month');

  const updateBudgetMonthLabel = () => {
    if (!budgetMonthLabel) return;
    const [y, m] = currentBudgetMonth.split('-');
    const label = new Date(y, m - 1).toLocaleDateString('default', { month: 'long', year: 'numeric' });
    budgetMonthLabel.textContent = label;

    // Disable "next" if we are at the current month
    if (budgetNextBtn) {
      budgetNextBtn.disabled = currentBudgetMonth >= INITIAL_MONTH;
    }
  };

  const stepMonth = (delta) => {
    const [y, m] = currentBudgetMonth.split('-').map(Number);
    const date = new Date(y, m - 1 + delta);
    currentBudgetMonth = getYearMonth(date);
    updateBudgetMonthLabel();
    updateBudgetUI();

    // Sync filter dropdown if possible
    if (Array.from(filterSelect.options).some(opt => opt.value === currentBudgetMonth)) {
      filterSelect.value = currentBudgetMonth;
    } else {
      filterSelect.value = 'all'; // Fallback if no transactions for that month
    }

    renderExpenses(); // Also re-render list to reflect month change if filter is active
  };

  if (budgetPrevBtn) {
    budgetPrevBtn.addEventListener('click', () => stepMonth(-1));
  }

  if (budgetNextBtn) {
    budgetNextBtn.addEventListener('click', () => stepMonth(1));
  }

  // Initial label state
  updateBudgetMonthLabel();

  // (Keeping this for compatibility with existing database subscriptions)
  const updateBudgetMonthOptions = () => {
    updateBudgetMonthLabel();
  };

  const updateInsights = (allExpenses, filterValue = 'all') => {
    const container = document.getElementById('insights-track');
    if (!container) return;

    container.innerHTML = '';
    const insights = [];

    // Determine the active month for insights
    let targetMonthKey;
    if (filterValue && filterValue !== 'all') {
      targetMonthKey = filterValue;
    } else {
      // Default to latest month in data or current month
      if (allExpenses.length > 0) {
        const latestDate = new Date(Math.max(...allExpenses.map(e => new Date(e.date))));
        targetMonthKey = `${latestDate.getFullYear()}-${String(latestDate.getMonth() + 1).padStart(2, '0')}`;
      } else {
        const now = new Date();
        targetMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      }
    }

    const [year, month] = targetMonthKey.split('-').map(Number);
    const prevMonthDate = new Date(year, month - 2, 1);
    const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    let currentSpend = 0;
    let prevSpend = 0;
    let currentIncome = 0;

    allExpenses.forEach(exp => {
      const d = new Date(exp.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      if (key === targetMonthKey) {
        if (exp.type === 'income') currentIncome += exp.amount;
        else currentSpend += exp.amount;
      } else if (key === prevMonthKey) {
        if (exp.type !== 'income') prevSpend += exp.amount;
      }
    });

    // 1. Saving Trend (Month-over-Month)
    if (prevSpend > 0) {
      if (currentSpend < prevSpend) {
        const saved = prevSpend - currentSpend;
        insights.push({
          icon: 'bi-stars',
          title: 'Saving Trend',
          text: `You've spent ₹${saved.toFixed(0)} less than in ${prevMonthDate.toLocaleDateString('default', { month: 'short' })}! 👏`,
          color: 'success'
        });
      } else if (currentSpend > prevSpend * 1.1) {
        insights.push({
          icon: 'bi-exclamation-circle',
          title: 'Spending Spike',
          text: `Spending is higher than ${prevMonthDate.toLocaleDateString('default', { month: 'short' })}. Keep an eye on your bills!  ⚠️`,
          color: 'warning'
        });
      }
    }

    // 2. Highest Category Insight (Specific to Target Month)
    const targetMonthExpenses = allExpenses.filter(exp => {
      const d = new Date(exp.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return exp.type !== 'income' && key === targetMonthKey;
    });

    if (targetMonthExpenses.length > 0) {
      const catTotals = {};
      targetMonthExpenses.forEach(e => {
        catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
      });
      const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
      if (topCat) {
        insights.push({
          icon: 'bi-info-circle',
          title: 'Category Focus',
          text: `In ${new Date(year, month - 1).toLocaleDateString('default', { month: 'short' })}, ${topCat[0]} was your top expense (₹${topCat[1].toFixed(0)}).`,
          color: 'info'
        });
      }
    }

    // 3. Net Balance Insight
    if (currentSpend > currentIncome && currentIncome > 0) {
      insights.push({
        icon: 'bi-graph-down-arrow',
        title: 'Balance Alert',
        text: `Your spending (<span style="color: #ffcfcf; font-weight: 700;">₹${currentSpend.toFixed(0)}</span>) has exceeded your income (<span style="color: #cfffcf; font-weight: 700;">₹${currentIncome.toFixed(0)}</span>) this month. ⚠️`,
        color: 'danger'
      });
    }

    // 4. Dynamic Power Tip
    const budgetLimit = allBudgets[targetMonthKey] || 0;
    if (budgetLimit > 0 && currentSpend > budgetLimit) {
      insights.push({
        icon: 'bi-lightning-charge',
        title: 'Power Tip',
        text: `You're ₹${(currentSpend - budgetLimit).toFixed(0)} over budget. Let's try to curb non-essential spending.`,
        color: 'warning'
      });
    } else if (currentIncome > currentSpend && currentSpend > 0) {
      const savings = currentIncome - currentSpend;
      insights.push({
        icon: 'bi-lightning-charge',
        title: 'Power Tip',
        text: `You saved ₹${savings.toFixed(0)} this month! Consider moving this to your emergency fund. 💰`,
        color: 'success'
      });
    } else {
      insights.push({
        icon: 'bi-lightning-charge',
        title: 'Power Tip',
        text: "Categorizing every 'Other' expense helps identify hidden spending leaks.",
        color: 'primary'
      });
    }

    // Render Cards
    insights.forEach(insight => {
      const card = document.createElement('div');
      card.className = `insight-card insight-card--${insight.color}`;
      card.innerHTML = `
        <i class="bi ${insight.icon} insight-icon"></i>
        <div class="insight-content">
          <div class="insight-title">${insight.title}</div>
          <div class="insight-text">${insight.text}</div>
        </div>
      `;
      container.appendChild(card);
    });
  };

  const updateBudgetUI = () => {
    const budgetCard = document.querySelector('.budget-card');

    if (!budgetCard) return;

    const limit = allBudgets[currentBudgetMonth] || 0;

    if (limit === 0) {
      document.getElementById('budget-status-text').textContent = 'No budget set for this month';
      document.getElementById('budget-percentage').textContent = '';
      document.getElementById('budget-progress-bar').style.width = '0%';
      document.getElementById('budget-warning').style.display = 'none';
      const msgEl = document.getElementById('budget-message');
      if (msgEl) {
        msgEl.textContent = "💡 Set a budget for this month to start tracking your limits!";
        msgEl.className = 'budget-message budget-message--calm';
      }
      return;
    }

    // Calculate total expenses for SELECTED MONTH
    // currentBudgetMonth is YYYY-MM

    const currentMonthExpenses = allExpenses
      .filter(t => t.type !== 'income') // Only expenses
      .filter(t => {
        // Robust string check: YYYY-MM-DD starts with YYYY-MM
        return t.date.startsWith(currentBudgetMonth);
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const percentage = Math.min((currentMonthExpenses / limit) * 100, 100);
    const isOverBudget = currentMonthExpenses > limit;

    // Update Text
    const remaining = Math.max(limit - currentMonthExpenses, 0);
    document.getElementById('budget-status-text').textContent = `Spent: ₹ ${currentMonthExpenses.toFixed(2)} / ₹ ${limit.toFixed(2)}`;
    const pctEl = document.getElementById('budget-percentage');
    pctEl.textContent = `${Math.round((currentMonthExpenses / limit) * 100)}%`;

    // Progress bar width + colour
    const progressBar = document.getElementById('budget-progress-bar');
    progressBar.style.width = `${percentage}%`;
    if (percentage > 90) {
      progressBar.style.background = 'linear-gradient(90deg, #f87171, #ef4444)';
    } else if (percentage > 50) {
      progressBar.style.background = 'linear-gradient(90deg, #fbbf24, #f59e0b)';
    } else {
      progressBar.style.background = 'linear-gradient(90deg, #22c55e, #06b6d4)';
    }

    // Warning banner & percentage badge
    const warningEl = document.getElementById('budget-warning');
    const pctBadge = document.getElementById('budget-percentage');
    if (isOverBudget) {
      warningEl.style.display = 'flex';
      pctBadge.classList.add('over-budget');
    } else {
      warningEl.style.display = 'none';
      pctBadge.classList.remove('over-budget');
    }

    // Contextual motivational message
    const msgEl = document.getElementById('budget-message');
    if (msgEl) {
      const rawPct = (currentMonthExpenses / limit) * 100;
      let msg = '', cls = '';
      if (rawPct === 0) {
        msg = "✨ Month's just getting started — you're at ₹0 spent!";
        cls = 'budget-message--calm';
      } else if (rawPct <= 30) {
        msg = "🌟 Great going! You're well within your budget.";
        cls = 'budget-message--good';
      } else if (rawPct <= 60) {
        msg = "👍 On track! Keep mindful of your spending.";
        cls = 'budget-message--good';
      } else if (rawPct <= 80) {
        msg = "🙂 You've used over half your budget — slow down a little.";
        cls = 'budget-message--warn';
      } else if (rawPct <= 100) {
        msg = "😬 Careful! Only ₹" + remaining.toFixed(0) + " left of your budget.";
        cls = 'budget-message--warn';
      } else {
        msg = "🛑 You've gone over budget by ₹" + (currentMonthExpenses - limit).toFixed(0) + ". Time to pause spending!";
        cls = 'budget-message--danger';
      }
      msgEl.textContent = msg;
      msgEl.className = 'budget-message ' + cls;
    }
  };

  // Budget Modal Listeners
  const budgetModal = document.getElementById('edit-budget-modal');
  const editBudgetBtn = document.getElementById('edit-budget-btn');
  const closeBudgetBtn = document.getElementById('close-budget-modal-btn');
  const budgetForm = document.getElementById('edit-budget-form');

  if (editBudgetBtn) {
    editBudgetBtn.addEventListener('click', () => {
      budgetModal.classList.add('active');
      budgetForm.month.value = currentBudgetMonth;
      if (allBudgets[currentBudgetMonth]) {
        budgetForm.limit.value = allBudgets[currentBudgetMonth];
      } else {
        budgetForm.limit.value = '';
      }
    });

    // Update limit field when month is changed inside the modal
    budgetForm.month.addEventListener('change', (e) => {
      const selectedMonth = e.target.value;
      if (allBudgets[selectedMonth]) {
        budgetForm.limit.value = allBudgets[selectedMonth];
      } else {
        budgetForm.limit.value = '';
      }
    });
  }

  if (closeBudgetBtn) {
    closeBudgetBtn.addEventListener('click', () => {
      budgetModal.classList.remove('active');
    });
  }

  if (budgetForm) {
    budgetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const limit = e.target.limit.value;
      const month = e.target.month.value;
      try {
        await setMonthlyBudget(user.uid, month, limit);
        budgetModal.classList.remove('active');
      } catch (error) {
        console.error("Error setting budget:", error);
        alert(`Failed to save budget: ${error.message}`);
      }
    });
  }

  
  expensesCleanup = subscribeToExpenses(user.uid, (expenses) => {
    allExpenses = expenses;
    updateFilterOptions();
    updateBudgetMonthOptions(); // Update month dropdown

    // Force current month on first data load if filter is still 'all'
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (filterSelect.value === 'all' && !filterSelect.dataset.userChanged) {
      filterSelect.value = currentMonthKey;
      // Sync budget
      currentBudgetMonth = currentMonthKey;
      updateBudgetMonthLabel();
    }

    renderExpenses();
    updateBudgetUI();
    // updateInsights is now called inside renderExpenses
  });

  budgetCleanup = subscribeToBudget(user.uid, (budgets) => {
    allBudgets = budgets;
    updateBudgetMonthOptions(); // Ensure logic handles new budget months
    updateBudgetUI(); // Recalculate on budget change
    updateInsights(allExpenses, filterSelect.value);
  });
}