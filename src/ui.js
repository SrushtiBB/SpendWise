export const renderLogin = () => {
  return `
    <div class="container">
      <div style="display: flex; justify-content: flex-end; padding: 1rem 0;">
          <span class="theme-label" style="font-size: 0.9rem; margin-right: 0.5rem; font-weight: 600;">Dark Mode</span>
          <label class="theme-switch" title="Toggle Theme">
            <input type="checkbox" id="theme-toggle-input">
            <span class="slider round"></span>
          </label>
      </div>
      <div class="auth-container">
        <div class="brand-header">
            <p class="welcome-text">Welcome Back</p>
            <img src="/assets/logo2.svg" alt="SpendWise Logo" class="brand-logo" />
            <h1 class="brand-name">SpendWise</h1>
        </div>
        <form id="login-form">
          <div class="input-group">
            <svg xmlns="http://www.w3.org/2000/svg" class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect><polyline points="3 7 12 13 21 7"></polyline></svg>
            <input type="email" id="email" placeholder="Email Address" required />
          </div>
          <div class="input-group">
             <svg xmlns="http://www.w3.org/2000/svg" class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <input type="password" id="password" placeholder="Password" required />
          </div>
          <button type="submit" class="auth-btn">Sign In</button>
        </form>
        <p class="auth-switch">Don't have an account? <a href="#" id="show-signup">Create account</a></p>
      </div>
    </div>
  `;
};

export const renderSignup = () => {
  return `
    <div class="container">
      <div style="display: flex; justify-content: flex-end; padding: 1rem 0;">
          <span class="theme-label" style="font-size: 0.9rem; margin-right: 0.5rem; font-weight: 600;">Dark Mode</span>
          <label class="theme-switch" title="Toggle Theme">
            <input type="checkbox" id="theme-toggle-input">
            <span class="slider round"></span>
          </label>
      </div>
      <div class="auth-container">
        <div class="brand-header">
             <p class="welcome-text">Welcome To</p>
             <img src="/assets/logo2.svg" alt="SpendWise Logo" class="brand-logo" />
             <h1 class="brand-name">SpendWise</h1>
        </div>
        <form id="signup-form">
          <div class="input-group">
            <svg xmlns="http://www.w3.org/2000/svg" class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <input type="text" id="username" placeholder="Username" required />
          </div>
          <div class="input-group">
            <svg xmlns="http://www.w3.org/2000/svg" class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect><polyline points="3 7 12 13 21 7"></polyline></svg>
            <input type="email" id="email" placeholder="Email Address" required />
          </div>
          <div class="input-group">
            <svg xmlns="http://www.w3.org/2000/svg" class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <input type="password" id="password" placeholder="Password (min 6 chars)" required minlength="6" />
          </div>
          <button type="submit" class="auth-btn">Sign Up</button>
        </form>
        <p class="auth-switch">Already have an account? <a href="#" id="show-login">Sign in</a></p>
      </div>
    </div>
  `;
};

export const renderDashboard = (user) => {
  return `
    <div class="container">
      <header>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <img src="/assets/logo2.svg" alt="SpendWise Logo" class="brand-logo" style="width: 44px; height: 44px; margin: 0;" />
          <div>
            <h1 class="brand-name" style="font-size: 1.6rem; line-height: 1.1; margin: 0;">SpendWise</h1>
            <p class="header-greeting" id="header-greeting">${(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; })()}, ${user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'there'} 👋</p>
          </div>
        </div>

        <div class="header-center-pill" id="header-date-pill"></div>

        <div class="header-actions">
          <label class="theme-switch" title="Toggle Theme">
            <input type="checkbox" id="theme-toggle-input">
            <span class="slider round"></span>
          </label>
          <button id="logout-btn" class="btn-secondary"><i class="bi bi-box-arrow-right"></i> Logout</button>
        </div>
      </header>
      
      <main>
        <div style="display: flex; justify-content: flex-end; margin-bottom: 1.25rem;">
          <select id="date-filter" class="custom-select">
              <option value="all">All Time</option>
          </select>
        </div>

        <div class="overview-section">
          <!-- Smart Insights -->
          <div id="smart-insights-container" class="insights-carousel-wrapper">
             <div class="insights-track" id="insights-track">
                <!-- Insights cards will be injected here -->
             </div>
          </div>

          <div class="stats-container">
            <!-- Net Balance -->
            <div class="stat-card stat-card--balance">
              <div class="stat-icon-bubble stat-bubble--balance">
                <i class="bi bi-wallet2"></i>
              </div>
              <div class="stat-text-group">
                <span class="stat-label">Net Balance</span>
                <div class="stat-value" id="balance-amount">₹ 0.00</div>
              </div>
              <i class="bi bi-wallet2 stat-watermark"></i>
            </div>

            <!-- Total Income -->
            <div class="stat-card stat-card--income">
              <div class="stat-icon-bubble stat-bubble--income">
                <i class="bi bi-arrow-up-short"></i>
              </div>
              <div class="stat-text-group">
                <span class="stat-label">Income</span>
                <div class="stat-value" id="income-amount">₹ 0.00</div>
              </div>
              <i class="bi bi-arrow-up-circle stat-watermark"></i>
            </div>

            <!-- Total Expenses -->
            <div class="stat-card stat-card--expense">
              <div class="stat-icon-bubble stat-bubble--expense">
                <i class="bi bi-arrow-down-short"></i>
              </div>
              <div class="stat-text-group">
                <span class="stat-label">Expenses</span>
                <div class="stat-value" id="total-amount">₹ 0.00</div>
              </div>
              <i class="bi bi-arrow-down-circle stat-watermark"></i>
            </div>
          </div>
          
          <!-- Budget Overview -->
          <div class="budget-card">
            <div class="budget-card-header">
              <div class="budget-card-title">
                <div class="budget-icon-wrap"><i class="bi bi-pie-chart-fill"></i></div>
                <h3>Budget</h3>
              </div>
              <div class="budget-card-controls">
                <div class="month-stepper">
                  <button id="budget-prev-month" class="stepper-btn" title="Previous Month">
                    <i class="bi bi-chevron-left"></i>
                  </button>
                  <span id="budget-month-label" class="stepper-label">Month Year</span>
                  <button id="budget-next-month" class="stepper-btn" title="Next Month">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </div>
                <button id="edit-budget-btn" class="budget-set-btn"><i class="bi bi-pencil-fill"></i> Set Budget</button>
              </div>
            </div>

            <div class="budget-meta-row">
              <div class="budget-chip budget-chip--spent">
                <i class="bi bi-arrow-up-right"></i>
                <span id="budget-status-text">Spent: ₹ 0.00 / ₹ 0.00</span>
              </div>
              <span class="budget-percent-badge" id="budget-percentage">0%</span>
            </div>

            <div class="budget-progress-track">
              <div id="budget-progress-bar" class="budget-progress-fill"></div>
            </div>

            <p id="budget-warning" class="budget-warning-banner">
              <i class="bi bi-exclamation-triangle-fill"></i> You've exceeded your monthly budget!
            </p>

            <p id="budget-message" class="budget-message"></p>
          </div>
        </div>

            <!-- Charts Section with Tabs -->
            <div class="charts-section">
              <div class="charts-tab-header">
                <button class="chart-tab-btn active" data-tab="categories">
                  <i class="bi bi-pie-chart"></i> Categories
                </button>
                <button class="chart-tab-btn" data-tab="trends">
                  <i class="bi bi-graph-up"></i> Trends
                </button>
                <button class="chart-tab-btn" data-tab="comparison">
                  <i class="bi bi-bar-chart"></i> Comparison
                </button>
              </div>

              <div class="charts-container">
                <div class="chart-card active" id="tab-categories">
                  <h3>Category Distribution</h3>
                  <canvas id="pie-chart"></canvas>
                </div>
                <div class="chart-card" id="tab-trends">
                  <h3>Monthly Trends</h3>
                  <canvas id="bar-chart"></canvas>
                </div>
                <div class="chart-card" id="tab-comparison">
                  <h3>Income vs Expenses</h3>
                  <canvas id="income-expense-chart"></canvas>
                </div>
              </div>
            </div>

            <!-- Lower Section: Breakdown + Transactions -->
            <div class="lower-content">
                <!-- Breakdown Column -->
                <div class="breakdown-column">
                   <div id="category-breakdown">
                     <!-- Category stats will be injected here -->
                   </div>
                </div>

                <!-- Transactions Column -->
                <div class="transactions-column">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                      <div style="display: flex; align-items: center;">
                        <h3 class="m-0">Recent Transactions</h3>
                        <div id="filter-status" style="margin-left: 1rem;"></div>
                      </div>
                      
                      <div class="transaction-search-group">
                        <i class="bi bi-search"></i>
                        <input type="text" id="transaction-search" placeholder="Search transactions...">
                      </div>

                      <div style="display: flex; gap: 0.5rem;">
                        <button id="bulk-select-btn" class="btn-icon bulk-select-btn" title="Select Multiple">
                           <i class="bi bi-check2-square me-1"></i> Select
                        </button>
                        <button id="add-income-btn" type="button"><i class="bi bi-plus-circle-fill"></i> Add Income</button>
                        <button id="add-expense-btn" type="button"><i class="bi bi-plus-circle-fill"></i> Add Expense</button>
                      </div>
                    </div>
                    
                    <div id="expenses-list">
                      <p>Loading expenses...</p>
                    </div>
                </div>
            </div>
      </main>

      <!-- Floating Action Button (Speed Dial) -->
      <div class="fab-container" id="fab-container">
        <!-- Child: Add Income -->
        <div class="fab-child" id="fab-income">
          <span class="fab-label">Add Income</span>
          <button class="fab-child-btn fab-child-btn--income" id="fab-add-income-btn" aria-label="Add Income">
            <i class="bi bi-arrow-up-short"></i>
          </button>
        </div>
        <!-- Child: Add Expense -->
        <div class="fab-child" id="fab-expense">
          <span class="fab-label">Add Expense</span>
          <button class="fab-child-btn fab-child-btn--expense" id="fab-add-expense-btn" aria-label="Add Expense">
            <i class="bi bi-arrow-down-short"></i>
          </button>
        </div>
        <!-- Main FAB -->
        <button class="fab-main" id="fab-main-btn" aria-label="Quick Add">
          <i class="bi bi-plus-lg fab-icon-plus"></i>
          <i class="bi bi-x-lg fab-icon-close"></i>
        </button>
      </div>
      
      <!-- Add Expense/Income Modal -->
      <div id="add-expense-modal" class="modal">
        <div class="modal-content">
          <h3>Add New Transaction</h3>
          <form id="add-expense-form">
            <input type="hidden" name="type" value="expense">
            
            <div class="form-group">
                <label class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem;">Description</label>
                <input type="text" name="description" placeholder="e.g., Grocery Shopping" required style="width: 100%; box-sizing: border-box;" />
            </div>

            <div class="form-group">
                <label class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem;">Amount</label>
                <input type="number" name="amount" placeholder="0.00" step="0.01" min="0" required style="width: 100%; box-sizing: border-box;" />
            </div>

            <div class="form-group">
                <label class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem;">Category</label>
                <input type="text" name="category" placeholder="Select or type category" list="categories" required style="width: 100%; box-sizing: border-box;" />
                <datalist id="categories">
                  <option value="Food">
                  <option value="Transport">
                  <option value="Utilities">
                  <option value="Entertainment">
                  <option value="Health">
                  <option value="Salary">
                  <option value="Freelance">
                  <option value="Investment">
                </datalist>
            </div>

            <div class="form-group">
                <label class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem;">Date</label>
                <input type="date" name="date" required style="width: 100%; box-sizing: border-box;" />
            </div>
            
            <div class="modal-actions">
              <button type="button" id="close-modal-btn" class="btn-secondary">Cancel</button>
              <button type="submit" id="submit-expense-btn" style="background: var(--primary-color); color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 0.8rem; font-weight: 600; cursor: pointer;">Add Expense</button>
             </div>
          </form>
        </div>
      </div>

      <!-- Edit Budget Modal -->
      <div id="edit-budget-modal" class="modal">
        <div class="modal-content" style="max-width: 400px;">
            <h3>Set Monthly Budget</h3>
            <form id="edit-budget-form">
                <div class="form-group">
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem;">Month</label>
                    <input type="month" name="month" required style="width: 100%; box-sizing: border-box;" />
                </div>
                <div class="form-group">
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem;">Budget Limit</label>
                    <input type="number" name="limit" placeholder="e.g., 20000" step="0.01" min="0" required style="width: 100%; box-sizing: border-box;" />
                </div>
                <div class="modal-actions">
                    <button type="button" id="close-budget-modal-btn" class="btn-secondary">Cancel</button>
                    <button type="submit" style="background: var(--primary-color); color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 0.8rem; font-weight: 600; cursor: pointer;">Save Limit</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  `;
};

export const renderEmptyExpenses = () => {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">
        <i class="bi bi-wallet2"></i>
      </div>
      <h4>No transactions yet</h4>
      <p>Start tracking your finances by adding your first expense or income.</p>
      <button class="empty-state-cta" id="empty-state-add-btn">
        <i class="bi bi-plus-lg"></i> Add First Transaction
      </button>
    </div>
  `;
};
