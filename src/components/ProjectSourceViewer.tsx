import React, { useState } from 'react';
import { Code2, Database, BrainCircuit, Terminal, Copy, Check, FileText, BookOpen, Layers } from 'lucide-react';

export const ProjectSourceViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'app' | 'schema' | 'ml' | 'model' | 'viva' | 'run'>('app');
  const [copied, setCopied] = useState(false);

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets: Record<string, { title: string; lang: string; code: string }> = {
    app: {
      title: 'app.py (Flask REST API Controller & Routes)',
      lang: 'python',
      code: `# app.py - Online FIR Management System Flask Backend
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from models.user_model import UserModel
from models.fir_model import FIRModel
from models.officer_model import OfficerModel
from ml.crime_classifier import crime_ai

app = Flask(__name__)
app.secret_key = "e_rakshak_police_secure_key_2026_jwt"
CORS(app)

@app.route("/api/firs/submit", methods=["POST"])
def submit_fir():
    data = request.get_json()
    user_id = data.get("user_id")
    category_id = data.get("category_id")
    incident_description = data.get("incident_description")
    
    # 1. Automatic Crime Classification via NLP Machine Learning
    classification = crime_ai.predict_category(incident_description)
    
    # 2. Duplicate Complaint Detection via Cosine Similarity
    existing_firs = FIRModel.list_all()
    dup_analysis = crime_ai.detect_duplicates(incident_description, existing_firs)

    # 3. Parameterized SQL insert into MySQL database
    fir_id, fir_number = FIRModel.submit_fir(
        user_id=user_id,
        category_id=category_id,
        incident_date=data.get("incident_date"),
        incident_location=data.get("incident_location"),
        incident_district=data.get("incident_district"),
        police_station=data.get("police_station"),
        station_code=data.get("station_code"),
        incident_description=incident_description,
        ai_predicted_category=classification.get("category"),
        ai_confidence_score=classification.get("confidence"),
        ai_potential_duplicate_fir_id=dup_analysis.get("matched_fir", {}).get("id"),
        ai_duplicate_similarity_score=dup_analysis.get("similarity_score", 0.0)
    )
    return jsonify({"success": True, "fir_number": fir_number, "id": fir_id}), 201

if __name__ == "__main__":
    app.run(port=5000, debug=True)`
    },
    schema: {
      title: 'database/schema.sql (MySQL Relational Schema)',
      lang: 'sql',
      code: `-- database/schema.sql - MySQL 8.0 Relational Tables
CREATE DATABASE fir_management_db CHARACTER SET utf8mb4;
USE fir_management_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    aadhaar_number VARCHAR(16) NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE firs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fir_number VARCHAR(40) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    incident_date DATETIME NOT NULL,
    incident_location VARCHAR(255) NOT NULL,
    incident_description LONGTEXT NOT NULL,
    status ENUM('Submitted', 'Verified', 'Under Investigation', 'Charge Sheet Filed', 'Closed', 'Rejected') DEFAULT 'Submitted',
    assigned_officer_id INT NULL,
    ai_predicted_category VARCHAR(60) NULL,
    ai_confidence_score DECIMAL(5,2) NULL,
    ai_duplicate_similarity_score DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES crime_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_officer_id) REFERENCES police_officers(id) ON DELETE SET NULL
) ENGINE=InnoDB;`
    },
    ml: {
      title: 'ml/crime_classifier.py (TF-IDF & Naive Bayes Engine)',
      lang: 'python',
      code: `# ml/crime_classifier.py - ML Classification & Duplicate Detection
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class CrimeAI:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(ngram_range=(1,2), stop_words='english')
        self.classifier = MultinomialNB(alpha=0.1)

    def predict_category(self, text):
        clean_text = self._preprocess(text)
        vec = self.vectorizer.transform([clean_text])
        probs = self.classifier.predict_proba(vec)[0]
        category = self.classifier.classes_[np.argmax(probs)]
        return {
            "category": category,
            "confidence": float(np.max(probs) * 100),
            "disclaimer": "AI recommendations are for decision support only. Investigating Officer retains final authority."
        }

    def detect_duplicates(self, new_description, existing_firs, threshold=0.55):
        corpus = [new_description] + [f.get("description", "") for f in existing_firs]
        tfidf_mat = self.vectorizer.fit_transform(corpus)
        sims = cosine_similarity(tfidf_mat[0:1], tfidf_mat[1:])[0]
        max_idx = int(np.argmax(sims))
        return {
            "is_duplicate": bool(sims[max_idx] >= threshold),
            "similarity_score": round(float(sims[max_idx]) * 100, 2)
        }`
    },
    model: {
      title: 'models/fir_model.py (Data Access Object & SQL Parameterization)',
      lang: 'python',
      code: `# models/fir_model.py - Parameterized Query Handler
from .db import execute_query

class FIRModel:
    @staticmethod
    def get_by_id(fir_id):
        sql = """
            SELECT f.*, u.full_name as complainant_name, u.phone as complainant_phone,
                   c.category_name, c.legal_section_ipc, c.legal_section_bns,
                   po.full_name as officer_name, po.badge_number as officer_badge
            FROM firs f
            JOIN users u ON f.user_id = u.id
            JOIN crime_categories c ON f.category_id = c.id
            LEFT JOIN police_officers po ON f.assigned_officer_id = po.id
            WHERE f.id = %s
        """
        return execute_query(sql, (fir_id,), fetch_one=True)

    @staticmethod
    def update_status(fir_id, new_status, changed_by_name, remarks):
        execute_query("UPDATE firs SET status = %s WHERE id = %s", (new_status, fir_id), commit=True)
        execute_query("""
            INSERT INTO fir_status_history (fir_id, new_status, changed_by_name, remarks)
            VALUES (%s, %s, %s, %s)
        """, (fir_id, new_status, changed_by_name, remarks), commit=True)
        return True`
    },
    run: {
      title: 'Terminal Execution Commands (Local Setup)',
      lang: 'bash',
      code: `# 1. Clone repository & enter directory
git clone https://github.com/police-cctns/online-fir-system.git
cd online-fir-system

# 2. Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# 3. Install required packages
pip install -r requirements.txt

# 4. Import MySQL Database Schema
mysql -u root -p < database/schema.sql

# 5. Train the Machine Learning Classifier
python ml/train_classifier.py

# 6. Run the Flask Web Application
python app.py
# -> Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)`
    },
    viva: {
      title: 'College Final-Year Viva Voce Questions & Answers',
      lang: 'markdown',
      code: `### 1. What constitutes a Cognizable Offense requiring an FIR?
An offense where a police officer can arrest without an arrest warrant as per the First Schedule of CrPC / BNSS. Under Section 173 BNSS (Sec 154 CrPC), police are bound to register an FIR for cognizable reports.

### 2. How is TF-IDF calculated for Crime Category prediction?
TF-IDF(t, d, D) = TF(t, d) * IDF(t, D)
- TF = frequency of word 't' in incident narrative 'd'
- IDF = log(Total documents / Documents containing 't')
This penalizes common legal terms and highlights distinctive crime keywords like 'pickpocket', 'phishing', or 'crowbar'.

### 3. How does Cosine Similarity flag duplicate FIRs?
By computing the cosine of the angle between two TF-IDF word vectors:
cos(θ) = (A · B) / (||A|| * ||B||)
A score >= 55% alerts officers that the complaint may refer to an already registered incident.

### 4. What security measures prevent SQL Injection?
All database queries use parameterized SQL placeholders (%s) executed through PyMySQL / DB-API. User inputs are never concatenated directly into query strings.`
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#0B132B] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>College Final-Year Project Submission & Code Explorer</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Full System Architecture & Python Flask Source Files
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
          Inspect the complete backend source code generated in this project: Python Flask controllers, MySQL DDL schema, Scikit-Learn TF-IDF crime classifier, DB models, and terminal execution guide.
        </p>
      </div>

      {/* Code Browser Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveFile('app')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeFile === 'app' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              app.py (Flask API)
            </button>
            <button
              onClick={() => setActiveFile('schema')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeFile === 'schema' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              schema.sql (MySQL)
            </button>
            <button
              onClick={() => setActiveFile('ml')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeFile === 'ml' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              crime_classifier.py (ML)
            </button>
            <button
              onClick={() => setActiveFile('model')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeFile === 'model' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              fir_model.py (DAO)
            </button>
            <button
              onClick={() => setActiveFile('run')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeFile === 'run' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terminal Commands
            </button>
            <button
              onClick={() => setActiveFile('viva')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeFile === 'viva' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Viva Voce Q&A
            </button>
          </div>

          <button
            onClick={() => copyCode(codeSnippets[activeFile].code)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-[600px] overflow-y-auto">
          <div className="text-slate-500 mb-2 pb-2 border-b border-slate-800 flex items-center justify-between text-[11px]">
            <span>File: {codeSnippets[activeFile].title}</span>
            <span className="uppercase text-[10px] text-amber-400">{codeSnippets[activeFile].lang}</span>
          </div>
          <pre className="whitespace-pre">{codeSnippets[activeFile].code}</pre>
        </div>
      </div>
    </div>
  );
};
