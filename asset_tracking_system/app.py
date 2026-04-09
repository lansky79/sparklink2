import os
from flask import Flask, render_template, request, jsonify, redirect, url_for
from datetime import datetime, date
from database import init_db, get_db_connection

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'dev-fallback-key-change-in-prod')

# 信号强度和电量的判定阈值
SIGNAL_WEAK_THRESHOLD = -60      # dBm, 低于此值视为信号异常
BATTERY_LOW_THRESHOLD = 20       # %, 低于此值触发低电量告警
DEFAULT_SIGNAL_STRENGTH = -50    # dBm, 位置上报时的默认信号值

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

    online_devices = len([loc for loc in locations if loc['signal_strength']])

    # 从位置历史中统计覆盖区域数
    area_row = conn.execute('''
        SELECT COUNT(DISTINCT location) FROM location_history
    ''').fetchone()
    total_areas = area_row[0] if area_row[0] else 0

    # 在线设备的平均信号强度
    sig_row = conn.execute('''
        SELECT AVG(signal_strength) FROM location_history
        WHERE id IN (SELECT MAX(id) FROM location_history GROUP BY asset_id)
              AND signal_strength IS NOT NULL
    ''').fetchone()
    avg_signal = round(sig_row[0]) if sig_row[0] else 0

    # 平均定位延迟暂时取不到真实值，用信号强度做粗略估算
    # 信号越弱延迟越高，经验公式: delay ≈ abs(signal) * 0.35
    avg_delay = round(abs(avg_signal) * 0.35) if avg_signal else 0
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
        SELECT ir.*, a.asset_name, a.asset_code, a.battery_level,
            (SELECT signal_strength FROM location_history
             WHERE asset_id = a.id ORDER BY timestamp DESC LIMIT 1) as signal_strength
        FROM inventory_records ir
        JOIN assets a ON ir.asset_id = a.id
        ORDER BY ir.inventory_date DESC
    ''').fetchall()

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

    category_stats = conn.execute('''
        SELECT category, COUNT(*) as total,
               SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
               SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) as borrowed,
               SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
               COALESCE(SUM(purchase_price), 0) as total_value
        FROM assets GROUP BY category
    ''').fetchall()

    total_value = conn.execute('SELECT COALESCE(SUM(purchase_price), 0) FROM assets').fetchone()[0]

    # 利用率 = 非闲置资产 / 总资产
    total_cnt = conn.execute('SELECT COUNT(*) FROM assets').fetchone()[0]
    in_use_cnt = conn.execute("SELECT COUNT(*) FROM assets WHERE status != 'available'").fetchone()[0]
    utilization_rate = round(in_use_cnt / total_cnt * 100, 1) if total_cnt else 0

    # 本月流转次数（借用+归还）
    monthly_transfers = conn.execute('''
        SELECT COUNT(*) FROM borrow_records
        WHERE borrow_date >= date('now', 'start of month')
           OR actual_return_date >= date('now', 'start of month')
    ''').fetchone()[0]

    # 平均借用天数
    avg_row = conn.execute('''
        SELECT AVG(julianday(COALESCE(actual_return_date, date('now'))) - julianday(borrow_date))
        FROM borrow_records WHERE status IN ('borrowed', 'returned')
    ''').fetchone()
    avg_borrow_days = round(avg_row[0], 1) if avg_row[0] else 0
    conn.close()

    return render_template('index.html', active_page='report_statistics',
                           category_stats=category_stats, total_value=total_value,
                           utilization_rate=utilization_rate, monthly_transfers=monthly_transfers,
                           avg_borrow_days=avg_borrow_days)


@app.route('/permission_management')
def permission_management():
    conn = get_db_connection()
    users = conn.execute('SELECT * FROM users ORDER BY created_at DESC').fetchall()
    total_users = len(users)
    admin_users = len([u for u in users if u['role'] == 'admin'])
    active_users = len([u for u in users if u['status'] == 'active'])
    conn.close()

    return render_template('index.html', active_page='permission_management',
                           users=users, total_users=total_users,
                           admin_users=admin_users, active_users=active_users)


@app.route('/alert_notification')
def alert_notification():
    conn = get_db_connection()
    db_alerts = conn.execute('''
        SELECT al.*, a.asset_name, a.asset_code
        FROM alerts al
        LEFT JOIN assets a ON al.asset_id = a.id
    ''').fetchall()
    alerts = [dict(row) for row in db_alerts]

    unread_alerts = len([a for a in alerts if a['status'] == 'unread'])
    high_alerts = len([a for a in alerts if a['severity'] == 'high'])
    resolved_alerts = len([a for a in alerts if a['status'] == 'resolved'])
    unprocessed_alerts = len(alerts) - resolved_alerts
    conn.close()

    return render_template('index.html', active_page='alert_notification',
                           alerts=alerts, unread_alerts=unread_alerts,
                           high_alerts=high_alerts, resolved_alerts=resolved_alerts,
                           unprocessed_alerts=unprocessed_alerts)


@app.route('/tracker_diagnostics')
def tracker_diagnostics():
    conn = get_db_connection()
    trackers = conn.execute('''
        SELECT a.star_flash_tag_id, a.asset_code, a.battery_level,
               lh.signal_strength, lh.accuracy, lh.timestamp
        FROM assets a
        LEFT JOIN location_history lh ON a.id = lh.asset_id
        WHERE a.star_flash_tag_id IS NOT NULL
          AND (lh.id IN (SELECT MAX(id) FROM location_history GROUP BY asset_id) OR lh.id IS NULL)
        ORDER BY a.star_flash_tag_id
    ''').fetchall()
    conn.close()

    online_trackers = len([t for t in trackers if t['signal_strength'] is not None])
    offline_trackers = len(trackers) - online_trackers
    signal_anomalies = len([t for t in trackers if t['signal_strength'] is not None
                            and t['signal_strength'] < SIGNAL_WEAK_THRESHOLD])
    low_battery_warnings = len([t for t in trackers if t['battery_level'] is not None
                                and t['battery_level'] < BATTERY_LOW_THRESHOLD])

    return render_template('index.html', active_page='tracker_diagnostics',
                           trackers=trackers, online_trackers=online_trackers,
                           offline_trackers=offline_trackers, signal_anomalies=signal_anomalies,
                           low_battery_warnings=low_battery_warnings)


# ---- RESTful API ----

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
            return jsonify({'success': True, 'message': '资产添加成功'})
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)})
        finally:
            conn.close()

    assets = conn.execute('SELECT * FROM assets ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(row) for row in assets])


@app.route('/api/assets/<int:asset_id>', methods=['GET', 'PUT', 'DELETE'])
def api_asset_detail(asset_id):
    conn = get_db_connection()

    if request.method == 'GET':
        asset = conn.execute('SELECT * FROM assets WHERE id = ?', (asset_id,)).fetchone()
        if not asset:
            conn.close()
            return jsonify({'success': False, 'message': '资产不存在'}), 404

        borrower_name = ''
        if asset['status'] == 'borrowed':
            rec = conn.execute(
                'SELECT borrower_name FROM borrow_records WHERE asset_id = ? AND status = ?',
                (asset_id, 'borrowed')).fetchone()
            if rec:
                borrower_name = rec['borrower_name']

        res = dict(asset)
        res['borrower_name'] = borrower_name
        conn.close()
        return jsonify(res)

    if request.method == 'PUT':
        data = request.get_json()
        try:
            conn.execute('''
                UPDATE assets SET asset_name=?, category=?, brand=?, model=?,
                    current_location=?, status=?, updated_at=CURRENT_TIMESTAMP
                WHERE id=?
            ''', (data['asset_name'], data['category'], data.get('brand', ''),
                  data.get('model', ''), data.get('current_location', ''),
                  data.get('status', 'available'), asset_id))

            borrower_name = data.get('borrower_name')
            if data.get('status') == 'borrowed' and borrower_name:
                existing = conn.execute(
                    'SELECT id FROM borrow_records WHERE asset_id = ? AND status = ?',
                    (asset_id, 'borrowed')).fetchone()
                if existing:
                    conn.execute('UPDATE borrow_records SET borrower_name = ? WHERE id = ?',
                                 (borrower_name, existing['id']))
                else:
                    conn.execute('''
                        INSERT INTO borrow_records (asset_id, borrower_name, borrow_date, status)
                        VALUES (?, ?, date('now'), 'borrowed')
                    ''', (asset_id, borrower_name))
            elif data.get('status') != 'borrowed':
                conn.execute('''
                    UPDATE borrow_records SET status = 'returned', actual_return_date = date('now')
                    WHERE asset_id = ? AND status = 'borrowed'
                ''', (asset_id,))

            conn.commit()
            return jsonify({'success': True, 'message': '资产更新成功'})
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)})
        finally:
            conn.close()

    # DELETE
    try:
        conn.execute('DELETE FROM assets WHERE id=?', (asset_id,))
        conn.commit()
        return jsonify({'success': True, 'message': '资产删除成功'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()


@app.route('/api/inventory/<int:inventory_id>', methods=['GET'])
def api_inventory_detail(inventory_id):
    conn = get_db_connection()
    row = conn.execute('''
        SELECT ir.*, a.asset_name, a.asset_code
        FROM inventory_records ir JOIN assets a ON ir.asset_id = a.id
        WHERE ir.id = ?
    ''', (inventory_id,)).fetchone()
    conn.close()
    if row:
        return jsonify(dict(row))
    return jsonify({'success': False, 'message': '盘点记录不存在'}), 404


@app.route('/api/borrows', methods=['POST'])
def api_create_borrow():
    conn = get_db_connection()
    data = request.get_json()
    try:
        conn.execute('''
            INSERT INTO borrow_records (asset_id, borrower_name, borrower_department,
                borrow_date, expected_return_date, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (data['asset_id'], data['borrower_name'], data['borrower_department'],
              data['borrow_date'], data['expected_return_date'], data.get('notes', '')))
        conn.execute('UPDATE assets SET status=? WHERE id=?', ('borrowed', data['asset_id']))
        conn.commit()
        return jsonify({'success': True, 'message': '借用记录创建成功'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()


@app.route('/api/borrows/<int:borrow_id>/return', methods=['POST'])
def api_return_asset(borrow_id):
    conn = get_db_connection()
    try:
        conn.execute('''
            UPDATE borrow_records SET status='returned', actual_return_date=date('now')
            WHERE id=?
        ''', (borrow_id,))
        aid = conn.execute('SELECT asset_id FROM borrow_records WHERE id=?', (borrow_id,)).fetchone()[0]
        conn.execute('UPDATE assets SET status=? WHERE id=?', ('available', aid))
        conn.commit()
        return jsonify({'success': True, 'message': '资产归还成功'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()


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
        conn.execute('UPDATE assets SET status=? WHERE id=?', ('maintenance', data['asset_id']))
        conn.commit()
        return jsonify({'success': True, 'message': '维护记录创建成功'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()


@app.route('/api/alerts/<int:alert_id>/resolve', methods=['POST'])
def api_resolve_alert(alert_id):
    conn = get_db_connection()
    try:
        conn.execute('''
            UPDATE alerts SET status='resolved', resolved_at=CURRENT_TIMESTAMP WHERE id=?
        ''', (alert_id,))
        conn.commit()
        return jsonify({'success': True, 'message': '告警已处理'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()


@app.route('/api/location/update', methods=['POST'])
def api_update_location():
    conn = get_db_connection()
    data = request.get_json()
    try:
        conn.execute('''
            INSERT INTO location_history (asset_id, location, x_coordinate, y_coordinate, signal_strength)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['asset_id'], data['location'], data.get('x_coordinate'),
              data.get('y_coordinate'), data.get('signal_strength', DEFAULT_SIGNAL_STRENGTH)))
        conn.execute('UPDATE assets SET current_location=? WHERE id=?',
                     (data['location'], data['asset_id']))
        conn.commit()
        return jsonify({'success': True, 'message': '位置更新成功'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        conn.close()


if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    port = int(os.environ.get('FLASK_PORT', 5000))
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
