<p align="center">
  <h1 align="center">📚 E-Library</h1>
  <p align="center">
    A cloud-native digital library platform built with microservices architecture, featuring AI-powered book analysis, Razorpay subscription payments, and a modern Next.js frontend.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 17"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2+-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Configuration](#%EF%B8%8F-configuration)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

E-Library is a full-stack digital library platform that enables users to discover, read, and manage digital books through a scalable microservices architecture. The platform combines **Spring Boot** backend services with a **Next.js** frontend and an **AI-powered** analysis engine to deliver intelligent book summaries, text-to-speech, and content analysis.

Key highlights:
- **8 independently deployable microservices** communicating via Kafka and REST
- **AI-powered features** using LangChain + Gemini/Sarvam for book analysis, summaries, and TTS
- **Razorpay integration** for subscription-based payment processing
- **Cloudinary** for book cover/file storage
- **OAuth2 + JWT** for secure authentication with rate limiting

## ✨ Features

### 📖 Core Features
- **Book Catalog & Upload** — Upload, browse, search, and filter books by category
- **Book Reader** — In-app reading experience with reading history tracking
- **User Profiles** — Comprehensive user profile management with preferences

### 🤖 AI-Powered Features
- **Book Summarization** — AI-generated summaries using LangChain & Gemini
- **Content Analysis** — Intelligent book content analysis
- **Text-to-Speech** — AI-powered TTS using Sarvam API for audio playback

### 💳 Payments & Subscriptions
- **Razorpay Integration** — Secure payment processing with order creation & webhook verification
- **Subscription Plans** — Flexible subscription tiers with automatic management

### 🔐 Security & Infrastructure
- **JWT Authentication** with OAuth2 (Google) social login
- **Rate Limiting** via Bucket4j across all services
- **Circuit Breaker** pattern with Resilience4j for fault tolerance
- **Service Discovery** with Netflix Eureka
- **Event-Driven Architecture** with Apache Kafka for inter-service communication
- **Centralized API Gateway** with Spring Cloud Gateway & Redis caching
- **Email Notifications** via Kafka-driven mail service

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16 / React 19)                │
│            Tailwind CSS 4 · shadcn/ui · Framer Motion               │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                    API Gateway (Spring Cloud Gateway)                │
│              WebFlux · Resilience4j · Redis · JWT Filter             │
└───┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┘
    │          │          │          │          │          │
┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼────────┐
│ Auth  │ │ Book  │ │ User  │ │ Sub.  │ │ Mail  │ │     AI     │
│Service│ │Upload │ │Profile│ │Payment│ │Service│ │   Service  │
│       │ │       │ │       │ │       │ │       │ │            │
│MySQL  │ │Postgre│ │MySQL  │ │Postgre│ │Kafka  │ │  MongoDB   │
│OAuth2 │ │Cloudi-│ │OpenFe-│ │Razor- │ │SMTP   │ │  LangChain │
│JWT    │ │nary   │ │ign    │ │pay    │ │       │ │  Gemini    │
│Bucket4│ │Kafka  │ │Kafka  │ │Kafka  │ │       │ │  Sarvam    │
└───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └─────┬──────┘
    │         │         │         │         │            │
┌───▼─────────▼─────────▼─────────▼─────────▼────────────▼──────────┐
│                  Service Discovery (Eureka Server)                 │
│                     Spring Boot 4.0 · Spring Cloud 2025            │
└───────────────────────────────────────────────────────────────────┘
    │
┌───▼──────────────────────────────────────────────────────────────┐
│                    Apache Kafka (Event Bus)                       │
│          Profile events · Payment events · Mail triggers          │
└──────────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

### Backend (Java / Spring Boot)

| Component | Technology |
|---|---|
| **Framework** | Spring Boot 3.2.5 / 3.3.5 / 4.0.3 |
| **API Gateway** | Spring Cloud Gateway (Reactive / WebFlux) |
| **Service Discovery** | Netflix Eureka Server & Client |
| **Messaging** | Apache Kafka |
| **Databases** | MySQL (Auth, UserProfile) · PostgreSQL (BookUpload, Payment) |
| **Caching** | Redis (Gateway) · Caffeine (BookUpload, UserProfile) |
| **Security** | Spring Security · JWT (jjwt 0.12) · OAuth2 Client |
| **Rate Limiting** | Bucket4j |
| **Resilience** | Resilience4j Circuit Breaker + Spring Retry |
| **Inter-Service Calls** | OpenFeign |
| **Payments** | Razorpay Java SDK |
| **File Storage** | Cloudinary |
| **Email** | Spring Mail (SMTP) |
| **API Docs** | SpringDoc OpenAPI (Swagger UI) |
| **Code Generation** | Lombok |
| **Monitoring** | Spring Boot Actuator |
| **Build Tool** | Maven |

### AI Service (Node.js / Express)

| Component | Technology |
|---|---|
| **Runtime** | Node.js with Express 5 |
| **AI/LLM** | LangChain · Google Gemini |
| **TTS** | Sarvam API |
| **ML Models** | Xenova/Transformers |
| **Database** | MongoDB (Mongoose) |
| **PDF Processing** | pdf-parse |
| **Security** | Helmet · JWT · express-rate-limit |
| **Service Discovery** | eureka-js-client |

### Frontend (Next.js)

| Component | Technology |
|---|---|
| **Framework** | Next.js 16.1.6 (App Router) |
| **UI Library** | React 19.2 |
| **Authentication** | NextAuth.js 4 |
| **State Management** | Zustand 5 |
| **Styling** | Tailwind CSS 4 · tw-animate-css |
| **UI Components** | shadcn/ui · Radix UI |
| **Animations** | Framer Motion 12 |
| **Forms** | React Hook Form 7 |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Theming** | next-themes (dark mode) |

## 📁 Project Structure

```
E-library/
├── Api_Gateway/                # Spring Cloud Gateway — routing, JWT filter, Redis cache
│   └── src/main/java/...
├── Authentication/             # Auth service — login, signup, OAuth2, JWT, password reset
│   └── src/main/java/...
├── BookUpload/                 # Book management — CRUD, Cloudinary upload, Kafka events
│   └── src/main/java/...
├── UserProfile/                # User profiles — preferences, OpenFeign, Kafka events
│   └── src/main/java/...
├── subscriptionpayment/        # Razorpay payments — subscriptions, plans, webhooks
│   └── src/main/java/...
├── MailSevice/                 # Email notifications — Kafka consumer, SMTP sender
│   └── src/main/java/...
├── Eureka/                     # Eureka Server — service registry & discovery
│   └── Eureka/src/main/java/...
├── Ai_service/                 # AI microservice (Node.js/Express)
│   ├── src/
│   │   ├── app.js              # Express app entry point
│   │   ├── controller/         # analysisController, summaryController, ttsController
│   │   ├── routes/             # analysisRoutes, summaryRoutes, ttsRoutes
│   │   ├── service/            # AI service logic (LangChain, Gemini, Sarvam)
│   │   ├── models/             # Mongoose schemas
│   │   ├── middleware/         # Auth & rate limiting middleware
│   │   └── utils/              # Utilities
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # Next.js 16 frontend application
│   ├── app/
│   │   ├── (auth)/             # Auth pages — login, signup, reset-password
│   │   ├── (pages)/            # App pages — Home, Bookcatalog, BookUpload, Profile, Readpage
│   │   ├── layout.js           # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/             # UI components
│   │   ├── BookCard.jsx        # Book card with preview
│   │   ├── Categoryfilter.jsx  # Category filtering
│   │   ├── Featuredbooks.jsx   # Featured books section
│   │   ├── HeroBanner.jsx      # Landing hero banner
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── Uploadsection.jsx   # Book upload form
│   │   ├── Userprofile.jsx     # User profile display
│   │   └── ui/                 # shadcn/ui primitives
│   ├── store/                  # Zustand stores (authstore, usebookstore)
│   ├── lib/                    # API clients (authapi, bookapi)
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Java JDK | 17+ |
| Maven | 3.6+ |
| Node.js | 18+ (LTS) |
| MySQL | 8.0+ |
| PostgreSQL | 15+ |
| MongoDB | 6.0+ |
| Apache Kafka | 3.x |
| Redis | 7.x |
| Git | Latest |

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Praveenvkadam/E-library.git
   cd E-library
   ```

2. **Start infrastructure services**
   ```bash
   # Start Kafka, Redis, MySQL, PostgreSQL, MongoDB
   # (Use Docker Compose or install locally)
   ```

3. **Start Eureka Server** (must be first)
   ```bash
   cd Eureka/Eureka
   mvn spring-boot:run
   # Runs on http://localhost:8761
   ```

4. **Start API Gateway**
   ```bash
   cd Api_Gateway
   mvn spring-boot:run
   ```

5. **Start backend microservices** (in any order)
   ```bash
   # Authentication Service
   cd Authentication && mvn spring-boot:run

   # Book Upload Service
   cd BookUpload && mvn spring-boot:run

   # User Profile Service
   cd UserProfile && mvn spring-boot:run

   # Subscription Payment Service
   cd subscriptionpayment && mvn spring-boot:run

   # Mail Service
   cd MailSevice && mvn spring-boot:run
   ```

6. **Start AI Service** (Node.js)
   ```bash
   cd Ai_service
   npm install
   npm run dev    # Development mode with nodemon
   # or
   npm start      # Production mode
   ```

7. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   # Runs on http://localhost:3000
   ```

## ⚙️ Configuration

### Environment Variables

Each service requires its own configuration. Create `.env` files or update `application.properties`/`application.yml` in each service:

#### Authentication Service
```properties
# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/elibrary_auth
spring.datasource.username=root
spring.datasource.password=your_password

# JWT
jwt.secret=your_jwt_secret_key
jwt.expiration=86400000

# OAuth2 (Google)
spring.security.oauth2.client.registration.google.client-id=your_client_id
spring.security.oauth2.client.registration.google.client-secret=your_client_secret
```

#### BookUpload Service
```properties
# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/elibrary_books
spring.datasource.username=postgres
spring.datasource.password=your_password

# Cloudinary
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret

# Kafka
spring.kafka.bootstrap-servers=localhost:9092
```

#### Subscription Payment Service
```properties
# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/elibrary_payments

# Razorpay
razorpay.key-id=your_razorpay_key_id
razorpay.key-secret=your_razorpay_key_secret
```

#### AI Service (`Ai_service/.env`)
```env
GEMINI_API_KEY=your_gemini_api_key
SARVAM_API_KEY=your_sarvam_api_key
MONGODB_URI=mongodb://localhost:27017/elibrary_ai
JWT_SECRET=your_jwt_secret
PORT=5000
EUREKA_HOST=localhost
EUREKA_PORT=8761
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

#### API Gateway
```properties
# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

#### Mail Service
```properties
# SMTP
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password

# Kafka
spring.kafka.bootstrap-servers=localhost:9092
```

## 📚 API Reference

All requests go through the **API Gateway**. Swagger UI is available on services that include SpringDoc OpenAPI.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login with email & password |
| `POST` | `/auth/refresh` | Refresh JWT token |
| `POST` | `/auth/reset-password` | Request password reset |
| `GET` | `/oauth2/authorize/google` | Google OAuth2 login |

### Books

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/books` | Get all books (with filtering) |
| `GET` | `/books/:id` | Get book details |
| `POST` | `/books/upload` | Upload a new book (multipart) |
| `PUT` | `/books/:id` | Update book metadata |
| `DELETE` | `/books/:id` | Delete a book |

### User Profile

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/profile` | Get authenticated user's profile |
| `PUT` | `/profile` | Update user profile |
| `GET` | `/profile/preferences` | Get reading preferences |

### Subscriptions & Payments

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/subscription/plans` | Get available subscription plans |
| `POST` | `/subscription/subscribe` | Create a new subscription |
| `GET` | `/subscription/status` | Get subscription status |
| `POST` | `/payment/webhook` | Razorpay webhook handler |

### AI Services

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/ai/summary` | Generate AI book summary |
| `POST` | `/ai/analysis` | Analyze book content |
| `POST` | `/ai/tts` | Convert text to speech |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 🐛 [Open an Issue](https://github.com/Praveenvkadam/E-library/issues) on GitHub
- 📧 Contact the development team
- 📖 Check documentation in each service directory

## 🙏 Acknowledgments

- [Spring Boot](https://spring.io/projects/spring-boot) & [Spring Cloud](https://spring.io/projects/spring-cloud)
- [Next.js](https://nextjs.org/) & [React](https://react.dev/)
- [LangChain](https://www.langchain.com/) & [Google Gemini](https://ai.google.dev/)
- [Razorpay](https://razorpay.com/) for payment processing
- [Cloudinary](https://cloudinary.com/) for media management
- [Netflix OSS](https://netflix.github.io/) (Eureka)
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components

---

**Last Updated**: March 2026  
**Repository**: [Praveenvkadam/E-library](https://github.com/Praveenvkadam/E-library)
