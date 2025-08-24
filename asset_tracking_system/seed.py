from database import get_db_connection, init_db

def seed_data():
    """向数据库中插入种子数据"""
    # 首先确保数据库和表已创建
    init_db()
    
    conn = get_db_connection()
    
    # 检查是否已有数据，如果有了就不再插入
    count = conn.execute('SELECT COUNT(*) FROM assets').fetchone()[0]
    if count > 0:
        print("数据库中已有数据，跳过种子数据插入。")
        conn.close()
        return

    print("正在插入种子数据...")

    # 插入示例资产数据 - 包含电池电量
    sample_assets = [
        ('LAPTOP001', '联想ThinkPad P1', '移动工作站', '联想', 'ThinkPad P1 Gen4', '2024-01-15', 18999.00, '15F-研发部-工位R12', 'available', 'SF001', 85),
        ('LAPTOP002', '戴尔Precision 7560', '移动工作站', '戴尔', 'Precision 7560', '2024-02-20', 22999.00, '15F-设计部-工位D05', 'borrowed', 'SF002', 45),
        ('SERVER003', '边缘计算服务器', '便携服务器', '华为', 'FusionServer 2288H V5', '2024-03-10', 35999.00, '15F-机房-机柜A15', 'available', 'SF003', 92),
        ('DRONE004', '大疆无人机', '无人机设备', '大疆', 'Matrice 300 RTK', '2024-01-25', 45999.00, '15F-测试部-设备柜', 'maintenance', 'SF004', 15),
        ('LAPTOP005', '苹果MacBook Pro', '笔记本电脑', '苹果', 'MacBook Pro 16"', '2024-04-05', 25999.00, '15F-市场部-工位M03', 'borrowed', 'SF005', 8),
        ('SERVER006', '移动存储服务器', '存储设备', '戴尔', 'PowerVault ME4012', '2024-02-15', 28999.00, '15F-机房-存储区', 'available', 'SF006', 78),
        ('WORKSTATION007', '图形工作站', '移动工作站', '惠普', 'ZBook Fury 17 G8', '2024-05-20', 32999.00, '15F-研发部-工位R08', 'borrowed', 'SF007', 55),
        ('DRONE008', '测绘无人机', '无人机设备', '大疆', 'Phantom 4 RTK', '2024-03-25', 15999.00, '15F-测试部-充电区', 'available', 'SF008', 68),
        ('NET-TESTER001', '网络优化测试仪', '移动工作站', '是德科技', 'Keysight N9918A', '2024-06-10', 85000.00, '15F-网络部-测试台', 'borrowed', 'SF009', 90),
        ('OSCILLOSCOPE001', '示波器', '便携服务器', '泰克', 'Tektronix MSO58', '2024-07-15', 120000.00, '15F-硬件部-实验室', 'available', 'SF010', 90),
        ('CAMERA009', '佳能单反相机', '摄影设备', '佳能', 'EOS R5', '2024-06-10', 12999.00, '15F-行政部-设备柜', 'borrowed', 'SF011', 90),
        ('PROJECTOR010', '激光投影仪', '会议设备', '爱普生', 'EB-L1755U', '2024-07-15', 8999.00, '15F-设计部-会议室', 'available', 'SF012', 90),
        ('TABLET011', 'iPad Pro', '平板电脑', '苹果', 'iPad Pro 12.9"', '2025-01-20', 6999.00, '15F-产品部-工位P12', 'borrowed', 'SF013', 90),
        ('ROUTER012', '企业路由器', '网络设备', '华为', 'AR6300', '2025-02-25', 4999.00, '15F-技术部-网络机柜', 'available', 'SF014', 90),
        ('LAPTOP013', '华硕游戏本', '笔记本电脑', '华硕', 'ROG Strix G15', '2025-03-30', 9999.00, '15F-研发部-工位R03', 'available', 'SF015', 90),
        ('WORKSTATION014', '戴尔工作站', '台式工作站', '戴尔', 'Precision 7000', '2025-04-05', 15999.00, '15F-运维部-工位O12', 'borrowed', 'SF016', 90),
        ('DRONE015', '航拍无人机', '无人机设备', '大疆', 'Air 2S', '2025-05-10', 6999.00, '15F-测试部-充电站', 'available', 'SF017', 90),
        ('LAPTOP010', '联想ThinkPad T14', '笔记本电脑', '联想', 'ThinkPad T14', '2025-08-19', 8999.00, '15F-研发部-工位R10', 'available', 'SF018', 90),
        ('TABLET015', '苹果iPad Pro', '平板电脑', '苹果', 'iPad Pro 11"', '2025-08-14', 5999.00, '15F-产品部-工位P15', 'available', 'SF019', 90),
        ('CAMERA016', '索尼A7R5', '摄影设备', '索尼', 'A7R5', '2025-08-11', 25999.00, '15F-行政部-设备柜', 'available', 'SF020', 90),
        ('LAPTOP022', '联想ThinkBook 14', '笔记本电脑', '联想', 'ThinkBook 14', '2025-08-04', 6999.00, '15F-市场部-工位M08', 'available', 'SF021', 90),
        ('LAPTOP031', '华硕ZenBook Pro', '笔记本电脑', '华硕', 'ZenBook Pro', '2025-07-27', 12999.00, '15F-设计部-工位D11', 'available', 'SF022', 90),
        ('SERVER020', '华为RH2288H V5', '服务器', '华为', 'RH2288H V5', '2025-07-19', 45000.00, '15F-机房-机柜B05', 'available', 'SF023', 90),
        ('PROJECTOR032', '明基TK700STi', '会议设备', '明基', 'TK700STi', '2025-07-09', 7999.00, '15F-会议室-大会议室', 'available', 'SF024', 90)
    ]
    
    for asset in sample_assets:
        conn.execute('''
            INSERT INTO assets (asset_code, asset_name, category, brand, model, purchase_date, purchase_price, current_location, status, star_flash_tag_id, battery_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', asset)

    # 获取asset_code到id的映射
    asset_id_map = {row['asset_code']: row['id'] for row in conn.execute('SELECT id, asset_code FROM assets').fetchall()}
    asset_codes = [asset[0] for asset in sample_assets]

    def get_asset_id(code):
        return asset_id_map.get(code)

    # 插入示例位置数据 - 包含精度
    location_data = [
        (get_asset_id('LAPTOP001'), '15F-研发部-工位R12', 120.123456, 30.654321, -45, 0.15),
        (get_asset_id('LAPTOP002'), '15F-设计部-工位D05', 120.124567, 30.655432, -38, 0.25),
        (get_asset_id('SERVER003'), '15F-机房-机柜A15', 120.125678, 30.656543, -35, 0.12),
        (get_asset_id('WORKSTATION007'), '15F-研发部-工位R08', 120.126789, 30.657654, -50, 0.35),
        (get_asset_id('SERVER006'), '15F-机房-存储区', 120.127890, 30.658765, -42, 0.20),
        (get_asset_id('LAPTOP005'), '15F-市场部-工位M03', 120.128901, 30.659876, -40, 0.18),
        (get_asset_id('DRONE008'), '15F-测试部-充电区', 120.129901, 30.661876, -48, 0.16),
        (get_asset_id('NET-TESTER001'), '15F-网络部-测试台', 120.130901, 30.662876, -52, 0.30),
        (get_asset_id('OSCILLOSCOPE001'), '15F-硬件部-实验室', 120.131901, 30.663876, -41, 0.10),
        (get_asset_id('CAMERA009'), '15F-行政部-设备柜', 120.132901, 30.664876, -55, 0.22),
        (get_asset_id('PROJECTOR010'), '15F-设计部-会议室', 120.133901, 30.665876, -46, 0.28),
        (get_asset_id('TABLET011'), '15F-产品部-工位P12', 120.134901, 30.666876, -43, 0.17),
        (get_asset_id('ROUTER012'), '15F-技术部-网络机柜', 120.135901, 30.667876, -39, 0.14),
        (get_asset_id('LAPTOP013'), '15F-研发部-工位R03', 120.136901, 30.668876, -51, 0.26),
        (get_asset_id('WORKSTATION014'), '15F-运维部-工位O12', 120.137901, 30.669876, -47, 0.33),
        (get_asset_id('LAPTOP010'), '15F-研发部-工位R10', 120.138901, 30.670876, -44, 0.19),
        (get_asset_id('TABLET015'), '15F-产品部-工位P15', 120.139901, 30.671876, -49, 0.21),
        (get_asset_id('CAMERA016'), '15F-行政部-设备柜', 120.140901, 30.672876, -53, 0.24),
        (get_asset_id('LAPTOP022'), '15F-市场部-工位M08', 120.141901, 30.673876, -42, 0.20),
        (get_asset_id('LAPTOP031'), '15F-设计部-工位D11', 120.142901, 30.674876, -50, 0.27)
    ]
    
    for location in location_data:
        if location[0] is not None:
            conn.execute('''
                INSERT INTO location_history (asset_id, location, x_coordinate, y_coordinate, signal_strength, accuracy)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', location)

    # 插入示例借用记录
    borrow_data = [
        (get_asset_id('LAPTOP002'), '王建国', '市场部', '2025-03-10', '2025-09-20', 'borrowed'),
        (get_asset_id('WORKSTATION007'), '李明华', '项目组', '2025-04-12', '2025-10-19', 'borrowed'),
        (get_asset_id('LAPTOP001'), '张志强', '研发部', '2025-01-08', '2025-07-15', 'returned'),
        (get_asset_id('SERVER003'), '陈晓东', '技术部', '2025-02-05', '2025-06-12', 'returned'),
        (get_asset_id('LAPTOP005'), '刘小红', '创意部', '2025-05-14', '2025-12-21', 'borrowed'),
        (get_asset_id('DRONE004'), '赵敏', '测试部', '2025-01-11', '2025-01-18', 'returned'),
        (get_asset_id('SERVER006'), '孙大伟', '运维部', '2025-01-13', '2025-01-20', 'borrowed'),
        (get_asset_id('DRONE008'), '周小丽', '产品部', '2025-01-09', '2025-01-16', 'returned'),
        (get_asset_id('LAPTOP001'), '陈思雨', '研发部', '2025-02-15', '2025-09-22', 'borrowed'),
        (get_asset_id('LAPTOP002'), '林志豪', '设计部', '2025-03-16', '2025-10-23', 'borrowed'),
        (get_asset_id('SERVER003'), '黄小明', '技术部', '2025-04-14', '2025-07-21', 'returned'),
        (get_asset_id('DRONE004'), '吴大伟', '测试部', '2025-01-13', '2025-01-20', 'borrowed'),
        (get_asset_id('LAPTOP005'), '范小芳', '创意部', '2025-02-17', '2025-09-24', 'borrowed'),
        (get_asset_id('SERVER006'), '刘小菲', '运维部', '2025-01-12', '2025-01-19', 'returned'),
        (get_asset_id('WORKSTATION007'), '胡小歌', '研发部', '2025-03-18', '2025-10-25', 'borrowed'),
        (get_asset_id('DRONE008'), '杨小美', '产品部', '2025-01-11', '2025-01-18', 'returned'),
        (get_asset_id('LAPTOP001'), '邓小超', '行政部', '2025-04-19', '2025-11-26', 'borrowed'),
        (get_asset_id('LAPTOP002'), '孙小丽', '市场部', '2025-01-10', '2025-01-17', 'returned'),
        (get_asset_id('SERVER003'), '赵小颖', '技术部', '2025-05-20', '2025-12-27', 'borrowed'),
        (get_asset_id('DRONE004'), '迪小热', '测试部', '2025-01-09', '2025-01-16', 'returned'),
        (get_asset_id('LAPTOP005'), '古小娜', '创意部', '2025-06-21', '2026-01-28', 'borrowed'),
        (get_asset_id('SERVER006'), '宋小茜', '运维部', '2025-01-08', '2025-01-15', 'returned'),
        (get_asset_id('WORKSTATION007'), '易小千', '研发部', '2025-01-22', '2025-08-29', 'borrowed'),
        (get_asset_id('DRONE008'), '王小凯', '产品部', '2025-01-07', '2025-01-14', 'returned'),
        (get_asset_id('LAPTOP001'), '王小源', '行政部', '2025-02-23', '2025-09-30', 'borrowed'),
        (get_asset_id('LAPTOP002'), '鹿小晗', '市场部', '2025-01-06', '2025-01-13', 'returned'),
        (get_asset_id('SERVER003'), '吴小凡', '技术部', '2025-03-24', '2025-10-31', 'borrowed'),
        (get_asset_id('DRONE004'), '张小兴', '测试部', '2025-01-05', '2025-01-12', 'returned'),
        (get_asset_id('LAPTOP005'), '李小峰', '创意部', '2025-04-25', '2026-02-01', 'borrowed'),
        (get_asset_id('SERVER006'), '杨小洋', '运维部', '2025-01-04', '2025-01-11', 'returned'),
        (get_asset_id('WORKSTATION007'), '陈小霆', '研发部', '2025-05-26', '2026-02-02', 'borrowed'),
        (get_asset_id('DRONE008'), '李小硕', '产品部', '2025-01-03', '2025-01-10', 'returned'),
        (get_asset_id('LAPTOP001'), '宋小基', '行政部', '2025-06-27', '2026-03-03', 'borrowed'),
        (get_asset_id('LAPTOP002'), '朴小剑', '市场部', '2025-01-02', '2025-01-09', 'returned'),
        (get_asset_id('SERVER003'), '金小贤', '技术部', '2025-01-28', '2025-08-04', 'borrowed'),
        (get_asset_id('DRONE004'), '李小镐', '测试部', '2025-01-01', '2025-01-08', 'returned'),
        (get_asset_id('NET-TESTER001'), '王五', '网络部', '2025-01-15', '2025-08-22', 'borrowed'),
        (get_asset_id('OSCILLOSCOPE001'), '赵六', '硬件部', '2025-01-16', '2025-08-23', 'available')
    ]
    
    for borrow in borrow_data:
        if borrow[0] is not None:
            conn.execute('''
                INSERT INTO borrow_records (asset_id, borrower_name, borrower_department, borrow_date, expected_return_date, status)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', borrow)

    # 插入示例维护记录
    maintenance_data = [
        (get_asset_id('DRONE004'), '定期保养', '2025-01-10', '王志伟', '无人机电池校准和螺旋桨检查', 850.00, 'ongoing', '2025-07-10'),
        (get_asset_id('LAPTOP001'), '屏幕更换', '2025-01-12', '李娜', '更换损坏的笔记本电脑屏幕', 1200.00, 'completed', None),
        (get_asset_id('SERVER003'), '系统升级', '2025-01-15', '张鹏', '服务器操作系统版本升级', 0.00, 'completed', None),
        (get_asset_id('LAPTOP005'), '电池更换', '2025-01-18', '刘洋', '更换老化电池', 500.00, 'ongoing', '2025-07-18'),
        (get_asset_id('LAPTOP002'), '主板维修', '2025-01-20', '陈静', '维修无法开机的笔记本电脑', 2500.00, 'ongoing', None),
        (get_asset_id('SERVER006'), '网络配置', '2025-01-22', '黄磊', '配置新的网络交换机', 300.00, 'completed', None),
        (get_asset_id('WORKSTATION007'), '软件安装', '2025-01-25', '周涛', '安装专业设计软件', 0.00, 'completed', '2025-07-25'),
        (get_asset_id('DRONE008'), '天线校准', '2025-02-01', '王志伟', '校准无人机天线', 200.00, 'planned', '2025-08-01'),
        (get_asset_id('CAMERA009'), '镜头清洁', '2025-02-05', '李娜', '清洁相机镜头', 50.00, 'completed', None),
        (get_asset_id('OSCILLOSCOPE001'), '固件升级', '2025-02-10', '张鹏', '升级示波器固件', 0.00, 'planned', '2025-08-10')
    ]
    
    for maintenance in maintenance_data:
        if maintenance[0] is not None:
            conn.execute('''
                INSERT INTO maintenance_records (asset_id, maintenance_type, maintenance_date, maintenance_person, description, cost, status, next_maintenance_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', maintenance)

    # 插入示例盘点记录
    inventory_data = [
        ('2025-01-15', get_asset_id('LAPTOP001'), '1F-研发部-工位A12', '1F-研发部-工位A12', 'normal', '张伟'),
        ('2025-01-15', get_asset_id('SERVER003'), '1F-机房-机柜A15', '1F-机房-机柜B12', 'abnormal', '李静'),
        ('2025-01-15', get_asset_id('LAPTOP005'), '2F-创意部-工位C08', '2F-创意部-工位C08', 'normal', '王强'),
        ('2025-01-16', get_asset_id('LAPTOP002'), '15F-设计部-工位D05', '15F-市场部-会议室', 'abnormal', '赵丽'),
        ('2025-01-16', get_asset_id('DRONE004'), '15F-测试部-设备柜', '无法定位', 'missing', '孙超'),
        ('2025-01-17', get_asset_id('SERVER006'), '15F-机房-存储区', '15F-机房-存储区', 'normal', '周鹏'),
        ('2025-01-17', get_asset_id('WORKSTATION007'), '15F-研发部-工位R08', '15F-研发部-工位R08', 'normal', '吴迪'),
        ('2025-01-18', get_asset_id('DRONE008'), '15F-测试部-充电区', '15F-测试部-充电区', 'normal', '郑洋')
    ]
    
    for inventory in inventory_data:
        if inventory[1] is not None:
            conn.execute('''
                INSERT INTO inventory_records (inventory_date, asset_id, expected_location, actual_location, status, checker_name)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', inventory)

    # 插入示例告警 (合并自 app.py 和 database.py)
    alert_data = [
        ('location_anomaly', get_asset_id('LAPTOP001'), '设备位置异常', 'LAPTOP001设备检测到异常移动，当前位置与预期不符', 'high', 'unread', '2025-08-22 10:00:00', None),
        ('device_offline', get_asset_id('LAPTOP005'), '设备离线', 'CAMERA005设备星闪信号丢失，可能已关机或移出范围', 'medium', 'unread', '2025-08-22 11:00:00', None),
        ('borrow_overdue', get_asset_id('SERVER003'), '借用逾期', 'TABLET003设备借用已逾期2天，请及时催还', 'medium', 'unread', '2025-08-21 14:00:00', None),
        ('maintenance_due', get_asset_id('SERVER006'), '维护提醒', 'SERVER006设备即将到达维护周期，建议安排保养', 'low', 'read', '2025-08-20 09:30:00', None),
        ('device_offline', get_asset_id('LAPTOP010'), '设备离线', '设备超过24小时未连接', 'high', 'unread', '2025-08-20 10:00:00', None),
        ('location_anomaly', get_asset_id('DRONE008'), '位置异常', '设备出现在非工作区域', 'medium', 'unread', '2025-08-18 15:30:00', None),
        ('low_battery', get_asset_id('TABLET015'), '电量过低', '设备电量低于10%', 'medium', 'read', '2025-08-15 11:00:00', None),
        ('device_offline', get_asset_id('CAMERA016'), '设备离线', '设备超过24小时未连接', 'high', 'unread', '2025-08-12 09:00:00', None),
        ('location_anomaly', get_asset_id('LAPTOP022'), '位置异常', '设备出现在非工作区域', 'medium', 'resolved', '2025-08-05 18:00:00', '2025-08-06 10:00:00'),
        ('low_battery', get_asset_id('LAPTOP031'), '电量过低', '设备电量低于10%', 'medium', 'resolved', '2025-07-28 14:00:00', '2025-07-29 11:00:00'),
        ('device_offline', get_asset_id('SERVER020'), '设备离线', '设备超过24小时未连接', 'high', 'unread', '2025-07-20 12:00:00', None),
        ('location_anomaly', get_asset_id('PROJECTOR032'), '位置异常', '设备出现在非工作区域', 'medium', 'resolved', '2025-07-10 16:00:00', '2025-07-11 09:00:00'),
    ]
    
    for alert in alert_data:
        if alert[1] is not None:
            conn.execute('''
                INSERT INTO alerts (alert_type, asset_id, title, message, severity, status, created_at, resolved_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', alert)

    # 插入示例用户
    user_data = [
        ('admin', '系统管理员', 'pbkdf2:sha256:260000$...', '超级管理员', '系统', 'admin@company.com', '13800138000', 'active'),
        ('liu_yang', '刘洋', 'pbkdf2:sha256:260000$...', '资产管理员', '人事部', 'liuyang@company.com', '13800138003', 'active'),
        ('lin_tao', '林涛', 'pbkdf2:sha256:260000$...', '资产管理员', '研发部', 'lintao@company.com', '13800138004', 'active'),
        ('wangqiang', '王强', 'pbkdf2:sha256:260000$...', '部门管理员', '研发部', 'wangqiang@company.com', '13800138005', 'active'),
        ('gao_feng', '高风', 'pbkdf2:sha256:260000$...', '部门管理员', '财务部', 'gaofeng@company.com', '13800138006', 'active'),
        ('song_ping', '宋平', 'pbkdf2:sha256:260000$...', '部门管理员', '行政部', 'songping@company.com', '13800138007', 'active'),
        ('zhangwei', '张伟', 'pbkdf2:sha256:260000$...', '普通用户', '研发部', 'zhangwei@company.com', '13800138001', 'active'),
        ('li_na', '李娜', 'pbkdf2:sha256:260000$...', '普通用户', '市场部', 'lina@company.com', '13800138008', 'active'),
        ('chen_li', '陈丽', 'pbkdf2:sha256:260000$...', '普通用户', '财务部', 'chenli@company.com', '13800138009', 'disabled'),
        ('zhao_min', '赵敏', 'pbkdf2:sha256:260000$...', '普通用户', '研发部', 'zhaomin@company.com', '13800138010', 'active'),
        ('zhou_peng', '周鹏', 'pbkdf2:sha256:260000$...', '普通用户', '市场部', 'zhoupeng@company.com', '13800138011', 'active'),
        ('wu_jing', '吴静', 'pbkdf2:sha256:260000$...', '普通用户', '财务部', 'wujing@company.com', '13800138012', 'active'),
        ('sun_yue', '孙悦', 'pbkdf2:sha256:260000$...', '普通用户', '研发部', 'sunyue@company.com', '13800138013', 'active'),
        ('ma_chao', '马超', 'pbkdf2:sha256:260000$...', '普通用户', '人事部', 'machao@company.com', '13800138014', 'disabled'),
        ('huang_yan', '黄燕', 'pbkdf2:sha256:260000$...', '普通用户', '市场部', 'huangyan@company.com', '13800138015', 'active'),
        ('xu_liang', '徐亮', 'pbkdf2:sha256:260000$...', '普通用户', '研发部', 'xuliang@company.com', '13800138016', 'active')
    ]

    for user_row in user_data:
        conn.execute('''
            INSERT INTO users (username, name, password, role, department, email, phone, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', user_row)
    
    conn.commit()
    conn.close()
    print("种子数据插入完成。")

if __name__ == '__main__':
    seed_data()
