# E-Library

A comprehensive microservices-based digital library platform built with Java, featuring AI-powered services, secure authentication, and subscription-based access to digital books.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Architecture](#project-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

E-Library is a full-stack digital library platform designed to provide users with seamless access to digital books through a microservices architecture. The platform combines modern web technologies with cloud-native patterns to ensure scalability, reliability, and security.

## ✨ Features

- **User Authentication**: Secure authentication system with JWT-based authorization
- **Book Upload & Management**: Easy book upload and catalog management
- **AI-Powered Services**: Machine learning integration for recommendations and content analysis
- **Subscription Management**: Flexible subscription and payment processing
- **User Profiles**: Comprehensive user profile and preference management
- **Mail Service**: Email notifications and user communications
- **API Gateway**: Centralized API management and routing
- **Service Discovery**: Eureka-based service discovery for microservices
- **Responsive Frontend**: Modern, responsive user interface

## 🏗️ Project Architecture

This project follows a **microservices architecture** pattern with the following components:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next JS)                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                      API Gateway                                 │
│                  (Central Entry Point)                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┬───────────┬───────────┐
         │           │           │           │           │
    ┌────▼──┐  ┌────▼──┐  ┌────▼──┐  ┌────▼──┐  ┌────▼──┐
    │  Auth │  │ Books │  │  User │  │Payment│  │  AI   │
    │Service│  │Service│  │Profile│  │Service│  │Service│
    └───────┘  └───────┘  └───────┘  └───────┘  └───────┘
         │           │           │           │           │
    ┌────▼─────────────────────────────────────────────┐
    │           Service Discovery (Eureka)             │
    └────────────────────────────────────────────────┘
         │
    ┌────▼─────────────────────────────────────────────┐
    │        Mail Service (Notifications)              │
    └──────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

- **Language**: Java,JS
- **Architecture**: Microservices
- **API Gateway**: Spring Cloud Gateway
- **Service Discovery**: Eureka
- **Authentication**: JWT-based security
- **Frontend**: Modern responsive web framework
- **Payment Processing**: Subscription payment service
- **AI/ML**: AI service for recommendations(gemini,sarvam)
- **Email**: Mail service for notifications
- **Build Tools**: Maven
- **IDE Support**: IntelliJ IDEA, VS Code

## 📁 Project Structure

```
E-library/
├── Api_Gateway/              # API Gateway - central entry point for all services
├── Authentication/           # Authentication and authorization service
├── BookUpload/              # Book upload and management service
├── UserProfile/             # User profile management service
├── subscriptionpayment/     # Subscription and payment processing
├── Ai_service/              # AI-powered recommendations and analytics
├── MailSevice/              # Email service for notifications
├── Eureka/                  # Service discovery and registry
├── frontend/                # Frontend application (React/Vue/Angular)
├── README.md                # This file
└── .vscode/                 # VS Code configuration
    .idea/                   # IntelliJ IDEA configuration
```

## 🚀 Getting Started

### Prerequisites

- Java 11 or higher
- Maven 3.6+ or Gradle 6.0+
- Node.js 14+ (for frontend)
- MySQL/PostgreSQL (for database)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Praveenvkadam/E-library.git
   cd E-library
   ```

2. **Backend Setup**
   
   Build all microservices:
   ```bash
   # Using Maven
   mvn clean install
   
   # Or using Gradle
   gradle build
   ```

3. **Start Services**
   
   Start each microservice (in order):
   ```bash
   # 1. Eureka Server (Service Discovery)
   cd Eureka
   mvn spring-boot:run
   
   # 2. API Gateway
   cd Api_Gateway
   mvn spring-boot:run
   
   # 3. Authentication Service
   cd Authentication
   mvn spring-boot:run
   
   # 4. User Profile Service
   cd UserProfile
   mvn spring-boot:run
   
   # 5. Book Upload Service
   cd BookUpload
   mvn spring-boot:run
   
   # 6. Subscription Payment Service
   cd subscriptionpayment
   mvn spring-boot:run
   
   # 7. Mail Service
   cd MailSevice
   mvn spring-boot:run
   
   # 8. AI Service
   cd Ai_service
   mvn spring-boot:run
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=elibrary
DB_USER=root
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400000

# Mail Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# Payment Gateway Configuration
PAYMENT_API_KEY=your_payment_gateway_key
PAYMENT_SECRET=your_payment_secret

# AI Service Configuration
AI_API_KEY=your_ai_service_key
```

### Database Setup

```sql
CREATE DATABASE elibrary;
USE elibrary;

-- Run migration scripts from each service
-- These should be located in each service's resources/db directory
```

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token

### Book Endpoints

- `GET /books` - Get all books
- `GET /books/:id` - Get book details
- `POST /books/upload` - Upload new book
- `PUT /books/:id` - Update book
- `DELETE /books/:id` - Delete book

### User Profile Endpoints

- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /profile/preferences` - Get user preferences

### Subscription Endpoints

- `POST /subscription/plans` - Get subscription plans
- `POST /subscription/subscribe` - Subscribe to plan
- `GET /subscription/status` - Get subscription status

### AI Recommendations

- `GET /ai/recommendations` - Get personalized recommendations
- `GET /ai/search` - AI-powered search

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please:
- Open an issue on GitHub
- Contact the development team at support@elibrary.com
- Check documentation in each service directory

## 🙏 Acknowledgments

- Spring Boot community
- Netflix OSS (Eureka, API Gateway)
- All contributors and users

---

**Last Updated**: March 2026  
**Repository**: [Praveenvkadam/E-library](https://github.com/Praveenvkadam/E-library)
