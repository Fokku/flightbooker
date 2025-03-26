# SkyGlobe Flight Reservation System

SkyGlobe is a flight reservation system that allows users to search for flights, book tickets, and manage their bookings with a modern, responsive interface.

## Features

- **User Authentication**

  - Registration with email verification
  - Login/logout with secure session handling
  - User profile management
  - Password reset functionality

- **Flight Management**

  - Advanced flight search with filters (date, price, stops)
  - Interactive globe view for destination exploration
  - Real-time flight availability

- **Booking System**

  - Multi-passenger booking support
  - Seat selection
  - Class selection (economy, business, first class)
  - Payment processing
  - Booking confirmation with email notifications

- **Booking Management**

  - View upcoming and past bookings
  - Booking details with passenger information
  - Cancel bookings
  - Download/print boarding passes
  - Check-in functionality

- **User Experience**

  - Responsive design for mobile, tablet, and desktop
  - Animated UI components for enhanced user experience
  - Dark/light mode support
  - Intuitive navigation and user flows

- **Administration**
  - Admin dashboard for system management
  - User management
  - Flight management
  - Booking oversight
  - System statistics and reporting

## Project Structure

The project follows a client-server architecture:

### Frontend (React/TypeScript)

```
src/
├── components/        # Reusable UI components
│   ├── animations/    # Animation components
│   ├── auth/          # Authentication-related components
│   ├── home/          # Homepage components
│   ├── layout/        # Layout components (navbar, footer, etc.)
│   └── ui/            # Basic UI components (buttons, inputs, etc.)
├── context/           # React context providers
├── data/              # Static data (countries, airports, etc.)
├── lib/               # Utility functions and API clients
├── pages/             # Page components
└── styles/            # Global styles and themes
```

### Backend (PHP)

```
backend/
├── api/               # API endpoints
│   ├── admin/         # Admin-only endpoints
│   ├── auth/          # Authentication endpoints
│   ├── bookings/      # Booking-related endpoints
│   ├── config/        # API-specific configuration
│   ├── flights/       # Flight-related endpoints
│   └── users/         # User-related endpoints
├── config/            # Configuration files
├── includes/          # Reusable PHP classes
├── logs/              # Application logs
└── sql/               # Database schema and migrations
```

## Prerequisites

- **Frontend**

  - Node.js 16+ and npm/yarn
  - Modern web browser

- **Backend**

  - PHP 7.4+ with the following extensions:
    - PDO
    - MySQLi
    - JSON
    - OpenSSL
    - Mbstring
    - CURL
  - MySQL 5.7+ or MariaDB 10.3+
  - Apache/Nginx web server
  - Composer (for PHP dependencies)

- **Development Tools**
  - Git
  - VS Code or other IDE
  - Postman/Insomnia (for API testing)

## Setup and Installation for Development

### Database Setup

1. Create a new MySQL database:

   ```bash
   mysql -u root -p
   CREATE DATABASE flight_booking;
   EXIT;
   ```

2. Import the database schema:

   ```bash
   mysql -u root -p flight_booking < backend/sql/schema.sql
   ```

3. (Optional) Import sample data:

   ```bash
   mysql -u root -p flight_booking < backend/sql/sample_data.sql
   ```

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/skyglobe-reservations.git
   cd skyglobe-reservations
   ```

2. Configure the backend:

   ```bash
   cp backend/config/config.example.php backend/config/config.php
   ```

3. Edit `backend/config/config.php` with your database credentials and site settings:

   ```php
   // Database configuration
   define('DB_HOST', 'localhost');
   define('DB_USER', 'your_db_user');
   define('DB_PASS', 'your_db_password');
   define('DB_NAME', 'flight_booking');
   ```

4. Create the logs directory and ensure it's writable:

   ```bash
   mkdir -p backend/logs
   chmod 755 backend/logs
   ```

5. Configure your web server (Apache/Nginx) to serve the backend directory or use PHP's built-in server for development:

   ```bash
   cd backend
   php -S localhost:8000
   ```

### Frontend Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the API URL in the `.env` file:

   ```
   VITE_API_URL=http://localhost:8000
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. The application will be available at `http://localhost:8080` by default.

## Integration between Frontend and Backend

The frontend and backend communicate through RESTful API calls:

1. **API Client**: The frontend includes an API client (`src/lib/api.ts`) that handles all requests to the backend.

2. **Authentication**: JWT tokens or PHP sessions are used for authentication.

3. **Data Flow**:

   - Frontend components make requests to the API client
   - API client sends requests to the PHP backend
   - Backend processes the request, interacts with the database if needed
   - Backend returns a JSON response
   - Frontend updates the UI based on the response

4. **Error Handling**: Both frontend and backend implement comprehensive error handling to ensure a smooth user experience.

## API Endpoints

### Authentication

- **POST /api/auth/login.php**

  - Description: Authenticates a user
  - Request Body: `{ username: string, password: string }`
  - Response: `{ status: boolean, message: string, data: User }`

- **POST /api/auth/register.php**

  - Description: Registers a new user
  - Request Body: `{ username: string, email: string, password: string }`
  - Response: `{ status: boolean, message: string }`

- **POST /api/auth/logout.php**

  - Description: Logs out a user
  - Response: `{ status: boolean, message: string }`

- **GET /api/auth/check-session.php**

  - Description: Checks if a user is logged in
  - Response: `{ status: boolean, message: string, data: User }`

- **POST /api/auth/verify-pre-registration.php**
  - Description: Verifies a registration OTP
  - Request Body: `{ email: string, otp: string }`
  - Response: `{ status: boolean, message: string }`

### Flights

- **POST /api/flights/search.php**

  - Description: Searches for flights
  - Request Body: `{ departure: string, destination: string, departureDate: string, returnDate?: string, passengers: number, class?: string }`
  - Response: `{ status: boolean, message: string, data: Flight[] }`

- **GET /api/flights/get.php?id={id}**
  - Description: Gets flight details
  - Response: `{ status: boolean, message: string, data: Flight }`

### Bookings

- **POST /api/bookings/create.php**

  - Description: Creates a new booking
  - Request Body: `{ flightId: number, passengers: PassengerInfo[], seatClass: string, paymentMethod: string, totalPrice: number }`
  - Response: `{ status: boolean, message: string, data: { bookingId: number } }`

- **GET /api/bookings/user.php**

  - Description: Gets a user's bookings
  - Response: `{ status: boolean, message: string, data: Booking[] }`

- **GET /api/bookings/get.php?id={id}**

  - Description: Gets booking details
  - Response: `{ status: boolean, message: string, data: Booking }`

- **POST /api/bookings/cancel.php**
  - Description: Cancels a booking
  - Request Body: `{ id: number }`
  - Response: `{ status: boolean, message: string }`

### User Profile

- **GET /api/users/profile.php**

  - Description: Gets user profile
  - Response: `{ status: boolean, message: string, data: UserProfile }`

- **POST /api/users/update.php**

  - Description: Updates user profile
  - Request Body: `{ username?: string, email?: string, firstName?: string, lastName?: string, phoneNumber?: string, address?: string }`
  - Response: `{ status: boolean, message: string }`

- **POST /api/users/change-password.php**
  - Description: Changes user password
  - Request Body: `{ currentPassword: string, newPassword: string }`
  - Response: `{ status: boolean, message: string }`

## Development

### Frontend

The frontend is built using:

- **React 18**: Core UI library
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **React Router**: For navigation
- **React Query**: For data fetching and caching
- **Radix UI**: For accessible UI components
- **Lucide Icons**: For icons
- **Vite**: For development and build

### Backend

The backend is built using:

- **PHP 7.4+**: For API endpoints
- **MySQL**: For data storage
- **Session-based Authentication**: For user authentication

## Deployment on a Linux Machine

### Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Nginx or Apache web server
- PHP 7.4+ with required extensions
- MySQL 5.7+ or MariaDB 10.3+
- Node.js 16+ and npm
- PM2 (optional, for process management)
- Git

### Backend Deployment

1. Clone the repository on your server:

   ```bash
   git clone https://github.com/yourusername/skyglobe-reservations.git
   cd skyglobe-reservations
   ```

2. Set up the MySQL database:

   ```bash
   mysql -u root -p
   CREATE DATABASE flight_booking;
   CREATE USER 'flightuser'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON flight_booking.* TO 'flightuser'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;

   # Import schema and data
   mysql -u flightuser -p flight_booking < backend/sql/schema.sql
   mysql -u flightuser -p flight_booking < backend/sql/sample_data.sql
   ```

3. Configure the backend:

   ```bash
   cp backend/config/config.example.php backend/config/config.php
   nano backend/config/config.php
   # Update database credentials and other settings
   ```

4. Create logs directory and set permissions:

   ```bash
   mkdir -p backend/logs
   chmod 755 backend/logs
   chown -R www-data:www-data backend/logs  # For Apache/Nginx
   ```

5. Configure Nginx (example configuration):

   ```bash
   sudo nano /etc/nginx/sites-available/skyglobe-api
   ```

   Add this configuration:

   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       root /path/to/skyglobe-reservations/backend;

       index index.php;

       location / {
           try_files $uri $uri/ /index.php?$query_string;
       }

       location ~ \.php$ {
           include snippets/fastcgi-php.conf;
           fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
           fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
           include fastcgi_params;
       }

       location ~ /\.ht {
           deny all;
       }
   }
   ```

6. Enable the site and restart Nginx:

   ```bash
   sudo ln -s /etc/nginx/sites-available/skyglobe-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Frontend Deployment

1. Build the frontend:

   ```bash
   cd /path/to/skyglobe-reservations
   npm install

   # Create production .env file
   echo "VITE_API_URL=https://api.yourdomain.com" > .env.production

   # Build the frontend
   npm run build
   ```

2. Configure Nginx for the frontend:

   ```bash
   sudo nano /etc/nginx/sites-available/skyglobe-frontend
   ```

   Add this configuration:

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       root /path/to/skyglobe-reservations/dist;

       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
           expires 30d;
           add_header Cache-Control "public, no-transform";
       }

       # Prevent access to dot files
       location ~ /\. {
           deny all;
       }
   }
   ```

3. Enable the site and restart Nginx:

   ```bash
   sudo ln -s /etc/nginx/sites-available/skyglobe-frontend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Securing Your Deployment

1. Enable HTTPS with Let's Encrypt:

   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   sudo certbot --nginx -d api.yourdomain.com
   ```

2. Set up firewall:

   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw allow ssh
   sudo ufw enable
   ```

3. Set up regular backups:

   ```bash
   # Create a backup script
   sudo nano /usr/local/bin/backup-skyglobe.sh
   ```

   Add the following content:

   ```bash
   #!/bin/bash
   TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
   BACKUP_DIR="/path/to/backups"

   # Database backup
   mysqldump -u flightuser -p'your_secure_password' flight_booking > $BACKUP_DIR/db-$TIMESTAMP.sql

   # Files backup
   tar -czf $BACKUP_DIR/files-$TIMESTAMP.tar.gz /path/to/skyglobe-reservations

   # Remove backups older than 30 days
   find $BACKUP_DIR -type f -mtime +30 -delete
   ```

   Make the script executable and add to crontab:

   ```bash
   sudo chmod +x /usr/local/bin/backup-skyglobe.sh
   sudo crontab -e
   # Add this line to run daily at 2 AM
   0 2 * * * /usr/local/bin/backup-skyglobe.sh
   ```

### Maintenance and Monitoring

1. Set up basic monitoring:

   ```bash
   sudo apt install htop iotop
   ```

2. For application monitoring, consider using:
   - PM2 for Node.js applications
   - New Relic or Datadog for comprehensive monitoring
   - Loggly or ELK stack for log management

## License

This project is licensed under the MIT License - see the LICENSE file for details.
