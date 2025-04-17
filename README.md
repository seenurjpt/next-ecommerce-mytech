# Next.js App

A modern web application built with [Next.js](https://nextjs.org/), React, and Tailwind CSS (or your preferred UI framework).

## 🚀 Features

- ⚡ Server-side rendering and static site generation
- 🔄 API routes with built-in backend support
- 📦 Code-splitting and fast performance
- 💅 Built-in CSS & Sass support, TailwindCSS compatible
- 🔐 Environment variable support
- 🧪 Extensible structure for scaling

## 📦 Installation

> ⚠️ We're using `--legacy-peer-deps` due to specific dependency compatibility issues.

```bash
npm install --legacy-peer-deps
```

## 🧑‍💻 Development

Start the development server:

```bash
npm run dev
```

## 🔨 Production Build

Create an optimized build:

```bash
npm run build
```

Then start the server:

```bash
npm start
```

## 📁 Project Structure

```
.
├── .next/              # Generated build output
├── node_modules/       # Node.js modules
├── public/             # Static assets (favicon.ico, etc.)
├── src/
│   ├── app/            # Main application folder
│   │   ├── api/        # API routes
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Context API for state management
│   │   ├── dashboard/  # Dashboard-related components/pages
│   │   ├── e-commerce/ # E-commerce related components/pages
│   │   ├── hooks/      # Custom hooks
│   │   ├── lib/        # Utility libraries and helper functions
│   │   ├── not-found/  # Not found pages/components
│   │   ├── utils.js    # Utility functions
│   │   └── WrapperComp.js # Layout wrapper component
├── .gitignore          # Git ignore file
├── jsconfig.json       # JavaScript configuration
├── next.config.mjs     # Next.js configuration
├── package.json        # Project metadata and dependencies
├── package-lock.json   # Dependency lock file
├── postcss.config.mjs  # PostCSS configuration
├── README.md           # Project documentation
├── tailwind.config.js  # TailwindCSS configuration
├── vercel.json         # Vercel deployment configuration
```

## 🌐 Deployment

This app is deployed on vercel, can be accessible with below link,

https://next-ecommerce-mytech.vercel.app/

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---
