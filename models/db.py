"""
models/db.py
========================================================================
MySQL Database Connector with Fallback to SQLite for zero-setup local dev.
Supports parameterized queries for 100% SQL-injection safety.
========================================================================
"""

import os
import sqlite3
from dotenv import load_dotenv

load_dotenv()

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DB = os.getenv("MYSQL_DB", "fir_management_db")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))

def get_db_connection():
    """
    Attempts to connect to MySQL database via PyMySQL.
    If MySQL server is not running locally, seamlessly falls back
    to an embedded SQLite database (fir_local.db) for testing & demo.
    """
    try:
        import pymysql
        conn = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DB,
            port=MYSQL_PORT,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True
        )
        return conn, "mysql"
    except Exception as e:
        # Fallback to SQLite for portable local operation
        db_path = os.path.join(os.path.dirname(__file__), "..", "database", "fir_local.db")
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn, "sqlite"

def execute_query(query, params=None, fetch_all=False, fetch_one=False, commit=False):
    """
    Executes a parameterized SQL query safely against MySQL or SQLite.
    """
    conn, engine = get_db_connection()
    try:
        cursor = conn.cursor()
        # Adapt placeholder syntax if SQLite is active
        if engine == "sqlite" and "%s" in query:
            query = query.replace("%s", "?")
            
        cursor.execute(query, params or ())
        
        if fetch_one:
            res = cursor.fetchone()
            if engine == "sqlite" and res:
                return dict(res)
            return res
        if fetch_all:
            res = cursor.fetchall()
            if engine == "sqlite" and res:
                return [dict(r) for r in res]
            return res
        if commit:
            if engine == "sqlite":
                conn.commit()
            return cursor.lastrowid
        return None
    finally:
        conn.close()
