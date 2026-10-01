-- =====================================================================
-- ONLINE FIR MANAGEMENT & CRIME INTELLIGENCE SYSTEM
-- Database Schema: MySQL 8.0+ Compatible
-- Description: Complete Relational Schema with Foreign Keys, Indexes,
--              Triggers, and Comprehensive Sample Data.
-- =====================================================================

DROP DATABASE IF EXISTS fir_management_db;
CREATE DATABASE fir_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fir_management_db;

-- ---------------------------------------------------------------------
-- 1. Table: users (Citizens registering complaints)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    aadhaar_number VARCHAR(16) NULL,
    address TEXT NOT NULL,
    city VARCHAR(60) NOT NULL,
    state VARCHAR(60) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    emergency_contact VARCHAR(15) NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_phone (phone),
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. Table: police_officers (Law enforcement personnel)
-- ---------------------------------------------------------------------
CREATE TABLE police_officers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    badge_number VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    officer_rank ENUM('Constable', 'Head Constable', 'Assistant Sub-Inspector', 'Sub-Inspector', 'Inspector', 'Deputy Superintendent of Police') NOT NULL DEFAULT 'Sub-Inspector',
    police_station VARCHAR(100) NOT NULL,
    station_code VARCHAR(20) NOT NULL,
    district VARCHAR(60) NOT NULL,
    state VARCHAR(60) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_officer_station (station_code),
    INDEX idx_officer_badge (badge_number)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. Table: admins (System administrators / Station House Officers)
-- ---------------------------------------------------------------------
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('SUPER_ADMIN', 'STATION_ADMIN', 'CYBER_ADMIN') DEFAULT 'STATION_ADMIN',
    assigned_station VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. Table: crime_categories (Standard Crime heads & Legal sections)
-- ---------------------------------------------------------------------
CREATE TABLE crime_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(60) NOT NULL UNIQUE,
    legal_section_ipc VARCHAR(100) NOT NULL,
    legal_section_bns VARCHAR(100) NOT NULL,
    severity ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    description TEXT,
    keywords TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. Table: firs (First Information Reports)
-- ---------------------------------------------------------------------
CREATE TABLE firs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fir_number VARCHAR(40) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    incident_date DATETIME NOT NULL,
    incident_location VARCHAR(255) NOT NULL,
    incident_district VARCHAR(60) NOT NULL,
    police_station VARCHAR(100) NOT NULL,
    station_code VARCHAR(20) NOT NULL,
    incident_description LONGTEXT NOT NULL,
    accused_type ENUM('Known', 'Unknown', 'Suspected') DEFAULT 'Unknown',
    accused_details TEXT NULL,
    stolen_property_details TEXT NULL,
    priority ENUM('Normal', 'Urgent', 'High Priority') DEFAULT 'Normal',
    status ENUM('Submitted', 'Verified', 'Under Investigation', 'Charge Sheet Filed', 'Closed', 'Rejected') DEFAULT 'Submitted',
    assigned_officer_id INT NULL,
    ai_predicted_category VARCHAR(60) NULL,
    ai_confidence_score DECIMAL(5, 2) NULL,
    ai_potential_duplicate_fir_id INT NULL,
    ai_duplicate_similarity_score DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES crime_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_officer_id) REFERENCES police_officers(id) ON DELETE SET NULL,
    INDEX idx_fir_number (fir_number),
    INDEX idx_fir_status (status),
    INDEX idx_fir_station (station_code),
    INDEX idx_fir_date (incident_date)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. Table: evidence (Supporting documents, images, audio, CCTV)
-- ---------------------------------------------------------------------
CREATE TABLE evidence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fir_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size_bytes INT NOT NULL,
    description VARCHAR(255) NULL,
    uploaded_by_type ENUM('Citizen', 'Officer', 'Forensics') DEFAULT 'Citizen',
    uploaded_by_id INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fir_id) REFERENCES firs(id) ON DELETE CASCADE,
    INDEX idx_evidence_fir (fir_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. Table: fir_status_history (Audit trail of status transitions)
-- ---------------------------------------------------------------------
CREATE TABLE fir_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fir_id INT NOT NULL,
    previous_status VARCHAR(40) NULL,
    new_status VARCHAR(40) NOT NULL,
    changed_by_name VARCHAR(100) NOT NULL,
    changed_by_role VARCHAR(50) NOT NULL,
    remarks TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fir_id) REFERENCES firs(id) ON DELETE CASCADE,
    INDEX idx_status_history_fir (fir_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. Table: investigation_updates (Case diary entries by IO)
-- ---------------------------------------------------------------------
CREATE TABLE investigation_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fir_id INT NOT NULL,
    officer_id INT NOT NULL,
    diary_entry_number VARCHAR(30) NOT NULL,
    findings LONGTEXT NOT NULL,
    next_action_plan TEXT,
    witness_statements TEXT NULL,
    is_confidential BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fir_id) REFERENCES firs(id) ON DELETE CASCADE,
    FOREIGN KEY (officer_id) REFERENCES police_officers(id) ON DELETE RESTRICT,
    INDEX idx_updates_fir (fir_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- INITIAL SEED DATA
-- ---------------------------------------------------------------------

-- Crime categories with Indian Penal Code (IPC) and Bharatiya Nyaya Sanhita (BNS) mapping
INSERT INTO crime_categories (id, category_name, legal_section_ipc, legal_section_bns, severity, description, keywords) VALUES
(1, 'Theft / Larceny', 'IPC Sec 379 / 380', 'BNS Sec 303 / 305', 'Medium', 'Dishonest removal of movable property without consent from possession of person or dwelling house.', 'theft, stolen, bag, wallet, pickpocket, mobile, snatched, bicycle, laptop'),
(2, 'Cybercrime & Financial Fraud', 'IPC Sec 420 / IT Act 66D', 'BNS Sec 318(4) / IT Act 66D', 'High', 'Deceptive electronic cheating, unauthorized bank transactions, phishing, UPI fraud, extortion via digital means.', 'cyber, upi, otp, scam, bank, account, phishing, card, transfer, hacked, online, fraud'),
(3, 'Physical Assault & Violence', 'IPC Sec 323 / 324 / 325', 'BNS Sec 115 / 117', 'High', 'Voluntarily causing hurt or grievous hurt by dangerous weapons or criminal force.', 'assault, beaten, fight, attack, punch, weapon, injury, blood, hospital, hurt'),
(4, 'Burglary & Housebreaking', 'IPC Sec 457 / 458 / 380', 'BNS Sec 331 / 305', 'High', 'Lurking house-trespass or housebreaking by night in order to commit offense punishable with imprisonment.', 'burglary, break-in, lock, broken, house, night, robbed, ransacked, jewelry, almirah'),
(5, 'Vehicle Theft (Motor Vehicle)', 'IPC Sec 379 / 411', 'BNS Sec 303 / 317', 'Medium', 'Theft or receiving stolen motor vehicles including two-wheelers, cars, and commercial trucks.', 'car, bike, motorcycle, scooter, parked, stolen vehicle, license plate, chassis'),
(6, 'Harassment & Stalking', 'IPC Sec 354D / 509', 'BNS Sec 78 / 79', 'High', 'Following, monitoring electronic communication, or insulting modesty of an individual persistently.', 'stalking, harassment, following, messages, threats, obscene, calls, abusive, blackmail'),
(7, 'Robbery & Snatching', 'IPC Sec 392 / 390', 'BNS Sec 309 / 307', 'Critical', 'Theft committed with violence, restraint, or instant fear of hurt or death.', 'robbery, gun, knife, snatched chain, held at point, extortion, gang, looted'),
(8, 'Domestic Violence & Cruelty', 'IPC Sec 498A / DV Act', 'BNS Sec 85 / 86', 'High', 'Cruelty by spouse or relatives of spouse causing physical, emotional, or economic harm.', 'domestic violence, husband, in-laws, harassment, dowry, beaten at home, abuse');

-- Sample Users (Password hashes are bcrypt / sha256 mock standard 'User@123')
INSERT INTO users (id, full_name, email, phone, password_hash, aadhaar_number, address, city, state, pincode, emergency_contact) VALUES
(1, 'Rajesh Kumar Verma', 'rajesh.kumar@example.com', '9876543210', 'pbkdf2:sha256:260000$saltdummy$hashdummy123', 'XXXX-XXXX-4589', 'Flat 402, Shanti Heights, Sector 18', 'New Delhi', 'Delhi', '110001', '9876543219'),
(2, 'Priya S. Sharma', 'priya.sharma@example.com', '9812345678', 'pbkdf2:sha256:260000$saltdummy$hashdummy123', 'XXXX-XXXX-8921', 'B-12, Green Glen Layout, Bellandur', 'Bengaluru', 'Karnataka', '560103', '9812345679'),
(3, 'Amitabh Roy', 'amitabh.roy@example.com', '9734567890', 'pbkdf2:sha256:260000$saltdummy$hashdummy123', 'XXXX-XXXX-3341', '74/A Salt Lake City, Sector 5', 'Kolkata', 'West Bengal', '700091', '9734567899');

-- Sample Police Officers (Officers & Station In-charges)
INSERT INTO police_officers (id, badge_number, full_name, email, phone, password_hash, officer_rank, police_station, station_code, district, state) VALUES
(1, 'POL-DL-8842', 'Vikram Singh Rathore', 'vikram.rathore@police.gov.in', '9811122233', 'pbkdf2:sha256:260000$saltdummy$hashdummy123', 'Sub-Inspector', 'Connaught Place Police Station', 'PS-CP-01', 'New Delhi', 'Delhi'),
(2, 'POL-DL-4109', 'Ananya Sharma', 'ananya.sharma@police.gov.in', '9822233344', 'pbkdf2:sha256:260000$saltdummy$hashdummy123', 'Inspector', 'Cyber Crime Investigation Cell', 'CYBER-HQ-01', 'New Delhi', 'Delhi'),
(3, 'POL-KA-6201', 'Kavitha R. Nayak', 'kavitha.nayak@police.gov.in', '9833344455', 'pbkdf2:sha256:260000$saltdummy$hashdummy123', 'Sub-Inspector', 'Indiranagar Police Station', 'PS-INDR-04', 'Bengaluru Urban', 'Karnataka'),
(4, 'POL-DL-1099', 'Devendra Patil', 'devendra.patil@police.gov.in', '9844455566', 'pbkdf2:sha256:260000$saltdummy$hashdummy123', 'Assistant Sub-Inspector', 'Connaught Place Police Station', 'PS-CP-01', 'New Delhi', 'Delhi');

-- Sample Admins
INSERT INTO admins (id, username, full_name, email, password_hash, role, assigned_station) VALUES
(1, 'sho_admin', 'Senior Inspector Alok Sen', 'sho.central@police.gov.in', 'pbkdf2:sha256:260000$saltdummy$hashdummy123', 'SUPER_ADMIN', 'Central Police Headquarters'),
(2, 'cyber_admin', 'ACP Dr. Rakesh Tandon', 'cyber.acp@police.gov.in', 'pbkdf2:sha256:260000$saltdummy$hashdummy123', 'CYBER_ADMIN', 'Cyber Crime Investigation Cell');

-- Sample FIRs
INSERT INTO firs (id, fir_number, user_id, category_id, incident_date, incident_location, incident_district, police_station, station_code, incident_description, accused_type, accused_details, stolen_property_details, priority, status, assigned_officer_id, ai_predicted_category, ai_confidence_score, ai_duplicate_similarity_score) VALUES
(1, 'FIR/DL-CP/2026/0104', 1, 2, '2026-09-24 14:30:00', 'Online Banking / Connaught Place residence', 'New Delhi', 'Cyber Crime Investigation Cell', 'CYBER-HQ-01', 'Received fraudulent phone call claiming to be bank manager regarding KYC update. An APK link was shared over WhatsApp. Upon clicking, Rs. 1,45,000 was debited in three unauthorized UPI transactions to unknown account.', 'Unknown', 'Caller identified as Sharma from HDFC Fraud Desk, phone +91-9123456789. Beneficiary VPA: scammer@paytm', 'INR 1,45,000 in electronic funds', 'High Priority', 'Under Investigation', 2, 'Cybercrime & Financial Fraud', 96.50, 8.40),

(2, 'FIR/DL-CP/2026/0105', 1, 1, '2026-09-26 19:15:00', 'Metro Station Gate 3, Rajiv Chowk, Connaught Place', 'New Delhi', 'Connaught Place Police Station', 'PS-CP-01', 'While deboarding metro train at Rajiv Chowk Gate 3, unknown pickpocket snatched black leather backpack containing Apple MacBook Air M2, passport, and office ID card. Crowd was dense during peak evening rush.', 'Unknown', 'Unidentified male, medium height, wearing black hoodie and baseball cap, fled towards outer circle.', 'Apple MacBook Air M2 (Serial #C02XX098), Indian Passport, Leather bag', 'Normal', 'Verified', 1, 'Theft / Larceny', 94.20, 12.10),

(3, 'FIR/KA-INDR/2026/0078', 2, 5, '2026-09-28 21:00:00', 'Near 100 Feet Road, 12th Main, Indiranagar', 'Bengaluru Urban', 'Indiranagar Police Station', 'PS-INDR-04', 'Parked Royal Enfield Classic 350 (Reg No: KA-03-MK-4421, Black color) outside coffee cafe at 8:15 PM. When returned at 9:00 PM, handlebar lock was broken and motorcycle was missing. Nearby CCTV footage shows two individuals pushing bike.', 'Suspected', 'Two males captured on Cafe camera wearing helmets and denim jackets, aged around 25-30 years.', 'Royal Enfield Classic 350 CC Motorcycle, Reg: KA-03-MK-4421, Engine #RE89221', 'Normal', 'Submitted', NULL, 'Vehicle Theft (Motor Vehicle)', 98.10, 5.20),

(4, 'FIR/DL-CP/2026/0108', 3, 4, '2026-09-29 03:30:00', 'B-44, Barakhamba Road, Near Metro Pillar 18', 'New Delhi', 'Connaught Place Police Station', 'PS-CP-01', 'House broken into between 2:00 AM and 4:30 AM while family was out of town. Front door deadbolt was forced open with crowbar. Master bedroom almirah ransacked, gold ornaments and cash missing.', 'Unknown', 'Footprints and pry marks recovered by forensics. Fingerprints lifted from almirah handle.', 'Gold necklaces 65 grams, Diamond rings 2, Cash INR 80,000', 'High Priority', 'Charge Sheet Filed', 1, 'Burglary & Housebreaking', 95.80, 14.50),

(5, 'FIR/DL-CP/2026/0099', 2, 6, '2026-09-15 11:20:00', 'Indiranagar Metro Station to Office Corridor', 'Bengaluru Urban', 'Indiranagar Police Station', 'PS-INDR-04', 'Persistent stalking and threatening WhatsApp messages from unknown VoIP numbers over past three weeks. Accused followed complainant multiple times on way to work.', 'Known', 'Known former colleague Suresh Rao, resident of Koramangala. WhatsApp logs and call recordings submitted.', 'N/A', 'Urgent', 'Closed', 3, 'Harassment & Stalking', 92.40, 3.10);

-- Sample Evidence
INSERT INTO evidence (fir_id, file_name, original_name, file_path, file_type, file_size_bytes, description, uploaded_by_type, uploaded_by_id) VALUES
(1, 'evid_fir1_bank_stmt.pdf', 'Bank_Transaction_Statement_Sept2026.pdf', '/uploads/evidence/evid_fir1_bank_stmt.pdf', 'application/pdf', 342100, 'Certified bank statement showing three unauthorized IMPS transactions', 'Citizen', 1),
(1, 'evid_fir1_whatsapp_apk.png', 'WhatsApp_Scam_Screenshot.png', '/uploads/evidence/evid_fir1_whatsapp_apk.png', 'image/png', 512000, 'Chat screenshot with phishing download link and fake bank logo', 'Citizen', 1),
(2, 'evid_fir2_metro_cctv.mp4', 'Metro_CCTV_Gate3_Cam04.mp4', '/uploads/evidence/evid_fir2_metro_cctv.mp4', 'video/mp4', 8400120, 'Station CCTV camera recording of suspect escaping with bag', 'Officer', 1),
(3, 'evid_fir3_rc_copy.pdf', 'Motorcycle_Registration_Certificate.pdf', '/uploads/evidence/evid_fir3_rc_copy.pdf', 'application/pdf', 189400, 'Original vehicle RC copy and purchase invoice', 'Citizen', 2),
(4, 'evid_fir4_crime_scene.jpg', 'Broken_Lock_Forensic_Photo.jpg', '/uploads/evidence/evid_fir4_crime_scene.jpg', 'image/jpeg', 1240000, 'Close-up photograph of sheared deadbolt lock mechanism', 'Officer', 1);

-- Sample Status History (Audit Trail)
INSERT INTO fir_status_history (fir_id, previous_status, new_status, changed_by_name, changed_by_role, remarks, changed_at) VALUES
(1, 'Submitted', 'Verified', 'Inspector Ananya Sharma', 'Police Station In-Charge', 'Initial verification completed. IP trace and CDR request dispatched to telecom nodal officer.', '2026-09-24 16:00:00'),
(1, 'Verified', 'Under Investigation', 'Inspector Ananya Sharma', 'Investigating Officer', 'Assigned to Cyber Cell Task Force. Mule account frozen with payment gateway.', '2026-09-25 10:15:00'),
(2, 'Submitted', 'Verified', 'SI Vikram Singh Rathore', 'Investigating Officer', 'Complainant identity verified and incident location confirmed at Rajiv Chowk Metro station.', '2026-09-27 09:30:00'),
(4, 'Submitted', 'Verified', 'SI Vikram Singh Rathore', 'Investigating Officer', 'Crime scene examined by forensic unit. Fingerprint lifts preserved.', '2026-09-29 08:00:00'),
(4, 'Verified', 'Under Investigation', 'SI Vikram Singh Rathore', 'Investigating Officer', 'Suspect identified in local surveillance database. Raid conducted in Seelampur.', '2026-09-29 14:00:00'),
(4, 'Under Investigation', 'Charge Sheet Filed', 'SI Vikram Singh Rathore', 'Investigating Officer', 'Charge sheet No 44/2026 filed before Metropolitan Magistrate Patiala House Courts.', '2026-09-30 17:30:00'),
(5, 'Submitted', 'Verified', 'SI Kavitha R. Nayak', 'Investigating Officer', 'Notice served to accused under Section 41A CrPC / Sec 35 BNSS.', '2026-09-16 11:00:00'),
(5, 'Verified', 'Closed', 'SI Kavitha R. Nayak', 'Investigating Officer', 'Accused produced with legal counsel. Written undertaking and restraining order executed.', '2026-09-20 16:45:00');

-- Sample Investigation Updates (General Diary / Case Diary Entries)
INSERT INTO investigation_updates (fir_id, officer_id, diary_entry_number, findings, next_action_plan, witness_statements) VALUES
(1, 2, 'CD-CYBER-2026/89', 'Liaised with Nodal Officer at Bank. Amount routed through three intermediary wallets in Jamtara hub. Transaction ID TXN-998122 placed on hold with Rs 85,000 recovered.', 'Issue Section 91 CrPC notice to second-tier payment aggregator. Track device IMEI and IP logs.', 'Statement of complainant recorded over phone regarding WhatsApp interaction.'),
(2, 1, 'CD-CP-2026/142', 'Reviewed DMRC CCTV feed from cameras 12, 14, and 18. Suspect observed boarding Auto Rickshaw DL-1RT-5512 towards Paharganj.', 'Contact Delhi Traffic Police to intercept auto rickshaw registration details.', 'Statement of Metro CISF token booth operator recorded.'),
(4, 1, 'CD-CP-2026/159', 'Fingerprint analysis matched known prior offender Rafiq @ Bhura. Recovered 45 grams of melted gold ornaments and Rs. 52,000 in cash during house search.', 'Produce accused before Chief Metropolitan Magistrate for 3 days police custody remand.', 'Neighbor Shri R. K. Singhania stated seeing two individuals on scooter around 3:15 AM.');

-- ---------------------------------------------------------------------
-- Trigger: Automatically record status change into fir_status_history
-- ---------------------------------------------------------------------
DELIMITER $$
CREATE TRIGGER after_fir_status_update
AFTER UPDATE ON firs
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO fir_status_history (fir_id, previous_status, new_status, changed_by_name, changed_by_role, remarks, changed_at)
        VALUES (NEW.id, OLD.status, NEW.status, 'System Automation / Officer', 'System Audit', CONCAT('FIR status updated from ', OLD.status, ' to ', NEW.status), NOW());
    END IF;
END$$
DELIMITER ;
