 Crowdsourced Travel Planner

Concept: A collaborative trip-planning web app where friends can build, vote on, and finalize itineraries, manage budgets, and export a polished PDF guide.

1. Core Features

Shared Itineraries & Voting

Create and edit day-by-day plans with activities, times, and notes.

Upvote/downvote suggestions; sort by popularity.

Comment threads on each activity.

Interactive Maps

Display pinned locations and routes via Google Maps API.

Drag-and-drop map markers to update itinerary in real time.

Map view toggle between list and map.

Expense Splitting

Add expenses (amount, payer, participants).

Calculate balances, suggest settlements (Splitwise logic).

Email or in-app reminders for reimbursements.

PDF Itinerary Export

Generate a printable PDF with schedule, map snapshots, and budget summary.

Customizable styling (theme colors, cover page).

2. Tech Stack

Frontend (React)

Create-react-app or Vite + React

State management: Redux Toolkit or Context + useReducer

Styling: Tailwind CSS

Routing: React Router v6

PDF rendering: React-PDF or PDFKit via backend API

Maps: @react-google-maps/api

Real-time updates: Socket.io-client

Backend (Node.js + Express)

RESTful API endpoints

Authentication: JSON Web Tokens (JWT)

Realtime: Socket.io server

PDF generation: PDFKit (server-side) or React-PDF (client-side)

Database (MongoDB)

Collections: Users, Trips, Itineraries, Expenses, Votes, Comments

ODM: Mongoose

Deployment

Frontend: Vercel or Netlify

Backend: Heroku, Render, or DigitalOcean App Platform

MongoDB Atlas

Environment variables via .env and secrets manager

3. High-Level Architecture

[Client (React)] --REST/Socket--> [Node/Express Backend] -- MongoDB Atlas
                               \
                                \-- PDFKit --> PDF Stream

4. Data Models (Mongoose Schemas)

User: { _id, name, email, hashedPassword, avatarUrl, joinedTrips: [tripId] }

Trip: { _id, name, description, owner: userId, members: [userId], settings: {...} }

Itinerary: { _id, tripId, date, activities: [{ _id, title, description, location:{lat,lng}, suggestions:[userId], votes:{up:[userId],down:[userId]} }] }

Expense: { _id, tripId, amount, description, payer: userId, participants: [userId], settled: Boolean }

Comment: { _id, itineraryItemId, author: userId, text, timestamp }

5. API Endpoints (Examples)

POST /api/auth/register — signup

POST /api/auth/login — login

GET /api/trips — list trips

POST /api/trips — create trip

GET /api/trips/:id/itinerary — fetch itinerary

PUT /api/itinerary/:itemId/vote — up/down vote

POST /api/expenses — add expense

GET /api/expenses/:tripId/summary — expense summary

