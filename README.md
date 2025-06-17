# Posts App

A full-stack web application for creating, managing, and sharing posts with user authentication. Built with modern technologies including [Next.js](https://nextjs.org/), [NestJS](https://nestjs.com/), and [SQLite](https://sqlite.org/).

## 🚀 Features

- **User Authentication**: Secure JWT-based login and registration
- **Post Management**: Create, read, update, and delete posts
- **User Profiles**: Personalized user accounts with profile management
- **Responsive Design**: Modern, mobile-friendly UI with Tailwind CSS
- **Real-time Updates**: Dynamic post loading and management
- **Protected Routes**: Secure access control for authenticated users

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Context](https://react.dev/reference/react/useContext)** - State management for authentication and posts

### Backend
- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[SQLite](https://sqlite.org/)** - Lightweight database
- **[JWT](https://jwt.io/)** - JSON Web Tokens for authentication
- **[TypeORM](https://typeorm.io/)** - Object-relational mapping

## 📁 Project Structure

```
KupaInterview/
├── README.md
├── backend/                    # NestJS API server
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── posts/             # Posts management module
│   │   ├── database/          # Database entities
│   │   └── common/            # Shared utilities
│   └── database.sqlite        # SQLite database
└── frontend/                  # Next.js React app
    ├── src/
    │   ├── app/               # Next.js App Router pages
    │   ├── components/        # Reusable React components
    │   ├── contexts/          # React Context providers
    │   ├── services/          # API service layer
    │   └── types/             # TypeScript type definitions
    └── public/                # Static assets
```

## 🚦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.0 or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) package manager

### Quick Start

Both services need to be running simultaneously for the full application to work.

#### 1. Backend Setup (Terminal 1)
```bash
cd backend
npm install
npm run start:dev
```
**API Server**: http://localhost:3001

#### 2. Frontend Setup (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
**Web Application**: http://localhost:3000

## 📚 API Documentation

**Base URL**: `http://localhost:3001`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/login` | User login | ❌ |
| `POST` | `/auth/signup` | User registration | ❌ |
| `GET` | `/posts` | Get all posts | ✅ |
| `GET` | `/posts/my` | Get current user's posts | ✅ |
| `POST` | `/posts` | Create a new post | ✅ |
| `PUT` | `/posts/:id` | Update a post | ✅ |
| `DELETE` | `/posts/:id` | Delete a post | ✅ |

### Authentication
- Uses [JWT](https://jwt.io/) tokens for secure authentication
- Tokens are stored in browser localStorage
- Include `Authorization: Bearer <token>` header for protected endpoints

## 🔐 Authentication Flow

1. **Registration**: Users sign up with email, password, first name, and last name
2. **Login**: Authenticate with email/password to receive JWT token
3. **Session Management**: JWT token stored in localStorage for subsequent requests
4. **Route Protection**: Unauthenticated users automatically redirected to login
5. **Logout**: Clear session and redirect to login page

## 📱 Application Routes

### Frontend ([Next.js App Router](https://nextjs.org/docs/app))
- **`/`** - Home dashboard (protected, requires authentication)
- **`/auth`** - Login page (public)
- **`/auth/register`** - Registration page (public)

### Backend ([NestJS RESTful API](https://docs.nestjs.com/))
- **Base URL**: `http://localhost:3001`
- See [API Documentation](#-api-documentation) section above for detailed endpoints

## 🎨 Key Features & UI/UX

- **🎯 Responsive Design**: Optimized for desktop and mobile with [Tailwind CSS](https://tailwindcss.com/)
- **⚡ Loading States**: Visual feedback during API operations
- **🚨 Error Handling**: User-friendly error messages and validation
- **🔄 Real-time Updates**: Dynamic post loading and management
- **🎛️ Tab Interface**: Switch between "All Posts" and "My Posts" views
- **🔒 Protected Routes**: Secure access control with automatic redirects

## 🧪 Development & Deployment

### Development Commands
```bash
# Backend development
cd backend && npm run start:dev    # Start with hot reload
cd backend && npm run test         # Run tests

# Frontend development  
cd frontend && npm run dev         # Start development server
cd frontend && npm run build       # Build for production
```

### Production Build
```bash
# Backend
cd backend && npm run build && npm run start:prod

# Frontend
cd frontend && npm run build && npm start
```

### Useful Links
- **[Next.js Documentation](https://nextjs.org/docs)** - Frontend framework docs
- **[NestJS Documentation](https://docs.nestjs.com/)** - Backend framework docs
- **[TypeORM Documentation](https://typeorm.io/)** - Database ORM docs
- **[Tailwind CSS Documentation](https://tailwindcss.com/docs)** - CSS framework docs

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or have questions:
- **📋 Open an issue** on the GitHub repository
- **📧 Contact** the development team
- **📖 Check** the documentation links above

---

**Built with ❤️ using [Next.js](https://nextjs.org/) and [NestJS](https://nestjs.com/)**
