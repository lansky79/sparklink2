from flask import Flask, render_template, request, jsonify, redirect, url_for
from datetime import datetime
from database import init_db, get_db_connection
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

# 确保数据库初始化
if not os.path.exists('data'):
    os.makedirs('data')
init_db()

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/')
def index():
    return redirect(url_for('asset_register'))

@app.route('/asset_register')
def asset_register():
    conn = get_db_connection()
    assets = conn.execute('''
        SELECT a.*, br.borrower_name
        FROM assets a
        LEFT JOIN borrow_records br ON a.id = br.asset_id AND br.status = 'borrowed'
        ORDER BY a.created_at DESC
    ''').fetchall()
    
    # 统计数据
    total_assets = conn.execute('SELECT COUNT(*) FROM assets').fetchone()[0]
    available_assets = conn.execute("SELECT COUNT(*) FROM assets WHERE status = 'available'").fetchone()[0]
    borrowed_assets = conn.execute("SELECT COUNT(*) FROM assets WHERE status = 'borrowed'").fetchone()[0]
    maintenance_assets = conn.execute("SELECT COUNT(*) FROM assets WHERE status = 'maintenance'").fetchone()[0]
    
    conn.close()
    
    return render_template('index.html', active_page='asset_register', 
                         assets=assets, total_assets=total_assets,
                         available_assets=available_assets, borrowed_assets=borrowed_assets,
                         maintenance_assets=maintenance_assets)

@app.route('/location_tracking')
def location_tracking():
    conn = get_db_connection()
    # 获取最新位置信息，包含借用人信息
    locations = conn.execute('''
        SELECT a.*, lh.location, lh.x_coordinate, lh.y_coordinate, 
               lh.signal_strength, lh.timestamp,
               COALESCE(br.borrower_name, a.asset_name) as borrower_name
        FROM assets a
        LEFT JOIN location_history lh ON a.id = lh.asset_id
        LEFT JOIN borrow_records br ON a.id = br.asset_id AND br.status = 'borrowed'
        WHERE lh.id IN (
            SELECT MAX(id) FROM location_history GROUP BY asset_id
        ) OR lh.id IS NULL
        ORDER BY a.asset_code
    ''').fetchall()
    
    # 统计数据
    online_devices = len([l for l in locations if l['signal_strength']])
    total_areas = 5  # 固定区域数
    avg_signal = -42  # 模拟平均信号强度
    avg_delay = 15    # 模拟平均延迟
    
    conn.close()
    
    return render_template('index.html', active_page='location_tracking',
                         locations=locations, online_devices=online_devices,
                         total_areas=total_areas, avg_signal=avg_signal, avg_delay=avg_delay)

@app.route('/borrow_management')
def borrow_management():
    conn = get_db_connection()
    borrows = conn.execute('''
        SELECT br.*, a.asset_name, a.asset_code
        FROM borrow_records br
        JOIN assets a ON br.asset_id = a.id
        ORDER BY br.borrow_date DESC
    ''').fetchall()
    
    # 统计数据
    current_borrows = conn.execute("SELECT COUNT(*) FROM borrow_records WHERE status = 'borrowed'").fetchone()[0]
    overdue_borrows = conn.execute('''
        SELECT COUNT(*) FROM borrow_records 
        WHERE status = 'borrowed' AND expected_return_date < date('now')
    ''').fetchone()[0]
    
    conn.close()
    
    return render_template('index.html', active_page='borrow_management',
                         borrows=borrows, current_borrows=current_borrows,
                         overdue_borrows=overdue_borrows)

@app.route('/maintenance_management')
def maintenance_management():
    conn = get_db_connection()
    maintenances = conn.execute('''
        SELECT mr.*, a.asset_name, a.asset_code
        FROM maintenance_records mr
        JOIN assets a ON mr.asset_id = a.id
        ORDER BY mr.maintenance_date DESC
    ''').fetchall()
    
    # 统计数据
    ongoing_maintenance = conn.execute("SELECT COUNT(*) FROM maintenance_records WHERE status = 'ongoing'").fetchone()[0]
    planned_maintenance = conn.execute("SELECT COUNT(*) FROM maintenance_records WHERE status = 'planned'").fetchone()[0]
    total_cost = conn.execute("SELECT COALESCE(SUM(cost), 0) FROM maintenance_records WHERE maintenance_date >= date('now', 'start of month')").fetchone()[0]
    
    conn.close()
    
    return render_template('index.html', active_page='maintenance_management',
                         maintenances=maintenances, ongoing_maintenance=ongoing_maintenance,
                         planned_maintenance=planned_maintenance, total_cost=total_cost)

@app.route('/inventory_check')
def inventory_check():
    conn = get_db_connection()
    inventories = conn.execute('''
        SELECT ir.*, a.asset_name, a.asset_code
        FROM inventory_records ir
        JOIN assets a ON ir.asset_id = a.id
        ORDER BY ir.inventory_date DESC
    ''').fetchall()
    
    # 统计数据
    total_assets = conn.execute('SELECT COUNT(*) FROM assets').fetchone()[0]
    checked_assets = conn.execute("SELECT COUNT(*) FROM inventory_records WHERE status = 'normal'").fetchone()[0]
    pending_assets = total_assets - checked_assets
    
    conn.close()
    
    return render_template('index.html', active_page='inventory_check',
                         inventories=inventories, total_assets=total_assets,
                         checked_assets=checked_assets, pending_assets=pending_assets)

@app.route('/report_statistics')
def report_statistics():
    conn = get_db_connection()
    
    # 资产类别统计
    category_stats = conn.execute('''
        SELECT category, COUNT(*) as total,
               SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
               SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) as borrowed,
               SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
               COALESCE(SUM(purchase_price), 0) as total_value
        FROM assets
        GROUP BY category
    ''').fetchall()
    
    # 总体统计
    total_value = conn.execute('SELECT COALESCE(SUM(purchase_price), 0) FROM assets').fetchone()[0]
    utilization_rate = 85  # 模拟利用率
    monthly_transfers = 234  # 模拟流转次数
    avg_borrow_days = 7.2   # 模拟平均借用天数
    
    conn.close()
    
    return render_template('index.html', active_page='report_statistics',
                         category_stats=category_stats, total_value=total_value,
                         utilization_rate=utilization_rate, monthly_transfers=monthly_transfers,
                         avg_borrow_days=avg_borrow_days)

@app.route('/permission_management')
def permission_management():
    conn = get_db_connection()
    users = conn.execute('SELECT * FROM users ORDER BY created_at DESC').fetchall()
    
    # 统计数据
    total_users = len(users)
    admin_users = len([u for u in users if u['role'] == 'admin'])
    active_users = len([u for u in users if u['status'] == 'active'])
    
    conn.close()
    
    return render_template('index.html', active_page='permission_management',
                         users=users, total_users=total_users,
                         admin_users=admin_users, active_users=active_users)

from datetime import datetime

@app.route('/alert_notification')
def alert_notification():
    conn = get_db_connection()
    db_alerts = conn.execute('''
        SELECT al.*, a.asset_name, a.asset_code
        FROM alerts al
        LEFT JOIN assets a ON al.asset_id = a.id
    ''').fetchall()

    alerts = [dict(alert) for alert in db_alerts]
    
    # Add 8 new alerts
    new_alerts = [
        {'id': 101, 'alert_type': '设备离线', 'asset_code': 'LAPTOP010', 'asset_name': '联想ThinkPad T14', 'message': '设备超过24小时未连接', 'severity': 'high', 'created_at': '2025-08-20 10:00:00', 'status': 'unread'},
        {'id': 102, 'alert_type': '位置异常', 'asset_code': 'DRONE008', 'asset_name': '大疆无人机', 'message': '设备出现在非工作区域', 'severity': 'medium', 'created_at': '2025-08-18 15:30:00', 'status': 'unread'},
        {'id': 103, 'alert_type': '电量过低', 'asset_code': 'TABLET015', 'asset_name': '苹果iPad Pro', 'message': '设备电量低于10%', 'severity': 'medium', 'created_at': '2025-08-15 11:00:00', 'status': 'read'},
        {'id': 104, 'alert_type': '设备离线', 'asset_code': 'CAMERA016', 'asset_name': '索尼A7R5', 'message': '设备超过24小时未连接', 'severity': 'high', 'created_at': '2025-08-12 09:00:00', 'status': 'unread'},
        {'id': 105, 'alert_type': '位置异常', 'asset_code': 'LAPTOP022', 'asset_name': '联想ThinkBook 14', 'message': '设备出现在非工作区域', 'severity': 'medium', 'created_at': '2025-08-05 18:00:00', 'status': 'resolved'},
        {'id': 106, 'alert_type': '电量过低', 'asset_code': 'LAPTOP031', 'asset_name': '华硕ZenBook Pro', 'message': '设备电量低于10%', 'severity': 'medium', 'created_at': '2025-07-28 14:00:00', 'status': 'resolved'},
        {'id': 107, 'alert_type': '设备离线', 'asset_code': 'SERVER020', 'asset_name': '华为RH2288H V5', 'message': '设备超过24小时未连接', 'severity': 'high', 'created_at': '2025-07-20 12:00:00', 'status': 'unread'},
        {'id': 108, 'alert_type': '位置异常', 'asset_code': 'PROJECTOR032', 'asset_name': '明基TK700STi', 'message': '设备出现在非工作区域', 'severity': 'medium', 'created_at': '2025-07-10 16:00:00', 'status': 'resolved'},
    ]
    alerts.extend(new_alerts)

    # Sort all alerts by date
    alerts.sort(key=lambda x: datetime.strptime(x['created_at'], '%Y-%m-%d %H:%M:%S'), reverse=True)

    # 统计数据
    unread_alerts = len([a for a in alerts if a['status'] == 'unread'])
    high_alerts = len([a for a in alerts if a['severity'] == 'high'])
    resolved_alerts = len([a for a in alerts if a['status'] == 'resolved'])
    unprocessed_alerts = 6
    
    conn.close()
    
    return render_template('index.html', active_page='alert_notification',
                         alerts=alerts, unread_alerts=unread_alerts,
                         high_alerts=high_alerts, resolved_alerts=resolved_alerts,
                         unprocessed_alerts=unprocessed_alerts)

# 星闪诊断功能已合并到盘点核查模块

# API接口
@app.route('/api/assets', methods=['GET', 'POST'])
def api_assets():
    conn = get_db_connection()
    
    if request.method == 'POST':
        data = request.get_json()
        try:
            conn.execute('''
                INSERT INTO assets (asset_code, asset_name, category, brand, model, 
                                  purchase_date, purchase_price, current_location, star_flash_tag_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (data['asset_code'], data['asset_name'], data['category'], 
                  data.get('brand', ''), data.get('model', ''), data.get('purchase_date'),
                  data.get('purchase_price', 0), data.get('current_location', ''), 
                  data.get('star_flash_tag_id', '')))
            conn.commit()
            conn.close()
            return jsonify({'success': True, 'message': '资产添加成功'})
        except Exception as e:
            conn.close()
            return jsonify({'success': False, 'message': str(e)})
    
    assets = conn.execute('SELECT * FROM assets ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(asset) for asset in assets])

@app.route('/api/assets/<int:asset_id>', methods=['GET', 'PUT', 'DELETE'])
def api_asset_detail(asset_id):
    conn = get_db_connection()
    
    if request.method == 'GET':
        asset = conn.execute('SELECT * FROM assets WHERE id = ?', (asset_id,)).fetchone()
        if asset is None:
            return jsonify({'success': False, 'message': '资产不存在'}), 404
        
        borrower_name = ''
        if asset['status'] == 'borrowed':
            borrower = conn.execute('SELECT borrower_name FROM borrow_records WHERE asset_id = ? AND status = ?', (asset_id, 'borrowed')).fetchone()
            if borrower:
                borrower_name = borrower['borrower_name']

        asset_dict = dict(asset)
        asset_dict['borrower_name'] = borrower_name
        conn.close()
        return jsonify(asset_dict)

    if request.method == 'PUT':
        data = request.get_json()
        try:
            # 更新资产表
            conn.execute('''
                UPDATE assets SET asset_name=?, category=?, brand=?, model=?,
                                current_location=?, status=?, updated_at=CURRENT_TIMESTAMP
                WHERE id=?
            ''', (data['asset_name'], data['category'], data.get('brand', ''),
                  data.get('model', ''), data.get('current_location', ''),
                  data.get('status', 'available'), asset_id))

            # 处理借用人信息
            borrower_name = data.get('borrower_name')
            if data.get('status') == 'borrowed':
                if borrower_name:
                    # 查找当前是否已有借用记录
                    borrow_record = conn.execute('SELECT id FROM borrow_records WHERE asset_id = ? AND status = ?', (asset_id, 'borrowed')).fetchone()
                    if borrow_record:
                        # 更新借用人
                        conn.execute('UPDATE borrow_records SET borrower_name = ? WHERE id = ?', (borrower_name, borrow_record['id']))
                    else:
                        # 创建新的借用记录
                        conn.execute('''
                            INSERT INTO borrow_records (asset_id, borrower_name, borrow_date, status)
                            VALUES (?, ?, date('now'), 'borrowed')
                        ''', (asset_id, borrower_name))
            else:
                # 如果资产状态不是“借用中”，则将所有该资产的借用记录设置为“已归还”
                conn.execute('''
                    UPDATE borrow_records SET status = 'returned', actual_return_date = date('now')
                    WHERE asset_id = ? AND status = 'borrowed'
                ''', (asset_id,))

            conn.commit()
            conn.close()
            return jsonify({'success': True, 'message': '资产更新成功'})
        except Exception as e:
            conn.close()
            return jsonify({'success': False, 'message': str(e)})
    
    elif request.method == 'DELETE':
        try:
            conn.execute('DELETE FROM assets WHERE id=?', (asset_id,))
            conn.commit()
            conn.close()
            return jsonify({'success': True, 'message': '资产删除成功'})
        except Exception as e:
            conn.close()
            return jsonify({'success': False, 'message': str(e)})

@app.route('/api/inventory/<int:inventory_id>', methods=['GET'])
def api_inventory_detail(inventory_id):
    conn = get_db_connection()
    inventory = conn.execute('''
        SELECT ir.*, a.asset_name, a.asset_code
        FROM inventory_records ir
        JOIN assets a ON ir.asset_id = a.id
        WHERE ir.id = ?
    ''', (inventory_id,)).fetchone()
    conn.close()
    if inventory:
        return jsonify(dict(inventory))
    return jsonify({'success': False, 'message': '盘点记录不存在'}), 404

@app.route('/api/borrows', methods=['POST'])
def api_create_borrow():
    conn = get_db_connection()
    data = request.get_json()
    
    try:
        # 创建借用记录
        conn.execute('''
            INSERT INTO borrow_records (asset_id, borrower_name, borrower_department,
                                      borrow_date, expected_return_date, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (data['asset_id'], data['borrower_name'], data['borrower_department'],
              data['borrow_date'], data['expected_return_date'], data.get('notes', '')))
        
        # 更新资产状态
        conn.execute('UPDATE assets SET status=? WHERE id=?', ('borrowed', data['asset_id']))
        
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': '借用记录创建成功'})
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/borrows/<int:borrow_id>/return', methods=['POST'])
def api_return_asset(borrow_id):
    conn = get_db_connection()
    
    try:
        # 更新借用记录
        conn.execute('''
            UPDATE borrow_records SET status='returned', actual_return_date=date('now')
            WHERE id=?
        ''', (borrow_id,))
        
        # 获取资产ID并更新状态
        asset_id = conn.execute('SELECT asset_id FROM borrow_records WHERE id=?', (borrow_id,)).fetchone()[0]
        conn.execute('UPDATE assets SET status=? WHERE id=?', ('available', asset_id))
        
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': '资产归还成功'})
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/maintenance', methods=['POST'])
def api_create_maintenance():
    conn = get_db_connection()
    data = request.get_json()
    
    try:
        conn.execute('''
            INSERT INTO maintenance_records (asset_id, maintenance_type, maintenance_date,
                                           maintenance_person, description, cost, next_maintenance_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (data['asset_id'], data['maintenance_type'], data['maintenance_date'],
              data['maintenance_person'], data.get('description', ''),
              data.get('cost', 0), data.get('next_maintenance_date')))
        
        # 更新资产状态
        conn.execute('UPDATE assets SET status=? WHERE id=?', ('maintenance', data['asset_id']))
        
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': '维护记录创建成功'})
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/alerts/<int:alert_id>/resolve', methods=['POST'])
def api_resolve_alert(alert_id):
    conn = get_db_connection()
    
    try:
        conn.execute('''
            UPDATE alerts SET status='resolved', resolved_at=CURRENT_TIMESTAMP
            WHERE id=?
        ''', (alert_id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': '告警已处理'})
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/location/update', methods=['POST'])
def api_update_location():
    conn = get_db_connection()
    data = request.get_json()
    
    try:
        conn.execute('''
            INSERT INTO location_history (asset_id, location, x_coordinate, y_coordinate, signal_strength)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['asset_id'], data['location'], data.get('x_coordinate'),
              data.get('y_coordinate'), data.get('signal_strength', -50)))
        
        # 更新资产当前位置
        conn.execute('UPDATE assets SET current_location=? WHERE id=?', 
                    (data['location'], data['asset_id']))
        
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': '位置更新成功'})
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)