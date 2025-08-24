import sqlite3
import os
from datetime import datetime

# Build paths relative to the script's location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DATABASE_PATH = os.path.join(DATA_DIR, 'assets.db')

def get_db_connection():
    """获取数据库连接"""
    # Ensure the data directory exists
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """初始化数据库表"""
    conn = get_db_connection()
    
    # 资产信息表
    conn.execute('''
        CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_code VARCHAR(50) UNIQUE NOT NULL,
            asset_name VARCHAR(100) NOT NULL,
            category VARCHAR(50) NOT NULL,
            brand VARCHAR(50),
            model VARCHAR(50),
            purchase_date DATE,
            purchase_price DECIMAL(10,2),
            current_location VARCHAR(100),
            status VARCHAR(20) DEFAULT 'available',
            star_flash_tag_id VARCHAR(50),
            battery_level INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 位置追踪表
    conn.execute('''
        CREATE TABLE IF NOT EXISTS location_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER,
            location VARCHAR(100) NOT NULL,
            x_coordinate DECIMAL(10,6),
            y_coordinate DECIMAL(10,6),
            signal_strength INTEGER,
            accuracy REAL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets (id)
        )
    ''')
    
    # 借用记录表
    conn.execute('''
        CREATE TABLE IF NOT EXISTS borrow_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER,
            borrower_name VARCHAR(50) NOT NULL,
            borrower_department VARCHAR(50),
            borrow_date DATE NOT NULL,
            expected_return_date DATE,
            actual_return_date DATE,
            status VARCHAR(20) DEFAULT 'borrowed',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets (id)
        )
    ''')
    
    # 维护记录表
    conn.execute('''
        CREATE TABLE IF NOT EXISTS maintenance_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER,
            maintenance_type VARCHAR(50) NOT NULL,
            maintenance_date DATE NOT NULL,
            maintenance_person VARCHAR(50),
            description TEXT,
            cost DECIMAL(10,2),
            next_maintenance_date DATE,
            status VARCHAR(20) DEFAULT 'completed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets (id)
        )
    ''')
    
    # 盘点记录表
    conn.execute('''
        CREATE TABLE IF NOT EXISTS inventory_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inventory_date DATE NOT NULL,
            asset_id INTEGER,
            expected_location VARCHAR(100),
            actual_location VARCHAR(100),
            status VARCHAR(20),
            checker_name VARCHAR(50),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets (id)
        )
    ''')
    
    # 用户权限表
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(50),
            password VARCHAR(100) NOT NULL,
            role VARCHAR(20) NOT NULL,
            department VARCHAR(50),
            email VARCHAR(100),
            phone VARCHAR(20),
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 告警通知表
    conn.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_type VARCHAR(50) NOT NULL,
            asset_id INTEGER,
            title VARCHAR(100) NOT NULL,
            message TEXT NOT NULL,
            severity VARCHAR(20) DEFAULT 'medium',
            status VARCHAR(20) DEFAULT 'unread',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets (id)
        )
    ''')
    
    conn.commit()
    conn.close()