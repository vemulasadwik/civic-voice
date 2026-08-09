# Civic Voice

Civic Voice is an end-to-end citizen grievance system for reporting and tracking civic problems. It supports citizens, ward officers and administrators with a fixed, auditable complaint workflow.

## Features

- Citizen registration, login, profile and password management
- Complaint submission with location and Cloudinary image evidence
- Citizen complaint tracking, comments, notifications and reopening
- Administrator search, filters, priorities, assignments, user management, analytics and CSV reports
- Ward-officer assignments, progress notes, completion images and resolution
- Responsive React/Tailwind interfaces for all three roles
- JWT authentication, role authorization, rate limiting, secure headers and restricted CORS
- Automated end-to-end API lifecycle test

## Project structure

```text
civic voice/
├── client/        React, Vite and Tailwind CSS
├── server/        Node.js, Express and Mongoose
├── render.yaml    Render backend configuration
└── README.md
```

## Requirements

- Node.js 22.12 or newer
- MongoDB Atlas database
- Cloudinary account for image uploads

## Local setup

```powershell
cd client
npm install
Copy-Item .env.example .env

cd ..\server
npm install
Copy-Item .env.example .env
```

Configure `server/.env` and `client/.env`. Never commit either file.

Start the backend:

```powershell
cd server
npm run dev
```

Start the frontend in another terminal:

```powershell
cd client
npm run dev
```

Open `http://localhost:5173`.

## Create the first administrator

Add these values to `server/.env`:

```env
ADMIN_NAME=Civic Voice Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password
```

Run once:

```powershell
cd server
npm run create-admin
```

The administrator can then log in through the same login page and create ward officers.

## Verification

```powershell
cd client
npm run lint
npm run build

cd ..\server
npm test
```

The backend test creates uniquely named temporary users and a complaint, exercises the complete lifecycle, and removes only those records afterward.

## Complaint lifecycle

```text
Pending → Assigned → In Progress → Resolved
                 ↘ Rejected
Resolved → Reopened → In Progress → Resolved
```

## Deployment

### Backend on Render

1. Push the repository to GitHub.
2. Create a Render Blueprint from `render.yaml`, or create a Node web service with root directory `server`.
3. Set the environment variables from `server/.env.example`.
4. Set `CLIENT_URL` to the deployed Vercel URL.
5. Verify `https://YOUR-RENDER-SERVICE/api/health`.

### Frontend on Vercel

1. Import the GitHub repository into Vercel.
2. Set the root directory to `client`.
3. Add `VITE_API_URL=https://YOUR-RENDER-SERVICE/api`.
4. Deploy. `client/vercel.json` enables React Router refreshes.

After deployment, update Render's `CLIENT_URL` and redeploy the backend.
