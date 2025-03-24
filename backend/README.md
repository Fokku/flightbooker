
# SkyGlobe PHP Backend

This directory contains the PHP backend for the SkyGlobe flight booking application.

## Directory Structure

- `api/`: Contains API endpoints
  - `auth/`: Authentication endpoints (login, register, logout)
  - `flights/`: Flight-related endpoints (search, details)
  - `bookings/`: Booking-related endpoints (create, list)
  - `contact/`: Contact form endpoint
  - `faq/`: FAQ endpoints
  - `admin/`: Admin-only endpoints
    - `flights/`: Flight management (list, create, update, delete)
    - `users/`: User management (list, create, update, delete)
    - `bookings/`: Booking management (list, update, delete)
- `config/`: Configuration files
  - `database.php`: Database connection
  - `config.php`: General configuration
- `includes/`: Reusable code
  - `auth.php`: Authentication functions

## Setup Instructions

1. Set up a MySQL database and import the SQL schema from the provided file.
2. Configure database connection in `config/database.php`.
3. Ensure PHP is configured to handle API requests.
4. Set up proper CORS headers for development and production.

## API Endpoints

### Authentication
- POST `/api/auth/register.php`: Register a new user
- POST `/api/auth/login.php`: Log in a user
- POST `/api/auth/logout.php`: Log out a user

### Flights
- GET `/api/flights/search.php`: Search for flights
- GET `/api/flights/details.php`: Get flight details

### Bookings
- POST `/api/bookings/create.php`: Create a new booking
- GET `/api/bookings/list.php`: Get user's bookings

### Contact
- POST `/api/contact/submit.php`: Submit a contact form

### FAQ
- GET `/api/faq/list.php`: Get list of FAQs

### Admin - Flights
- GET `/api/admin/flights/list.php`: Get all flights
- POST `/api/admin/flights/create.php`: Create a new flight
- PUT `/api/admin/flights/update.php`: Update a flight
- DELETE `/api/admin/flights/delete.php`: Delete a flight

## Security Considerations

- All inputs are sanitized to prevent SQL injection.
- Authentication is required for protected endpoints.
- Admin-only endpoints check for admin role.
- Passwords are securely hashed using PHP's password_hash() function.
