-- Sample Trains for Testing
INSERT INTO trains (name, number, from_station, to_station, departure_time, arrival_time, running_days, scheduled_date, actual_running_date) VALUES
('Nagpur Express', 78001, 'Nagpur', 'Yavatmal', '08:00:00', '10:30:00', 'MON,TUE,WED,THU,FRI,SAT,SUN', NULL, NULL),
('Yavatmail Special', 78002, 'Yavatmal', 'Nagpur', '11:00:00', '13:30:00', 'MON,TUE,WED,THU,FRI,SAT,SUN', NULL, NULL),
('Central Express', 78003, 'Nagpur', 'Yavatmal', '14:00:00', '16:30:00', 'MON,WED,FRI,SUN', NULL, NULL),
('Weekend Special', 78004, 'Nagpur', 'Yavatmal', '18:00:00', '20:30:00', 'SAT,SUN', NULL, NULL);
