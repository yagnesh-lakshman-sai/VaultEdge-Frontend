# 🏦 VaultEdge — Enterprise Banking Frontend

Modern React.js frontend for the VaultEdge Banking System featuring secure authentication, role-based dashboards, fund transfers, loan management, transaction tracking, and admin controls.

---

## Tech Stack

| Category         | Technologies      |
| ---------------- | ----------------- |
| Framework        | React.js          |
| Build Tool       | Vite              |
| Language         | JavaScript (ES6+) |
| Routing          | React Router DOM  |
| HTTP Client      | Axios             |
| State Management | Context API       |
| Charts           | Recharts          |
| Styling          | CSS               |
| Authentication   | JWT               |

---

## Repository

| Layer    | Repository                                                                  |
| -------- | --------------------------------------------------------------------------- |
| Backend  | https://github.com/yagnesh-lakshman-sai/VaultEdge-Enterprise-Banking-System |

---


## Features

### Authentication

* JWT-based login system
* OTP verification
* Protected routes
* Role-based authorization

### Customer Features

* Dashboard overview
* Multi-account management
* Fund transfer workflow
* Transaction history
* Loan application system
* EMI calculation preview

### Admin Features

* Loan approval workflow
* Loan review management
* Status filtering
* Admin dashboard analytics

### UI Features

* Responsive design
* Toast notifications
* Interactive charts
* Loading spinners
* Sidebar navigation

---


## Project Structure

```
src/
├── api/
├── components/
├── context/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── utils/
└── assets/
```

---

## Environment Variables

Create `.env` file in project root:

```env id="m1sdx4"
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## Local Setup

### Clone Repository

```bash id="jdavfr"
git clone https://github.com/yagnesh-lakshman-sai/VaultEdge-frontend.git
cd VaultEdge-frontend
```

### Install Dependencies

```bash id="jlwm3g"
npm install
```

### Run Development Server

```bash id="u7d9jo"
npm run dev
```

Application runs at:

```bash id="9qiv3h"
http://localhost:5173
```

---

## Production Build

```bash id="0r4b3f"
npm run build
```

---

## Deployment

| Layer    | Platform                   |
| -------- | -------------------------- |
| Frontend | Vercel                     |
| Backend  | Render / Railway / AWS EC2 |

---

## Engineering Concepts

* Component-Based Architecture
* Protected Route Handling
* JWT Authentication
* Axios Interceptors
* Context API State Management
* Responsive UI Design
* API Integration
* Reusable Component Design

---

## Project Highlights

* Built responsive banking UI using React.js
* Integrated Spring Boot REST APIs
* Implemented JWT authentication workflow
* Designed reusable component architecture
* Developed secure banking operations frontend

---
