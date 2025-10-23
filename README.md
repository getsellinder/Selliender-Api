# Audio Stream API

A powerful backend API for an audio streaming platform with comprehensive features including user management, product management, chapter management, and more.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [File Storage](#file-storage)
- [Authentication](#authentication)
- [Payment Integration](#payment-integration)
- [Deployment](#deployment)
- [License](#license)

## Overview

Audio Stream API is a robust backend service designed to power an audio streaming platform. It provides a comprehensive set of RESTful APIs for managing users, products, chapters, orders, and more. The API is built with Node.js, Express, and MongoDB, offering a scalable and maintainable solution for audio content delivery.

## Features

- **User Management**: Registration, authentication, profile management
- **Product Management**: Create, read, update, delete audio products
- **Chapter Management**: Organize audio content into chapters
- **Order Processing**: Handle purchases and subscriptions
- **Payment Integration**: Support for Stripe and Razorpay
- **Content Management**: Blogs, testimonials, banners
- **Support System**: Ticket creation and management
- **Cloud Storage**: Integration with Cloudinary for media files
- **SEO & Analytics**: Tools for optimizing and tracking performance

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Payment Processing**: Stripe, Razorpay
- **Email Service**: Nodemailer, SendGrid

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Stripe account (for payment processing)
- Razorpay account (for alternative payment processing)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/Audio-Stream-Api.git
   cd Audio-Stream-Api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables (see [Environment Variables](#environment-variables))

4. Start the development server:

   ```bash
   npm run dev
   ```

5. For production:
   ```bash
   npm start
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DB_URL=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

FRONTEND_URL=http://localhost:3000
Backend_URL=http://localhost:5000

RAZERPAY_KEY_ID=your_razorpay_key_id
RAZERPAY_SECRET_KEY=your_razorpay_secret_key

STRIPE_SECRET_KEY=your_stripe_secret_key
WEBHOOK_SECRET_KEY=your_webhook_secret_key
```

## API Endpoints

The API provides numerous endpoints organized by resource. Here are some of the main categories:

### Authentication

```
POST /api/v1/register - Register a new user
POST /api/v1/login - User login
GET /api/v1/logout - User logout
GET /api/v1/me - Get user profile
```

### Products

```
GET /api/products - Get all products
GET /api/products/:id - Get a single product
POST /api/products - Create a new product (admin)
PUT /api/products/:id - Update a product (admin)
DELETE /api/products/:id - Delete a product (admin)
```

### Chapters

```
GET /api/chapters - Get all chapters
GET /api/chapters/:id - Get a single chapter
POST /api/chapters - Create a new chapter (admin)
PUT /api/chapters/:id - Update a chapter (admin)
DELETE /api/chapters/:id - Delete a chapter (admin)
```

### Orders

```
GET /api/order - Get all orders
GET /api/order/:id - Get a single order
POST /api/order/new - Create a new order
PUT /api/order/:id - Update order status (admin)
```

### Support

```
POST /api/support/create - Create a support ticket
GET /api/support/getAll - Get all support tickets (admin)
GET /api/support/userticket - Get user's support tickets
GET /api/support/getOne/:id - Get a single support ticket
PATCH /api/support/update/:id - Update a support ticket
DELETE /api/support/delete/:id - Delete a support ticket
```

## Database

The project uses MongoDB as its database. The connection is established in `database/db.js`. The database schema is defined using Mongoose and organized by resource in the `resources` directory.

## File Storage

Cloudinary is used for storing media files like images and audio. The configuration is set up in `server.js` and the implementation can be found in `Utils/cloudinary.js`.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. The implementation can be found in:

- `Utils/jwtToken.js` - Token generation
- `middlewares/auth.js` - Authentication middleware
- `middlewares/PatientAuth.js` - Patient authentication
- `middlewares/AuthUserOrPatient.js` - Combined authentication

## Payment Integration

The API supports multiple payment gateways:

- **Stripe**: Implementation in `resources/StripePayment`
- **Razorpay**: Implementation in `resources/Orders/RazerPayCheckoutController.js`

## Deployment

The API can be deployed to any Node.js hosting service. For production deployment:

1. Set the environment variables for production
2. Build the project: `npm run build`
3. Start the server: `npm start`

For continuous deployment, you can use PM2 which is included in the dependencies:

```bash
pm2 start server.js
```

## License

This project is licensed under the ISC License - see the LICENSE file for details.
