"""
app.py
========================================================================
ONLINE FIR MANAGEMENT SYSTEM (FLASK + MYSQL / SQLITE BACKEND)
REST API and Web Controller for Police Department and Citizens
College Final-Year Project Standard Implementation
========================================================================
"""

import os
import sys
import datetime
from flask import Flask, request, jsonify, render_template, session, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Import database models and ML engine
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from models.user_model import UserModel
from models.officer_model import OfficerModel
from models.fir_model import FIRModel
from models.db import execute_query
from ml.crime_classifier import crime_ai

load_dotenv()

app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = os.getenv("SECRET_KEY", "e_rakshak_police_secure_key_2026_jwt")
app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB max upload
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf", "mp4", "doc", "docx"}

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], "evidence"), exist_ok=True)

CORS(app)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ----------------------------------------------------------------------
# 1. AUTHENTICATION APIS
# ----------------------------------------------------------------------

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()
    password = data.get("password", "")
    address = data.get("address", "").strip()
    city = data.get("city", "").strip()
    state = data.get("state", "").strip()
    pincode = data.get("pincode", "").strip()
    aadhaar_number = data.get("aadhaar_number", "").strip()
    emergency_contact = data.get("emergency_contact", "").strip()

    if not all([full_name, email, phone, password, address, city, state, pincode]):
        return jsonify({"success": False, "message": "All required fields must be filled"}), 400

    existing_user = UserModel.get_by_email(email)
    if existing_user:
        return jsonify({"success": False, "message": "Email is already registered"}), 400

    existing_phone = UserModel.get_by_phone(phone)
    if existing_phone:
        return jsonify({"success": False, "message": "Phone number is already registered"}), 400

    user_id = UserModel.create_user(full_name, email, phone, password, address, city, state, pincode, aadhaar_number, emergency_contact)
    return jsonify({
        "success": True,
        "message": "User registered successfully",
        "user_id": user_id
    }), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    role = data.get("role", "CITIZEN")  # CITIZEN or POLICE / ADMIN
    identifier = data.get("identifier", "").strip()  # email or phone or badge
    password = data.get("password", "")

    if not identifier or not password:
        return jsonify({"success": False, "message": "Identifier and password are required"}), 400

    if role == "CITIZEN":
        user = UserModel.get_by_email(identifier) or UserModel.get_by_phone(identifier)
        if not user or not UserModel.verify_password(user["password_hash"], password):
            return jsonify({"success": False, "message": "Invalid email/phone or password"}), 401
        
        session["user_id"] = user["id"]
        session["user_role"] = "CITIZEN"
        session["user_name"] = user["full_name"]

        return jsonify({
            "success": True,
            "message": "Citizen login successful",
            "user": {
                "id": user["id"],
                "role": "CITIZEN",
                "full_name": user["full_name"],
                "email": user["email"],
                "phone": user["phone"],
                "city": user["city"],
                "state": user["state"]
            }
        })
    else:
        # Officer or Admin Login
        officer = OfficerModel.get_by_email_or_badge(identifier)
        if not officer or not OfficerModel.verify_password(officer["password_hash"], password):
            return jsonify({"success": False, "message": "Invalid badge number / email or officer credentials"}), 401
        
        session["officer_id"] = officer["id"]
        session["user_role"] = "POLICE"
        session["user_name"] = officer["full_name"]
        session["badge_number"] = officer["badge_number"]

        return jsonify({
            "success": True,
            "message": "Police officer login successful",
            "officer": {
                "id": officer["id"],
                "role": "POLICE",
                "badge_number": officer["badge_number"],
                "full_name": officer["full_name"],
                "rank": officer["officer_rank"],
                "police_station": officer["police_station"],
                "station_code": officer["station_code"],
                "district": officer["district"]
            }
        })

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"})

# ----------------------------------------------------------------------
# 2. AI / SMART CRIME INTELLIGENCE APIS
# ----------------------------------------------------------------------

@app.route("/api/ai/classify", methods=["POST"])
def ai_classify():
    """
    Real-time crime classification endpoint using TF-IDF and Naive Bayes ML.
    Advisory support only.
    """
    data = request.get_json() or {}
    description = data.get("description", "")
    
    result = crime_ai.predict_category(description)
    return jsonify({
        "success": True,
        "prediction": result
    })

@app.route("/api/ai/detect-duplicate", methods=["POST"])
def ai_detect_duplicate():
    """
    Evaluates text similarity with existing FIRs to flag duplicate reports.
    """
    data = request.get_json() or {}
    description = data.get("description", "")
    
    all_firs = execute_query("SELECT id, fir_number, incident_date, incident_description as description FROM firs", fetch_all=True)
    duplicate_info = crime_ai.detect_duplicates(description, all_firs)
    
    return jsonify({
        "success": True,
        "duplicate_analysis": duplicate_info
    })

# ----------------------------------------------------------------------
# 3. FIR MANAGEMENT APIS
# ----------------------------------------------------------------------

@app.route("/api/firs", methods=["GET"])
def get_firs():
    status = request.args.get("status")
    category_id = request.args.get("category_id")
    search = request.args.get("search")
    user_id = request.args.get("user_id")
    officer_id = request.args.get("officer_id")

    firs = FIRModel.list_all(status=status, category_id=category_id, search=search, user_id=user_id, officer_id=officer_id)
    return jsonify({"success": True, "count": len(firs), "firs": firs})

@app.route("/api/firs/<int:fir_id>", methods=["GET"])
def get_fir_detail(fir_id):
    fir = FIRModel.get_by_id(fir_id)
    if not fir:
        return jsonify({"success": False, "message": "FIR record not found"}), 404

    history = FIRModel.get_status_history(fir_id)
    evidence = FIRModel.get_evidence(fir_id)
    updates = FIRModel.get_investigation_updates(fir_id)

    return jsonify({
        "success": True,
        "fir": fir,
        "history": history,
        "evidence": evidence,
        "investigation_updates": updates
    })

@app.route("/api/firs/track", methods=["GET"])
def track_fir():
    fir_number = request.args.get("fir_number", "").strip()
    if not fir_number:
        return jsonify({"success": False, "message": "FIR Number is required"}), 400

    fir = FIRModel.get_by_fir_number(fir_number)
    if not fir:
        return jsonify({"success": False, "message": "No FIR record found for provided number"}), 404

    history = FIRModel.get_status_history(fir["id"])
    updates = FIRModel.get_investigation_updates(fir["id"])
    # Filter confidential updates for public citizen tracking
    public_updates = [u for u in updates if not u.get("is_confidential", False)]

    return jsonify({
        "success": True,
        "fir": fir,
        "history": history,
        "public_updates": public_updates
    })

@app.route("/api/firs/submit", methods=["POST"])
def submit_fir():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    category_id = data.get("category_id")
    incident_date = data.get("incident_date")
    incident_location = data.get("incident_location", "").strip()
    incident_district = data.get("incident_district", "Central")
    police_station = data.get("police_station", "Connaught Place Police Station")
    station_code = data.get("station_code", "DL-CP")
    incident_description = data.get("incident_description", "").strip()
    accused_type = data.get("accused_type", "Unknown")
    accused_details = data.get("accused_details")
    stolen_property_details = data.get("stolen_property_details")
    priority = data.get("priority", "Normal")

    if not all([user_id, category_id, incident_date, incident_location, incident_description]):
        return jsonify({"success": False, "message": "Required incident details missing"}), 400

    # Auto-run AI classifier & duplicate analyzer
    classification = crime_ai.predict_category(incident_description)
    existing_firs = execute_query("SELECT id, fir_number, incident_description as description FROM firs", fetch_all=True)
    dup_analysis = crime_ai.detect_duplicates(incident_description, existing_firs)

    dup_fir_id = dup_analysis.get("matched_fir", {}).get("id") if dup_analysis.get("is_duplicate") else None
    dup_score = dup_analysis.get("similarity_score", 0.0)

    fir_id, fir_number = FIRModel.submit_fir(
        user_id=user_id,
        category_id=category_id,
        incident_date=incident_date,
        incident_location=incident_location,
        incident_district=incident_district,
        police_station=police_station,
        station_code=station_code,
        incident_description=incident_description,
        accused_type=accused_type,
        accused_details=accused_details,
        stolen_property_details=stolen_property_details,
        priority=priority,
        ai_predicted_category=classification.get("category"),
        ai_confidence_score=classification.get("confidence"),
        ai_potential_duplicate_fir_id=dup_fir_id,
        ai_duplicate_similarity_score=dup_score
    )

    return jsonify({
        "success": True,
        "message": "FIR successfully lodged and registered",
        "fir_id": fir_id,
        "fir_number": fir_number,
        "ai_prediction": classification,
        "duplicate_analysis": dup_analysis
    }), 201

@app.route("/api/firs/<int:fir_id>/status", methods=["PUT"])
def update_fir_status(fir_id):
    data = request.get_json() or {}
    new_status = data.get("status")
    changed_by_name = data.get("changed_by_name", "Investigating Officer")
    changed_by_role = data.get("changed_by_role", "Police Officer")
    remarks = data.get("remarks", "")

    valid_statuses = ['Submitted', 'Verified', 'Under Investigation', 'Charge Sheet Filed', 'Closed', 'Rejected']
    if new_status not in valid_statuses:
        return jsonify({"success": False, "message": f"Invalid status. Must be one of {valid_statuses}"}), 400

    FIRModel.update_status(fir_id, new_status, changed_by_name, changed_by_role, remarks)
    return jsonify({"success": True, "message": f"FIR status updated to {new_status}"})

@app.route("/api/firs/<int:fir_id>/assign", methods=["PUT"])
def assign_investigating_officer(fir_id):
    data = request.get_json() or {}
    officer_id = data.get("officer_id")
    assigned_by_name = data.get("assigned_by_name", "Station In-Charge")

    if not officer_id:
        return jsonify({"success": False, "message": "Officer ID is required"}), 400

    FIRModel.assign_officer(fir_id, officer_id, assigned_by_name)
    return jsonify({"success": True, "message": "Investigating Officer assigned successfully"})

@app.route("/api/firs/<int:fir_id>/investigation-update", methods=["POST"])
def add_investigation_update(fir_id):
    data = request.get_json() or {}
    officer_id = data.get("officer_id")
    diary_entry_number = data.get("diary_entry_number", f"CD-{datetime.datetime.now().strftime('%Y%m%d%H%M')}")
    findings = data.get("findings", "").strip()
    next_action_plan = data.get("next_action_plan", "").strip()
    witness_statements = data.get("witness_statements", "").strip()

    if not findings or not officer_id:
        return jsonify({"success": False, "message": "Officer ID and findings narrative are required"}), 400

    FIRModel.add_investigation_update(fir_id, officer_id, diary_entry_number, findings, next_action_plan, witness_statements)
    return jsonify({"success": True, "message": "Investigation diary entry recorded in case docket"})

@app.route("/api/evidence/upload", methods=["POST"])
def upload_evidence():
    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file part in upload request"}), 400

    file = request.files["file"]
    fir_id = request.form.get("fir_id")
    description = request.form.get("description", "Supporting Evidence")
    uploaded_by_type = request.form.get("uploaded_by_type", "Citizen")
    uploaded_by_id = request.form.get("uploaded_by_id", 1)

    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"success": False, "message": "Invalid file format. Allowed: JPG, PNG, PDF, MP4, DOC"}), 400

    original_filename = secure_filename(file.filename)
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    saved_name = f"evid_fir{fir_id}_{timestamp}_{original_filename}"
    save_path = os.path.join(app.config["UPLOAD_FOLDER"], "evidence", saved_name)
    file.save(save_path)

    file_size = os.path.getsize(save_path)
    file_type = file.content_type or "application/octet-stream"
    file_url = f"/uploads/evidence/{saved_name}"

    FIRModel.add_evidence(fir_id, saved_name, original_filename, file_url, file_type, file_size, description, uploaded_by_type, uploaded_by_id)

    return jsonify({
        "success": True,
        "message": "Evidence successfully logged into digital repository",
        "file_url": file_url,
        "file_name": saved_name
    }), 201

@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# ----------------------------------------------------------------------
# 4. ROSTER & STATS APIS
# ----------------------------------------------------------------------

@app.route("/api/officers", methods=["GET"])
def get_officers():
    officers = OfficerModel.list_all()
    return jsonify({"success": True, "officers": officers})

@app.route("/api/officers", methods=["POST"])
def create_officer():
    data = request.get_json() or {}
    badge_number = data.get("badge_number")
    full_name = data.get("full_name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password", "Officer@123")
    rank = data.get("officer_rank", "Sub-Inspector")
    police_station = data.get("police_station")
    station_code = data.get("station_code", "PS-01")
    district = data.get("district")
    state = data.get("state")

    officer_id = OfficerModel.create_officer(badge_number, full_name, email, phone, password, rank, police_station, station_code, district, state)
    return jsonify({"success": True, "officer_id": officer_id, "message": "Officer enrolled successfully"})

@app.route("/api/stats", methods=["GET"])
def get_dashboard_stats():
    stats = FIRModel.get_statistics()
    return jsonify({"success": True, "stats": stats})

@app.route("/api/categories", methods=["GET"])
def get_categories():
    categories = execute_query("SELECT * FROM crime_categories ORDER BY id ASC", fetch_all=True)
    return jsonify({"success": True, "categories": categories})

# ----------------------------------------------------------------------
# 5. HTML WEB CONTROLLERS (College Presentation / Demo UI)
# ----------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"[*] Starting E-Rakshak Online FIR Management Server on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)
