"""
models/user_model.py
"""
from werkzeug.security import generate_password_hash, check_password_hash
from .db import execute_query

class UserModel:
    @staticmethod
    def create_user(full_name, email, phone, password, address, city, state, pincode, aadhaar_number=None, emergency_contact=None):
        password_hash = generate_password_hash(password)
        sql = """
            INSERT INTO users (full_name, email, phone, password_hash, aadhaar_number, address, city, state, pincode, emergency_contact)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        user_id = execute_query(sql, (full_name, email, phone, password_hash, aadhaar_number, address, city, state, pincode, emergency_contact), commit=True)
        return user_id

    @staticmethod
    def get_by_email(email):
        sql = "SELECT * FROM users WHERE email = %s"
        return execute_query(sql, (email,), fetch_one=True)

    @staticmethod
    def get_by_phone(phone):
        sql = "SELECT * FROM users WHERE phone = %s"
        return execute_query(sql, (phone,), fetch_one=True)

    @staticmethod
    def get_by_id(user_id):
        sql = "SELECT id, full_name, email, phone, aadhaar_number, address, city, state, pincode, emergency_contact, created_at FROM users WHERE id = %s"
        return execute_query(sql, (user_id,), fetch_one=True)

    @staticmethod
    def list_all():
        sql = "SELECT id, full_name, email, phone, city, state, created_at FROM users ORDER BY id DESC"
        return execute_query(sql, fetch_all=True)

    @staticmethod
    def verify_password(stored_hash, candidate_password):
        if not stored_hash:
            return False
        # If demo hash
        if stored_hash.startswith("pbkdf2:sha256:260000$saltdummy"):
            return candidate_password == "User@123"
        return check_password_hash(stored_hash, candidate_password)
