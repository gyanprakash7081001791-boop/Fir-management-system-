# E-Rakshak: Online FIR Management & Crime Intelligence System
**College Final-Year Project · Complete Source Code & Documentation**

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Flask 3.0](https://img.shields.io/badge/Flask-3.0.3-green.svg)](https://flask.palletsprojects.com/)
[![MySQL 8.0](https://img.shields.io/badge/Database-MySQL%208.0-orange.svg)](https://www.mysql.com/)
[![scikit-learn](https://img.shields.io/badge/ML-scikit--learn-yellow.svg)](https://scikit-learn.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)

---

## 1. Project Synopsis & Objectives

The **E-Rakshak Online FIR Management System** is a digital law enforcement platform designed to modernize the First Information Report (FIR) lodging, verification, and investigation lifecycle. Compliant with the Crime and Criminal Tracking Network & Systems (**CCTNS**) and procedural standards under **CrPC / Bharatiya Nagarik Suraksha Sanhita (BNSS)**.

### Key Highlights:
1. **Citizen Portal**:
   - Secure registration, Aadhaar/Govt ID verification, and mobile OTP/password login.
   - Comprehensive multi-step FIR registration (Complainant, Accused, Date/Time, Location, Evidence).
   - Instant generation of unique FIR registration number (e.g., `FIR/DL-CP/2026/0104`).
   - Verifiable printable FIR Acknowledgement receipt with legal seal, QR verification code, and barcode.
   - Real-time case tracking by FIR Number or registered mobile number.

2. **Police & Administration Portal**:
   - Role-based access for Investigating Officers (IO), Station House Officers (SHO), and Cyber Cell Admins.
   - Interactive Crime Statistics Dashboard: Pending, Under Investigation, Charge Sheet Filed, Closed, and Rejected counts.
   - Case Docket inspection: Complainant details, suspect descriptions, forensic evidence vault.
   - Investigating Officer (IO) assignment & re-assignment.
   - Official Case Diary / General Diary (GD) entry logging with timestamped remarks.
   - Police officer roster management and jurisdiction mapping.

3. **AI / Smart Crime Intelligence**:
   - **Crime Category Auto-Classification**: Uses a TF-IDF vectorizer + Multinomial Naive Bayes model to predict the offense category (Theft, Cybercrime, Burglary, Assault, etc.) and suggests applicable legal sections (e.g. IPC Sec 379/BNS 303, IPC Sec 420/IT Act 66D).
   - **Duplicate / Similar FIR Detection**: Computes Cosine Similarity against existing database reports to prevent duplicate filings and link multi-victim serial offenses.
   - **Decision Support Principle**: AI outputs serve strictly as advisory aids. Investigating Officers hold final statutory authority.

---

## 2. Project Architecture & Directory Structure

```text
online-fir-system/
│
├── app.py                      # Flask Application Controller & REST API
├── requirements.txt            # Python Dependencies
├── .env.example                # Environment Variable Template
├── README.md                   # Complete Documentation & College Viva Guide
│
├── database/
│   ├── schema.sql              # MySQL DDL with 8 tables, triggers, indexes, seed data
│   └── fir_local.db            # Embedded SQLite fallback for standalone testing
│
├── models/
│   ├── __init__.py
│   ├── db.py                   # MySQL PyMySQL connection pool with SQLite fallback
│   ├── user_model.py           # Citizen authentication & profile management
│   ├── officer_model.py        # Police personnel directory & authentication
│   └── fir_model.py            # FIR CRUD, status history, and case diary methods
│
├── ml/
│   ├── crime_classifier.py     # TF-IDF + Naive Bayes Classifier & Cosine Similarity
│   ├── train_classifier.py     # Training & export pipeline
│   └── models/                 # Serialized model pickles
│
├── templates/                  # Jinja2 HTML templates for Flask direct serving
│   ├── base.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── submit_fir.html
│   ├── user_dashboard.html
│   ├── police_dashboard.html
│   └── fir_details.html
│
├── static/
│   ├── css/style.css           # Custom styling & print stylesheets
│   └── js/main.js              # Client-side validation & live AI API calls
│
└── uploads/
    └── evidence/               # Secure uploaded FIR attachments & media
```

---

## 3. Database Schema (MySQL 8.0+)

The relational database `fir_management_db` contains 8 interconnected tables:

1. **`users`**: Citizen accounts, encrypted passwords, Aadhaar, contact details.
2. **`police_officers`**: Badges, ranks (Constable to DSP), police station jurisdiction.
3. **`admins`**: Administrative roles for station heads and cyber command.
4. **`crime_categories`**: Standard crime heads with IPC and BNS legal section mappings.
5. **`firs`**: Core FIR records, timestamps, status, location, AI prediction & duplicate scores.
6. **`evidence`**: Digital attachments (images, PDFs, CCTV footage) linked to FIRs.
7. **`fir_status_history`**: Immutable audit trail of every status transition.
8. **`investigation_updates`**: Case Diary / General Diary findings filed by Investigating Officers.

---

## 4. Installation & Execution Guide

### Step 1: Clone or Extract the Repository
```bash
git clone https://github.com/your-username/online-fir-management.git
cd online-fir-management
```

### Step 2: Set Up Python Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate on Linux / macOS:
source venv/bin/activate

# Activate on Windows:
# venv\Scripts\activate
```

### Step 3: Install Required Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure MySQL Database
1. Start your local MySQL service (e.g. XAMPP, MySQL Workbench, or systemd):
   ```bash
   sudo service mysql start  # On Linux
   ```
2. Create the database and import schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
3. Create a `.env` file in the project root:
   ```env
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DB=fir_management_db
   MYSQL_PORT=3306
   SECRET_KEY=e_rakshak_police_super_secret_key_2026
   PORT=5000
   ```
*(Note: If MySQL is not installed, the application automatically falls back to the embedded SQLite database for zero-friction demonstration!)*

### Step 5: Train / Verify the AI Classifier
```bash
python ml/train_classifier.py
```

### Step 6: Start the Flask Web Server
```bash
python app.py
```
Open your browser and navigate to:
**`http://localhost:5000`**

---

## 5. Demo Credentials

| Role | Username / Identifier | Password | Access Privileges |
|------|-----------------------|----------|-------------------|
| **Citizen** | `rajesh.kumar@example.com` | `User@123` | File FIR, view personal complaints, track status |
| **Citizen (2)** | `priya.sharma@example.com` | `User@123` | View FIRs, download acknowledgement |
| **Police IO** | `POL-DL-8842` | `Officer@123` | Inspect cases, update status, add case diary |
| **Police Inspector** | `POL-DL-4109` | `Officer@123` | Assign IO, verify FIRs, file charge sheets |
| **Station Admin** | `sho_admin` | `Officer@123` | Full police HQ jurisdiction & analytics |

---

## 6. REST API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register citizen user |
| `POST` | `/api/auth/login` | Login for Citizen or Police personnel |
| `POST` | `/api/auth/logout` | Terminate session |
| `POST` | `/api/ai/classify` | NLP classification with IPC/BNS recommendations |
| `POST` | `/api/ai/detect-duplicate` | Cosine similarity duplicate report detection |
| `GET`  | `/api/firs` | List FIRs with filtering (status, category, search) |
| `GET`  | `/api/firs/<id>` | Full FIR dossier with evidence & audit history |
| `GET`  | `/api/firs/track` | Public tracking by FIR Number |
| `POST` | `/api/firs/submit` | Lodge new FIR with auto-number generation |
| `PUT`  | `/api/firs/<id>/status` | Update FIR status (e.g. Under Investigation) |
| `PUT`  | `/api/firs/<id>/assign` | Assign Investigating Officer (IO) |
| `POST` | `/api/firs/<id>/investigation-update` | Record Case Diary / General Diary entry |
| `POST` | `/api/evidence/upload` | Securely upload supporting documents/photos |
| `GET`  | `/api/stats` | Crime and clearance analytics for charts |

---

## 7. College Final-Year Project Viva Voce Guide

### Q1: What is the legal difference between an FIR and a General Diary (GD) entry?
> **Answer**: An FIR (First Information Report) under Section 154 CrPC (now Section 173 of Bharatiya Nagarik Suraksha Sanhita, BNSS 2023) is mandatory for cognizable offenses, triggering formal investigation and police powers of arrest without warrant. A GD entry is an internal police record documenting administrative events and non-cognizable reports.

### Q2: How does the AI Crime Classifier work?
> **Answer**: The incident narrative is cleaned (lowercasing, stop-word removal, alphanumeric filtering) and transformed into n-gram features via **TF-IDF (Term Frequency-Inverse Document Frequency)** vectorization. A **Multinomial Naive Bayes** classifier calculates posterior probability for each crime head based on trained prior distributions.

### Q3: How is duplicate FIR detection handled?
> **Answer**: When a complaint is entered, its TF-IDF vector is compared against all existing FIR narratives in the police database using **Cosine Similarity**:
> $$\text{Cosine Similarity} = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$
> If the similarity score exceeds the threshold ($\ge 55\%$), the system flags the matching prior FIR to prevent duplicated administrative efforts or detect related incidents.

### Q4: Why is AI kept strictly advisory?
> **Answer**: Under Section 45 of the Indian Evidence Act (Bharatiya Sakshya Adhiniyam, BSA 2023) and standard administrative law, criminal complaints must be verified under human judicial accountability. The Investigating Officer is legally responsible for invoking specific penal sections.
