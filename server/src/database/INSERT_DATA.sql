-- INSERT DATA FOR MENTORIA DATABASE
-- Password for all users: Password123!
-- Hashed password: $2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2

-- Insert Users
-- Insert 30 Mentors (user_id 1-30)
INSERT INTO users (first_name, last_name, sex, email, password, avatar_url, country, role, timezone, status, is_email_verified, provider)
VALUES
(N'John', N'Doe', N'Male', N'john.doe@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=1', N'United States', N'Mentor', N'America/New_York', N'Active', 1, N'Local'),
(N'Sarah', N'Johnson', N'Female', N'sarah.johnson@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=5', N'United Kingdom', N'Mentor', N'Europe/London', N'Active', 1, N'Local'),
(N'Michael', N'Chen', N'Male', N'michael.chen@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=12', N'Singapore', N'Mentor', N'Asia/Singapore', N'Active', 1, N'Local'),
(N'Emily', N'Rodriguez', N'Female', N'emily.rodriguez@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=9', N'Spain', N'Mentor', N'Europe/Madrid', N'Active', 1, N'Local'),
(N'David', N'Kim', N'Male', N'david.kim@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=15', N'South Korea', N'Mentor', N'Asia/Seoul', N'Active', 1, N'Local'),
(N'Lisa', N'Anderson', N'Female', N'lisa.anderson@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=10', N'Canada', N'Mentor', N'America/Toronto', N'Active', 1, N'Local'),
(N'James', N'Martinez', N'Male', N'james.martinez@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=13', N'Mexico', N'Mentor', N'America/Mexico_City', N'Active', 1, N'Local'),
(N'Anna', N'Kowalski', N'Female', N'anna.kowalski@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=16', N'Poland', N'Mentor', N'Europe/Warsaw', N'Active', 1, N'Local'),
(N'Robert', N'Thompson', N'Male', N'robert.thompson@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=17', N'Australia', N'Mentor', N'Australia/Sydney', N'Active', 1, N'Local'),
(N'Maria', N'Garcia', N'Female', N'maria.garcia@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=23', N'Argentina', N'Mentor', N'America/Argentina/Buenos_Aires', N'Active', 1, N'Local'),
(N'Thomas', N'Lee', N'Male', N'thomas.lee@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=18', N'Japan', N'Mentor', N'Asia/Tokyo', N'Active', 1, N'Local'),
(N'Sophie', N'Dubois', N'Female', N'sophie.dubois@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=24', N'France', N'Mentor', N'Europe/Paris', N'Active', 1, N'Local'),
(N'Kevin', N'Walsh', N'Male', N'kevin.walsh@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=25', N'Ireland', N'Mentor', N'Europe/Dublin', N'Active', 1, N'Local'),
(N'Laura', N'Muller', N'Female', N'laura.muller@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=29', N'Germany', N'Mentor', N'Europe/Berlin', N'Active', 1, N'Local'),
(N'Daniel', N'Santos', N'Male', N'daniel.santos@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=26', N'Brazil', N'Mentor', N'America/Sao_Paulo', N'Active', 1, N'Local'),
(N'Emma', N'Wilson', N'Female', N'emma.wilson@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=32', N'New Zealand', N'Mentor', N'Pacific/Auckland', N'Active', 1, N'Local'),
(N'Marco', N'Rossi', N'Male', N'marco.rossi@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=33', N'Italy', N'Mentor', N'Europe/Rome', N'Active', 1, N'Local'),
(N'Olivia', N'Brown', N'Female', N'olivia.brown@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=35', N'South Africa', N'Mentor', N'Africa/Johannesburg', N'Active', 1, N'Local'),
(N'Alex', N'Petrov', N'Male', N'alex.petrov@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=36', N'Russia', N'Mentor', N'Europe/Moscow', N'Active', 1, N'Local'),
(N'Nina', N'Singh', N'Female', N'nina.singh@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=38', N'India', N'Mentor', N'Asia/Kolkata', N'Active', 1, N'Local'),
(N'Patrick', N'OBrien', N'Male', N'patrick.obrien@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=39', N'Ireland', N'Mentor', N'Europe/Dublin', N'Active', 1, N'Local'),
(N'Isabella', N'Lopez', N'Female', N'isabella.lopez@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=42', N'Colombia', N'Mentor', N'America/Bogota', N'Active', 1, N'Local'),
(N'Henrik', N'Andersson', N'Male', N'henrik.andersson@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=43', N'Sweden', N'Mentor', N'Europe/Stockholm', N'Active', 1, N'Local'),
(N'Rachel', N'Cohen', N'Female', N'rachel.cohen@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=44', N'Israel', N'Mentor', N'Asia/Jerusalem', N'Active', 1, N'Local'),
(N'Mohammed', N'Ahmed', N'Male', N'mohammed.ahmed@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=46', N'UAE', N'Mentor', N'Asia/Dubai', N'Active', 1, N'Local'),
(N'Yuki', N'Tanaka', N'Female', N'yuki.tanaka@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=47', N'Japan', N'Mentor', N'Asia/Tokyo', N'Active', 1, N'Local'),
(N'Lucas', N'Silva', N'Male', N'lucas.silva@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=48', N'Portugal', N'Mentor', N'Europe/Lisbon', N'Active', 1, N'Local'),
(N'Chloe', N'Martin', N'Female', N'chloe.martin@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=49', N'Belgium', N'Mentor', N'Europe/Brussels', N'Active', 1, N'Local'),
(N'Erik', N'Hansen', N'Male', N'erik.hansen@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=52', N'Denmark', N'Mentor', N'Europe/Copenhagen', N'Active', 1, N'Local'),
(N'Sophia', N'Nguyen', N'Female', N'sophia.nguyen@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=53', N'Vietnam', N'Mentor', N'Asia/Ho_Chi_Minh', N'Active', 1, N'Local'),
-- Insert 20 Mentees (user_id 31-50)
(N'Alice', N'Smith', N'Female', N'alice.smith@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=20', N'Canada', N'Mentee', N'America/Toronto', N'Active', 1, N'Local'),
(N'Bob', N'Wilson', N'Male', N'bob.wilson@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=33', N'Australia', N'Mentee', N'Australia/Sydney', N'Active', 1, N'Local'),
(N'Carol', N'Taylor', N'Female', N'carol.taylor@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=27', N'Ireland', N'Mentee', N'Europe/Dublin', N'Active', 1, N'Local'),
(N'Daniel', N'Brown', N'Male', N'daniel.brown@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=51', N'Germany', N'Mentee', N'Europe/Berlin', N'Active', 1, N'Local'),
(N'Emma', N'Davis', N'Female', N'emma.davis@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=45', N'New Zealand', N'Mentee', N'Pacific/Auckland', N'Active', 1, N'Local'),
(N'Frank', N'Miller', N'Male', N'frank.miller@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=54', N'United States', N'Mentee', N'America/Los_Angeles', N'Active', 1, N'Local'),
(N'Grace', N'Moore', N'Female', N'grace.moore@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=55', N'United Kingdom', N'Mentee', N'Europe/London', N'Active', 1, N'Local'),
(N'Henry', N'White', N'Male', N'henry.white@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=56', N'Netherlands', N'Mentee', N'Europe/Amsterdam', N'Active', 1, N'Local'),
(N'Iris', N'Clark', N'Female', N'iris.clark@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=57', N'Switzerland', N'Mentee', N'Europe/Zurich', N'Active', 1, N'Local'),
(N'Jack', N'Lewis', N'Male', N'jack.lewis@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=58', N'Norway', N'Mentee', N'Europe/Oslo', N'Active', 1, N'Local'),
(N'Kate', N'Hall', N'Female', N'kate.hall@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=59', N'Austria', N'Mentee', N'Europe/Vienna', N'Active', 1, N'Local'),
(N'Liam', N'Young', N'Male', N'liam.young@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=60', N'Finland', N'Mentee', N'Europe/Helsinki', N'Active', 1, N'Local'),
(N'Mia', N'King', N'Female', N'mia.king@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=61', N'Chile', N'Mentee', N'America/Santiago', N'Active', 1, N'Local'),
(N'Noah', N'Wright', N'Male', N'noah.wright@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=62', N'Peru', N'Mentee', N'America/Lima', N'Active', 1, N'Local'),
(N'Olivia', N'Scott', N'Female', N'olivia.scott@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=63', N'Thailand', N'Mentee', N'Asia/Bangkok', N'Active', 1, N'Local'),
(N'Paul', N'Green', N'Male', N'paul.green@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=64', N'Malaysia', N'Mentee', N'Asia/Kuala_Lumpur', N'Active', 1, N'Local'),
(N'Quinn', N'Adams', N'Female', N'quinn.adams@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=65', N'Philippines', N'Mentee', N'Asia/Manila', N'Active', 1, N'Local'),
(N'Ryan', N'Baker', N'Male', N'ryan.baker@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=66', N'Indonesia', N'Mentee', N'Asia/Jakarta', N'Active', 1, N'Local'),
(N'Stella', N'Nelson', N'Female', N'stella.nelson@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=67', N'Turkey', N'Mentee', N'Europe/Istanbul', N'Active', 1, N'Local'),
(N'Tyler', N'Carter', N'Male', N'tyler.carter@example.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=69', N'Greece', N'Mentee', N'Europe/Athens', N'Active', 1, N'Local'),
-- Insert Admin
(N'Admin', N'User', N'Male', N'admin@mentoria.com', N'$2b$10$UJAn0gdXdvLWzjkVVPCcsuUvXRKE0.NdAGVfEudOvUTEyZaMlapH2', N'https://i.pravatar.cc/150?img=68', N'United States', N'Admin', N'America/New_York', N'Active', 1, N'Local');

-- Insert User Social Links
INSERT INTO user_social_links (user_id, link, platform)
VALUES
-- Mentors (user_id 1-30)
(1, N'https://linkedin.com/in/johndoe', N'LinkedIn'),
(1, N'https://github.com/johndoe', N'GitHub'),
(1, N'https://twitter.com/johndoe', N'Twitter'),
(2, N'https://linkedin.com/in/sarahjohnson', N'LinkedIn'),
(2, N'https://dribbble.com/sarahjohnson', N'Dribbble'),
(2, N'https://behance.net/sarahjohnson', N'Behance'),
(3, N'https://linkedin.com/in/michaelchen', N'LinkedIn'),
(3, N'https://github.com/michaelchen', N'GitHub'),
(3, N'https://kaggle.com/michaelchen', N'Kaggle'),
(4, N'https://linkedin.com/in/emilyrodriguez', N'LinkedIn'),
(4, N'https://twitter.com/emilyrodriguez', N'Twitter'),
(5, N'https://linkedin.com/in/davidkim', N'LinkedIn'),
(5, N'https://twitter.com/davidkim', N'Twitter'),
(6, N'https://linkedin.com/in/lisaanderson', N'LinkedIn'),
(6, N'https://github.com/lisaanderson', N'GitHub'),
(7, N'https://linkedin.com/in/jamesmartinez', N'LinkedIn'),
(7, N'https://github.com/jamesmartinez', N'GitHub'),
(8, N'https://linkedin.com/in/annakowalski', N'LinkedIn'),
(8, N'https://behance.net/annakowalski', N'Behance'),
(9, N'https://linkedin.com/in/robertthompson', N'LinkedIn'),
(9, N'https://github.com/robertthompson', N'GitHub'),
(10, N'https://linkedin.com/in/mariagarcia', N'LinkedIn'),
(10, N'https://twitter.com/mariagarcia', N'Twitter'),
(11, N'https://linkedin.com/in/thomaslee', N'LinkedIn'),
(11, N'https://github.com/thomaslee', N'GitHub'),
(12, N'https://linkedin.com/in/sophiedubois', N'LinkedIn'),
(12, N'https://dribbble.com/sophiedubois', N'Dribbble'),
(13, N'https://linkedin.com/in/kevinwalsh', N'LinkedIn'),
(13, N'https://github.com/kevinwalsh', N'GitHub'),
(14, N'https://linkedin.com/in/lauramuller', N'LinkedIn'),
(14, N'https://behance.net/lauramuller', N'Behance'),
(15, N'https://linkedin.com/in/danielsantos', N'LinkedIn'),
(15, N'https://github.com/danielsantos', N'GitHub'),
(16, N'https://linkedin.com/in/emmawilson', N'LinkedIn'),
(16, N'https://dribbble.com/emmawilson', N'Dribbble'),
(17, N'https://linkedin.com/in/marcorossi', N'LinkedIn'),
(17, N'https://github.com/marcorossi', N'GitHub'),
(18, N'https://linkedin.com/in/oliviabrown', N'LinkedIn'),
(18, N'https://twitter.com/oliviabrown', N'Twitter'),
(19, N'https://linkedin.com/in/alexpetrov', N'LinkedIn'),
(19, N'https://github.com/alexpetrov', N'GitHub'),
(20, N'https://linkedin.com/in/ninasingh', N'LinkedIn'),
(20, N'https://kaggle.com/ninasingh', N'Kaggle'),
(21, N'https://linkedin.com/in/patrickobrien', N'LinkedIn'),
(21, N'https://github.com/patrickobrien', N'GitHub'),
(22, N'https://linkedin.com/in/isabellalopez', N'LinkedIn'),
(22, N'https://twitter.com/isabellalopez', N'Twitter'),
(23, N'https://linkedin.com/in/henrikandersson', N'LinkedIn'),
(23, N'https://github.com/henrikandersson', N'GitHub'),
(24, N'https://linkedin.com/in/rachelcohen', N'LinkedIn'),
(24, N'https://dribbble.com/rachelcohen', N'Dribbble'),
(25, N'https://linkedin.com/in/mohammedahmed', N'LinkedIn'),
(25, N'https://github.com/mohammedahmed', N'GitHub'),
(26, N'https://linkedin.com/in/yukitanaka', N'LinkedIn'),
(26, N'https://behance.net/yukitanaka', N'Behance'),
(27, N'https://linkedin.com/in/lucassilva', N'LinkedIn'),
(27, N'https://github.com/lucassilva', N'GitHub'),
(28, N'https://linkedin.com/in/chloemartin', N'LinkedIn'),
(28, N'https://dribbble.com/chloemartin', N'Dribbble'),
(29, N'https://linkedin.com/in/erikhansen', N'LinkedIn'),
(29, N'https://github.com/erikhansen', N'GitHub'),
(30, N'https://linkedin.com/in/sophianguyen', N'LinkedIn'),
(30, N'https://behance.net/sophianguyen', N'Behance'),
-- Mentees (user_id 31-50)
(31, N'https://linkedin.com/in/alicesmith', N'LinkedIn'),
(31, N'https://github.com/alicesmith', N'GitHub'),
(32, N'https://linkedin.com/in/bobwilson', N'LinkedIn'),
(32, N'https://github.com/bobwilson', N'GitHub'),
(33, N'https://linkedin.com/in/caroltaylor', N'LinkedIn'),
(34, N'https://linkedin.com/in/danielbrown', N'LinkedIn'),
(34, N'https://github.com/danielbrown', N'GitHub'),
(35, N'https://linkedin.com/in/emmadavis', N'LinkedIn'),
(36, N'https://linkedin.com/in/frankmiller', N'LinkedIn'),
(37, N'https://linkedin.com/in/gracemoore', N'LinkedIn'),
(38, N'https://linkedin.com/in/henrywhite', N'LinkedIn'),
(38, N'https://github.com/henrywhite', N'GitHub'),
(39, N'https://linkedin.com/in/irisclark', N'LinkedIn'),
(40, N'https://linkedin.com/in/jacklewis', N'LinkedIn'),
(41, N'https://linkedin.com/in/katehall', N'LinkedIn'),
(42, N'https://linkedin.com/in/liamyoung', N'LinkedIn'),
(42, N'https://github.com/liamyoung', N'GitHub'),
(43, N'https://linkedin.com/in/miaking', N'LinkedIn'),
(44, N'https://linkedin.com/in/noahwright', N'LinkedIn'),
(45, N'https://linkedin.com/in/oliviascott', N'LinkedIn'),
(46, N'https://linkedin.com/in/paulgreen', N'LinkedIn'),
(47, N'https://linkedin.com/in/quinnadams', N'LinkedIn'),
(48, N'https://linkedin.com/in/ryanbaker', N'LinkedIn'),
(49, N'https://linkedin.com/in/stellanelson', N'LinkedIn'),
(50, N'https://linkedin.com/in/tylercarter', N'LinkedIn'),
-- Admin
(51, N'https://linkedin.com/in/adminuser', N'LinkedIn');

-- Insert Mentees (user_id 31-50)
INSERT INTO mentees (user_id, goal)
VALUES
(31, N'Transition to a full-stack developer role within 6 months'),
(32, N'Learn mobile app development and launch my first app'),
(33, N'Break into the UI/UX design field and build a strong portfolio'),
(34, N'Master data science and machine learning for career advancement'),
(35, N'Develop leadership skills and prepare for management role'),
(36, N'Learn cloud architecture and DevOps practices'),
(37, N'Improve frontend development skills with React and TypeScript'),
(38, N'Build a career in cybersecurity and ethical hacking'),
(39, N'Master product management and agile methodologies'),
(40, N'Learn backend development with Node.js and databases'),
(41, N'Transition into data analytics and business intelligence'),
(42, N'Develop iOS apps and publish to App Store'),
(43, N'Learn digital marketing and grow online presence'),
(44, N'Master Python for automation and scripting'),
(45, N'Build expertise in AI and deep learning'),
(46, N'Learn web3 and blockchain development'),
(47, N'Improve soft skills for tech leadership'),
(48, N'Master Java and enterprise application development'),
(49, N'Learn game development with Unity'),
(50, N'Build a career in technical writing and documentation');

-- Insert Mentors (user_id 1-30)
INSERT INTO mentors (user_id, bio, headline, response_time, cv_url, bank_name, account_number, account_holder_name, bank_branch, swift_code)
VALUES
(1, N'Experienced full-stack developer with 10+ years in web development. Specialized in React, Node.js, and cloud architecture. Passionate about helping developers grow their careers.', N'Senior Full-Stack Developer & Tech Lead', N'Within 24 hours', N'https://example.com/cv/johndoe.pdf', N'Chase Bank', N'1234567890', N'John Doe', N'New York Main Branch', N'CHASUS33'),
(2, N'Product designer with expertise in creating user-centered digital experiences. Worked with startups and Fortune 500 companies.', N'Lead Product Designer', N'Within 12 hours', N'https://example.com/cv/sarahjohnson.pdf', N'Barclays Bank', N'2345678901', N'Sarah Johnson', N'London Central', N'BARCGB22'),
(3, N'Data scientist and ML engineer specializing in NLP and computer vision. Published researcher and conference speaker.', N'Senior Data Scientist & ML Engineer', N'Within 48 hours', N'https://example.com/cv/michaelchen.pdf', N'DBS Bank', N'3456789012', N'Michael Chen', N'Singapore Marina Bay', N'DBSSSGSG'),
(4, N'Digital marketing strategist with experience in growth hacking and content marketing. Helped 50+ startups scale.', N'Growth Marketing Lead', N'Within 24 hours', N'https://example.com/cv/emilyrodriguez.pdf', N'Santander Bank', N'4567890123', N'Emily Rodriguez', N'Madrid Centro', N'BSCHESMM'),
(5, N'Career coach and leadership consultant. Former tech executive with 15+ years of experience guiding professionals.', N'Career Coach & Leadership Consultant', N'Within 24 hours', N'https://example.com/cv/davidkim.pdf', N'Kookmin Bank', N'5678901234', N'David Kim', N'Seoul Gangnam', N'CZNBKRSE'),
(6, N'Cloud architect and DevOps specialist. Expert in AWS, Azure, and Kubernetes. Helped companies migrate to cloud.', N'Senior Cloud Architect', N'Within 24 hours', N'https://example.com/cv/lisaanderson.pdf', N'Royal Bank of Canada', N'6789012345', N'Lisa Anderson', N'Toronto Downtown', N'ROYCCAT2'),
(7, N'Mobile developer with expertise in iOS and Android. Published 20+ apps with millions of downloads.', N'Senior Mobile Developer', N'Within 36 hours', N'https://example.com/cv/jamesmartinez.pdf', N'BBVA Bancomer', N'7890123456', N'James Martinez', N'Mexico City Reforma', N'BCMRMXMM'),
(8, N'UI/UX designer focused on creating beautiful and intuitive interfaces. 8 years of experience in product design.', N'Senior UI/UX Designer', N'Within 12 hours', N'https://example.com/cv/annakowalski.pdf', N'PKO Bank Polski', N'8901234567', N'Anna Kowalski', N'Warsaw Centrum', N'BPKOPLPW'),
(9, N'Backend engineer specializing in scalable systems. Expert in microservices and distributed architecture.', N'Senior Backend Engineer', N'Within 24 hours', N'https://example.com/cv/robertthompson.pdf', N'Commonwealth Bank', N'9012345678', N'Robert Thompson', N'Sydney CBD', N'CTBAAU2S'),
(10, N'Digital transformation consultant. Helping businesses leverage technology for growth and innovation.', N'Digital Transformation Consultant', N'Within 48 hours', N'https://example.com/cv/mariagarcia.pdf', N'Banco Galicia', N'0123456789', N'Maria Garcia', N'Buenos Aires Centro', N'GABSARAR'),
(11, N'Software architect with deep knowledge in system design. Expert in building high-performance applications.', N'Principal Software Architect', N'Within 24 hours', N'https://example.com/cv/thomaslee.pdf', N'MUFG Bank', N'1122334455', N'Thomas Lee', N'Tokyo Marunouchi', N'BOTKJPJT'),
(12, N'Creative director and brand strategist. Worked with global brands on digital campaigns and rebranding.', N'Creative Director & Brand Strategist', N'Within 24 hours', N'https://example.com/cv/sophiedubois.pdf', N'BNP Paribas', N'2233445566', N'Sophie Dubois', N'Paris Opera', N'BNPAFRPP'),
(13, N'Cybersecurity expert with certifications in ethical hacking. Protected Fortune 500 companies from threats.', N'Senior Cybersecurity Consultant', N'Within 24 hours', N'https://example.com/cv/kevinwalsh.pdf', N'AIB Bank', N'3344556677', N'Kevin Walsh', N'Dublin O''Connell Street', N'AIBKIE2D'),
(14, N'Product manager with strong technical background. Led multiple successful product launches at tech companies.', N'Senior Product Manager', N'Within 12 hours', N'https://example.com/cv/lauramuller.pdf', N'Deutsche Bank', N'4455667788', N'Laura Muller', N'Berlin Alexanderplatz', N'DEUTDEFF'),
(15, N'AI researcher and engineer. Published papers on deep learning and neural networks. Industry speaker.', N'AI Research Engineer', N'Within 48 hours', N'https://example.com/cv/danielsantos.pdf', N'Banco do Brasil', N'5566778899', N'Daniel Santos', N'Sao Paulo Paulista', N'BRASBRRJ'),
(16, N'Graphic designer and illustrator. Specialized in branding, UI design, and creative visual storytelling.', N'Senior Graphic Designer', N'Within 24 hours', N'https://example.com/cv/emmawilson.pdf', N'ANZ Bank', N'6677889900', N'Emma Wilson', N'Auckland Queen Street', N'ANZBNZ22'),
(17, N'Full-stack developer with passion for clean code. Mentor to 100+ junior developers. Open source contributor.', N'Lead Full-Stack Developer', N'Within 24 hours', N'https://example.com/cv/marcorossi.pdf', N'UniCredit', N'7788990011', N'Marco Rossi', N'Rome Via Veneto', N'UNCRITMM'),
(18, N'SEO and content marketing specialist. Helped brands achieve 10x organic growth through strategic content.', N'SEO & Content Marketing Lead', N'Within 24 hours', N'https://example.com/cv/oliviabrown.pdf', N'Standard Bank', N'8899001122', N'Olivia Brown', N'Johannesburg Sandton', N'SBZAZAJJ'),
(19, N'Game developer with 12 years experience. Worked on AAA titles and indie games. Unity and Unreal expert.', N'Senior Game Developer', N'Within 36 hours', N'https://example.com/cv/alexpetrov.pdf', N'Sberbank', N'9900112233', N'Alex Petrov', N'Moscow Red Square', N'SABRRUMM'),
(20, N'Business analyst and data visualization expert. Transform complex data into actionable business insights.', N'Senior Business Analyst', N'Within 24 hours', N'https://example.com/cv/ninasingh.pdf', N'State Bank of India', N'0011223344', N'Nina Singh', N'Mumbai Fort', N'SBININBB'),
(21, N'Engineering manager with experience leading distributed teams. Focus on agile methodologies and team growth.', N'Engineering Manager', N'Within 24 hours', N'https://example.com/cv/patrickobrien.pdf', N'Bank of Ireland', N'1122334455', N'Patrick OBrien', N'Dublin College Green', N'BOFIIE2D'),
(22, N'Social media strategist and influencer marketing expert. Built campaigns with 50M+ reach.', N'Social Media Strategy Lead', N'Within 12 hours', N'https://example.com/cv/isabellalopez.pdf', N'Bancolombia', N'2233445566', N'Isabella Lopez', N'Bogota Zona T', N'COLOCOBM'),
(23, N'Blockchain developer and Web3 enthusiast. Built DeFi and NFT platforms. Smart contract expert.', N'Senior Blockchain Developer', N'Within 48 hours', N'https://example.com/cv/henrikandersson.pdf', N'Swedbank', N'3344556677', N'Henrik Andersson', N'Stockholm Sergels Torg', N'SWEDSESS'),
(24, N'Motion designer and video editor. Created animations for top brands. Expert in After Effects and Cinema 4D.', N'Senior Motion Designer', N'Within 24 hours', N'https://example.com/cv/rachelcohen.pdf', N'Bank Hapoalim', N'4455667788', N'Rachel Cohen', N'Tel Aviv Rothschild', N'POALILIT'),
(25, N'IoT engineer and embedded systems developer. Built connected devices for smart home and industrial IoT.', N'Senior IoT Engineer', N'Within 36 hours', N'https://example.com/cv/mohammedahmed.pdf', N'Emirates NBD', N'5566778899', N'Mohammed Ahmed', N'Dubai Marina', N'EBILAEAD'),
(26, N'Technical writer and documentation specialist. Created docs for major tech companies. Clear communication expert.', N'Senior Technical Writer', N'Within 24 hours', N'https://example.com/cv/yukitanaka.pdf', N'Mizuho Bank', N'6677889900', N'Yuki Tanaka', N'Tokyo Shibuya', N'MHCBJPJT'),
(27, N'QA engineer and test automation specialist. Built testing frameworks used by enterprise companies.', N'Senior QA Engineer', N'Within 24 hours', N'https://example.com/cv/lucassilva.pdf', N'Millennium BCP', N'7788990011', N'Lucas Silva', N'Lisbon Avenida da Liberdade', N'BCOMPTPL'),
(28, N'E-commerce specialist and conversion optimization expert. Increased revenue for 100+ online stores.', N'E-commerce Strategy Lead', N'Within 24 hours', N'https://example.com/cv/chloemartin.pdf', N'KBC Bank', N'8899001122', N'Chloe Martin', N'Brussels Grand Place', N'KREDBEBB'),
(29, N'Site reliability engineer. Expert in monitoring, observability, and building resilient systems at scale.', N'Senior SRE', N'Within 24 hours', N'https://example.com/cv/erikhansen.pdf', N'Danske Bank', N'9900112233', N'Erik Hansen', N'Copenhagen Kongens Nytorv', N'DABADKKK'),
(30, N'Startup advisor and venture consultant. Helped 30+ startups raise funding and scale their businesses.', N'Startup Advisor & Consultant', N'Within 48 hours', N'https://example.com/cv/sophianguyen.pdf', N'Vietcombank', N'0011223344', N'Sophia Nguyen', N'Ho Chi Minh District 1', N'BFTVVNVX');

-- Insert Mentor Languages
INSERT INTO mentor_languages (mentor_id, mentor_language)
VALUES
-- John Doe (US)
(1, N'English'),
(1, N'Spanish'),
-- Sarah Johnson (UK)
(2, N'English'),
-- Michael Chen (Singapore)
(3, N'English'),
(3, N'Mandarin'),
(3, N'Cantonese'),
-- Emily Rodriguez (Spain)
(4, N'English'),
(4, N'Spanish'),
-- David Kim (South Korea)
(5, N'English'),
(5, N'Korean'),
-- Lisa Anderson (Canada)
(6, N'English'),
(6, N'French'),
-- James Martinez (Mexico)
(7, N'English'),
(7, N'Spanish'),
-- Anna Kowalski (Poland)
(8, N'English'),
(8, N'Polish'),
-- Robert Thompson (Australia)
(9, N'English'),
-- Maria Garcia (Argentina)
(10, N'Spanish'),
(10, N'English'),
-- Thomas Lee (Japan)
(11, N'English'),
(11, N'Japanese'),
-- Sophie Dubois (France)
(12, N'French'),
(12, N'English'),
-- Kevin Walsh (Ireland)
(13, N'English'),
-- Laura Muller (Germany)
(14, N'German'),
(14, N'English'),
-- Daniel Santos (Brazil)
(15, N'Portuguese'),
(15, N'English'),
(15, N'Spanish'),
-- Emma Wilson (New Zealand)
(16, N'English'),
-- Marco Rossi (Italy)
(17, N'Italian'),
(17, N'English'),
-- Olivia Brown (South Africa)
(18, N'English'),
(18, N'Afrikaans'),
-- Alex Petrov (Russia)
(19, N'Russian'),
(19, N'English'),
-- Nina Singh (India)
(20, N'English'),
(20, N'Hindi'),
-- Patrick OBrien (Ireland)
(21, N'English'),
-- Isabella Lopez (Colombia)
(22, N'Spanish'),
(22, N'English'),
-- Henrik Andersson (Sweden)
(23, N'Swedish'),
(23, N'English'),
-- Rachel Cohen (Israel)
(24, N'Hebrew'),
(24, N'English'),
-- Mohammed Ahmed (UAE)
(25, N'Arabic'),
(25, N'English'),
-- Yuki Tanaka (Japan)
(26, N'Japanese'),
(26, N'English'),
-- Lucas Silva (Portugal)
(27, N'Portuguese'),
(27, N'English'),
(27, N'Spanish'),
-- Chloe Martin (Belgium)
(28, N'French'),
(28, N'Dutch'),
(28, N'English'),
-- Erik Hansen (Denmark)
(29, N'Danish'),
(29, N'English'),
-- Sophia Nguyen (Vietnam)
(30, N'Vietnamese'),
(30, N'English');

-- Insert Companies
INSERT INTO companies (cname)
VALUES
(N'Google'),
(N'Microsoft'),
(N'Amazon'),
(N'Meta'),
(N'Apple'),
(N'Netflix'),
(N'Tesla'),
(N'Airbnb'),
(N'Uber'),
(N'Stripe'),
(N'Shopify'),
(N'Spotify'),
(N'Twitter'),
(N'LinkedIn'),
(N'Adobe'),
(N'Salesforce'),
(N'Oracle'),
(N'IBM'),
(N'Intel'),
(N'Cisco'),
(N'Samsung'),
(N'Sony'),
(N'Nvidia'),
(N'PayPal'),
(N'Square'),
(N'Dropbox'),
(N'Slack'),
(N'Zoom'),
(N'Atlassian'),
(N'Reddit');

-- Insert Job Titles
INSERT INTO job_title (job_name)
VALUES
(N'Senior Software Engineer'),
(N'Tech Lead'),
(N'Lead Product Designer'),
(N'Senior UX Designer'),
(N'ML Engineer'),
(N'Data Scientist'),
(N'Growth Marketing Manager'),
(N'Digital Marketing Lead'),
(N'Engineering Manager'),
(N'VP of Engineering'),
(N'Product Manager'),
(N'DevOps Engineer'),
(N'Senior Backend Engineer'),
(N'Senior Frontend Engineer'),
(N'Full Stack Developer'),
(N'Mobile Developer'),
(N'UI Designer'),
(N'UX Researcher'),
(N'Data Analyst'),
(N'Business Analyst'),
(N'QA Engineer'),
(N'Security Engineer'),
(N'Cloud Architect'),
(N'Site Reliability Engineer'),
(N'Technical Writer'),
(N'Scrum Master'),
(N'Product Owner'),
(N'CTO'),
(N'VP of Product'),
(N'Chief Data Officer');

-- Insert Work Experience
INSERT INTO work_for (mentor_id, c_company_id, current_job_title_id)
VALUES
-- John Doe (mentor_id 1) - Google & Microsoft
(1, 1, 1),
(1, 2, 2),
-- Sarah Johnson (mentor_id 2) - Amazon & Airbnb
(2, 3, 3),
(2, 8, 4),
-- Michael Chen (mentor_id 3) - Meta & Netflix
(3, 4, 5),
(3, 6, 6),
-- Emily Rodriguez (mentor_id 4) - Shopify & Uber
(4, 11, 7),
(4, 9, 8),
-- David Kim (mentor_id 5) - Apple & Stripe
(5, 5, 9),
(5, 10, 10),
-- Lisa Anderson (mentor_id 6) - Amazon & Microsoft
(6, 3, 11),
(6, 2, 23),
-- James Martinez (mentor_id 7) - Apple & Google
(7, 5, 16),
(7, 1, 16),
-- Anna Kowalski (mentor_id 8) - Adobe
(8, 15, 17),
-- Robert Thompson (mentor_id 9) - Amazon & Netflix
(9, 3, 13),
(9, 6, 13),
-- Maria Garcia (mentor_id 10) - Oracle & Salesforce
(10, 17, 20),
(10, 16, 20),
-- Thomas Lee (mentor_id 11) - Google & Meta
(11, 1, 1),
(11, 4, 28),
-- Sophie Dubois (mentor_id 12) - Adobe & Apple
(12, 15, 3),
(12, 5, 29),
-- Kevin Walsh (mentor_id 13) - Cisco & IBM
(13, 20, 22),
(13, 18, 22),
-- Laura Muller (mentor_id 14) - Microsoft & Google
(14, 2, 11),
(14, 1, 27),
-- Daniel Santos (mentor_id 15) - Meta & Google
(15, 4, 5),
(15, 1, 30),
-- Emma Wilson (mentor_id 16) - Adobe
(16, 15, 17),
-- Marco Rossi (mentor_id 17) - Shopify & Stripe
(17, 11, 15),
(17, 10, 15),
-- Olivia Brown (mentor_id 18) - Google & Twitter
(18, 1, 8),
(18, 13, 8),
-- Alex Petrov (mentor_id 19) - Sony & Samsung
(19, 22, 16),
(19, 21, 16),
-- Nina Singh (mentor_id 20) - IBM & Oracle
(20, 18, 19),
(20, 17, 30),
-- Patrick OBrien (mentor_id 21) - Amazon & Netflix
(21, 3, 9),
(21, 6, 10),
-- Isabella Lopez (mentor_id 22) - Twitter & LinkedIn
(22, 13, 7),
(22, 14, 7),
-- Henrik Andersson (mentor_id 23) - Spotify & PayPal
(23, 12, 15),
(23, 24, 15),
-- Rachel Cohen (mentor_id 24) - Adobe & Netflix
(24, 15, 3),
(24, 6, 3),
-- Mohammed Ahmed (mentor_id 25) - Intel & Nvidia
(25, 19, 1),
(25, 23, 1),
-- Yuki Tanaka (mentor_id 26) - Sony
(26, 22, 25),
-- Lucas Silva (mentor_id 27) - Atlassian & Spotify
(27, 29, 21),
(27, 12, 21),
-- Chloe Martin (mentor_id 28) - Shopify & Amazon
(28, 11, 11),
(28, 3, 11),
-- Erik Hansen (mentor_id 29) - Google & Dropbox
(29, 1, 24),
(29, 26, 24),
-- Sophia Nguyen (mentor_id 30) - Stripe & Square
(30, 10, 11),
(30, 25, 27);

-- Insert Categories
-- First insert parent categories (super_category_id = NULL)
INSERT INTO categories (category_name, super_category_id)
VALUES
(N'Engineering Mentors', NULL),
(N'Design Mentors', NULL),
(N'Startup Mentors', NULL),
(N'AI Mentors', NULL),
(N'Product Managers', NULL),
(N'Marketing Coaches', NULL),
(N'Leadership Mentors', NULL);

-- Then insert subcategories
INSERT INTO categories (category_name, super_category_id)
VALUES
-- Engineering Mentors subcategories (super_category_id = 1)
(N'Web Development', 1),
(N'Mobile Development', 1),
(N'Cloud & DevOps', 1),
(N'Cybersecurity', 1),
(N'Backend Development', 1),
(N'Frontend Development', 1),
(N'Full Stack Development', 1),
(N'Game Development', 1),
(N'Embedded Systems', 1),
(N'Blockchain Development', 1),
-- Design Mentors subcategories (super_category_id = 2)
(N'UI/UX Design', 2),
(N'Product Design', 2),
(N'Graphic Design', 2),
(N'Motion Design', 2),
(N'Brand Design', 2),
(N'Interaction Design', 2),
-- Startup Mentors subcategories (super_category_id = 3)
(N'Business Strategy', 3),
(N'Fundraising', 3),
(N'Growth Strategy', 3),
(N'Product Development', 3),
(N'Business Operations', 3),
-- AI Mentors subcategories (super_category_id = 4)
(N'Machine Learning', 4),
(N'Deep Learning', 4),
(N'Natural Language Processing', 4),
(N'Computer Vision', 4),
(N'Data Science', 4),
-- Product Managers subcategories (super_category_id = 5)
(N'Product Strategy', 5),
(N'Product Analytics', 5),
(N'Agile Methodologies', 5),
(N'User Research', 5),
-- Marketing Coaches subcategories (super_category_id = 6)
(N'Digital Marketing', 6),
(N'Content Marketing', 6),
(N'Social Media Marketing', 6),
(N'SEO & SEM', 6),
(N'Email Marketing', 6),
(N'Growth Marketing', 6),
-- Leadership Mentors subcategories (super_category_id = 7)
(N'Career Coaching', 7),
(N'Executive Coaching', 7),
(N'Team Management', 7),
(N'Communication Skills', 7),
(N'Strategic Leadership', 7);

-- Insert Skills
INSERT INTO skills (skill_name)
VALUES
-- Web Development
(N'React'),
(N'Node.js'),
(N'TypeScript'),
(N'JavaScript'),
(N'HTML/CSS'),
-- Mobile Development
(N'React Native'),
(N'Flutter'),
(N'Swift'),
(N'Kotlin'),
-- Cloud & DevOps
(N'AWS'),
(N'Docker'),
(N'Kubernetes'),
(N'CI/CD'),
(N'Azure'),
-- Data Science & AI
(N'Python'),
(N'Machine Learning'),
(N'SQL'),
(N'Data Analysis'),
(N'TensorFlow'),
-- Design
(N'Figma'),
(N'Adobe XD'),
(N'UI/UX Design'),
(N'Prototyping'),
(N'Wireframing'),
-- Marketing
(N'SEO'),
(N'Content Marketing'),
(N'Social Media Marketing'),
(N'Google Analytics'),
(N'Email Marketing'),
-- Leadership & Management
(N'Team Management'),
(N'Project Management'),
(N'Agile'),
(N'Communication'),
(N'Leadership'),
-- Backend Development
(N'REST API'),
(N'PostgreSQL'),
(N'MongoDB'),
(N'Express.js'),
-- Other Popular Skills
(N'Git'),
(N'Cybersecurity'),
(N'Blockchain'),
(N'System Design'),
(N'Technical Writing');

-- Insert Own Skill (category_id and skill_id based on insertion order)
INSERT INTO own_skill (category_id, skill_id)
VALUES
-- Web Development skills (category_id 8)
(8, 1), (8, 2), (8, 3), (8, 4), (8, 5),
-- Mobile Development skills (category_id 9)
(9, 6), (9, 7), (9, 8), (9, 9),
-- Cloud & DevOps skills (category_id 10)
(10, 10), (10, 11), (10, 12), (10, 13), (10, 14),
-- Cybersecurity skills (category_id 9)
(9, 40), (9, 42),
-- Backend Development skills (category_id 10)
(10, 2), (10, 35), (10, 36), (10, 37), (10, 38),
-- Frontend Development skills (category_id 11)
(11, 1), (11, 3), (11, 4), (11, 5),
-- Full Stack Development skills (category_id 12)
(12, 1), (12, 2), (12, 3), (12, 4), (12, 15),
-- Game Development skills (category_id 13)
(13, 15),
-- Embedded Systems skills (category_id 14)
(14, 15),
-- Blockchain Development skills (category_id 15)
(15, 41),
-- UI/UX Design skills (category_id 16)
(16, 20), (16, 21), (16, 22), (16, 23), (16, 24),
-- Product Design skills (category_id 17)
(17, 20), (17, 22), (17, 23),
-- Graphic Design skills (category_id 18)
(18, 21), (18, 22),
-- Motion Design skills (category_id 19)
(19, 22),
-- Brand Design skills (category_id 20)
(20, 22),
-- Interaction Design skills (category_id 21)
(21, 20), (21, 23),
-- Business Strategy skills (category_id 22)
(22, 30), (22, 33),
-- Fundraising skills (category_id 23)
(23, 33),
-- Growth Strategy skills (category_id 24)
(24, 25), (24, 26), (24, 33),
-- Product Development skills (category_id 25)
(25, 30), (25, 31),
-- Business Operations skills (category_id 26)
(26, 30), (26, 31),
-- Machine Learning skills (category_id 27)
(27, 15), (27, 16), (27, 19),
-- Deep Learning skills (category_id 28)
(28, 15), (28, 19),
-- Natural Language Processing skills (category_id 29)
(29, 15), (29, 19),
-- Computer Vision skills (category_id 30)
(30, 15), (30, 19),
-- Data Science skills (category_id 31)
(31, 15), (31, 17), (31, 18),
-- Product Strategy skills (category_id 32)
(32, 30), (32, 31),
-- Product Analytics skills (category_id 33)
(33, 17), (33, 28),
-- Agile Methodologies skills (category_id 34)
(34, 31), (34, 32),
-- User Research skills (category_id 35)
(35, 18), (35, 23),
-- Digital Marketing skills (category_id 36)
(36, 25), (36, 26), (36, 27), (36, 28), (36, 29),
-- Content Marketing skills (category_id 37)
(37, 26), (37, 25),
-- Social Media Marketing skills (category_id 38)
(38, 27), (38, 28),
-- SEO & SEM skills (category_id 39)
(39, 25), (39, 28),
-- Email Marketing skills (category_id 40)
(40, 29),
-- Growth Marketing skills (category_id 41)
(41, 25), (41, 26), (41, 28),
-- Career Coaching skills (category_id 42)
(42, 33), (42, 34),
-- Executive Coaching skills (category_id 43)
(43, 33), (43, 34),
-- Team Management skills (category_id 44)
(44, 30), (44, 33),
-- Communication Skills skills (category_id 45)
(45, 33), (45, 34),
-- Strategic Leadership skills (category_id 46)
(46, 33), (46, 34), (46, 42);

-- Insert Set Skill (mentor skills)
INSERT INTO set_skill (mentor_id, skill_id)
VALUES
-- John Doe (mentor_id 1) - Full-stack developer
(1, 1), (1, 2), (1, 3), (1, 4), (1, 10), (1, 13), (1, 39),
-- Sarah Johnson (mentor_id 2) - Product designer
(2, 20), (2, 21), (2, 22), (2, 23), (2, 24),
-- Michael Chen (mentor_id 3) - Data scientist & ML engineer
(3, 15), (3, 16), (3, 17), (3, 19), (3, 18),
-- Emily Rodriguez (mentor_id 4) - Marketing strategist
(4, 25), (4, 26), (4, 27), (4, 28), (4, 29),
-- David Kim (mentor_id 5) - Career coach
(5, 30), (5, 33), (5, 34), (5, 32),
-- Lisa Anderson (mentor_id 6) - Cloud architect
(6, 10), (6, 11), (6, 12), (6, 13), (6, 14),
-- James Martinez (mentor_id 7) - Mobile developer
(7, 6), (7, 7), (7, 8), (7, 9),
-- Anna Kowalski (mentor_id 8) - UI/UX designer
(8, 20), (8, 22), (8, 23), (8, 24),
-- Robert Thompson (mentor_id 9) - Backend engineer
(9, 2), (9, 35), (9, 36), (9, 37), (9, 42),
-- Maria Garcia (mentor_id 10) - Digital transformation
(10, 30), (10, 33), (10, 42),
-- Thomas Lee (mentor_id 11) - Software architect
(11, 2), (11, 15), (11, 42), (11, 39),
-- Sophie Dubois (mentor_id 12) - Creative director
(12, 21), (12, 22), (12, 33),
-- Kevin Walsh (mentor_id 13) - Cybersecurity expert
(13, 40), (13, 42),
-- Laura Muller (mentor_id 14) - Product manager
(14, 30), (14, 31), (14, 32),
-- Daniel Santos (mentor_id 15) - AI researcher
(15, 15), (15, 16), (15, 19),
-- Emma Wilson (mentor_id 16) - Graphic designer
(16, 21), (16, 22),
-- Marco Rossi (mentor_id 17) - Full-stack developer
(17, 1), (17, 2), (17, 3), (17, 4), (17, 39),
-- Olivia Brown (mentor_id 18) - SEO specialist
(18, 25), (18, 26), (18, 28),
-- Alex Petrov (mentor_id 19) - Game developer
(19, 15), (19, 3),
-- Nina Singh (mentor_id 20) - Business analyst
(20, 17), (20, 18), (20, 30),
-- Patrick OBrien (mentor_id 21) - Engineering manager
(21, 30), (21, 31), (21, 33),
-- Isabella Lopez (mentor_id 22) - Social media strategist
(22, 27), (22, 28), (22, 26),
-- Henrik Andersson (mentor_id 23) - Blockchain developer
(23, 41), (23, 15), (23, 2),
-- Rachel Cohen (mentor_id 24) - Motion designer
(24, 21), (24, 22),
-- Mohammed Ahmed (mentor_id 25) - IoT engineer
(25, 15), (25, 2),
-- Yuki Tanaka (mentor_id 26) - Technical writer
(26, 43), (26, 33),
-- Lucas Silva (mentor_id 27) - QA engineer
(27, 31), (27, 39),
-- Chloe Martin (mentor_id 28) - E-commerce specialist
(28, 25), (28, 28), (28, 30),
-- Erik Hansen (mentor_id 29) - SRE
(29, 11), (29, 12), (29, 13),
-- Sophia Nguyen (mentor_id 30) - Startup advisor
(30, 30), (30, 33), (30, 34);

-- Insert Plans
INSERT INTO plans (plan_description, plan_charge, plan_type, mentor_id)
VALUES
-- John Doe's plans (mentor_id 1)
(N'30-minute focused mentorship session covering React, Node.js, and web development best practices', 50.00, N'Beginner', 1),
(N'1-hour deep-dive session with code review and architecture discussion', 90.00, N'Introductory', 1),
(N'2-hour comprehensive technical consultation with system design review', 150.00, N'Introductory', 1),
-- Sarah Johnson's plans (mentor_id 2)
(N'Portfolio review and UX design consultation session', 60.00, N'Beginner', 2),
(N'Monthly mentorship program for aspiring designers - 2 calls per month (60min/call)', 199.00, N'Lite', 2),
(N'Comprehensive design mentorship - 4 calls per month (60min/call)', 349.00, N'Standard', 2),
-- Michael Chen's plans (mentor_id 3)
(N'ML/AI consultation session with hands-on guidance', 75.00, N'Beginner', 3),
(N'Advanced machine learning project review and optimization', 130.00, N'Introductory', 3),
(N'ML mentorship with weekly sessions - 4 calls per month (60min/call)', 399.00, N'Standard', 3),
(N'Premium ML mentorship with intensive support - 8 calls per month (60min/call)', 699.00, N'Premium', 3),
-- Emily Rodriguez's plans (mentor_id 4)
(N'Marketing strategy consultation and growth tactics', 45.00, N'Beginner', 4),
(N'Digital marketing mentorship - 2 calls per month (45min/call)', 199.00, N'Lite', 4),
(N'Comprehensive marketing mentorship - 4 calls per month (60min/call)', 349.00, N'Standard', 4),
-- David Kim's plans (mentor_id 5)
(N'Career coaching session with resume review', 70.00, N'Beginner', 5),
(N'Leadership development and career growth session', 120.00, N'Introductory', 5),
(N'Executive leadership mentorship - 2 calls per month (60min/call)', 399.00, N'Lite', 5),
(N'Premium leadership coaching - 4 calls per month (90min/call)', 799.00, N'Premium', 5),
-- Lisa Anderson's plans (mentor_id 6)
(N'Cloud architecture consultation and AWS best practices', 85.00, N'Beginner', 6),
(N'DevOps mentorship - 2 calls per month (60min/call)', 299.00, N'Lite', 6),
(N'Cloud infrastructure mentorship - 4 calls per month (90min/call)', 549.00, N'Standard', 6),
-- James Martinez's plans (mentor_id 7)
(N'Mobile app development consultation', 65.00, N'Beginner', 7),
(N'iOS/Android mentorship - 2 calls per month (60min/call)', 249.00, N'Lite', 7),
(N'Comprehensive mobile development - 4 calls per month (75min/call)', 449.00, N'Standard', 7),
-- Anna Kowalski's plans (mentor_id 8)
(N'UI/UX design review and feedback session', 55.00, N'Beginner', 8),
(N'Design mentorship program - 2 calls per month (60min/call)', 189.00, N'Lite', 8),
(N'Advanced UI/UX mentorship - 4 calls per month (60min/call)', 329.00, N'Standard', 8),
-- Robert Thompson's plans (mentor_id 9)
(N'Backend architecture consultation', 70.00, N'Beginner', 9),
(N'Scalable systems mentorship - 3 calls per month (60min/call)', 299.00, N'Lite', 9),
(N'Enterprise backend mentorship - 4 calls per month (90min/call)', 499.00, N'Standard', 9),
-- Maria Garcia's plans (mentor_id 10)
(N'Digital transformation strategy session', 80.00, N'Beginner', 10),
(N'Business technology consulting - 2 calls per month (60min/call)', 349.00, N'Lite', 10),
-- Thomas Lee's plans (mentor_id 11)
(N'System design consultation', 90.00, N'Beginner', 11),
(N'Software architecture mentorship - 2 calls per month (75min/call)', 399.00, N'Lite', 11),
(N'Premium architecture guidance - 4 calls per month (90min/call)', 699.00, N'Premium', 11),
-- Sophie Dubois's plans (mentor_id 12)
(N'Creative direction and brand strategy session', 75.00, N'Beginner', 12),
(N'Brand design mentorship - 2 calls per month (60min/call)', 279.00, N'Lite', 12),
-- Kevin Walsh's plans (mentor_id 13)
(N'Cybersecurity assessment and consultation', 95.00, N'Beginner', 13),
(N'Security mentorship program - 2 calls per month (60min/call)', 399.00, N'Lite', 13),
(N'Enterprise security mentorship - 4 calls per month (90min/call)', 699.00, N'Standard', 13),
-- Laura Muller's plans (mentor_id 14)
(N'Product management consultation', 65.00, N'Beginner', 14),
(N'PM mentorship - 2 calls per month (60min/call)', 249.00, N'Lite', 14),
(N'Advanced product leadership - 4 calls per month (75min/call)', 449.00, N'Standard', 14),
-- Daniel Santos's plans (mentor_id 15)
(N'AI/Deep learning consultation', 85.00, N'Beginner', 15),
(N'AI research mentorship - 2 calls per month (90min/call)', 449.00, N'Standard', 15),
(N'Premium AI mentorship - 4 calls per month (90min/call)', 799.00, N'Premium', 15),
-- Emma Wilson's plans (mentor_id 16)
(N'Graphic design and branding consultation', 50.00, N'Beginner', 16),
(N'Creative design mentorship - 2 calls per month (60min/call)', 179.00, N'Lite', 16),
-- Marco Rossi's plans (mentor_id 17)
(N'Full-stack development consultation', 60.00, N'Beginner', 17),
(N'Web development mentorship - 2 calls per month (60min/call)', 229.00, N'Lite', 17),
(N'Comprehensive full-stack mentorship - 4 calls per month (75min/call)', 399.00, N'Standard', 17),
-- Olivia Brown's plans (mentor_id 18)
(N'SEO and content strategy session', 55.00, N'Beginner', 18),
(N'Content marketing mentorship - 2 calls per month (60min/call)', 199.00, N'Lite', 18),
-- Alex Petrov's plans (mentor_id 19)
(N'Game development consultation', 70.00, N'Beginner', 19),
(N'Game dev mentorship - 2 calls per month (75min/call)', 299.00, N'Lite', 19),
(N'Advanced game development - 4 calls per month (90min/call)', 549.00, N'Standard', 19),
-- Nina Singh's plans (mentor_id 20)
(N'Business analytics consultation', 60.00, N'Beginner', 20),
(N'Data analytics mentorship - 2 calls per month (60min/call)', 249.00, N'Lite', 20),
-- Patrick OBrien's plans (mentor_id 21)
(N'Engineering management consultation', 75.00, N'Beginner', 21),
(N'Team leadership mentorship - 2 calls per month (60min/call)', 349.00, N'Lite', 21),
(N'Engineering leadership program - 4 calls per month (90min/call)', 599.00, N'Standard', 21),
-- Isabella Lopez's plans (mentor_id 22)
(N'Social media strategy session', 50.00, N'Beginner', 22),
(N'Social media mentorship - 2 calls per month (60min/call)', 189.00, N'Lite', 22),
-- Henrik Andersson's plans (mentor_id 23)
(N'Blockchain and Web3 consultation', 90.00, N'Beginner', 23),
(N'Blockchain development mentorship - 2 calls per month (75min/call)', 399.00, N'Lite', 23),
(N'Advanced Web3 mentorship - 4 calls per month (90min/call)', 699.00, N'Standard', 23),
-- Rachel Cohen's plans (mentor_id 24)
(N'Motion design consultation', 65.00, N'Beginner', 24),
(N'Motion graphics mentorship - 2 calls per month (60min/call)', 249.00, N'Lite', 24),
-- Mohammed Ahmed's plans (mentor_id 25)
(N'IoT and embedded systems consultation', 75.00, N'Beginner', 25),
(N'IoT development mentorship - 2 calls per month (75min/call)', 329.00, N'Lite', 25),
-- Yuki Tanaka's plans (mentor_id 26)
(N'Technical writing consultation', 55.00, N'Beginner', 26),
(N'Documentation mentorship - 2 calls per month (60min/call)', 199.00, N'Lite', 26),
-- Lucas Silva's plans (mentor_id 27)
(N'QA and testing consultation', 60.00, N'Beginner', 27),
(N'Test automation mentorship - 2 calls per month (60min/call)', 229.00, N'Lite', 27),
-- Chloe Martin's plans (mentor_id 28)
(N'E-commerce strategy session', 65.00, N'Beginner', 28),
(N'E-commerce mentorship - 2 calls per month (60min/call)', 249.00, N'Lite', 28),
-- Erik Hansen's plans (mentor_id 29)
(N'SRE and DevOps consultation', 80.00, N'Beginner', 29),
(N'Site reliability mentorship - 2 calls per month (75min/call)', 349.00, N'Lite', 29),
-- Sophia Nguyen's plans (mentor_id 30)
(N'Startup consulting session', 85.00, N'Beginner', 30),
(N'Startup mentorship - 2 calls per month (90min/call)', 399.00, N'Lite', 30),
(N'Comprehensive startup guidance - 4 calls per month (90min/call)', 699.00, N'Standard', 30);

-- Insert Plan Sessions (plan_id based on insertion order)
INSERT INTO plan_sessions (sessions_id, sessions_duration)
VALUES
-- John Doe (mentor_id 1)
(1, 30),   -- Plan 1: 30-minute session
(2, 60),   -- Plan 2: 1-hour session
(3, 120),  -- Plan 3: 2-hour session
-- Sarah Johnson (mentor_id 2)
(4, 60),   -- Plan 4: Portfolio review session
-- Michael Chen (mentor_id 3)
(7, 75),   -- Plan 7: ML consultation
(8, 120),  -- Plan 8: Advanced ML review
-- Emily Rodriguez (mentor_id 4)
(11, 45),  -- Plan 11: Marketing strategy
-- David Kim (mentor_id 5)
(14, 70),  -- Plan 14: Career coaching
(15, 120), -- Plan 15: Leadership development
-- Lisa Anderson (mentor_id 6)
(18, 85),  -- Plan 18: Cloud architecture
-- James Martinez (mentor_id 7)
(21, 65),  -- Plan 21: Mobile app consultation
-- Anna Kowalski (mentor_id 8)
(24, 55),  -- Plan 24: UI/UX review
-- Robert Thompson (mentor_id 9)
(27, 70),  -- Plan 27: Backend architecture
-- Maria Garcia (mentor_id 10)
(30, 80),  -- Plan 30: Digital transformation
-- Thomas Lee (mentor_id 11)
(32, 90),  -- Plan 32: System design
-- Sophie Dubois (mentor_id 12)
(35, 75),  -- Plan 35: Creative direction
-- Kevin Walsh (mentor_id 13)
(37, 95),  -- Plan 37: Cybersecurity assessment
-- Laura Muller (mentor_id 14)
(40, 65),  -- Plan 40: Product management
-- Daniel Santos (mentor_id 15)
(43, 85),  -- Plan 43: AI/Deep learning
-- Emma Wilson (mentor_id 16)
(46, 50),  -- Plan 46: Graphic design
-- Marco Rossi (mentor_id 17)
(48, 60),  -- Plan 48: Full-stack development
-- Olivia Brown (mentor_id 18)
(51, 55),  -- Plan 51: SEO and content
-- Alex Petrov (mentor_id 19)
(53, 70),  -- Plan 53: Game development
-- Nina Singh (mentor_id 20)
(56, 60),  -- Plan 56: Business analytics
-- Patrick OBrien (mentor_id 21)
(58, 75),  -- Plan 58: Engineering management
-- Isabella Lopez (mentor_id 22)
(61, 50),  -- Plan 61: Social media strategy
-- Henrik Andersson (mentor_id 23)
(63, 90),  -- Plan 63: Blockchain consultation
-- Rachel Cohen (mentor_id 24)
(66, 65),  -- Plan 66: Motion design
-- Mohammed Ahmed (mentor_id 25)
(68, 75),  -- Plan 68: IoT consultation
-- Yuki Tanaka (mentor_id 26)
(70, 55),  -- Plan 70: Technical writing
-- Lucas Silva (mentor_id 27)
(72, 60),  -- Plan 72: QA and testing
-- Chloe Martin (mentor_id 28)
(74, 65),  -- Plan 74: E-commerce strategy
-- Erik Hansen (mentor_id 29)
(76, 80),  -- Plan 76: SRE consultation
-- Sophia Nguyen (mentor_id 30)
(78, 85);  -- Plan 78: Startup consulting

-- Insert Plan Mentorships
INSERT INTO plan_mentorships (mentorships_id, calls_per_month, minutes_per_call)
VALUES
-- Sarah Johnson (mentor_id 2)
(5, 2, 60),   -- Plan 5: Monthly mentorship
(6, 4, 60),   -- Plan 6: Comprehensive mentorship
-- Michael Chen (mentor_id 3)
(9, 4, 60),   -- Plan 9: ML mentorship
(10, 8, 60),  -- Plan 10: Premium ML mentorship
-- Emily Rodriguez (mentor_id 4)
(12, 2, 45),  -- Plan 12: Digital marketing mentorship
(13, 4, 60),  -- Plan 13: Comprehensive marketing mentorship
-- David Kim (mentor_id 5)
(16, 2, 60),  -- Plan 16: Leadership mentorship
(17, 4, 90),  -- Plan 17: Premium leadership coaching
-- Lisa Anderson (mentor_id 6)
(19, 2, 60),  -- Plan 19: DevOps mentorship
(20, 4, 90),  -- Plan 20: Cloud infrastructure mentorship
-- James Martinez (mentor_id 7)
(22, 2, 60),  -- Plan 22: Mobile mentorship
(23, 4, 75),  -- Plan 23: Comprehensive mobile development
-- Anna Kowalski (mentor_id 8)
(25, 2, 60),  -- Plan 25: Design mentorship
(26, 4, 60),  -- Plan 26: Advanced UI/UX mentorship
-- Robert Thompson (mentor_id 9)
(28, 3, 60),  -- Plan 28: Scalable systems mentorship
(29, 4, 90),  -- Plan 29: Enterprise backend mentorship
-- Maria Garcia (mentor_id 10)
(31, 2, 60),  -- Plan 31: Business technology consulting
-- Thomas Lee (mentor_id 11)
(33, 2, 75),  -- Plan 33: Software architecture mentorship
(34, 4, 90),  -- Plan 34: Premium architecture guidance
-- Sophie Dubois (mentor_id 12)
(36, 2, 60),  -- Plan 36: Brand design mentorship
-- Kevin Walsh (mentor_id 13)
(38, 2, 60),  -- Plan 38: Security mentorship
(39, 4, 90),  -- Plan 39: Enterprise security mentorship
-- Laura Muller (mentor_id 14)
(41, 2, 60),  -- Plan 41: PM mentorship
(42, 4, 75),  -- Plan 42: Advanced product leadership
-- Daniel Santos (mentor_id 15)
(44, 2, 90),  -- Plan 44: AI research mentorship
(45, 4, 90),  -- Plan 45: Premium AI mentorship
-- Emma Wilson (mentor_id 16)
(47, 2, 60),  -- Plan 47: Creative design mentorship
-- Marco Rossi (mentor_id 17)
(49, 2, 60),  -- Plan 49: Web development mentorship
(50, 4, 75),  -- Plan 50: Comprehensive full-stack mentorship
-- Olivia Brown (mentor_id 18)
(52, 2, 60),  -- Plan 52: Content marketing mentorship
-- Alex Petrov (mentor_id 19)
(54, 2, 75),  -- Plan 54: Game dev mentorship
(55, 4, 90),  -- Plan 55: Advanced game development
-- Nina Singh (mentor_id 20)
(57, 2, 60),  -- Plan 57: Data analytics mentorship
-- Patrick OBrien (mentor_id 21)
(59, 2, 60),  -- Plan 59: Team leadership mentorship
(60, 4, 90),  -- Plan 60: Engineering leadership program
-- Isabella Lopez (mentor_id 22)
(62, 2, 60),  -- Plan 62: Social media mentorship
-- Henrik Andersson (mentor_id 23)
(64, 2, 75),  -- Plan 64: Blockchain development mentorship
(65, 4, 90),  -- Plan 65: Advanced Web3 mentorship
-- Rachel Cohen (mentor_id 24)
(67, 2, 60),  -- Plan 67: Motion graphics mentorship
-- Mohammed Ahmed (mentor_id 25)
(69, 2, 75),  -- Plan 69: IoT development mentorship
-- Yuki Tanaka (mentor_id 26)
(71, 2, 60),  -- Plan 71: Documentation mentorship
-- Lucas Silva (mentor_id 27)
(73, 2, 60),  -- Plan 73: Test automation mentorship
-- Chloe Martin (mentor_id 28)
(75, 2, 60),  -- Plan 75: E-commerce mentorship
-- Erik Hansen (mentor_id 29)
(77, 2, 75),  -- Plan 77: Site reliability mentorship
-- Sophia Nguyen (mentor_id 30)
(79, 2, 90),  -- Plan 79: Startup mentorship
(80, 4, 90);  -- Plan 80: Comprehensive startup guidance

-- Insert Mentorships Benefits
INSERT INTO mentorships_benefits (mentorships_id, benefit_description)
VALUES
-- Sarah Johnson's Lite mentorship (plan 5)
(5, N'2 calls per month (60min/call)'),
(5, N'Portfolio review and redesign guidance'),
(5, N'Email support'),
(5, N'Access to design resources'),
-- Sarah Johnson's Standard mentorship (plan 6)
(6, N'4 calls per month (60min/call)'),
(6, N'Portfolio review and redesign guidance'),
(6, N'Unlimited chat support'),
(6, N'Access to exclusive design resources'),
(6, N'Job application review'),
(6, N'Design system consultation'),
-- Michael Chen's Standard mentorship (plan 9)
(9, N'4 calls per month (60min/call)'),
(9, N'Real-world ML project guidance'),
(9, N'Code review and optimization'),
(9, N'Research paper discussions'),
(9, N'Email support'),
-- Michael Chen's Premium mentorship (plan 10)
(10, N'8 calls per month (60min/call)'),
(10, N'Real-world ML project guidance'),
(10, N'Code review and optimization'),
(10, N'Research paper discussions'),
(10, N'Career guidance in AI/ML field'),
(10, N'Interview preparation'),
(10, N'Priority 24/7 chat support'),
-- Emily Rodriguez's Lite mentorship (plan 12)
(12, N'2 calls per month (45min/call)'),
(12, N'Marketing strategy sessions'),
(12, N'Campaign reviews'),
(12, N'Email support'),
-- Emily Rodriguez's Standard mentorship (plan 13)
(13, N'4 calls per month (60min/call)'),
(13, N'Marketing strategy sessions'),
(13, N'Marketing campaign reviews'),
(13, N'Analytics and metrics guidance'),
(13, N'Content strategy development'),
(13, N'Chat and email support'),
-- David Kim's Lite mentorship (plan 16)
(16, N'2 calls per month (60min/call)'),
(16, N'Personalized leadership development plan'),
(16, N'Resume and LinkedIn review'),
(16, N'Email support'),
-- David Kim's Premium mentorship (plan 17)
(17, N'4 calls per month (90min/call)'),
(17, N'Personalized leadership development plan'),
(17, N'360-degree feedback analysis'),
(17, N'Executive presence training'),
(17, N'Priority chat support'),
(17, N'Access to leadership resources'),
(17, N'Networking opportunities'),
-- Lisa Anderson's Lite mentorship (plan 19)
(19, N'2 calls per month (60min/call)'),
(19, N'Cloud architecture guidance'),
(19, N'AWS/Azure best practices'),
(19, N'Email support'),
-- Lisa Anderson's Standard mentorship (plan 20)
(20, N'4 calls per month (90min/call)'),
(20, N'Cloud migration strategy'),
(20, N'Infrastructure optimization'),
(20, N'DevOps workflow guidance'),
(20, N'Priority chat support'),
-- James Martinez's Lite mentorship (plan 22)
(22, N'2 calls per month (60min/call)'),
(22, N'Mobile app development guidance'),
(22, N'Code review'),
(22, N'Email support'),
-- James Martinez's Standard mentorship (plan 23)
(23, N'4 calls per month (75min/call)'),
(23, N'iOS and Android development'),
(23, N'App architecture consultation'),
(23, N'App Store optimization tips'),
(23, N'Chat and email support'),
-- Anna Kowalski's Lite mentorship (plan 25)
(25, N'2 calls per month (60min/call)'),
(25, N'UI/UX design feedback'),
(25, N'Design system guidance'),
(25, N'Email support'),
-- Anna Kowalski's Standard mentorship (plan 26)
(26, N'4 calls per month (60min/call)'),
(26, N'Advanced UI/UX techniques'),
(26, N'User testing guidance'),
(26, N'Portfolio development'),
(26, N'Chat and email support'),
-- Robert Thompson's Lite mentorship (plan 28)
(28, N'3 calls per month (60min/call)'),
(28, N'Scalable architecture design'),
(28, N'Code review'),
(28, N'Email support'),
-- Robert Thompson's Standard mentorship (plan 29)
(29, N'4 calls per month (90min/call)'),
(29, N'Enterprise backend systems'),
(29, N'Microservices architecture'),
(29, N'Performance optimization'),
(29, N'Priority chat support'),
-- Maria Garcia's Lite mentorship (plan 31)
(31, N'2 calls per month (60min/call)'),
(31, N'Digital transformation strategy'),
(31, N'Technology consulting'),
(31, N'Email support'),
-- Thomas Lee's Lite mentorship (plan 33)
(33, N'2 calls per month (75min/call)'),
(33, N'System design guidance'),
(33, N'Architecture review'),
(33, N'Email support'),
-- Thomas Lee's Premium mentorship (plan 34)
(34, N'4 calls per month (90min/call)'),
(34, N'Advanced system architecture'),
(34, N'High-performance systems design'),
(34, N'Technical leadership guidance'),
(34, N'Priority 24/7 support'),
-- Sophie Dubois's Lite mentorship (plan 36)
(36, N'2 calls per month (60min/call)'),
(36, N'Brand strategy consultation'),
(36, N'Creative direction'),
(36, N'Email support'),
-- Kevin Walsh's Lite mentorship (plan 38)
(38, N'2 calls per month (60min/call)'),
(38, N'Security assessment guidance'),
(38, N'Penetration testing tips'),
(38, N'Email support'),
-- Kevin Walsh's Standard mentorship (plan 39)
(39, N'4 calls per month (90min/call)'),
(39, N'Enterprise security strategy'),
(39, N'Compliance guidance'),
(39, N'Incident response training'),
(39, N'Priority chat support'),
-- Laura Muller's Lite mentorship (plan 41)
(41, N'2 calls per month (60min/call)'),
(41, N'Product strategy sessions'),
(41, N'Roadmap planning'),
(41, N'Email support'),
-- Laura Muller's Standard mentorship (plan 42)
(42, N'4 calls per month (75min/call)'),
(42, N'Advanced product management'),
(42, N'Stakeholder management'),
(42, N'Metrics and analytics'),
(42, N'Chat and email support'),
-- Daniel Santos's Standard mentorship (plan 44)
(44, N'2 calls per month (90min/call)'),
(44, N'AI research guidance'),
(44, N'Deep learning projects'),
(44, N'Research paper collaboration'),
(44, N'Email support'),
-- Daniel Santos's Premium mentorship (plan 45)
(45, N'4 calls per month (90min/call)'),
(45, N'Advanced AI/ML research'),
(45, N'Neural network optimization'),
(45, N'Publication guidance'),
(45, N'Priority 24/7 support'),
(45, N'Conference presentation prep'),
-- Emma Wilson's Lite mentorship (plan 47)
(47, N'2 calls per month (60min/call)'),
(47, N'Graphic design feedback'),
(47, N'Portfolio building'),
(47, N'Email support'),
-- Marco Rossi's Lite mentorship (plan 49)
(49, N'2 calls per month (60min/call)'),
(49, N'Full-stack development guidance'),
(49, N'Code review'),
(49, N'Email support'),
-- Marco Rossi's Standard mentorship (plan 50)
(50, N'4 calls per month (75min/call)'),
(50, N'Comprehensive full-stack training'),
(50, N'Project architecture'),
(50, N'Best practices'),
(50, N'Chat and email support'),
-- Olivia Brown's Lite mentorship (plan 52)
(52, N'2 calls per month (60min/call)'),
(52, N'Content strategy guidance'),
(52, N'SEO optimization'),
(52, N'Email support'),
-- Alex Petrov's Lite mentorship (plan 54)
(54, N'2 calls per month (75min/call)'),
(54, N'Game development guidance'),
(54, N'Unity/Unreal tips'),
(54, N'Email support'),
-- Alex Petrov's Standard mentorship (plan 55)
(55, N'4 calls per month (90min/call)'),
(55, N'Advanced game development'),
(55, N'Game design patterns'),
(55, N'Publishing guidance'),
(55, N'Chat and email support'),
-- Nina Singh's Lite mentorship (plan 57)
(57, N'2 calls per month (60min/call)'),
(57, N'Data analytics guidance'),
(57, N'Business intelligence'),
(57, N'Email support'),
-- Patrick OBrien's Lite mentorship (plan 59)
(59, N'2 calls per month (60min/call)'),
(59, N'Team leadership guidance'),
(59, N'Agile methodologies'),
(59, N'Email support'),
-- Patrick OBrien's Standard mentorship (plan 60)
(60, N'4 calls per month (90min/call)'),
(60, N'Engineering leadership program'),
(60, N'Team scaling strategies'),
(60, N'Hiring and retention'),
(60, N'Priority chat support'),
-- Isabella Lopez's Lite mentorship (plan 62)
(62, N'2 calls per month (60min/call)'),
(62, N'Social media strategy'),
(62, N'Campaign planning'),
(62, N'Email support'),
-- Henrik Andersson's Lite mentorship (plan 64)
(64, N'2 calls per month (75min/call)'),
(64, N'Blockchain development'),
(64, N'Smart contract guidance'),
(64, N'Email support'),
-- Henrik Andersson's Standard mentorship (plan 65)
(65, N'4 calls per month (90min/call)'),
(65, N'Advanced Web3 development'),
(65, N'DeFi and NFT projects'),
(65, N'Tokenomics consultation'),
(65, N'Chat and email support'),
-- Rachel Cohen's Lite mentorship (plan 67)
(67, N'2 calls per month (60min/call)'),
(67, N'Motion graphics training'),
(67, N'Animation techniques'),
(67, N'Email support'),
-- Mohammed Ahmed's Lite mentorship (plan 69)
(69, N'2 calls per month (75min/call)'),
(69, N'IoT development guidance'),
(69, N'Embedded systems'),
(69, N'Email support'),
-- Yuki Tanaka's Lite mentorship (plan 71)
(71, N'2 calls per month (60min/call)'),
(71, N'Technical writing guidance'),
(71, N'Documentation best practices'),
(71, N'Email support'),
-- Lucas Silva's Lite mentorship (plan 73)
(73, N'2 calls per month (60min/call)'),
(73, N'Test automation guidance'),
(73, N'QA best practices'),
(73, N'Email support'),
-- Chloe Martin's Lite mentorship (plan 75)
(75, N'2 calls per month (60min/call)'),
(75, N'E-commerce strategy'),
(75, N'Conversion optimization'),
(75, N'Email support'),
-- Erik Hansen's Lite mentorship (plan 77)
(77, N'2 calls per month (75min/call)'),
(77, N'Site reliability engineering'),
(77, N'Monitoring and observability'),
(77, N'Email support'),
-- Sophia Nguyen's Lite mentorship (plan 79)
(79, N'2 calls per month (90min/call)'),
(79, N'Startup strategy guidance'),
(79, N'Fundraising consultation'),
(79, N'Email support'),
-- Sophia Nguyen's Standard mentorship (plan 80)
(80, N'4 calls per month (90min/call)'),
(80, N'Comprehensive startup guidance'),
(80, N'Investor pitch preparation'),
(80, N'Growth strategy'),
(80, N'Priority chat support');

-- Insert Discounts
INSERT INTO discounts (discount_name, discount_type, discount_value, start_date, end_date, status, usage_limit, used_count)
VALUES
(N'WELCOME10', N'Percentage', 10.00, '2025-01-01', '2026-12-31', N'Active', 1000, 15),
(N'SAVE20', N'Percentage', 20.00, '2025-06-01', '2026-06-30', N'Active', 500, 42),
(N'FIRST50', N'Fixed', 50.00, '2025-01-01', '2026-12-31', N'Active', 200, 67),
(N'MENTOR25', N'Percentage', 25.00, '2025-09-01', '2025-03-31', N'Active', 300, 89),
(N'EARLYBIRD', N'Percentage', 15.00, '2025-01-01', '2026-12-31', N'Inactive', 150, 150);

-- Insert Plan Registrations
INSERT INTO plan_registerations (message, discount_id)
VALUES
(N'Looking forward to learning web development with John!', 1),
(N'Excited to improve my design skills with Sarah', 2),
(N'Ready to dive into machine learning', 3),
(N'Need guidance on marketing strategies', 4),
(N'Want to advance my career to the next level', 1),
(N'Interested in full-stack development mentorship', 2),
(N'Hope to build better UI/UX for my projects', 3),
(N'Seeking mentorship for cloud architecture', 1),
(N'Want to learn mobile app development', 2),
(N'Looking to improve backend development skills', 3),
(N'Interested in digital transformation consulting', 4),
(N'Need help with system design and architecture', 1),
(N'Want to learn brand strategy', 2),
(N'Looking for cybersecurity guidance', 3),
(N'Interested in product management mentorship', 4),
(N'Ready to dive into AI and deep learning', 1),
(N'Want to improve my graphic design skills', 2),
(N'Seeking full-stack web development guidance', 3),
(N'Need help with SEO and content marketing', 4),
(N'Interested in game development mentorship', 1),
(N'Looking for business analytics guidance', 2),
(N'Want to learn engineering leadership', 3),
(N'Interested in social media marketing', 4),
(N'Ready to explore blockchain development', 1),
(N'Want to learn motion design', 2),
(N'Interested in IoT development', 3),
(N'Need help with technical writing', 4),
(N'Want to learn test automation', 1),
(N'Interested in e-commerce strategy', 2),
(N'Looking for SRE mentorship', 3),
(N'Ready for startup consulting', 4);

-- Insert Bookings (mentee_id, plan_registerations_id, plan_id)
INSERT INTO bookings (mentee_id, plan_registerations_id, plan_id)
VALUES
(31, 1, 1),   -- Alice Smith books John Doe's 30-min session
(32, 2, 4),   -- Bob Wilson books Sarah Johnson's session
(33, 3, 7),   -- Carol Taylor books Michael Chen's session
(34, 4, 11),  -- Daniel Brown books Emily Rodriguez's session
(35, 5, 14),  -- Emma Davis books David Kim's session
(31, 6, 2),   -- Alice Smith books another session with John Doe
(32, 7, 5),   -- Bob Wilson books Sarah's mentorship
(36, 8, 18),  -- Frank Miller books Lisa Anderson's session
(37, 9, 21),  -- Grace Moore books James Martinez's session
(38, 10, 24), -- Henry White books Anna Kowalski's session
(39, 11, 27), -- Iris Clark books Robert Thompson's session
(40, 12, 30), -- Jack Lewis books Maria Garcia's session
(41, 13, 32), -- Kate Hall books Thomas Lee's session
(42, 14, 35), -- Liam Young books Sophie Dubois's session
(43, 15, 37), -- Mia King books Kevin Walsh's session
(44, 16, 40), -- Noah Wright books Laura Muller's session
(45, 17, 43), -- Olivia Scott books Daniel Santos's session
(46, 18, 46), -- Paul Green books Emma Wilson's session
(47, 19, 48), -- Quinn Adams books Marco Rossi's session
(48, 20, 51), -- Ryan Baker books Olivia Brown's session
(49, 21, 53), -- Stella Nelson books Alex Petrov's session
(50, 22, 56), -- Tyler Carter books Nina Singh's session
(31, 23, 58), -- Alice Smith books Patrick OBrien's session
(32, 24, 61), -- Bob Wilson books Isabella Lopez's session
(33, 25, 63), -- Carol Taylor books Henrik Andersson's session
(34, 26, 66), -- Daniel Brown books Rachel Cohen's session
(35, 27, 68), -- Emma Davis books Mohammed Ahmed's session
(36, 28, 70), -- Frank Miller books Yuki Tanaka's session
(37, 29, 72), -- Grace Moore books Lucas Silva's session
(38, 30, 74), -- Henry White books Chloe Martin's session
(39, 31, 76); -- Iris Clark books Erik Hansen's session

-- Insert Slots
INSERT INTO slots (start_time, end_time, date, mentor_id, status, plan_id)
VALUES
-- John Doe's slots (mentor_id 1) - Plans: 1 (30min), 2 (60min), 3 (120min)
('2025-12-10 09:00:00', '2025-12-10 09:30:00', '2025-12-10', 1, N'Booked', 1),
('2025-12-10 10:00:00', '2025-12-10 11:00:00', '2025-12-10', 1, N'Available', 2),
('2025-12-11 14:00:00', '2025-12-11 16:00:00', '2025-12-11', 1, N'Available', 3),
('2025-12-12 09:00:00', '2025-12-12 10:00:00', '2025-12-12', 1, N'Booked', 2),
('2025-12-13 15:00:00', '2025-12-13 15:30:00', '2025-12-13', 1, N'Available', 1),
('2025-12-14 11:00:00', '2025-12-14 13:00:00', '2025-12-14', 1, N'Available', 3),
('2025-12-15 09:30:00', '2025-12-15 10:00:00', '2025-12-15', 1, N'Available', 1),

-- Sarah Johnson's slots (mentor_id 2) - Plans: 4 (60min), 5 (Lite), 6 (Standard)
('2025-12-10 10:00:00', '2025-12-10 11:00:00', '2025-12-10', 2, N'Booked', 4),
('2025-12-11 13:00:00', '2025-12-11 14:00:00', '2025-12-11', 2, N'Available', 5),
('2025-12-12 11:00:00', '2025-12-12 12:00:00', '2025-12-12', 2, N'Available', 6),
('2025-12-13 09:00:00', '2025-12-13 10:00:00', '2025-12-13', 2, N'Available', 4),
('2025-12-14 14:00:00', '2025-12-14 15:00:00', '2025-12-14', 2, N'Booked', 5),
('2025-12-15 10:00:00', '2025-12-15 11:00:00', '2025-12-15', 2, N'Available', 6),

-- Michael Chen's slots (mentor_id 3) - Plans: 7 (75min), 8 (130min), 9 (Standard), 10 (Premium)
('2025-12-10 11:00:00', '2025-12-10 12:15:00', '2025-12-10', 3, N'Booked', 7),
('2025-12-11 15:00:00', '2025-12-11 17:00:00', '2025-12-11', 3, N'Available', 8),
('2025-12-12 10:00:00', '2025-12-12 11:00:00', '2025-12-12', 3, N'Available', 9),
('2025-12-13 13:00:00', '2025-12-13 14:00:00', '2025-12-13', 3, N'Available', 10),
('2025-12-14 09:00:00', '2025-12-14 10:15:00', '2025-12-14', 3, N'Available', 7),
('2025-12-15 14:00:00', '2025-12-15 16:00:00', '2025-12-15', 3, N'Available', 8),

-- Emily Rodriguez's slots (mentor_id 4) - Plans: 11 (45min), 12 (Lite), 13 (Standard)
('2025-12-10 12:00:00', '2025-12-10 12:45:00', '2025-12-10', 4, N'Booked', 11),
('2025-12-11 10:00:00', '2025-12-11 10:45:00', '2025-12-11', 4, N'Available', 12),
('2025-12-12 14:00:00', '2025-12-12 15:00:00', '2025-12-12', 4, N'Available', 13),
('2025-12-13 11:00:00', '2025-12-13 11:45:00', '2025-12-13', 4, N'Available', 11),
('2025-12-14 15:00:00', '2025-12-14 16:00:00', '2025-12-14', 4, N'Available', 12),
('2025-12-15 09:00:00', '2025-12-15 10:00:00', '2025-12-15', 4, N'Available', 13),

-- David Kim's slots (mentor_id 5) - Plans: 14 (70min), 15 (120min), 16 (Lite), 17 (Premium)
('2025-12-10 13:00:00', '2025-12-10 14:10:00', '2025-12-10', 5, N'Booked', 14),
('2025-12-11 09:00:00', '2025-12-11 11:00:00', '2025-12-11', 5, N'Available', 15),
('2025-12-12 15:00:00', '2025-12-12 16:00:00', '2025-12-12', 5, N'Available', 16),
('2025-12-13 10:00:00', '2025-12-13 11:30:00', '2025-12-13', 5, N'Available', 17),
('2025-12-14 13:00:00', '2025-12-14 14:10:00', '2025-12-14', 5, N'Available', 14),
('2025-12-15 11:00:00', '2025-12-15 13:00:00', '2025-12-15', 5, N'Available', 15),

-- Lisa Anderson's slots (mentor_id 6) - Plans: 18 (85min), 19 (Lite), 20 (Standard)
('2025-12-10 14:00:00', '2025-12-10 15:25:00', '2025-12-10', 6, N'Booked', 18),
('2025-12-11 10:00:00', '2025-12-11 11:00:00', '2025-12-11', 6, N'Available', 19),
('2025-12-12 13:00:00', '2025-12-12 14:30:00', '2025-12-12', 6, N'Available', 20),
('2025-12-13 09:00:00', '2025-12-13 10:25:00', '2025-12-13', 6, N'Available', 18),
('2025-12-14 15:00:00', '2025-12-14 16:00:00', '2025-12-14', 6, N'Available', 19),

-- James Martinez's slots (mentor_id 7) - Plans: 21 (65min), 22 (Lite), 23 (Standard)
('2025-12-10 09:00:00', '2025-12-10 10:05:00', '2025-12-10', 7, N'Booked', 21),
('2025-12-11 14:00:00', '2025-12-11 15:00:00', '2025-12-11', 7, N'Available', 22),
('2025-12-12 10:00:00', '2025-12-12 11:15:00', '2025-12-12', 7, N'Available', 23),
('2025-12-13 13:00:00', '2025-12-13 14:05:00', '2025-12-13', 7, N'Available', 21),
('2025-12-14 11:00:00', '2025-12-14 12:00:00', '2025-12-14', 7, N'Available', 22),

-- Anna Kowalski's slots (mentor_id 8) - Plans: 24 (55min), 25 (Lite), 26 (Standard)
('2025-12-10 10:00:00', '2025-12-10 10:55:00', '2025-12-10', 8, N'Booked', 24),
('2025-12-11 13:00:00', '2025-12-11 14:00:00', '2025-12-11', 8, N'Available', 25),
('2025-12-12 15:00:00', '2025-12-12 16:00:00', '2025-12-12', 8, N'Available', 26),
('2025-12-13 09:00:00', '2025-12-13 09:55:00', '2025-12-13', 8, N'Available', 24),
('2025-12-14 14:00:00', '2025-12-14 15:00:00', '2025-12-14', 8, N'Available', 25),

-- Robert Thompson's slots (mentor_id 9) - Plans: 27 (70min), 28 (Lite), 29 (Standard)
('2025-12-10 11:00:00', '2025-12-10 12:10:00', '2025-12-10', 9, N'Booked', 27),
('2025-12-11 09:00:00', '2025-12-11 10:00:00', '2025-12-11', 9, N'Available', 28),
('2025-12-12 14:00:00', '2025-12-12 15:30:00', '2025-12-12', 9, N'Available', 29),
('2025-12-13 10:00:00', '2025-12-13 11:10:00', '2025-12-13', 9, N'Available', 27),
('2025-12-14 13:00:00', '2025-12-14 14:00:00', '2025-12-14', 9, N'Available', 28),

-- Maria Garcia's slots (mentor_id 10) - Plans: 30 (80min), 31 (Lite)
('2025-12-10 13:00:00', '2025-12-10 14:20:00', '2025-12-10', 10, N'Booked', 30),
('2025-12-11 10:00:00', '2025-12-11 11:00:00', '2025-12-11', 10, N'Available', 31),
('2025-12-12 15:00:00', '2025-12-12 16:20:00', '2025-12-12', 10, N'Available', 30),
('2025-12-13 11:00:00', '2025-12-13 12:00:00', '2025-12-13', 10, N'Available', 31),
('2025-12-14 09:00:00', '2025-12-14 10:20:00', '2025-12-14', 10, N'Available', 30),

-- Thomas Lee's slots (mentor_id 11) - Plans: 32 (90min), 33 (Lite), 34 (Premium)
('2025-12-10 09:00:00', '2025-12-10 10:30:00', '2025-12-10', 11, N'Booked', 32),
('2025-12-11 14:00:00', '2025-12-11 15:15:00', '2025-12-11', 11, N'Available', 33),
('2025-12-12 10:00:00', '2025-12-12 11:30:00', '2025-12-12', 11, N'Available', 34),
('2025-12-13 13:00:00', '2025-12-13 14:30:00', '2025-12-13', 11, N'Available', 32),
('2025-12-14 09:00:00', '2025-12-14 10:15:00', '2025-12-14', 11, N'Available', 33),

-- Sophie Dubois's slots (mentor_id 12) - Plans: 35 (75min), 36 (Lite)
('2025-12-10 11:00:00', '2025-12-10 12:15:00', '2025-12-10', 12, N'Booked', 35),
('2025-12-11 09:00:00', '2025-12-11 10:00:00', '2025-12-11', 12, N'Available', 36),
('2025-12-12 14:00:00', '2025-12-12 15:15:00', '2025-12-12', 12, N'Available', 35),
('2025-12-13 10:00:00', '2025-12-13 11:00:00', '2025-12-13', 12, N'Available', 36),
('2025-12-14 15:00:00', '2025-12-14 16:15:00', '2025-12-14', 12, N'Available', 35),

-- Kevin Walsh's slots (mentor_id 13) - Plans: 37 (95min), 38 (Lite), 39 (Standard)
('2025-12-10 10:00:00', '2025-12-10 11:35:00', '2025-12-10', 13, N'Booked', 37),
('2025-12-11 13:00:00', '2025-12-11 14:00:00', '2025-12-11', 13, N'Available', 38),
('2025-12-12 09:00:00', '2025-12-12 10:30:00', '2025-12-12', 13, N'Available', 39),
('2025-12-13 14:00:00', '2025-12-13 15:35:00', '2025-12-13', 13, N'Available', 37),
('2025-12-14 11:00:00', '2025-12-14 12:00:00', '2025-12-14', 13, N'Available', 38),

-- Laura Muller's slots (mentor_id 14) - Plans: 40 (65min), 41 (Lite), 42 (Standard)
('2025-12-10 13:00:00', '2025-12-10 14:05:00', '2025-12-10', 14, N'Booked', 40),
('2025-12-11 10:00:00', '2025-12-11 11:00:00', '2025-12-11', 14, N'Available', 41),
('2025-12-12 15:00:00', '2025-12-12 16:15:00', '2025-12-12', 14, N'Available', 42),
('2025-12-13 09:00:00', '2025-12-13 10:05:00', '2025-12-13', 14, N'Available', 40),
('2025-12-14 13:00:00', '2025-12-14 14:00:00', '2025-12-14', 14, N'Available', 41),

-- Daniel Santos's slots (mentor_id 15) - Plans: 43 (85min), 44 (Standard), 45 (Premium)
('2025-12-10 09:00:00', '2025-12-10 10:25:00', '2025-12-10', 15, N'Booked', 43),
('2025-12-11 14:00:00', '2025-12-11 15:30:00', '2025-12-11', 15, N'Available', 44),
('2025-12-12 10:00:00', '2025-12-12 11:30:00', '2025-12-12', 15, N'Available', 45),
('2025-12-13 13:00:00', '2025-12-13 14:25:00', '2025-12-13', 15, N'Available', 43),
('2025-12-14 09:00:00', '2025-12-14 10:30:00', '2025-12-14', 15, N'Available', 44),

-- Emma Wilson's slots (mentor_id 16) - Plans: 46 (50min), 47 (Lite)
('2025-12-10 11:00:00', '2025-12-10 11:50:00', '2025-12-10', 16, N'Booked', 46),
('2025-12-11 09:00:00', '2025-12-11 10:00:00', '2025-12-11', 16, N'Available', 47),
('2025-12-12 14:00:00', '2025-12-12 14:50:00', '2025-12-12', 16, N'Available', 46),
('2025-12-13 10:00:00', '2025-12-13 11:00:00', '2025-12-13', 16, N'Available', 47),
('2025-12-14 15:00:00', '2025-12-14 15:50:00', '2025-12-14', 16, N'Available', 46),

-- Marco Rossi's slots (mentor_id 17) - Plans: 48 (60min), 49 (Lite), 50 (Standard)
('2025-12-10 10:00:00', '2025-12-10 11:00:00', '2025-12-10', 17, N'Booked', 48),
('2025-12-11 13:00:00', '2025-12-11 14:00:00', '2025-12-11', 17, N'Available', 49),
('2025-12-12 09:00:00', '2025-12-12 10:15:00', '2025-12-12', 17, N'Available', 50),
('2025-12-13 14:00:00', '2025-12-13 15:00:00', '2025-12-13', 17, N'Available', 48),
('2025-12-14 11:00:00', '2025-12-14 12:00:00', '2025-12-14', 17, N'Available', 49),

-- Olivia Brown's slots (mentor_id 18) - Plans: 51 (55min), 52 (Lite)
('2025-12-10 13:00:00', '2025-12-10 13:55:00', '2025-12-10', 18, N'Booked', 51),
('2025-12-11 10:00:00', '2025-12-11 11:00:00', '2025-12-11', 18, N'Available', 52),
('2025-12-12 15:00:00', '2025-12-12 15:55:00', '2025-12-12', 18, N'Available', 51),
('2025-12-13 09:00:00', '2025-12-13 10:00:00', '2025-12-13', 18, N'Available', 52),
('2025-12-14 14:00:00', '2025-12-14 14:55:00', '2025-12-14', 18, N'Available', 51),

-- Alex Petrov's slots (mentor_id 19) - Plans: 53 (70min), 54 (Lite), 55 (Standard)
('2025-12-10 09:00:00', '2025-12-10 10:10:00', '2025-12-10', 19, N'Booked', 53),
('2025-12-11 14:00:00', '2025-12-11 15:15:00', '2025-12-11', 19, N'Available', 54),
('2025-12-12 10:00:00', '2025-12-12 11:30:00', '2025-12-12', 19, N'Available', 55),
('2025-12-13 13:00:00', '2025-12-13 14:10:00', '2025-12-13', 19, N'Available', 53),
('2025-12-14 09:00:00', '2025-12-14 10:15:00', '2025-12-14', 19, N'Available', 54),

-- Nina Singh's slots (mentor_id 20) - Plans: 56 (60min), 57 (Lite)
('2025-12-10 11:00:00', '2025-12-10 12:00:00', '2025-12-10', 20, N'Booked', 56),
('2025-12-11 09:00:00', '2025-12-11 10:00:00', '2025-12-11', 20, N'Available', 57),
('2025-12-12 14:00:00', '2025-12-12 15:00:00', '2025-12-12', 20, N'Available', 56),
('2025-12-13 10:00:00', '2025-12-13 11:00:00', '2025-12-13', 20, N'Available', 57),
('2025-12-14 15:00:00', '2025-12-14 16:00:00', '2025-12-14', 20, N'Available', 56),

-- Patrick OBrien's slots (mentor_id 21) - Plans: 58 (75min), 59 (Lite), 60 (Standard)
('2025-12-10 10:00:00', '2025-12-10 11:15:00', '2025-12-10', 21, N'Booked', 58),
('2025-12-11 13:00:00', '2025-12-11 14:00:00', '2025-12-11', 21, N'Available', 59),
('2025-12-12 09:00:00', '2025-12-12 10:30:00', '2025-12-12', 21, N'Available', 60),
('2025-12-13 14:00:00', '2025-12-13 15:15:00', '2025-12-13', 21, N'Available', 58),
('2025-12-14 11:00:00', '2025-12-14 12:00:00', '2025-12-14', 21, N'Available', 59),

-- Isabella Lopez's slots (mentor_id 22) - Plans: 61 (50min), 62 (Lite)
('2025-12-10 13:00:00', '2025-12-10 13:50:00', '2025-12-10', 22, N'Booked', 61),
('2025-12-11 10:00:00', '2025-12-11 11:00:00', '2025-12-11', 22, N'Available', 62),
('2025-12-12 15:00:00', '2025-12-12 15:50:00', '2025-12-12', 22, N'Available', 61),
('2025-12-13 09:00:00', '2025-12-13 10:00:00', '2025-12-13', 22, N'Available', 62),
('2025-12-14 14:00:00', '2025-12-14 14:50:00', '2025-12-14', 22, N'Available', 61),

-- Henrik Andersson's slots (mentor_id 23) - Plans: 63 (90min), 64 (Lite), 65 (Standard)
('2025-12-10 09:00:00', '2025-12-10 10:30:00', '2025-12-10', 23, N'Booked', 63),
('2025-12-11 14:00:00', '2025-12-11 15:15:00', '2025-12-11', 23, N'Available', 64),
('2025-12-12 10:00:00', '2025-12-12 11:30:00', '2025-12-12', 23, N'Available', 65),
('2025-12-13 13:00:00', '2025-12-13 14:30:00', '2025-12-13', 23, N'Available', 63),
('2025-12-14 09:00:00', '2025-12-14 10:15:00', '2025-12-14', 23, N'Available', 64),

-- Rachel Cohen's slots (mentor_id 24) - Plans: 66 (65min), 67 (Lite)
('2025-12-10 11:00:00', '2025-12-10 12:05:00', '2025-12-10', 24, N'Booked', 66),
('2025-12-11 09:00:00', '2025-12-11 10:00:00', '2025-12-11', 24, N'Available', 67),
('2025-12-12 14:00:00', '2025-12-12 15:05:00', '2025-12-12', 24, N'Available', 66),
('2025-12-13 10:00:00', '2025-12-13 11:00:00', '2025-12-13', 24, N'Available', 67),
('2025-12-14 15:00:00', '2025-12-14 16:05:00', '2025-12-14', 24, N'Available', 66),

-- Mohammed Ahmed's slots (mentor_id 25) - Plans: 68 (75min), 69 (Lite)
('2025-12-10 10:00:00', '2025-12-10 11:15:00', '2025-12-10', 25, N'Booked', 68),
('2025-12-11 13:00:00', '2025-12-11 14:15:00', '2025-12-11', 25, N'Available', 69),
('2025-12-12 09:00:00', '2025-12-12 10:15:00', '2025-12-12', 25, N'Available', 68),
('2025-12-13 14:00:00', '2025-12-13 15:15:00', '2025-12-13', 25, N'Available', 69),
('2025-12-14 11:00:00', '2025-12-14 12:15:00', '2025-12-14', 25, N'Available', 68),

-- Yuki Tanaka's slots (mentor_id 26) - Plans: 70 (55min), 71 (Lite)
('2025-12-10 13:00:00', '2025-12-10 13:55:00', '2025-12-10', 26, N'Booked', 70),
('2025-12-11 10:00:00', '2025-12-11 11:00:00', '2025-12-11', 26, N'Available', 71),
('2025-12-12 15:00:00', '2025-12-12 15:55:00', '2025-12-12', 26, N'Available', 70),
('2025-12-13 09:00:00', '2025-12-13 10:00:00', '2025-12-13', 26, N'Available', 71),
('2025-12-14 14:00:00', '2025-12-14 14:55:00', '2025-12-14', 26, N'Available', 70),

-- Lucas Silva's slots (mentor_id 27) - Plans: 72 (60min), 73 (Lite)
('2025-12-10 09:00:00', '2025-12-10 10:00:00', '2025-12-10', 27, N'Booked', 72),
('2025-12-11 14:00:00', '2025-12-11 15:00:00', '2025-12-11', 27, N'Available', 73),
('2025-12-12 10:00:00', '2025-12-12 11:00:00', '2025-12-12', 27, N'Available', 72),
('2025-12-13 13:00:00', '2025-12-13 14:00:00', '2025-12-13', 27, N'Available', 73),
('2025-12-14 09:00:00', '2025-12-14 10:00:00', '2025-12-14', 27, N'Available', 72),

-- Chloe Martin's slots (mentor_id 28) - Plans: 74 (65min), 75 (Lite)
('2025-12-10 11:00:00', '2025-12-10 12:05:00', '2025-12-10', 28, N'Booked', 74),
('2025-12-11 09:00:00', '2025-12-11 10:00:00', '2025-12-11', 28, N'Available', 75),
('2025-12-12 14:00:00', '2025-12-12 15:05:00', '2025-12-12', 28, N'Available', 74),
('2025-12-13 10:00:00', '2025-12-13 11:00:00', '2025-12-13', 28, N'Available', 75),
('2025-12-14 15:00:00', '2025-12-14 16:05:00', '2025-12-14', 28, N'Available', 74),

-- Erik Hansen's slots (mentor_id 29) - Plans: 76 (80min), 77 (Lite)
('2025-12-10 10:00:00', '2025-12-10 11:20:00', '2025-12-10', 29, N'Booked', 76),
('2025-12-11 13:00:00', '2025-12-11 14:15:00', '2025-12-11', 29, N'Available', 77),
('2025-12-12 09:00:00', '2025-12-12 10:20:00', '2025-12-12', 29, N'Available', 76),
('2025-12-13 14:00:00', '2025-12-13 15:15:00', '2025-12-13', 29, N'Available', 77),
('2025-12-14 11:00:00', '2025-12-14 12:20:00', '2025-12-14', 29, N'Available', 76),

-- Sophia Nguyen's slots (mentor_id 30) - Plans: 78 (85min), 79 (Lite), 80 (Standard)
('2025-12-10 13:00:00', '2025-12-10 14:25:00', '2025-12-10', 30, N'Available', 78),
('2025-12-11 10:00:00', '2025-12-11 11:30:00', '2025-12-11', 30, N'Available', 79),
('2025-12-12 15:00:00', '2025-12-12 16:30:00', '2025-12-12', 30, N'Available', 80),
('2025-12-13 09:00:00', '2025-12-13 10:25:00', '2025-12-13', 30, N'Available', 78),
('2025-12-14 14:00:00', '2025-12-14 15:30:00', '2025-12-14', 30, N'Available', 79);

-- Insert Invoices
INSERT INTO invoices (plan_registerations_id, method, paid_time, mentee_id, payment_status, currency, amount_subtotal, amount_total)
VALUES
-- Invoices for all 31 plan registrations
(1, N'Credit Card', '2025-12-05 10:30:00', 31, N'paid', N'usd', 50.00, 45.00),    -- Alice's first booking (50 - 10% = 45)
(2, N'PayPal', '2025-12-05 11:15:00', 32, N'paid', N'usd', 60.00, 48.00),         -- Bob's booking (60 - 20% = 48)
(3, N'Credit Card', '2025-12-05 12:00:00', 33, N'paid', N'usd', 75.00, 25.00),    -- Carol's booking (75 - 50 = 25)
(4, N'Debit Card', '2025-12-05 13:45:00', 34, N'paid', N'usd', 45.00, 33.75),     -- Daniel's booking (45 - 25% = 33.75)
(5, N'Credit Card', '2025-12-05 14:20:00', 35, N'paid', N'usd', 70.00, 63.00),    -- Emma's booking (70 - 10% = 63)
(6, N'PayPal', '2025-12-06 09:00:00', 31, N'paid', N'usd', 90.00, 72.00),         -- Alice's second booking (90 - 20% = 72)
(7, N'Credit Card', '2025-12-06 10:30:00', 32, N'paid', N'usd', 199.00, 149.00), -- Bob's mentorship (199 - 50 = 149)
(8, N'Credit Card', '2025-12-06 11:00:00', 36, N'paid', N'usd', 85.00, 76.50),    -- Frank's booking (85 - 10% = 76.5)
(9, N'PayPal', '2025-12-06 12:00:00', 37, N'paid', N'usd', 65.00, 52.00),         -- Grace's booking (65 - 20% = 52)
(10, N'Debit Card', '2025-12-06 13:00:00', 38, N'paid', N'usd', 55.00, 5.00),      -- Henry's booking (55 - 50 = 5)
(11, N'Credit Card', '2025-12-06 14:00:00', 39, N'paid', N'usd', 70.00, 52.50),   -- Iris's booking (70 - 25% = 52.5)
(12, N'PayPal', '2025-12-06 15:00:00', 40, N'paid', N'usd', 80.00, 72.00),        -- Jack's booking (80 - 10% = 72)
(13, N'Credit Card', '2025-12-07 09:00:00', 41, N'paid', N'usd', 90.00, 81.00),   -- Kate's booking (90 - 10% = 81)
(14, N'Debit Card', '2025-12-07 10:00:00', 42, N'paid', N'usd', 75.00, 60.00),    -- Liam's booking (75 - 20% = 60)
(15, N'Credit Card', '2025-12-07 11:00:00', 43, N'paid', N'usd', 95.00, 45.00),   -- Mia's booking (95 - 50 = 45)
(16, N'PayPal', '2025-12-07 12:00:00', 44, N'paid', N'usd', 65.00, 48.75),        -- Noah's booking (65 - 25% = 48.75)
(17, N'Credit Card', '2025-12-07 13:00:00', 45, N'paid', N'usd', 85.00, 76.50),   -- Olivia's booking (85 - 10% = 76.5)
(18, N'Debit Card', '2025-12-07 14:00:00', 46, N'paid', N'usd', 50.00, 40.00),    -- Paul's booking (50 - 20% = 40)
(19, N'Credit Card', '2025-12-07 15:00:00', 47, N'paid', N'usd', 60.00, 10.00),   -- Quinn's booking (60 - 50 = 10)
(20, N'PayPal', '2025-12-07 16:00:00', 48, N'paid', N'usd', 55.00, 41.25),        -- Ryan's booking (55 - 25% = 41.25)
(21, N'Credit Card', '2025-12-08 09:00:00', 49, N'paid', N'usd', 70.00, 63.00),   -- Stella's booking (70 - 10% = 63)
(22, N'Debit Card', '2025-12-08 10:00:00', 50, N'paid', N'usd', 60.00, 48.00),    -- Tyler's booking (60 - 20% = 48)
(23, N'Credit Card', '2025-12-08 11:00:00', 31, N'paid', N'usd', 75.00, 25.00),   -- Alice's third booking (75 - 50 = 25)
(24, N'PayPal', '2025-12-08 12:00:00', 32, N'paid', N'usd', 50.00, 37.50),        -- Bob's second booking (50 - 25% = 37.5)
(25, N'Credit Card', '2025-12-08 13:00:00', 33, N'paid', N'usd', 90.00, 81.00),   -- Carol's booking (90 - 10% = 81)
(26, N'Debit Card', '2025-12-08 14:00:00', 34, N'paid', N'usd', 65.00, 52.00),    -- Daniel's booking (65 - 20% = 52)
(27, N'Credit Card', '2025-12-08 15:00:00', 35, N'paid', N'usd', 75.00, 25.00),   -- Emma's booking (75 - 50 = 25)
(28, N'PayPal', '2025-12-08 16:00:00', 36, N'paid', N'usd', 55.00, 41.25),        -- Frank's booking (55 - 25% = 41.25)
(29, N'Credit Card', '2025-12-09 09:00:00', 37, N'paid', N'usd', 60.00, 54.00),   -- Grace's booking (60 - 10% = 54)
(30, N'Debit Card', '2025-12-09 10:00:00', 38, N'paid', N'usd', 65.00, 52.00),    -- Henry's booking (65 - 20% = 52)
(31, N'Credit Card', '2025-12-09 11:00:00', 39, N'paid', N'usd', 80.00, 72.00);   -- Iris's booking (80 - 10% = 72)

-- Insert Meetings
INSERT INTO meetings (invoice_id, plan_registerations_id, status, location, start_time, end_time, date, mentor_id)
VALUES
-- Meeting 1: Alice's first booking with John Doe (30 min)
(1, 1, N'Scheduled', N'https://zoom.us/j/123456789', '2025-12-10 09:00:00', '2025-12-10 09:30:00', '2025-12-10', 1),
-- Meeting 2: Bob's booking with Sarah Johnson (60 min)
(2, 2, N'Scheduled', N'https://meet.google.com/abc-defg-hij', '2025-12-10 10:00:00', '2025-12-10 11:00:00', '2025-12-10', 2),
-- Meeting 3: Carol's booking with Michael Chen (75 min)
(3, 3, N'Scheduled', N'https://zoom.us/j/987654321', '2025-12-10 11:00:00', '2025-12-10 12:15:00', '2025-12-10', 3),
-- Meeting 4: Daniel's booking with Emily Rodriguez (45 min)
(4, 4, N'Scheduled', N'https://meet.google.com/xyz-uvwx-yza', '2025-12-10 12:00:00', '2025-12-10 12:45:00', '2025-12-10', 4),
-- Meeting 5: Emma's booking with David Kim (70 min)
(5, 5, N'Scheduled', N'https://zoom.us/j/555666777', '2025-12-10 13:00:00', '2025-12-10 14:10:00', '2025-12-10', 5),
-- Meeting 6: Alice's second booking with John Doe (60 min)
(6, 6, N'Scheduled', N'https://zoom.us/j/111222333', '2025-12-12 09:00:00', '2025-12-12 10:00:00', '2025-12-12', 1),
-- Meeting 7: Bob's mentorship with Sarah (60 min)
(7, 7, N'Pending', N'', '2025-12-14 14:00:00', '2025-12-14 15:00:00', '2025-12-14', 2),
-- Meeting 8: Frank's booking with Lisa Anderson (85 min)
(8, 8, N'Scheduled', N'https://zoom.us/j/888999000', '2025-12-10 14:00:00', '2025-12-10 15:25:00', '2025-12-10', 6),
-- Meeting 9: Grace's booking with James Martinez (65 min)
(9, 9, N'Scheduled', N'https://meet.google.com/ghi-jklm-nop', '2025-12-10 09:00:00', '2025-12-10 10:05:00', '2025-12-10', 7),
-- Meeting 10: Henry's booking with Anna Kowalski (55 min)
(10, 10, N'Scheduled', N'https://zoom.us/j/444555666', '2025-12-10 10:00:00', '2025-12-10 10:55:00', '2025-12-10', 8),
-- Meeting 11: Iris's booking with Robert Thompson (70 min)
(11, 11, N'Scheduled', N'https://meet.google.com/qrs-tuvw-xyz', '2025-12-10 11:00:00', '2025-12-10 12:10:00', '2025-12-10', 9),
-- Meeting 12: Jack's booking with Maria Garcia (80 min)
(12, 12, N'Scheduled', N'https://zoom.us/j/777888999', '2025-12-10 13:00:00', '2025-12-10 14:20:00', '2025-12-10', 10),
-- Meeting 13: Kate's booking with Thomas Lee (90 min)
(13, 13, N'Scheduled', N'https://meet.google.com/abc-123-def', '2025-12-10 09:00:00', '2025-12-10 10:30:00', '2025-12-10', 11),
-- Meeting 14: Liam's booking with Sophie Dubois (75 min)
(14, 14, N'Scheduled', N'https://zoom.us/j/333444555', '2025-12-10 11:00:00', '2025-12-10 12:15:00', '2025-12-10', 12),
-- Meeting 15: Mia's booking with Kevin Walsh (95 min)
(15, 15, N'Scheduled', N'https://meet.google.com/mno-pqr-stu', '2025-12-10 10:00:00', '2025-12-10 11:35:00', '2025-12-10', 13),
-- Meeting 16: Noah's booking with Laura Muller (65 min)
(16, 16, N'Scheduled', N'https://zoom.us/j/666777888', '2025-12-10 13:00:00', '2025-12-10 14:05:00', '2025-12-10', 14),
-- Meeting 17: Olivia's booking with Daniel Santos (85 min)
(17, 17, N'Scheduled', N'https://meet.google.com/vwx-yza-bcd', '2025-12-10 09:00:00', '2025-12-10 10:25:00', '2025-12-10', 15),
-- Meeting 18: Paul's booking with Emma Wilson (50 min)
(18, 18, N'Scheduled', N'https://zoom.us/j/999000111', '2025-12-10 11:00:00', '2025-12-10 11:50:00', '2025-12-10', 16),
-- Meeting 19: Quinn's booking with Marco Rossi (60 min)
(19, 19, N'Scheduled', N'https://meet.google.com/efg-hij-klm', '2025-12-10 10:00:00', '2025-12-10 11:00:00', '2025-12-10', 17),
-- Meeting 20: Ryan's booking with Olivia Brown (55 min)
(20, 20, N'Scheduled', N'https://zoom.us/j/222333444', '2025-12-10 13:00:00', '2025-12-10 13:55:00', '2025-12-10', 18),
-- Meeting 21: Stella's booking with Alex Petrov (70 min)
(21, 21, N'Scheduled', N'https://meet.google.com/nop-qrs-tuv', '2025-12-10 09:00:00', '2025-12-10 10:10:00', '2025-12-10', 19),
-- Meeting 22: Tyler's booking with Nina Singh (60 min)
(22, 22, N'Scheduled', N'https://zoom.us/j/555666777', '2025-12-10 11:00:00', '2025-12-10 12:00:00', '2025-12-10', 20),
-- Meeting 23: Alice's third booking with Patrick OBrien (75 min)
(23, 23, N'Scheduled', N'https://meet.google.com/wxy-zab-cde', '2025-12-10 10:00:00', '2025-12-10 11:15:00', '2025-12-10', 21),
-- Meeting 24: Bob's second booking with Isabella Lopez (50 min)
(24, 24, N'Scheduled', N'https://zoom.us/j/888999000', '2025-12-10 13:00:00', '2025-12-10 13:50:00', '2025-12-10', 22),
-- Meeting 25: Carol's booking with Henrik Andersson (90 min)
(25, 25, N'Scheduled', N'https://meet.google.com/fgh-ijk-lmn', '2025-12-10 09:00:00', '2025-12-10 10:30:00', '2025-12-10', 23),
-- Meeting 26: Daniel's booking with Rachel Cohen (65 min)
(26, 26, N'Scheduled', N'https://zoom.us/j/111222333', '2025-12-10 11:00:00', '2025-12-10 12:05:00', '2025-12-10', 24),
-- Meeting 27: Emma's booking with Mohammed Ahmed (75 min)
(27, 27, N'Scheduled', N'https://meet.google.com/opq-rst-uvw', '2025-12-10 10:00:00', '2025-12-10 11:15:00', '2025-12-10', 25),
-- Meeting 28: Frank's booking with Yuki Tanaka (55 min)
(28, 28, N'Scheduled', N'https://zoom.us/j/444555666', '2025-12-10 13:00:00', '2025-12-10 13:55:00', '2025-12-10', 26),
-- Meeting 29: Grace's booking with Lucas Silva (60 min)
(29, 29, N'Scheduled', N'https://meet.google.com/xyz-abc-def', '2025-12-10 09:00:00', '2025-12-10 10:00:00', '2025-12-10', 27),
-- Meeting 30: Henry's booking with Chloe Martin (65 min)
(30, 30, N'Scheduled', N'https://zoom.us/j/777888999', '2025-12-10 11:00:00', '2025-12-10 12:05:00', '2025-12-10', 28),
-- Meeting 31: Iris's booking with Erik Hansen (80 min)
(31, 31, N'Scheduled', N'https://meet.google.com/ghi-jkl-mno', '2025-12-10 10:00:00', '2025-12-10 11:20:00', '2025-12-10', 29);

-- Insert Feedbacks (only for mentees who have booked at least one session with mentors)
INSERT INTO feedbacks (mentee_id, mentor_id, stars, content, sent_time)
VALUES
-- Alice Smith (mentee_id 31) feedback - has bookings with mentors 1, 21
(31, 1, 5, N'Excellent mentor! John provided great insights on React architecture and helped me understand complex concepts easily. Multiple sessions were incredibly valuable.', '2025-12-11 16:30:00'),
(31, 21, 4, N'Patrick gave solid advice on engineering management. Very practical and actionable insights.', '2025-12-11 14:30:00'),
-- Bob Wilson (mentee_id 32) feedback - has bookings with mentors 2, 22
(32, 2, 5, N'Sarah is amazing! Her design feedback was spot-on and really helped improve my portfolio. The mentorship program is fantastic.', '2025-12-11 19:45:00'),
(32, 22, 4, N'Isabella provided great social media strategy tips. My engagement has improved significantly!', '2025-12-11 15:45:00'),
-- Carol Taylor (mentee_id 33) feedback - has bookings with mentors 3, 23
(33, 3, 4, N'Very knowledgeable about ML. Michael explained neural networks in a way that finally made sense to me.', '2025-12-11 13:30:00'),
(33, 23, 5, N'Henrik is a blockchain expert! His guidance on smart contracts was invaluable for my project.', '2025-12-11 11:45:00'),
-- Daniel Brown (mentee_id 34) feedback - has bookings with mentors 4, 24
(34, 4, 5, N'Emily helped me create a comprehensive marketing strategy. Results were visible within weeks!', '2025-12-11 14:00:00'),
(34, 24, 4, N'Rachel''s motion design tips transformed my animations. Great mentor with excellent communication.', '2025-12-11 13:20:00'),
-- Emma Davis (mentee_id 35) feedback - has bookings with mentors 5, 25
(35, 5, 5, N'David provided excellent career guidance. His advice on leadership skills was invaluable.', '2025-12-11 15:30:00'),
(35, 25, 4, N'Mohammed''s IoT expertise is impressive. Learned a lot about embedded systems in just one session.', '2025-12-11 12:30:00'),
-- Frank Miller (mentee_id 36) feedback - has bookings with mentors 6, 26
(36, 6, 5, N'Lisa is a cloud architecture guru! Her AWS guidance helped me pass my certification exam.', '2025-12-11 16:45:00'),
(36, 26, 4, N'Yuki taught me how to write clear technical documentation. My team loves the new docs!', '2025-12-11 15:00:00'),
-- Grace Moore (mentee_id 37) feedback - has bookings with mentors 7, 27
(37, 7, 5, N'James made mobile development fun! His practical approach to iOS/Android is perfect for beginners.', '2025-12-11 11:30:00'),
(37, 27, 4, N'Lucas helped me set up a comprehensive test automation framework. Great practical knowledge!', '2025-12-11 11:15:00'),
-- Henry White (mentee_id 38) feedback - has bookings with mentors 8, 28
(38, 8, 5, N'Anna has an amazing eye for design! She helped me create interfaces that users actually love.', '2025-12-11 12:00:00'),
(38, 28, 5, N'Chloe''s e-commerce strategies increased my store conversion rate by 40%! Highly recommend.', '2025-12-11 13:20:00'),
-- Iris Clark (mentee_id 39) feedback - has bookings with mentors 9, 29
(39, 9, 5, N'Robert is a backend wizard! His microservices architecture advice scaled my application perfectly.', '2025-12-11 13:30:00'),
(39, 29, 4, N'Erik''s SRE knowledge is extensive. Monitoring and observability finally make sense to me now.', '2025-12-11 12:45:00'),
-- Jack Lewis (mentee_id 40) feedback - has booking with mentor 10
(40, 10, 4, N'Maria provided valuable insights on digital transformation. Her business perspective is refreshing.', '2025-12-11 15:45:00'),
-- Kate Hall (mentee_id 41) feedback - has booking with mentor 11
(41, 11, 5, N'Thomas''s system design knowledge is phenomenal! Best session I''ve ever had on architecture.', '2025-12-11 11:45:00'),
-- Liam Young (mentee_id 42) feedback - has booking with mentor 12
(42, 12, 5, N'Sophie''s creative direction elevated my brand. She has a unique vision and executes it perfectly.', '2025-12-11 13:30:00'),
-- Mia King (mentee_id 43) feedback - has booking with mentor 13
(43, 13, 5, N'Kevin''s cybersecurity expertise is world-class. Learned so much about ethical hacking!', '2025-12-11 12:50:00'),
-- Noah Wright (mentee_id 44) feedback - has booking with mentor 14
(44, 14, 4, N'Laura taught me product management from scratch. Her framework for prioritization is brilliant.', '2025-12-11 15:20:00'),
-- Olivia Scott (mentee_id 45) feedback - has booking with mentor 15
(45, 15, 5, N'Daniel is at the forefront of AI research. His deep learning insights are cutting-edge!', '2025-12-11 11:40:00'),
-- Paul Green (mentee_id 46) feedback - has booking with mentor 16
(46, 16, 4, N'Emma''s graphic design skills are exceptional. She helped me create a stunning visual identity.', '2025-12-11 13:00:00'),
-- Quinn Adams (mentee_id 47) feedback - has booking with mentor 17
(47, 17, 5, N'Marco is a full-stack master! His clean code principles have transformed my development style.', '2025-12-11 12:15:00'),
-- Ryan Baker (mentee_id 48) feedback - has booking with mentor 18
(48, 18, 5, N'Olivia''s SEO strategies doubled my organic traffic in just two months. Amazing results!', '2025-12-11 15:00:00'),
-- Stella Nelson (mentee_id 49) feedback - has booking with mentor 19
(49, 19, 4, N'Alex''s game development expertise is incredible. Unity tips were exactly what I needed!', '2025-12-11 11:25:00'),
-- Tyler Carter (mentee_id 50) feedback - has booking with mentor 20
(50, 20, 4, N'Nina helped me understand business analytics deeply. Her data visualization skills are top-notch.', '2025-12-11 13:15:00');

-- Insert Notifications
INSERT INTO notifications (title, content)
VALUES
(N'Welcome to Mentoria!', N'Thank you for joining Mentoria. Start your journey by browsing our mentors and booking your first session.'),
(N'New Mentor Available', N'Check out our latest mentors specializing in AI, Machine Learning, and Data Science.'),
(N'Session Reminder', N'Your session is scheduled for tomorrow. Please check your email for meeting details.'),
(N'Special Discount Available', N'Use code SAVE20 to get 20% off your next mentorship booking!'),
(N'Profile Update', N'Don''t forget to complete your profile to help mentors understand your goals better.');

-- Insert Sended (User-Notification relationships)
INSERT INTO sended (u_user_id, n_no_id, sent_time)
VALUES
(31, 1, '2025-12-01 10:00:00'),
(31, 3, '2025-12-02 08:00:00'),
(32, 1, '2025-12-01 10:30:00'),
(32, 3, '2025-12-02 08:30:00'),
(33, 1, '2025-12-01 11:00:00'),
(33, 2, '2025-12-02 14:00:00'),
(34, 1, '2025-12-01 11:30:00'),
(34, 4, '2025-12-02 09:00:00'),
(35, 1, '2025-12-01 12:00:00'),
(35, 5, '2025-12-02 15:00:00'),
(36, 1, '2025-12-01 12:30:00'),
(37, 1, '2025-12-01 13:00:00'),
(38, 1, '2025-12-01 13:30:00'),
(39, 1, '2025-12-01 14:00:00'),
(40, 1, '2025-12-01 14:30:00'),
(41, 1, '2025-12-01 15:00:00'),
(42, 1, '2025-12-01 15:30:00'),
(43, 1, '2025-12-01 16:00:00'),
(44, 1, '2025-12-01 16:30:00'),
(45, 1, '2025-12-01 17:00:00'),
(46, 1, '2025-12-01 17:30:00'),
(47, 1, '2025-12-01 18:00:00'),
(48, 1, '2025-12-01 18:30:00'),
(49, 1, '2025-12-01 19:00:00'),
(50, 1, '2025-12-01 19:30:00');

-- Insert Messages
INSERT INTO messages (content, sent_time, sender_id, receiver_id)
VALUES
(N'Hi John! I''m excited about our upcoming session on React.', '2024-12-08 10:00:00', 31, 1),
(N'Hello Alice! I''m looking forward to it too. Do you have any specific topics you want to cover?', '2024-12-08 11:30:00', 1, 31),
(N'Hi Sarah, I have some questions about my portfolio design.', '2024-12-07 14:00:00', 32, 2),
(N'Of course Bob! Feel free to send it over and I''ll take a look.', '2024-12-07 15:45:00', 2, 32),
(N'Michael, could we discuss NLP in our next session?', '2024-12-06 09:30:00', 33, 3),
(N'Absolutely Carol! NLP is a fascinating topic. We can go through some practical examples.', '2024-12-06 13:20:00', 3, 33),
(N'Emily, thank you for the marketing tips from last session!', '2024-12-05 16:00:00', 34, 4),
(N'You''re welcome Daniel! Let me know how the implementation goes.', '2024-12-05 17:30:00', 4, 34),
(N'David, I''ve updated my resume as you suggested.', '2024-12-04 11:00:00', 35, 5),
(N'Great Emma! Send it over and I''ll review the changes.', '2024-12-04 14:15:00', 5, 35);

-- Insert Complaints
INSERT INTO complaints (meeting_id, mentee_id, mentor_id, content, status)
VALUES
(3, 33, 3, N'The mentor was late to the session and it affected the quality of the meeting.', N'Rejected'),
(10, 38, 8, N'The session content did not match what was advertised on the mentor''s profile.', N'Pending'),
(15, 43, 13, N'The mentor was unprofessional during the session.', N'Resolved'),
(20, 48, 18, N'The meeting link provided did not work, causing delays.', N'Pending'),
(25, 33, 23, N'The mentor seemed distracted and did not focus on my questions.', N'Resolved'),
(26, 34, 24, N'The session was cut short without explanation.', N'Reviewed');

GO
