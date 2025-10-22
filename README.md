# 💼 Rakamin Job Board

A modern job board application built with **React + TypeScript + Vite**, integrating **Supabase**, **Zustand**, and **Formik** for smooth state management, form validation, and backend interaction.  
This project serves as a **frontend assessment challenge** and a showcase of clean, scalable architecture with strong UI/UX fundamentals.

---

## 🧭 Project Overview

**Rakamin Job Board** is a full-featured recruitment management web app where:
- Admins can **create, manage, and monitor** job listings.
- Applicants can **browse jobs**, **fill application forms**, and **upload photos** using face detection.
- Data is stored and managed using **Supabase**.
- UI is responsive, modern, and optimized for performance with **Vite + React 19**.

### ✨ Core Features
- 🧾 Job listing management (CRUD via Supabase)
- 🧍 Applicant form with **Formik + Yup** validation
- 📸 Webcam capture using **React Webcam + Mediapipe Hands**
- 📊 Candidate table with **Ag-Grid** and **TanStack Table**
- 🔔 Toast notification system with **React Toastify**
- 🌍 Routing using **React Router v7**
- ⚡ State management via **Zustand**
- 💅 Styled with **TailwindCSS (Vite plugin)**

---

## ⚙️ Tech Stack Used

| Category | Library / Tool | Description |
|-----------|----------------|--------------|
| **Framework** | [React 19](https://react.dev/) | Modern UI library |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strong typing support |
| **Build Tool** | [Vite (Rolldown)](https://vite.dev/) | Super fast bundler & dev server |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) | Lightweight and scalable store |
| **Form Handling** | [Formik](https://formik.org/) + [Yup](https://github.com/jquense/yup) | Form control and validation |
| **Database / Backend** | [Supabase](https://supabase.io/) | Database, auth, and file storage |
| **UI Utilities** | [TailwindCSS](https://tailwindcss.com/) | Utility-first CSS framework |
| **Table & Grid** | [Ag-Grid](https://www.ag-grid.com/) + [TanStack Table](https://tanstack.com/table) | Data table management |
| **Camera Detection** | [Mediapipe Hands](https://developers.google.com/mediapipe) | Hand tracking and camera utils |
| **Routing** | [React Router v7](https://reactrouter.com/) | Client-side routing |
| **Notification** | [React Toastify](https://fkhadra.github.io/react-toastify/) | Custom toast messages |
| **Linting** | [ESLint](https://eslint.org/) + TypeScript ESLint | Code consistency |

---

## 🧑‍💻 How to Run Locally

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/rakamin-job-board.git
cd rakamin-job-board
```

### 2️⃣ Install dependencies
```bash
npm install
# or
yarn install
```

### 3️⃣ Set up environment variables
Create a `.env` file in the root directory and add the following variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4️⃣ Run the development server
```bash
npm run dev
# or
yarn dev
```

### 5️⃣ Build for production
```bash
npm run build
# or
yarn build
```

### 6️⃣ Run the production server
```bash
npm run preview
# or
yarn preview
```
