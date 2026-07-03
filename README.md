Sugarcane Resource Engine

Description
A full stack web application designed to connect farmers, factory administrators, and machinery operators. It streamlines the sugarcane harvesting process by matching resources efficiently.

Architecture
Frontend: React, Tailwind CSS, Vite
Backend: Node JS, Express JS, BullMQ
Database: PostgreSQL
Cache: Redis

Setup Instructions

1. Database and Environment
Create a PostgreSQL database.
Set up an environment variable file with your database URL, Redis URL, and a JWT secret.

2. Backend Setup
Navigate into the backend directory.
Run npm install to install dependencies.
Run npm start to launch the API and background workers.

3. Frontend Setup
Navigate into the frontend directory.
Run npm install to install dependencies.
Run npm start to launch the React application.

Features
Role based dashboards for Farmers, Machines, and Factories.
Real time matching algorithms using BullMQ.
Instant notifications using WebSockets.
Secure HttpOnly cookie authentication.

Deployment
The frontend is optimized for Vercel deployment.
The backend is optimized for Render deployment using Docker.
The database is compatible with AWS RDS.
