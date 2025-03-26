# SkyGlobe Flight Reservation System

SkyGlobe is a flight reservation system that allows users to search for flights, book tickets, and manage their bookings.

## Features

- User authentication (register, login, logout)
- Flight search with various filters
- Booking management
- User profile management
- Responsive design for all devices

## Project Structure

The project is divided into two main parts:

1. **Frontend**: React/TypeScript application built with Vite
2. **Backend**: PHP API for data management and authentication

## Prerequisites

- Node.js 16+
- PHP 7.4+
- MySQL 5.7+
- Composer (for PHP dependencies)

## Setup and Installation

### Database Setup

1. Create a new MySQL database for the project
2. Import the SQL schema from `backend/sql/schema.sql`
3. (Optional) Import sample data from `backend/sql/sample_data.sql`

### Backend Setup

1. Navigate to the backend directory:

   ```
   cd backend
   ```

2. Copy the example configuration:

   ```
   cp config/config.example.php config/config.php
   ```

3. Edit `config/config.php` to add your database credentials

4. Configure your web server (Apache/Nginx) to serve the backend directory, or use PHP's built-in server:
   ```
   php -S localhost:8000
   ```

### Frontend Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Make sure the `.env` file has the correct API URL:

   ```
   VITE_API_URL=http://localhost:8000
   ```

3. Start the development server:

   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

## Integration between Frontend and Backend

The frontend communicates with the PHP backend through API calls. The main integration points are:

1. **Authentication**: Login, register, and session management
2. **Flight Search**: Query available flights based on criteria
3. **Booking Management**: Creating, viewing, and canceling bookings
4. **User Profile**: Viewing and updating user information

### API Endpoints

The backend provides the following main API endpoints:

- **Authentication**

  - `POST /api/auth/login.php`: User login
  - `POST /api/auth/register.php`: User registration
  - `POST /api/auth/logout.php`: User logout
  - `GET /api/auth/check-session.php`: Check if session is valid

- **Flights**

  - `POST /api/flights/search.php`: Search flights
  - `GET /api/flights/get.php?id={id}`: Get flight details

- **Bookings**

  - `POST /api/bookings/create.php`: Create a new booking
  - `GET /api/bookings/user.php`: Get user's bookings
  - `GET /api/bookings/get.php?id={id}`: Get booking details
  - `POST /api/bookings/cancel.php`: Cancel a booking

- **User Profile**
  - `GET /api/users/profile.php`: Get user profile
  - `POST /api/users/update.php`: Update user profile
  - `POST /api/users/change-password.php`: Change user password

## Development

The frontend is built using:

- React
- TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management

The backend is built using:

- PHP for API endpoints
- MySQL for data storage
- Session-based authentication

## Deployment

### Frontend Deployment

1. Build the frontend:

   ```
   npm run build
   ```

2. Deploy the contents of the `dist` directory to your web server

### Backend Deployment

1. Deploy the backend directory to a PHP-capable server
2. Configure the server to properly handle API requests

## License

This project is licensed under the MIT License - see the LICENSE file for details.
