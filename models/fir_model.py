"""
models/fir_model.py
"""
import datetime
from .db import execute_query

class FIRModel:
    @staticmethod
    def generate_fir_number(station_code="DL-CP"):
        year = datetime.datetime.now().year
        # Fetch count for current year
        sql = "SELECT COUNT(*) as cnt FROM firs WHERE fir_number LIKE %s"
        prefix = f"FIR/{station_code}/{year}/%"
        res = execute_query(sql, (prefix,), fetch_one=True)
        count = (res.get("cnt", 0) if res else 0) + 101
        return f"FIR/{station_code}/{year}/{count:04d}"

    @staticmethod
    def submit_fir(user_id, category_id, incident_date, incident_location, incident_district, 
                   police_station, station_code, incident_description, accused_type="Unknown", 
                   accused_details=None, stolen_property_details=None, priority="Normal",
                   ai_predicted_category=None, ai_confidence_score=None, 
                   ai_potential_duplicate_fir_id=None, ai_duplicate_similarity_score=0.0):
        
        fir_number = FIRModel.generate_fir_number(station_code or "DL-CP")
        sql = """
            INSERT INTO firs (fir_number, user_id, category_id, incident_date, incident_location, 
                              incident_district, police_station, station_code, incident_description, 
                              accused_type, accused_details, stolen_property_details, priority, status,
                              ai_predicted_category, ai_confidence_score, ai_potential_duplicate_fir_id, 
                              ai_duplicate_similarity_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Submitted', %s, %s, %s, %s)
        """
        fir_id = execute_query(sql, (
            fir_number, user_id, category_id, incident_date, incident_location, incident_district,
            police_station, station_code, incident_description, accused_type, accused_details,
            stolen_property_details, priority, ai_predicted_category, ai_confidence_score,
            ai_potential_duplicate_fir_id, ai_duplicate_similarity_score
        ), commit=True)

        # Log initial status history
        FIRModel.add_status_history(fir_id, None, 'Submitted', 'Citizen / Online Portal', 'System', 'FIR successfully lodged via online citizen portal')
        return fir_id, fir_number

    @staticmethod
    def get_by_id(fir_id):
        sql = """
            SELECT f.*, u.full_name as complainant_name, u.phone as complainant_phone, u.email as complainant_email,
                   u.address as complainant_address, u.aadhaar_number as complainant_aadhaar,
                   c.category_name, c.legal_section_ipc, c.legal_section_bns, c.severity,
                   po.full_name as officer_name, po.badge_number as officer_badge, po.officer_rank, po.phone as officer_phone
            FROM firs f
            JOIN users u ON f.user_id = u.id
            JOIN crime_categories c ON f.category_id = c.id
            LEFT JOIN police_officers po ON f.assigned_officer_id = po.id
            WHERE f.id = %s
        """
        return execute_query(sql, (fir_id,), fetch_one=True)

    @staticmethod
    def get_by_fir_number(fir_number):
        sql = """
            SELECT f.*, u.full_name as complainant_name, u.phone as complainant_phone, u.email as complainant_email,
                   u.address as complainant_address,
                   c.category_name, c.legal_section_ipc, c.legal_section_bns,
                   po.full_name as officer_name, po.badge_number as officer_badge, po.officer_rank, po.phone as officer_phone
            FROM firs f
            JOIN users u ON f.user_id = u.id
            JOIN crime_categories c ON f.category_id = c.id
            LEFT JOIN police_officers po ON f.assigned_officer_id = po.id
            WHERE f.fir_number = %s
        """
        return execute_query(sql, (fir_number.strip(),), fetch_one=True)

    @staticmethod
    def list_all(status=None, category_id=None, search=None, user_id=None, officer_id=None):
        conditions = []
        params = []

        if user_id:
            conditions.append("f.user_id = %s")
            params.append(user_id)
        if officer_id:
            conditions.append("f.assigned_officer_id = %s")
            params.append(officer_id)
        if status and status != 'ALL':
            conditions.append("f.status = %s")
            params.append(status)
        if category_id:
            conditions.append("f.category_id = %s")
            params.append(category_id)
        if search:
            conditions.append("(f.fir_number LIKE %s OR f.incident_location LIKE %s OR u.full_name LIKE %s OR f.incident_description LIKE %s)")
            term = f"%{search}%"
            params.extend([term, term, term, term])

        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        sql = f"""
            SELECT f.*, u.full_name as complainant_name, u.phone as complainant_phone,
                   c.category_name, c.legal_section_ipc, c.legal_section_bns,
                   po.full_name as officer_name, po.badge_number as officer_badge
            FROM firs f
            JOIN users u ON f.user_id = u.id
            JOIN crime_categories c ON f.category_id = c.id
            LEFT JOIN police_officers po ON f.assigned_officer_id = po.id
            {where_clause}
            ORDER BY f.id DESC
        """
        return execute_query(sql, params, fetch_all=True)

    @staticmethod
    def update_status(fir_id, new_status, changed_by_name, changed_by_role, remarks=""):
        current = execute_query("SELECT status FROM firs WHERE id = %s", (fir_id,), fetch_one=True)
        prev_status = current.get("status") if current else None
        
        execute_query("UPDATE firs SET status = %s WHERE id = %s", (new_status, fir_id), commit=True)
        FIRModel.add_status_history(fir_id, prev_status, new_status, changed_by_name, changed_by_role, remarks)
        return True

    @staticmethod
    def assign_officer(fir_id, officer_id, assigned_by_name="Admin"):
        execute_query("UPDATE firs SET assigned_officer_id = %s, status = CASE WHEN status = 'Submitted' THEN 'Verified' ELSE status END WHERE id = %s", 
                      (officer_id, fir_id), commit=True)
        officer = execute_query("SELECT full_name, officer_rank, badge_number FROM police_officers WHERE id = %s", (officer_id,), fetch_one=True)
        officer_label = f"{officer['officer_rank']} {officer['full_name']} (Badge: {officer['badge_number']})" if officer else f"Officer ID #{officer_id}"
        FIRModel.add_status_history(fir_id, None, 'Assigned', assigned_by_name, 'Admin/SHO', f"Investigating Officer assigned: {officer_label}")
        return True

    @staticmethod
    def add_status_history(fir_id, prev_status, new_status, changed_by_name, changed_by_role, remarks):
        sql = """
            INSERT INTO fir_status_history (fir_id, previous_status, new_status, changed_by_name, changed_by_role, remarks)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        return execute_query(sql, (fir_id, prev_status, new_status, changed_by_name, changed_by_role, remarks), commit=True)

    @staticmethod
    def get_status_history(fir_id):
        sql = "SELECT * FROM fir_status_history WHERE fir_id = %s ORDER BY id ASC"
        return execute_query(sql, (fir_id,), fetch_all=True)

    @staticmethod
    def add_investigation_update(fir_id, officer_id, diary_entry_number, findings, next_action_plan="", witness_statements=None):
        sql = """
            INSERT INTO investigation_updates (fir_id, officer_id, diary_entry_number, findings, next_action_plan, witness_statements)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        return execute_query(sql, (fir_id, officer_id, diary_entry_number, findings, next_action_plan, witness_statements), commit=True)

    @staticmethod
    def get_investigation_updates(fir_id):
        sql = """
            SELECT iu.*, po.full_name as officer_name, po.badge_number, po.officer_rank
            FROM investigation_updates iu
            JOIN police_officers po ON iu.officer_id = po.id
            WHERE iu.fir_id = %s
            ORDER BY iu.id ASC
        """
        return execute_query(sql, (fir_id,), fetch_all=True)

    @staticmethod
    def add_evidence(fir_id, file_name, original_name, file_path, file_type, file_size_bytes, description, uploaded_by_type="Citizen", uploaded_by_id=1):
        sql = """
            INSERT INTO evidence (fir_id, file_name, original_name, file_path, file_type, file_size_bytes, description, uploaded_by_type, uploaded_by_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        return execute_query(sql, (fir_id, file_name, original_name, file_path, file_type, file_size_bytes, description, uploaded_by_type, uploaded_by_id), commit=True)

    @staticmethod
    def get_evidence(fir_id):
        sql = "SELECT * FROM evidence WHERE fir_id = %s ORDER BY id DESC"
        return execute_query(sql, (fir_id,), fetch_all=True)

    @staticmethod
    def get_statistics():
        total = execute_query("SELECT COUNT(*) as c FROM firs", fetch_one=True).get('c', 0)
        pending = execute_query("SELECT COUNT(*) as c FROM firs WHERE status = 'Submitted'", fetch_one=True).get('c', 0)
        investigating = execute_query("SELECT COUNT(*) as c FROM firs WHERE status IN ('Verified', 'Under Investigation')", fetch_one=True).get('c', 0)
        charge_sheet = execute_query("SELECT COUNT(*) as c FROM firs WHERE status = 'Charge Sheet Filed'", fetch_one=True).get('c', 0)
        closed = execute_query("SELECT COUNT(*) as c FROM firs WHERE status = 'Closed'", fetch_one=True).get('c', 0)
        rejected = execute_query("SELECT COUNT(*) as c FROM firs WHERE status = 'Rejected'", fetch_one=True).get('c', 0)

        categories = execute_query("""
            SELECT c.category_name, COUNT(f.id) as count
            FROM crime_categories c
            LEFT JOIN firs f ON c.id = f.category_id
            GROUP BY c.id, c.category_name
            ORDER BY count DESC
        """, fetch_all=True)

        return {
            "total_firs": total,
            "pending_firs": pending,
            "under_investigation": investigating,
            "charge_sheet_filed": charge_sheet,
            "closed_firs": closed,
            "rejected_firs": rejected,
            "categories": categories or []
        }
