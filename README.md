
# SkyGlobe Flight Booking System

A modern flight booking platform with an interactive globe interface for selecting destinations.

## Features

- Interactive globe for destination selection
- Flight search and booking
- User authentication
- Admin dashboard for managing flights and bookings
- Responsive design for all devices
- PHP backend with MySQL database

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: PHP, MySQL
- **State Management**: React Query, Context API
- **Form Handling**: React Hook Form, Zod
- **Animations**: CSS Transitions

## Setup Instructions for Ubuntu Server

### 1. Server Prerequisites

```bash
# Update package list
sudo apt update
sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx mysql-server php-fpm php-mysql php-curl php-json php-zip php-mbstring php-xml git nodejs npm

# Enable services
sudo systemctl enable nginx
sudo systemctl enable mysql
sudo systemctl enable php-fpm
```

### 2. Configure MySQL

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Access MySQL
sudo mysql

# Create database and user (in MySQL prompt)
CREATE DATABASE flight_booking;
CREATE USER 'flight_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON flight_booking.* TO 'flight_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Clone and Set Up Project

```bash
# Navigate to web directory
cd /var/www

# Clone repository
sudo git clone https://github.com/your-username/skyglobe-flight-booking.git
cd skyglobe-flight-booking

# Set proper permissions
sudo chown -R www-data:www-data /var/www/skyglobe-flight-booking
sudo chmod -R 755 /var/www/skyglobe-flight-booking
```

### 4. Configure Backend

```bash
# Navigate to backend config
cd /var/www/skyglobe-flight-booking/backend/config

# Edit database configuration
sudo nano database.php

# Update the database settings
# define('DB_HOST', 'localhost');
# define('DB_USER', 'flight_user');
# define('DB_PASS', 'your_secure_password');
# define('DB_NAME', 'flight_booking');

# Import database schema
mysql -u flight_user -p flight_booking < /var/www/skyglobe-flight-booking/database/schema.sql
```

### 5. Build Frontend

```bash
# Navigate to project root
cd /var/www/skyglobe-flight-booking

# Install dependencies and build
sudo npm install
sudo npm run build
```

### 6. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/skyglobe

# Add the following configuration:
# server {
#     listen 80;
#     server_name your-domain.com www.your-domain.com;
#     root /var/www/skyglobe-flight-booking/dist;
#
#     index index.html index.php;
#
#     location / {
#         try_files $uri $uri/ /index.html;
#     }
#
#     location /backend/ {
#         alias /var/www/skyglobe-flight-booking/backend/;
#         try_files $uri $uri/ /index.php?$query_string;
#
#         location ~ \.php$ {
#             include snippets/fastcgi-php.conf;
#             fastcgi_param SCRIPT_FILENAME $request_filename;
#             fastcgi_pass unix:/var/run/php/php-fpm.sock;
#         }
#     }
#
#     location ~ /\.ht {
#         deny all;
#     }
# }

# Enable site and test configuration
sudo ln -s /etc/nginx/sites-available/skyglobe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Set Up SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot will update your Nginx configuration automatically
```

### 8. Set Up Automatic Deployment (Optional)

```bash
# Create deployment script
sudo nano /var/www/deploy.sh

# Add the following content:
# #!/bin/bash
# cd /var/www/skyglobe-flight-booking
# git pull
# npm install
# npm run build
# sudo systemctl restart nginx

# Make script executable
sudo chmod +x /var/www/deploy.sh

# Create cron job (if you want automatic updates)
sudo crontab -e

# Add the following line for daily updates at 2 AM:
# 0 2 * * * /var/www/deploy.sh >> /var/log/deploy.log 2>&1
```

### 9. Testing the Installation

- Visit your domain in a web browser
- Test login/registration functionality
- Verify backend API connectivity
- Check database connection

## Development Setup

If you want to set up the project for local development:

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up a local MySQL database and import the schema
4. Configure `/backend/config/database.php` for local development
5. Start the development server: `npm run dev`

## Project Structure

```
├── backend/              # PHP backend files
│   ├── api/              # API endpoints
│   ├── config/           # Configuration files
│   └── includes/         # Reusable PHP components
├── database/             # Database schema and migrations
├── public/               # Static files
└── src/                  # React frontend source code
    ├── components/       # UI components
    ├── context/          # React context providers
    ├── hooks/            # Custom React hooks
    ├── lib/              # Utility functions
    └── pages/            # Page components
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check database credentials in `backend/config/database.php`
   - Ensure MySQL service is running: `sudo systemctl status mysql`
   - Verify user permissions: `SHOW GRANTS FOR 'flight_user'@'localhost';`

2. **PHP Errors**:
   - Check PHP error logs: `sudo tail -f /var/log/nginx/error.log`
   - Verify PHP version compatibility: `php -v`

3. **Frontend Not Loading**:
   - Check Nginx configuration
   - Inspect browser console for JavaScript errors
   - Verify built files in `/dist` directory

### Support

For additional help, create an issue in the repository or contact the maintainers.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
