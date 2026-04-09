[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![SparkLink](https://img.shields.io/badge/SparkLink-NearLink-orange)](https://www.sparklink.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey)]()

# 设备资产定位管理系统 / Device Asset Location Management System

基于星闪（SparkLink/NearLink）技术的设备资产全生命周期管理系统，提供亚米级室内定位、实时监控、借用管理、维护管理、盘点核查等功能。

A full-lifecycle device asset management system powered by SparkLink (NearLink) technology, featuring sub-meter indoor positioning, real-time monitoring, borrowing management, maintenance tracking, and inventory auditing.

---

## 功能模块 / Features

| 模块 Module | 说明 Description |
|---|---|
| 资产登记 Asset Register | 资产信息录入、编辑、状态管理 / Asset CRUD and status management |
| 位置追踪 Location Tracking | 星闪室内定位、SVG楼层地图 / SparkLink indoor positioning with SVG floor map |
| 借用管理 Borrow Management | 借用、归还、延期、逾期提醒 / Borrow, return, extend, overdue alerts |
| 维护管理 Maintenance | 维护计划、记录、成本统计 / Maintenance plans, records, cost analysis |
| 盘点核查 Inventory Check | 自动盘点、异常识别 / Auto inventory, anomaly detection |
| 报表统计 Reports | 利用率、流转、成本分析 / Utilization, flow, cost analytics |
| 权限管理 Permissions | 多角色、多层级权限 / Role-based access control |
| 告警通知 Alerts | 位置异常、离线、低电量告警 / Location anomaly, offline, low battery alerts |
| 星闪诊断 Tracker Diagnostics | 标签状态、信号诊断 / Tag status and signal diagnostics |

## 技术栈 / Tech Stack

- **Backend**: Python 3.10+ / Flask
- **Database**: SQLite
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Positioning**: SparkLink (NearLink) protocol
- **Architecture**: B/S (Browser/Server)

## 快速开始 / Quick Start

```bash
# 克隆仓库 / Clone
git clone https://github.com/your-username/asset-tracking-system.git
cd asset-tracking-system/asset_tracking_system

# 安装依赖 / Install dependencies
pip install flask

# 初始化演示数据（可选）/ Seed demo data (optional)
python seed.py

# 启动服务 / Run
python app.py
```

访问 / Visit: `http://localhost:5000`

默认账号 / Default account: `admin` / `admin123`

## 项目结构 / Project Structure

```
asset_tracking_system/
├── app.py                 # Flask 主应用 / Main application
├── database.py            # 数据库初始化 / Database schema
├── seed.py                # 种子数据 / Demo data seeder
├── data/
│   └── assets.db          # SQLite 数据库文件 / Database file
├── static/
│   ├── css/style.css      # 样式表 / Stylesheet
│   └── js/
│       ├── main.js        # 核心交互逻辑 / Core UI logic
│       ├── indoor-map.js  # SVG 室内地图 / SVG indoor map
│       └── alert_settings.js
├── templates/
│   ├── base.html          # 基础布局 / Base layout
│   ├── index.html         # 主页面 / Main page
│   ├── login.html         # 登录页 / Login page
│   └── modules/           # 功能模块模板 / Module templates
└── manual.md              # 用户手册 / User manual
```

## 数据库设计 / Database Schema

| 表 Table | 说明 Description |
|---|---|
| `assets` | 资产主表 / Asset master |
| `location_history` | 位置历史 / Location history |
| `borrow_records` | 借用记录 / Borrow records |
| `maintenance_records` | 维护记录 / Maintenance records |
| `inventory_records` | 盘点记录 / Inventory records |
| `users` | 用户权限 / Users & permissions |
| `alerts` | 告警通知 / Alert notifications |

## API 接口 / API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/assets` | 资产列表/新增 |
| GET/PUT/DELETE | `/api/assets/<id>` | 资产详情/更新/删除 |
| POST | `/api/borrows` | 创建借用记录 |
| POST | `/api/borrows/<id>/return` | 归还资产 |
| POST | `/api/maintenance` | 创建维护记录 |
| POST | `/api/alerts/<id>/resolve` | 处理告警 |
| POST | `/api/location/update` | 更新位置信息 |
| GET | `/api/inventory/<id>` | 盘点详情 |

## 环境变量 / Environment Variables

| Variable | Default | Description |
|---|---|---|
| `FLASK_SECRET_KEY` | `dev-fallback-key-change-in-prod` | Session 密钥 |
| `FLASK_DEBUG` | `true` | 调试模式 |
| `FLASK_PORT` | `5000` | 服务端口 |

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
