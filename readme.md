# 🚀 Project Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=flat&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)

A enterprise-grade project management application featuring real-time collaboration, role-based access control, and a sleek glassmorphism UI.

![Application Kanban Board](./screenshots/kanban-screen.png)

---

## ✨ Key Features

- **Multi-Workspace Organization**: Effortlessly manage multiple teams and departments.
- **Dynamic Kanban Board**: Drag-and-drop tasks across custom columns with real-time sync.
- **Real-time Collaboration**: Powered by Socket.io for instant updates, typing indicators, and presence.
- **Advanced Permissions (RBAC)**: Granular control with Owner, Admin, Member, and Viewer roles.
- **Audit Trails**: Full activity logs for transparency and compliance.
- **Rich Task Details**: Support for comments, attachments, subtasks, and priority levels.
- **Stunning UI**: Modern glassmorphism aesthetic built with Tailwind CSS and Shadcn UI.

---

## 🛠 Tech Stack

| Frontend | Backend | Database & DevOps |
| :--- | :--- | :--- |
| **React 18** (Vite) | **Node.js** (Express) | **MySQL 8.0** |
| **TypeScript** | **TypeScript** | **Drizzle ORM** |
| **Tailwind CSS** | **Socket.io** | **Docker & Compose** |
| **TanStack Query** | **Zod** (Validation) | **Redis** (Scaling) |
| **Zustand** | **JWT** (Auth) | **Adminer** |

---

## 🏗 Modular Architecture

```mermaid
graph TD
    Client[React Client] <-->|HTTPS / WSS| Server[Express API Server]
    Server <-->|Drizzle ORM| DB[(MySQL Database)]
    Server <-->|Socket.io| Redis[Redis Cache]
    Server -->|Logs| Audit[Activity Store]
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & pnpm/npm
- Docker Desktop

### 1. Setup Server
```bash
cd server
cp .env.example .env # Update with your credentials
npm install
docker-compose up -d
npm run db:push
npm run db:seed
npm run dev
```

### 2. Setup Client
```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 📱 Mobile App

The project includes a cross-platform mobile application located in the `/mobile` directory. It shares the same backend and business logic for a seamless experience on the go.

---

## 📚 API Overview

Detailed API documentation is available in the [API Documentation](./server/docs/api.md) (or see the routes in `server/src/api/routes`).

### Core Endpoints:
- `POST /api/v1/auth/login` - User Authentication
- `GET /api/v1/workspaces` - Workspace Management
- `GET /api/v1/projects` - Project Organization
- `PATCH /api/v1/tasks` - Task Lifecycle

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more details.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

Built with ❤️ by the Project Management Team.
