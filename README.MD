# 💬 Real-Time Chat Application

A full-stack **real-time chat application** built with the MERN stack that enables users to communicate instantly with real-time messaging, online/offline presence, typing indicators, notifications, image sharing, and secure JWT authentication.

---

## 🚀 Live Demo

🌐 **Live Application:**
https://chatapp-1-z8w7.onrender.com

📂 **GitHub Repository:**
https://github.com/harshitkushwaha45/CHATAPP

---

## ✨ Highlights

* 🔐 **Custom JWT Authentication** — Secure user authentication without third-party authentication services
* ⚡ **Real-Time Messaging** — Instant one-to-one messaging powered by Socket.io
* 🟢 **Online/Offline Presence** — See when users are online or offline in real time
* ✍️ **Typing Indicators** — Real-time typing status while chatting
* 👁️ **Message Seen Status** — Track whether messages have been seen
* 🔔 **Notification Sounds** — Sound notifications for new messages with toggle controls
* 🔊 **Typing Sounds** — Optional typing sound with user-controlled toggle
* 📨 **Welcome Emails** — Automated welcome emails for new users using Resend
* 🖼️ **Image Uploads** — Upload and share profile images using Cloudinary
* 🧰 **RESTful API** — Backend API built with Node.js and Express.js
* 🗄️ **MongoDB Database** — Persistent storage for users, messages, and application data
* 🚦 **API Rate Limiting & Security** — API protection powered by Arcjet
* 🎨 **Modern UI** — React, Tailwind CSS, and DaisyUI
* 🧠 **Zustand State Management** — Lightweight global state management
* 🔄 **Real-Time Chat Synchronization** — Messages and presence updates synchronized instantly
* 📱 **Responsive Design** — Chat interface designed for different screen sizes
* 🛠️ **Git & GitHub Workflow** — Version control using Git and GitHub
* 🚀 **Deployment Ready** — Deployed using a free-tier-friendly hosting setup

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* Tailwind CSS
* DaisyUI
* Zustand
* Axios
* Socket.io Client

### Backend

* Node.js
* Express.js
* Socket.io
* RESTful APIs
* JWT Authentication
* Resend
* Arcjet

### Database & Storage

* MongoDB
* Cloudinary

### Development & Deployment

* Git
* GitHub
* Render
* npm

---

## 🏗️ Application Architecture

```text
┌───────────────────────────────┐
│        React Frontend         │
│                               │
│  React + Tailwind + DaisyUI   │
│  Zustand + Axios              │
│  Socket.io Client             │
└───────────────┬───────────────┘
                │
                │ REST API
                │ WebSocket
                ▼
┌───────────────────────────────┐
│      Node.js + Express        │
│                               │
│  Authentication               │
│  User Management              │
│  Message APIs                 │
│  Socket.io Server             │
│  Arcjet Security              │
└───────┬───────────┬───────────┘
        │           │
        ▼           ▼
┌─────────────┐  ┌─────────────┐
│   MongoDB   │  │  Cloudinary  │
│             │  │              │
│ Users       │  │ Profile      │
│ Messages    │  │ Images       │
└─────────────┘  └─────────────┘
```

---

## ⚡ Real-Time Messaging

The application uses **Socket.io** to provide real-time communication.

```text
User A
  │
  │ Send Message
  ▼
Socket.io Server
  │
  │ Real-Time Event
  ▼
User B
  │
  ▼
Message Appears Instantly
```

This allows users to communicate without manually refreshing the application.

---

## 🟢 Online / Offline Presence

The application tracks user presence in real time.

Users can see:

* 🟢 Online users
* ⚫ Offline users
* Real-time presence updates

When a user connects or disconnects, the status is synchronized through Socket.io.

---

## ✍️ Typing Indicators

The chat interface provides real-time typing indicators.

```text
User A starts typing
        ↓
Socket.io Event
        ↓
Server
        ↓
User B
        ↓
"User is typing..."
```

Typing sounds can also be enabled or disabled from the application.

---

## 👁️ Message Seen Status

Messages include seen-status functionality so users can determine whether their sent messages have been viewed.

```text
Message Sent
     ↓
Delivered
     ↓
Message Viewed
     ↓
Seen Status Updated
```

---

## 🔐 Authentication

The application implements custom **JWT-based authentication**.

Authentication flow:

```text
Register / Login
       ↓
Server Validation
       ↓
JWT Token
       ↓
Authenticated User
       ↓
Protected API Requests
```

No third-party authentication provider is required.

---

## 📨 Welcome Emails

New users can receive a welcome email after registration.

The email functionality is implemented using **Resend**.

```text
User Signup
     ↓
Registration Successful
     ↓
Resend API
     ↓
Welcome Email
```

---

## 🖼️ Image Uploads

Profile images are uploaded and stored using **Cloudinary**.

```text
Select Image
     ↓
Frontend Upload
     ↓
Backend
     ↓
Cloudinary
     ↓
Image URL
     ↓
MongoDB
```

This avoids storing large image files directly inside the application server.

---

## 🚦 API Security

The application uses **Arcjet** for API security and rate limiting.

This helps protect backend endpoints from excessive or abusive requests.

---

## 🧠 State Management

Global application state is managed using **Zustand**.

State includes areas such as:

* Authentication state
* Current user
* Selected chat
* Messages
* Online users
* Chat updates

---

## 🔔 Notification & Sound Controls

The application includes sound feedback for chat interactions.

Users can control:

* 🔔 New message notification sound
* ✍️ Typing sound

Sound preferences can be toggled according to user preference.

---

## 🧰 REST API

The backend follows a RESTful API architecture for application operations.

Main functionality includes:

```text
/api/auth
    ├── Register
    ├── Login
    └── User Authentication

/api/users
    └── User Management

/api/messages
    ├── Send Message
    ├── Get Messages
    └── Message Management
```

Real-time communication is handled separately through Socket.io.

---

## 📁 Project Structure

```text
CHATAPP/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── ...
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── hooks/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── ...
```

---

## 🧪 Environment Variables

### Backend (`/backend`)

Create a `.env` file inside the backend directory:

```env
PORT=3000

MONGO_URI=your_mongo_uri_here

NODE_ENV=development

JWT_SECRET=your_jwt_secret

RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_email_from_address
EMAIL_FROM_NAME=your_email_from_name

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development
```

> ⚠️ Never commit your `.env` file or expose API keys publicly.

---

## 🔧 Run the Backend

```bash
cd backend
npm install
npm run dev
```

---

## 💻 Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

---

## 🚀 Deployment

The application is deployed using a production-ready full-stack deployment setup.

### Frontend

```text
React + Vite
     ↓
Production Build
     ↓
Deployment
```

### Backend

```text
Node.js + Express
     ↓
Production Server
     ↓
Deployment
```

---

## 🔮 Future Improvements

* 👥 Group conversations
* 📎 File and document sharing
* 🎥 Voice and video calling
* 📨 Message replies and reactions
* 🔍 Advanced message search
* 🗑️ Message editing and deletion
* 🔔 Advanced notification preferences
* 📱 Improved mobile experience

---

## 👨‍💻 Author

**Harshit Kushwaha**

B.Tech — Information Technology

GitHub:
https://github.com/harshitkushwaha45

---

## ⭐ Show Your Support

If you like this project, consider giving the repository a ⭐ on GitHub.

