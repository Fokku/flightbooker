-- Insert sample flights
INSERT INTO flights (flight_number, airline, departure, arrival, date, time, duration, price, available_seats, status) VALUES
-- Today's flights
('AA100', 'American Airlines', 'New York (JFK)', 'Los Angeles (LAX)', CURDATE(), '08:00:00', 330, 299.99, 120, 'scheduled'),
('DL200', 'Delta Air Lines', 'Atlanta (ATL)', 'Chicago (ORD)', CURDATE(), '09:30:00', 120, 199.99, 85, 'scheduled'),
('UA300', 'United Airlines', 'San Francisco (SFO)', 'Seattle (SEA)', CURDATE(), '10:15:00', 90, 149.99, 65, 'scheduled'),
('JB400', 'JetBlue', 'Boston (BOS)', 'Washington DC (DCA)', CURDATE(), '11:45:00', 75, 129.99, 100, 'scheduled'),
('SW500', 'Southwest Airlines', 'Dallas (DFW)', 'Houston (IAH)', CURDATE(), '12:30:00', 60, 99.99, 150, 'scheduled'),

-- Tomorrow's flights
('AA101', 'American Airlines', 'Los Angeles (LAX)', 'New York (JFK)', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:00:00', 330, 299.99, 110, 'scheduled'),
('DL201', 'Delta Air Lines', 'Chicago (ORD)', 'Atlanta (ATL)', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:30:00', 120, 199.99, 95, 'scheduled'),
('UA301', 'United Airlines', 'Seattle (SEA)', 'San Francisco (SFO)', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:15:00', 90, 149.99, 75, 'scheduled'),
('JB401', 'JetBlue', 'Washington DC (DCA)', 'Boston (BOS)', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:45:00', 75, 129.99, 80, 'scheduled'),
('SW501', 'Southwest Airlines', 'Houston (IAH)', 'Dallas (DFW)', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:30:00', 60, 99.99, 140, 'scheduled'),

-- Day after tomorrow's flights
('AA102', 'American Airlines', 'Miami (MIA)', 'New York (JFK)', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '06:00:00', 180, 199.99, 90, 'scheduled'),
('DL202', 'Delta Air Lines', 'Detroit (DTW)', 'Atlanta (ATL)', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '07:30:00', 90, 149.99, 70, 'scheduled'),
('UA302', 'United Airlines', 'Denver (DEN)', 'Chicago (ORD)', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '08:15:00', 120, 179.99, 85, 'scheduled'),
('JB402', 'JetBlue', 'Orlando (MCO)', 'New York (JFK)', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:45:00', 150, 159.99, 95, 'scheduled'),
('SW502', 'Southwest Airlines', 'Phoenix (PHX)', 'Las Vegas (LAS)', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:30:00', 45, 79.99, 160, 'scheduled'),

-- Three days from now
('AA103', 'American Airlines', 'Dallas (DFW)', 'Miami (MIA)', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '05:00:00', 150, 179.99, 100, 'scheduled'),
('DL203', 'Delta Air Lines', 'Minneapolis (MSP)', 'Detroit (DTW)', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '06:30:00', 90, 129.99, 75, 'scheduled'),
('UA303', 'United Airlines', 'Houston (IAH)', 'Denver (DEN)', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '07:15:00', 120, 159.99, 80, 'scheduled'),
('JB403', 'JetBlue', 'Fort Lauderdale (FLL)', 'Boston (BOS)', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '08:45:00', 150, 169.99, 90, 'scheduled'),
('SW503', 'Southwest Airlines', 'San Diego (SAN)', 'Phoenix (PHX)', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '09:30:00', 60, 89.99, 150, 'scheduled'),

-- Four days from now
('AA104', 'American Airlines', 'Philadelphia (PHL)', 'Dallas (DFW)', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '04:00:00', 180, 199.99, 110, 'scheduled'),
('DL204', 'Delta Air Lines', 'Salt Lake City (SLC)', 'Minneapolis (MSP)', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '05:30:00', 120, 149.99, 85, 'scheduled'),
('UA304', 'United Airlines', 'Cleveland (CLE)', 'Houston (IAH)', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '06:15:00', 150, 169.99, 75, 'scheduled'),
('JB404', 'JetBlue', 'San Juan (SJU)', 'Fort Lauderdale (FLL)', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '07:45:00', 180, 189.99, 95, 'scheduled'),
('SW504', 'Southwest Airlines', 'Austin (AUS)', 'San Diego (SAN)', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '08:30:00', 150, 139.99, 140, 'scheduled'); 