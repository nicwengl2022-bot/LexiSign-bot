# LexiSign Single-Login Frontend

This directory contains the frontend for the single-login authentication system.

## Structure

```
single-login-frontend/
├── public/
│   └── login.html          # Login page
├── assets/
│   └── css/                # Stylesheets
│       ├── preflight.css
│       ├── index.css
│       ├── theme.css
│       └── utilities.css
└── src/
    ├── components/         # React components (if using React)
    └── pages/             # Page components
```

## Usage

The login page is served at `/login/` from the backend server. It posts credentials to `POST /auth/login`.

### Running Locally

The backend (`../lexisign backend/single-login-backend`) serves this frontend as static files.

To run the full system:

```bash
cd "../lexisign backend/single-login-backend"
ADMIN_USERNAME="nicwengl2022@gmail.com" ADMIN_PASSWORD="Nicknickj12@" PORT=3000 node server.js
```

Then visit: http://localhost:3000/login/

## Features

- Clean login form with email/username and password fields
- Styled with CSS framework (preflight, index, theme)
- Client-side validation
- Success/error feedback with attempt counter
- Token storage in localStorage
