# 📦 inventory-expiry-tracker

A simple web application to help small businesses track product inventory and expiry dates, with alerts for soon-to-expire items.

## ✨ Features (Phase 1 - MVP)
- ➕ Add, list, edit, and delete products
- 📊 Track quantity and expiry date
- ⚠️ Alert for products expiring within 7 days
- 🧾 Simple sales logging (reduce quantity when sold)

## 🛠️ Tech Stack
- 🖥️ Frontend: React.js + Tailwind CSS
- 🧩 Backend: Node.js + Express
- 🗄️ Database: PostgreSQL

## 🚀 Getting Started

### 🗂️ Project Structure

```
inventory-expiry-tracker-backend/
├── node_modules/
├── src/
│   ├── controllers/
│   │   └── productController.js
│   ├── models/
│   │   └── productModel.js
│   ├── routes/
│   │   └── productRoutes.js
│   ├── db/
│   │   └── index.js            # DB connection setup
│   ├── app.js                  # Express app setup
│   └── server.js               # Server start file
├── .env                       # Environment variables (DB creds)
├── .gitignore
├── package.json
└── README.md

```

### ⚙️ Backend Setup
1. 🔄 Clone the repo
2. 📥 Install dependencies: `npm install`
3. 🛠️ Setup PostgreSQL database and update connection settings
4. ▶️ Start server: `npm run dev`

### 🖼️ Frontend Setup
(To be added)

---
