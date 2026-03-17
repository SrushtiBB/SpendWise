# 💸 SpendWise — Smart Personal Expense Tracker

SpendWise is a modern web app that helps you manage your money with confidence. Track income and expenses, monitor spending patterns, and stay in control of your monthly budget — all from a clean and interactive dashboard.

## 🌐 Live Demo

👉 **[Try SpendWise](https://personal-expenses-tracker-gamma.vercel.app/)**

---

## ✨ Highlights

- 📌 Simple and intuitive expense tracking
- 📊 Interactive analytics and reports with Calendar-Year selectors
- 👤 Profile management tools for user personalization
- 🎯 Monthly budgeting with progress indicators
- 🔍 Fast search and transaction management tools
- 🌗 Light/Dark theme support with responsive aesthetics

---

## 🚀 Features

### 🔐 Authentication & Profile

- Sign up and log in securely using email/password
- Session-based authentication with Firebase
- Update profile username instantly from the dashboard

### 💰 Transactions

- Add income and expense entries
- Update or delete existing transactions
- Search transactions instantly
- Select multiple entries for bulk delete workflows

### 📈 Insights & Analytics

- Real-time balance, total income, and total expense metrics (Refined minimalist design)
- Category distribution chart
- Monthly trend chart inside 12-month calendar scopes (Prev/Next navigation arrows included to view analytics of neighboring years)
- Income vs expense comparison chart

### 🧾 Budgeting

- Set monthly budget targets
- Visual budget utilization progress
- Dynamic warnings when nearing or exceeding budget

### 🎨 User Experience

- Responsive layout for desktop and smaller screens
- Personalized dashboard greeting
- Theme preference (light/dark) saved locally

---

- **Frontend:** HTML, CSS, JavaScript (Vite)
- **Charts:** Chart.js
- **Backend Services:** Firebase Authentication + Cloud Firestore
- **Frontend:** HTML, CSS, JavaScript (Vite)
- **Charts:** Chart.js
- **Backend Services:** Firebase Authentication + Cloud Firestore

---

## ⚙️ Getting Started

### 1) Clone the repository

```bash
git clone https://github.com/Sanmati-u-s/SpendWise.git
cd SpendWise
```

### 2) Install dependencies

```bash
npm install
```

### 3) Configure Firebase

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Add a **Web App** in your Firebase project
3. Copy the Firebase config object
4. Update `src/firebase.js` with your Firebase credentials
5. Enable:
   - ✅ Authentication (Email/Password)
   - ✅ Cloud Firestore

### 4) Run the app locally

```bash
npm run dev
```

### 5) Build for production

```bash
npm run build
npm run preview
```

---

## 📜 Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Build production assets
- `npm run preview` — Preview production build locally

---

## 🧠 Future Enhancements

- 📤 Export data as CSV/PDF
- 🔁 Recurring transaction support
- 🧩 Category-wise budget caps
- 🔑 Social login providers
- 📱 PWA + offline support

---

## 📄 License

This project is licensed under the terms in [LICENSE](./LICENSE).
