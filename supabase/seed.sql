-- Insert test user
INSERT INTO users (first_name, last_name, email, password_hash) VALUES
('Demo', 'User', 'demo@erino.com', '$2b$10$demo.hash.for.testing.purposes.only');

-- Insert 100+ sample leads
INSERT INTO leads (user_id, first_name, last_name, email, phone, company, city, state, source, status, score, lead_value, last_activity_at, is_qualified) VALUES
(1, 'John', 'Smith', 'john.smith@techcorp.com', '+1-555-0101', 'TechCorp Inc', 'San Francisco', 'CA', 'website', 'qualified', 85, 5000.00, CURRENT_TIMESTAMP - INTERVAL '2 days', true),
(1, 'Sarah', 'Johnson', 'sarah.j@innovate.com', '+1-555-0102', 'Innovate Solutions', 'New York', 'NY', 'google_ads', 'contacted', 72, 3500.00, CURRENT_TIMESTAMP - INTERVAL '1 day', false),
(1, 'Michael', 'Brown', 'mike.brown@startup.com', '+1-555-0103', 'StartupXYZ', 'Austin', 'TX', 'referral', 'new', 45, 2000.00, CURRENT_TIMESTAMP - INTERVAL '5 days', false),
(1, 'Emily', 'Davis', 'emily.d@enterprise.com', '+1-555-0104', 'Enterprise Corp', 'Chicago', 'IL', 'facebook_ads', 'won', 95, 15000.00, CURRENT_TIMESTAMP - INTERVAL '3 hours', true),
(1, 'David', 'Wilson', 'david.w@consulting.com', '+1-555-0105', 'Consulting Pro', 'Boston', 'MA', 'events', 'contacted', 68, 4200.00, CURRENT_TIMESTAMP - INTERVAL '1 week', false),
(1, 'Lisa', 'Anderson', 'lisa.a@retail.com', '+1-555-0106', 'Retail Solutions', 'Miami', 'FL', 'website', 'lost', 30, 1800.00, CURRENT_TIMESTAMP - INTERVAL '2 weeks', false),
(1, 'Robert', 'Taylor', 'rob.t@finance.com', '+1-555-0107', 'Finance First', 'Seattle', 'WA', 'google_ads', 'qualified', 78, 8000.00, CURRENT_TIMESTAMP - INTERVAL '4 days', true),
(1, 'Jennifer', 'Martinez', 'jen.m@health.com', '+1-555-0108', 'HealthTech', 'Denver', 'CO', 'referral', 'new', 55, 3000.00, CURRENT_TIMESTAMP - INTERVAL '6 days', false),
(1, 'Christopher', 'Garcia', 'chris.g@education.com', '+1-555-0109', 'EduTech', 'Portland', 'OR', 'facebook_ads', 'contacted', 65, 2500.00, CURRENT_TIMESTAMP - INTERVAL '2 days', false),
(1, 'Amanda', 'Rodriguez', 'amanda.r@logistics.com', '+1-555-0110', 'LogiCorp', 'Atlanta', 'GA', 'website', 'won', 88, 12000.00, CURRENT_TIMESTAMP - INTERVAL '1 day', true);
