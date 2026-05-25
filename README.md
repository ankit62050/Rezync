# 🚀 Rezync - Smart Resume Sharing Platform

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015%20%2F%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=for-the-badge&logo=clerk)](https://clerk.com/)
[![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)

🔗 **Live Link:** [https://rezync.vercel.app](https://rezync.vercel.app)

**Rezync** is a modern, full-stack, smart resume-sharing platform. Instead of sending bulky PDF attachments that get outdated the moment you hit send, Rezync gives you **one permanent, professional link** (`rezync.com/p/your-slug`) that always points to your latest resume, tracks visitor analytics, and supports version history.


---

## ✨ Features

- 👤 **Seamless Authentication:** Secured by Clerk (Google, GitHub, and Email/Password).
- 📁 **Cloud Resume Storage:** Resumes are securely uploaded and stored in Cloudinary.
- 🔗 **Custom Slugs:** Generate professional, easy-to-remember short-links (e.g., `/p/johndoe`).
- 🔄 **Version Control:** Upload new versions of your resume, keep a history of revisions, write change-logs/notes, and toggle the active public version with one click.
- 📊 **Rich Analytics:** Monitor real-time page views, unique visitors, referrers (LinkedIn, Twitter, email, etc.), and contact-clicks.
- 📱 **Responsive Design:** Premium UI built with Next.js App Router and Tailwind CSS, fully optimized for mobile, tablet, and desktop screens.
- 🔒 **Security-First:** Custom middlewares for route protection, input validations, CORS, and Helmet headers.

---

## 📁 Monorepo Structure

```text
Rezync/
├── frontend/     # Next.js App Router, Tailwind CSS, Axios, Clerk Auth, Lucide Emojis
└── backend/      # Node.js, Express, MongoDB (Mongoose), Cloudinary (Multer), Clerk Express SDK
```

---

## 🛠️ Local Quick Start

Follow these steps to run the application on your local machine:

### Prerequisite Accounts
You will need free tier accounts with:
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (For database storage)
2. [Clerk Dashboard](https://dashboard.clerk.com) (For user authentication)
3. [Cloudinary Console](https://cloudinary.com) (For hosting PDF files)

---

### Step 1: Clone the Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/Rezync.git
cd Rezync

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

---

### Step 2: Environment Setup

#### 1. Backend Environment Variables (`backend/.env`)
Create a file named `.env` in the `backend` folder and add your credentials:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/rezync?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NODE_ENV=development
```

#### 2. Frontend Environment Variables (`frontend/.env.local`)
Create a file named `.env.local` in the `frontend` folder:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### Step 3: Run the Services

Open two terminals or terminal tabs:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
```
The API server will spin up at `http://localhost:5000`.

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
```
The Next.js client will start at `http://localhost:3000`.

---

## 📡 API Endpoints Reference

### 1. Resumes (`/api/resumes`)
- **GET** `/api/resumes/p/:slug` - Fetch public resume by its custom slug. *(Public)*
- **POST** `/api/resumes/` - Upload a new resume PDF (form-data: `file`, `slug`, `title`). *(Protected)*
- **GET** `/api/resumes/` - Fetch all resumes owned by the logged-in user. *(Protected)*
- **GET** `/api/resumes/:id` - Fetch details of a single resume by its ID. *(Protected)*
- **GET** `/api/resumes/check-slug/:slug` - Verify if a custom URL slug is available. *(Protected)*
- **PUT** `/api/resumes/:id` - Upload a new version to an existing resume. *(Protected)*
- **DELETE** `/api/resumes/:id` - Permanently delete a resume. *(Protected)*

#### Version Management:
- **PATCH** `/api/resumes/:id/versions/:versionId/active` - Toggle which version is public. *(Protected)*
- **PATCH** `/api/resumes/:id/versions/:versionId/note` - Update notes/changelog for a version. *(Protected)*
- **DELETE** `/api/resumes/:id/versions/:versionId` - Remove a specific version. *(Protected)*

### 2. Analytics (`/api/analytics`)
- **POST** `/api/analytics/:id/click` - Logs contact button click. *(Public)*
- **GET** `/api/analytics/` - Retrieve aggregated analytics across all user resumes. *(Protected)*
- **GET** `/api/analytics/:id` - Retrieve detailed view/referrer analytics for a specific resume. *(Protected)*

---

## 🚀 Live Hosting & Deployment Guide

For a complete step-by-step production deployment tutorial (including MongoDB, Clerk, Cloudinary, backend deployment on Render/Railway, and frontend deployment on Vercel), check the instructions below!

---

## 📄 License
This project is licensed under the ISC License.
