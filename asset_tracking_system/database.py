import sqlite3
import os
from datetime import datetime

DATABASE_PATH = 'data/assets.db'

def get_db_connection():
    """获取数据库连接"""
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
    
    # 插入示例数据
    insert_sample_data()

def insert_sample_data():
    """插入示例数据"""
    conn = get_db_connection()
    
    # 检查是否已有数据
    count = conn.execute('SELECT COUNT(*) FROM assets').fetchone()[0]
    if count > 0:
        conn.close()
        return
    
    # 插入示例资产数据 - 高价值可移动设备
    sample_assets = [
        ('LAPTOP001', '联想ThinkPad P1', '移动工作站', '联想', 'ThinkPad P1 Gen4', '2024-01-15', 18999.00, '15F-研发部-工位R12', 'available', 'SF001'),
        ('LAPTOP002', '戴尔Precision 7560', '移动工作站', '戴尔', 'Precision 7560', '2024-02-20', 22999.00, '15F-设计部-工位D05', 'borrowed', 'SF002'),
        ('SERVER003', '边缘计算服务器', '便携服务器', '华为', 'FusionServer 2288H V5', '2024-03-10', 35999.00, '15F-机房-机柜A15', 'available', 'SF003'),
        ('DRONE004', '大疆无人机', '无人机设备', '大疆', 'Matrice 300 RTK', '2024-01-25', 45999.00, '15F-测试部-设备柜', 'maintenance', 'SF004'),
        ('LAPTOP005', '苹果MacBook Pro', '笔记本电脑', '苹果', 'MacBook Pro 16"', '2024-04-05', 25999.00, '15F-市场部-工位M03', 'borrowed', 'SF005'),
        ('SERVER006', '移动存储服务器', '存储设备', '戴尔', 'PowerVault ME4012', '2024-02-15', 28999.00, '15F-机房-存储区', 'available', 'SF006'),
        ('WORKSTATION007', '图形工作站', '移动工作站', '惠普', 'ZBook Fury 17 G8', '2024-05-20', 32999.00, '15F-研发部-工位R08', 'borrowed', 'SF007'),
        ('DRONE008', '测绘无人机', '无人机设备', '大疆', 'Phantom 4 RTK', '2024-03-25', 15999.00, '15F-测试部-充电区', 'available', 'SF008'),
        ('NET-TESTER001', '网络优化测试仪', '移动工作站', '是德科技', 'Keysight N9918A', '2024-06-10', 85000.00, '15F-网络部-测试台', 'borrowed', 'SF009'),
        ('OSCILLOSCOPE001', '示波器', '便携服务器', '泰克', 'Tektronix MSO58', '2024-07-15', 120000.00, '15F-硬件部-实验室', 'available', 'SF010'),
        ('CAMERA009', '佳能单反相机', '摄影设备', '佳能', 'EOS R5', '2024-06-10', 12999.00, '15F-行政部-设备柜', 'borrowed', 'SF011'),
        ('PROJECTOR010', '激光投影仪', '会议设备', '爱普生', 'EB-L1755U', '2024-07-15', 8999.00, '15F-设计部-会议室', 'available', 'SF012'),
        ('TABLET011', 'iPad Pro', '平板电脑', '苹果', 'iPad Pro 12.9"', '2024-01-20', 6999.00, '15F-产品部-工位P12', 'borrowed', 'SF013'),
        ('ROUTER012', '企业路由器', '网络设备', '华为', 'AR6300', '2024-02-25', 4999.00, '15F-技术部-网络机柜', 'available', 'SF014'),
        ('LAPTOP013', '华硕游戏本', '笔记本电脑', '华硕', 'ROG Strix G15', '2024-03-30', 9999.00, '15F-研发部-工位R03', 'available', 'SF015'),
        ('WORKSTATION014', '戴尔工作站', '台式工作站', '戴尔', 'Precision 7000', '2024-04-05', 15999.00, '15F-运维部-工位O12', 'borrowed', 'SF016'),
        ('DRONE015', '航拍无人机', '无人机设备', '大疆', 'Air 2S', '2024-05-10', 6999.00, '15F-测试部-充电站', 'available', 'SF017')
    ]
    
    for asset in sample_assets:
        conn.execute('''
            INSERT INTO assets (asset_code, asset_name, category, brand, model, purchase_date, purchase_price, current_location, status, star_flash_tag_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', asset)
    
    # 插入示例位置数据 - 精确的室内坐标，统一为15F
    location_data = [
        (1, '15F-研发部-工位R12', 120.123456, 30.654321, -45),
        (2, '15F-设计部-工位D05', 120.124567, 30.655432, -38),
        (3, '15F-机房-机柜A15', 120.125678, 30.656543, -35),
        (4, '15F-研发部-工位R08', 120.126789, 30.657654, -50),
        (5, '15F-机房-存储区', 120.127890, 30.658765, -42),
        (6, '15F-市场部-工位M03', 120.128901, 30.659876, -40),
        (7, '15F-行政部-会议室', 120.129012, 30.660987, -47),
        (8, '15F-产品部-工位P08', 120.130123, 30.662098, -43)
    ]
    
    for location in location_data:
        conn.execute('''
            INSERT INTO location_history (asset_id, location, x_coordinate, y_coordinate, signal_strength)
            VALUES (?, ?, ?, ?, ?)
        ''', location)
    
    # 插入示例借用记录 - 更多真实数据
    borrow_data = [
        (2, '王建国', '市场部', '2024-03-10', '2024-10-20', 'borrowed'),
        (7, '李明华', '项目组', '2024-04-12', '2024-11-19', 'borrowed'),
        (1, '张志强', '研发部', '2024-01-08', '2024-08-15', 'returned'),
        (3, '陈晓东', '技术部', '2024-02-05', '2024-09-12', 'returned'),
        (5, '刘小红', '创意部', '2024-05-14', '2024-12-21', 'borrowed'),
        (4, '赵敏', '测试部', '2024-01-11', '2024-01-18', 'returned'),
        (6, '孙大伟', '运维部', '2024-01-13', '2024-01-20', 'borrowed'),
        (8, '周小丽', '产品部', '2024-01-09', '2024-01-16', 'returned'),
        (1, '陈思雨', '研发部', '2024-02-15', '2024-09-22', 'borrowed'),
        (2, '林志豪', '设计部', '2024-03-16', '2024-10-23', 'borrowed'),
        (3, '黄小明', '技术部', '2024-04-14', '2024-11-21', 'returned'),
        (4, '吴大伟', '测试部', '2024-01-13', '2024-01-20', 'borrowed'),
        (5, '范小芳', '创意部', '2024-02-17', '2024-09-24', 'borrowed'),
        (6, '刘小菲', '运维部', '2024-01-12', '2024-01-19', 'returned'),
        (7, '胡小歌', '研发部', '2024-03-18', '2024-10-25', 'borrowed'),
        (8, '杨小美', '产品部', '2024-01-11', '2024-01-18', 'returned'),
        (1, '邓小超', '行政部', '2024-04-19', '2024-11-26', 'borrowed'),
        (2, '孙小丽', '市场部', '2024-01-10', '2024-01-17', 'returned'),
        (3, '赵小颖', '技术部', '2024-05-20', '2024-12-27', 'borrowed'),
        (4, '迪小热', '测试部', '2024-01-09', '2024-01-16', 'returned'),
        (5, '古小娜', '创意部', '2024-06-21', '2025-01-28', 'borrowed'),
        (6, '宋小茜', '运维部', '2024-01-08', '2024-01-15', 'returned'),
        (7, '易小千', '研发部', '2024-01-22', '2024-08-29', 'borrowed'),
        (8, '王小凯', '产品部', '2024-01-07', '2024-01-14', 'returned'),
        (1, '王小源', '行政部', '2024-02-23', '2024-09-30', 'borrowed'),
        (2, '鹿小晗', '市场部', '2024-01-06', '2024-01-13', 'returned'),
        (3, '吴小凡', '技术部', '2024-03-24', '2024-10-31', 'borrowed'),
        (4, '张小兴', '测试部', '2024-01-05', '2024-01-12', 'returned'),
        (5, '李小峰', '创意部', '2024-04-25', '2025-02-01', 'borrowed'),
        (6, '杨小洋', '运维部', '2024-01-04', '2024-01-11', 'returned'),
        (7, '陈小霆', '研发部', '2024-05-26', '2025-02-02', 'borrowed'),
        (8, '李小硕', '产品部', '2024-01-03', '2024-01-10', 'returned'),
        (1, '宋小基', '行政部', '2024-06-27', '2025-03-03', 'borrowed'),
        (2, '朴小剑', '市场部', '2024-01-02', '2024-01-09', 'returned'),
        (3, '金小贤', '技术部', '2024-01-28', '2024-08-04', 'borrowed'),
        (4, '李小镐', '测试部', '2024-01-01', '2024-01-08', 'returned'),
        (9, '王五', '网络部', '2024-01-15', '2024-08-22', 'borrowed'),
        (10, '赵六', '硬件部', '2024-01-16', '2024-08-23', 'available')
    ]
    
    for borrow in borrow_data:
        conn.execute('''
            INSERT INTO borrow_records (asset_id, borrower_name, borrower_department, borrow_date, expected_return_date, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', borrow)
    
    # 插入示例维护记录
    maintenance_data = [
        (4, '定期保养', '2024-01-10', '王志伟', '无人机电池校准和螺旋桨检查', 850.00, 'ongoing', '2024-07-10'),
        (1, '屏幕更换', '2024-01-12', '李娜', '更换损坏的笔记本电脑屏幕', 1200.00, 'completed', None),
        (3, '系统升级', '2024-01-15', '张鹏', '服务器操作系统版本升级', 0.00, 'completed', None),
        (5, '电池更换', '2024-01-18', '刘洋', '更换老化电池', 500.00, 'ongoing', '2025-01-18'),
        (2, '主板维修', '2024-01-20', '陈静', '维修无法开机的笔记本电脑', 2500.00, 'ongoing', None),
        (6, '网络配置', '2024-01-22', '黄磊', '配置新的网络交换机', 300.00, 'completed', None),
        (7, '软件安装', '2024-01-25', '周涛', '安装专业设计软件', 0.00, 'completed', '2024-07-25'),
        (8, '天线校准', '2024-02-01', '王志伟', '校准无人机天线', 200.00, 'planned', '2024-08-01'),
        (9, '镜头清洁', '2024-02-05', '李娜', '清洁相机镜头', 50.00, 'completed', None),
        (10, '固件升级', '2024-02-10', '张鹏', '升级示波器固件', 0.00, 'planned', '2024-08-10')
    ]
    
    for maintenance in maintenance_data:
        conn.execute('''
            INSERT INTO maintenance_records (asset_id, maintenance_type, maintenance_date, maintenance_person, description, cost, status, next_maintenance_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', maintenance)
    
    # 插入示例盘点记录
    inventory_data = [
        ('2024-01-15', 1, '1F-研发部-工位A12', '1F-研发部-工位A12', 'normal', '张伟'),
        ('2024-01-15', 3, '1F-机房-机柜A15', '1F-机房-机柜B12', 'abnormal', '李静'),
        ('2024-01-15', 5, '2F-创意部-工位C08', '2F-创意部-工位C08', 'normal', '王强'),
        ('2024-01-16', 2, '15F-设计部-工位D05', '15F-市场部-会议室', 'abnormal', '赵丽'),
        ('2024-01-16', 4, '15F-测试部-设备柜', '无法定位', 'missing', '孙超'),
        ('2024-01-17', 6, '15F-机房-存储区', '15F-机房-存储区', 'normal', '周鹏'),
        ('2024-01-17', 7, '15F-研发部-工位R08', '15F-研发部-工位R08', 'normal', '吴迪'),
        ('2024-01-18', 8, '15F-测试部-充电区', '15F-测试部-充电区', 'normal', '郑洋')
    ]
    
    for inventory in inventory_data:
        conn.execute('''
            INSERT INTO inventory_records (inventory_date, asset_id, expected_location, actual_location, status, checker_name)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', inventory)
    
    # 插入示例告警
    alert_data = [
        ('location_anomaly', 1, '设备位置异常', 'LAPTOP001设备检测到异常移动，当前位置与预期不符', 'high', 'unread'),
        ('device_offline', 5, '设备离线', 'CAMERA005设备星闪信号丢失，可能已关机或移出范围', 'medium', 'unread'),
        ('borrow_overdue', 3, '借用逾期', 'TABLET003设备借用已逾期2天，请及时催还', 'medium', 'unread'),
        ('maintenance_due', 6, '维护提醒', 'SERVER006设备即将到达维护周期，建议安排保养', 'low', 'read')
    ]
    
    for alert in alert_data:
        conn.execute('''
            INSERT INTO alerts (alert_type, asset_id, title, message, severity, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', alert)
    
    # 插入示例用户
    user_data = [
        ('admin', '系统管理员', 'admin123', 'admin', 'IT部', 'admin@company.com', '13800138000'),
        ('zhangwei', '张伟', 'pass123', 'user', '市场部', 'zhangwei@company.com', '13800138001'),
        ('wangjing', '王静', 'pass123', 'manager', '技术部', 'wangjing@company.com', '13800138002')
    ]

    for user in user_data:
        conn.execute('''
            INSERT INTO users (username, name, password, role, department, email, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', user)
    
    conn.commit()
    conn.close()