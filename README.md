# ResumeX

ResumeX is a smart resume-sharing platform where users upload resumes and get one permanent professional link that always stays updated.

## Monorepo Structure
This is a full-stack monorepo:
- `frontend`: Next.js App Router, Tailwind CSS, JavaScript
- `backend`: Node.js, Express, MongoDB, JavaScript

## Core Features
1. Authentication (Clerk)
2. Dashboard
3. Upload Resume PDF
4. Public Resume Links (Custom Slugs)
5. Multiple Resume Versions
6. Resume Updating
7. Public Resume Viewer
8. Resume Analytics (Views, Referrers)

## Quick Start

### 1. Environment Variables

#### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/resumex?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NODE_ENV=development
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Run the Development Servers

**Backend:**
```bash
cd backend
npm run dev
```
The backend API will run on `http://localhost:5000`.

**Frontend:**
```bash
cd frontend
npm run dev
```
The frontend application will be available at `http://localhost:3000`.

## API Endpoints

### Resumes (`/api/resumes`)
- `GET /p/:slug` - Get public resume by slug (Public)
- `POST /` - Upload new resume (Protected)
- `GET /` - Get all user's resumes (Protected)
- `PUT /:id` - Update resume (Protected)
- `DELETE /:id` - Delete resume (Protected)

### Analytics (`/api/analytics`)
- `GET /:id` - Get resume analytics (Protected)

## Next Steps for Development
1. Configure your MongoDB connection string.
2. Create an account on Cloudinary and get your API keys.
3. Create an application on Clerk and get your API keys.
4. Set up the environment variables.
5. In the `frontend`, create the components and integrate the API routes!
