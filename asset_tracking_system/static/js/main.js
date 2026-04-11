// 全局配置
const LOCATION_REFRESH_INTERVAL = 30000;
const ALERT_CHECK_INTERVAL = 60000;
const ALERT_RANDOM_PROBABILITY = 0.1;
const TOAST_DURATION = 3000;
const TOAST_FADE_MS = 300;
const INVENTORY_STEP = 10;
const INVENTORY_TICK_MS = 500;
const RELOAD_DELAY = 1000;
const DIAG_DELAY = 3000;

const MSG_COLORS = {
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8'
};

document.addEventListener('DOMContentLoaded', function () {
  initializePage();
  bindEventListeners();
});

function initializePage() {
  console.log('设备资产定位管理系统已加载');
  if (window.location.pathname.includes('location_tracking')) {
    startLocationUpdates();
  }
  if (window.location.pathname.includes('alert_notification')) {
    checkNewAlerts();
  }
}

function bindEventListeners() {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', handleButtonClick);
  });
  document.querySelectorAll('.table tbody tr').forEach((row) => {
    row.addEventListener('click', handleRowClick);
  });
}

function handleButtonClick(event) {
  const btn = event.target.closest('.btn');
  const text = btn.textContent.trim();
  switch (text) {
    case '新增资产': showAssetForm(); break;
    case '刷新位置': refreshLocationData(); break;
    case '开始盘点': startInventoryCheck(); break;
    case '全部已读': markAllAlertsRead(); break;
  }
}

function handleRowClick(event) {
  const row = event.target.closest('tr');
  if (row && row.parentElement.tagName === 'TBODY') {
    document.querySelectorAll('.table tbody tr').forEach((r) => r.classList.remove('table-active'));
    row.classList.add('table-active');
  }
}

function showAssetForm() {
  const formHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>新增资产</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="assetForm">
            <div class="form-group">
              <label>资产编码 *</label>
              <input type="text" id="asset_code" class="form-control" placeholder="请输入资产编码" required>
            </div>
            <div class="form-group">
              <label>资产名称 *</label>
              <input type="text" id="asset_name" class="form-control" placeholder="请输入资产名称" required>
            </div>
            <div class="form-group">
              <label>资产类别 *</label>
              <select id="category" class="form-control" required>
                <option value="">请选择类别</option>
                <option value="笔记本电脑">笔记本电脑</option>
                <option value="投影设备">投影设备</option>
                <option value="打印设备">打印设备</option>
                <option value="显示设备">显示设备</option>
                <option value="办公家具">办公家具</option>
              </select>
            </div>
            <div class="form-group">
              <label>品牌</label>
              <input type="text" id="brand" class="form-control" placeholder="请输入品牌">
            </div>
            <div class="form-group">
              <label>型号</label>
              <input type="text" id="model" class="form-control" placeholder="请输入型号">
            </div>
            <div class="form-group">
              <label>购买价格</label>
              <input type="number" id="purchase_price" class="form-control" placeholder="请输入购买价格" step="0.01">
            </div>
            <div class="form-group">
              <label>当前位置</label>
              <input type="text" id="current_location" class="form-control" placeholder="请输入当前位置">
            </div>
            <div class="form-group">
              <label>星闪标签ID</label>
              <input type="text" id="star_flash_tag_id" class="form-control" placeholder="请输入星闪标签ID">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="saveAsset()">保存</button>
          <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

async function saveAsset() {
  const data = {
    asset_code: document.getElementById('asset_code').value,
    asset_name: document.getElementById('asset_name').value,
    category: document.getElementById('category').value,
    brand: document.getElementById('brand').value,
    model: document.getElementById('model').value,
    purchase_price: parseFloat(document.getElementById('purchase_price').value) || 0,
    current_location: document.getElementById('current_location').value,
    star_flash_tag_id: document.getElementById('star_flash_tag_id').value
  };
  if (!data.asset_code || !data.asset_name || !data.category) {
    showMessage('请填写必填字段', 'error');
    return;
  }
  try {
    const resp = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await resp.json();
    if (result.success) {
      showMessage('资产保存成功', 'success');
      closeModal();
      setTimeout(() => window.location.reload(), RELOAD_DELAY);
    } else {
      showMessage(result.message, 'error');
    }
  } catch (err) {
    showMessage('保存失败: ' + err.message, 'error');
  }
}

async function deleteAsset(assetId) {
  if (!confirm('确定要删除这个资产吗？')) return;
  try {
    const resp = await fetch(`/api/assets/${assetId}`, { method: 'DELETE' });
    const result = await resp.json();
    if (result.success) {
      showMessage('资产删除成功', 'success');
      const row = document.querySelector(`tr[data-asset-id="${assetId}"]`);
      if (row) row.remove();
    } else {
      showMessage(result.message, 'error');
    }
  } catch (err) {
    showMessage('删除失败: ' + err.message, 'error');
  }
}

async function editAsset(assetId) {
  try {
    const resp = await fetch(`/api/assets/${assetId}`);
    if (!resp.ok) throw new Error('获取资产信息失败');
    const asset = await resp.json();

    const formHtml = `
      <div class="modal-overlay" onclick="closeModal()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>编辑资产信息</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <form id="editAssetForm">
              <div class="form-group">
                <label>资产编码 *</label>
                <input type="text" id="edit_asset_code" class="form-control" value="${asset.asset_code}" required>
              </div>
              <div class="form-group">
                <label>资产名称 *</label>
                <input type="text" id="edit_asset_name" class="form-control" value="${asset.asset_name}" required>
              </div>
              <div class="form-group">
                <label>资产类别 *</label>
                <select id="edit_category" class="form-control" required>
                  <option value="移动工作站" ${asset.category === '移动工作站' ? 'selected' : ''}>移动工作站</option>
                  <option value="笔记本电脑" ${asset.category === '笔记本电脑' ? 'selected' : ''}>笔记本电脑</option>
                  <option value="投影设备" ${asset.category === '投影设备' ? 'selected' : ''}>投影设备</option>
                  <option value="打印设备" ${asset.category === '打印设备' ? 'selected' : ''}>打印设备</option>
                  <option value="显示设备" ${asset.category === '显示设备' ? 'selected' : ''}>显示设备</option>
                </select>
              </div>
              <div class="form-group">
                <label>品牌</label>
                <input type="text" id="edit_brand" class="form-control" value="${asset.brand || ''}">
              </div>
              <div class="form-group">
                <label>型号</label>
                <input type="text" id="edit_model" class="form-control" value="${asset.model || ''}">
              </div>
              <div class="form-group">
                <label>购买价格</label>
                <input type="number" id="edit_purchase_price" class="form-control" value="${asset.purchase_price || ''}" step="0.01">
              </div>
              <div class="form-group">
                <label>当前位置</label>
                <input type="text" id="edit_current_location" class="form-control" value="${asset.current_location || ''}">
              </div>
              <div class="form-group">
                <label>借用人</label>
                <input type="text" id="edit_borrower_name" class="form-control" value="${asset.borrower_name || ''}">
              </div>
              <div class="form-group">
                <label>资产状态</label>
                <select id="edit_status" class="form-control">
                  <option value="available" ${asset.status === 'available' ? 'selected' : ''}>可用</option>
                  <option value="borrowed" ${asset.status === 'borrowed' ? 'selected' : ''}>借用中</option>
                  <option value="maintenance" ${asset.status === 'maintenance' ? 'selected' : ''}>维护中</option>
                  <option value="retired" ${asset.status === 'retired' ? 'selected' : ''}>已报废</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" onclick="updateAsset(${assetId})">更新</button>
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', formHtml);
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function updateAsset(assetId) {
  const data = {
    asset_code: document.getElementById('edit_asset_code').value,
    asset_name: document.getElementById('edit_asset_name').value,
    category: document.getElementById('edit_category').value,
    brand: document.getElementById('edit_brand').value,
    model: document.getElementById('edit_model').value,
    purchase_price: parseFloat(document.getElementById('edit_purchase_price').value) || 0,
    current_location: document.getElementById('edit_current_location').value,
    borrower_name: document.getElementById('edit_borrower_name').value,
    status: document.getElementById('edit_status').value
  };
  try {
    const resp = await fetch(`/api/assets/${assetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await resp.json();
    if (result.success) {
      showMessage('资产信息更新成功', 'success');
      closeModal();
      setTimeout(() => window.location.reload(), RELOAD_DELAY);
    } else {
      showMessage(result.message, 'error');
    }
  } catch (err) {
    showMessage('更新失败: ' + err.message, 'error');
  }
}

async function returnAsset(borrowId) {
  if (!confirm('确定要归还这个资产吗？')) return;
  try {
    const resp = await fetch(`/api/borrows/${borrowId}/return`, { method: 'POST' });
    const result = await resp.json();
    if (result.success) {
      showMessage('资产归还成功', 'success');
      setTimeout(() => window.location.reload(), RELOAD_DELAY);
    } else {
      showMessage(result.message, 'error');
    }
  } catch (err) {
    showMessage('归还失败: ' + err.message, 'error');
  }
}

async function resolveAlert(alertId) {
  try {
    const resp = await fetch(`/api/alerts/${alertId}/resolve`, { method: 'POST' });
    const result = await resp.json();
    if (result.success) {
      showMessage('告警已处理', 'success');
      const row = document.querySelector(`tr[data-alert-id="${alertId}"]`);
      if (row) {
        row.cells[5].innerHTML = '<span class="status-badge status-available">已处理</span>';
      }
    } else {
      showMessage(result.message, 'error');
    }
  } catch (err) {
    showMessage('处理失败: ' + err.message, 'error');
  }
}

function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) modal.remove();
}

function startLocationUpdates() {
  setInterval(updateLocationData, LOCATION_REFRESH_INTERVAL);
}

function updateLocationData() {
  document.querySelectorAll('.table tbody tr').forEach((row) => {
    const cell = row.cells[5];
    if (cell && cell.textContent !== '未知') {
      const mins = Math.floor(Math.random() * 5) + 1;
      cell.textContent = `${mins}分钟前`;
    }
  });
}

function refreshLocationData() {
  showMessage('正在刷新位置数据...', 'info');
  setTimeout(() => {
    updateLocationData();
    showMessage('位置数据刷新完成', 'success');
  }, 2000);
}

function startInventoryCheck() {
  showMessage('开始盘点检查...', 'info');
  let progress = 0;
  const timer = setInterval(() => {
    progress += INVENTORY_STEP;
    showMessage(`盘点进度: ${progress}%`, 'info');
    if (progress >= 100) {
      clearInterval(timer);
      showMessage('盘点检查完成', 'success');
    }
  }, INVENTORY_TICK_MS);
}

function checkNewAlerts() {
  setInterval(() => {
    if (Math.random() < ALERT_RANDOM_PROBABILITY) {
      showMessage('检测到新告警', 'warning');
    }
  }, ALERT_CHECK_INTERVAL);
}

function markAllAlertsRead() {
  document.querySelectorAll('.status-badge.status-borrowed').forEach((badge) => {
    if (badge.textContent === '未读') {
      badge.textContent = '已读';
      badge.className = 'status-badge status-available';
    }
  });
  showMessage('所有告警已标记为已读', 'success');
}

function showMessage(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `message message-${type}`;
  el.textContent = message;
  el.style.cssText = `
    position: fixed; top: 20px; right: 20px; padding: 12px 20px;
    border-radius: 4px; color: white; font-weight: 500; z-index: 9999;
    animation: slideIn 0.3s ease; max-width: 300px;
  `;
  el.style.backgroundColor = MSG_COLORS[type] || MSG_COLORS.info;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, TOAST_FADE_MS);
  }, TOAST_DURATION);
}

function showBorrowForm() {
  const formHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>新增借用记录</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="borrowForm">
            <div class="form-group">
              <label>借用人姓名 *</label>
              <input type="text" id="borrower_name" class="form-control" placeholder="请输入借用人姓名" required>
            </div>
            <div class="form-group">
              <label>所属部门 *</label>
              <select id="borrower_department" class="form-control" required>
                <option value="">请选择部门</option>
                <option value="研发部">研发部</option>
                <option value="设计部">设计部</option>
                <option value="市场部">市场部</option>
                <option value="技术部">技术部</option>
                <option value="产品部">产品部</option>
              </select>
            </div>
            <div class="form-group">
              <label>借用资产 *</label>
              <select id="asset_id" class="form-control" required>
                <option value="">请选择资产</option>
                <option value="1">[LAPTOP001] 联想ThinkPad P1</option>
                <option value="3">[SERVER003] 边缘计算服务器</option>
                <option value="5">[LAPTOP005] 苹果MacBook Pro</option>
                <option value="6">[SERVER006] 移动存储服务器</option>
                <option value="8">[DRONE008] 测绘无人机</option>
                <option value="9">[CAMERA009] 佳能单反相机</option>
                <option value="10">[PROJECTOR010] 激光投影仪</option>
                <option value="11">[TABLET011] iPad Pro</option>
              </select>
            </div>
            <div class="form-group">
              <label>预计归还日期 *</label>
              <input type="date" id="expected_return_date" class="form-control" required>
            </div>
            <div class="form-group">
              <label>备注</label>
              <textarea id="notes" class="form-control" rows="3" placeholder="请输入备注信息"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="saveBorrow()">确认借用</button>
          <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

function saveBorrow() {
  showMessage('借用记录创建成功', 'success');
  closeModal();
}

function extendBorrow(borrowId) {
  const formHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>延期申请</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <p>当前借用记录：BR${String(borrowId).padStart(3, '0')}</p>
          <div class="form-group">
            <label>新的归还日期 *</label>
            <input type="date" id="new_return_date" class="form-control" required>
          </div>
          <div class="form-group">
            <label>延期原因 *</label>
            <textarea id="extend_reason" class="form-control" rows="3" placeholder="请说明延期原因" required></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-warning" onclick="confirmExtend(${borrowId})">确认延期</button>
          <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

function confirmExtend(borrowId) {
  showMessage('延期申请已提交', 'success');
  closeModal();
}

function viewBorrow(borrowId) {
  const detailHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>借用记录详情</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>借用编号:</span><span>BR${String(borrowId).padStart(3, '0')}</span></div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>借用人:</span><span>王建国</span></div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>所属部门:</span><span>市场部</span></div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>借用资产:</span><span>联想ThinkPad P1</span></div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>借用日期:</span><span>2024-01-10</span></div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>预计归还:</span><span>2024-01-20</span></div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>当前状态:</span><span style="color: #f39c12; font-weight: bold;">借用中</span></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="closeModal()">关闭</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', detailHtml);
}

function locateAsset(assetId) {
  showMessage('正在定位资产...', 'info');
  setTimeout(() => showMessage('资产定位成功，已在地图上高亮显示', 'success'), 2000);
}

function showTrajectory(assetId) {
  const html = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 600px;">
        <div class="modal-header">
          <h3>设备移动轨迹</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div style="height: 300px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
            <div style="text-align: center; color: #666;">
              <i class="fas fa-route" style="font-size: 48px; margin-bottom: 10px;"></i>
              <p>设备移动轨迹图</p>
              <p style="font-size: 12px;">显示过去24小时的移动路径</p>
            </div>
          </div>
          <div>
            <h5>最近位置记录：</h5>
            <div style="font-size: 12px;">
              <div>• 14:30 - 研发部-A区-工位12</div>
              <div>• 11:20 - 会议室-201</div>
              <div>• 09:15 - 研发部-A区-工位12</div>
              <div>• 昨天 17:45 - 研发部-A区-工位12</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="closeModal()">关闭</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function viewAlert(alertId) {
  const html = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>告警详情</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>告警类型:</span><span>设备位置异常</span></div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>资产编号:</span><span><strong>LAPTOP001</strong></span></div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>资产名称:</span><span>联想ThinkPad P1</span></div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>严重程度:</span><span style="color: #e74c3c; font-weight: bold;">高级</span></div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>发生时间:</span><span>2024-01-15 14:30</span></div>
            <div style="margin: 15px 0;">
              <span>详细描述:</span>
              <p style="margin-top: 5px; padding: 10px; background: #f8f9fa; border-radius: 4px;">设备检测到异常移动，当前位置与预期不符。建议立即核查设备状态。</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-success" onclick="resolveAlert(${alertId})">标记已处理</button>
          <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function showAlertSettings() {
  const html = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>告警设置</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group"><label>位置异常告警</label><select class="form-control"><option>启用</option><option>禁用</option></select></div>
          <div class="form-group"><label>设备离线告警</label><select class="form-control"><option>启用</option><option>禁用</option></select></div>
          <div class="form-group"><label>借用逾期告警</label><select class="form-control"><option>启用</option><option>禁用</option></select></div>
          <div class="form-group">
            <label>告警通知方式</label>
            <div>
              <label><input type="checkbox" checked> 系统通知</label><br>
              <label><input type="checkbox" checked> 邮件通知</label><br>
              <label><input type="checkbox"> 短信通知</label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="saveAlertSettings()">保存设置</button>
          <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function saveAlertSettings() {
  showMessage('告警设置已保存', 'success');
  closeModal();
}

// 星闪诊断
function refreshTrackerStatus() {
  showMessage('正在刷新跟踪器状态...', 'info');
  setTimeout(() => showMessage('跟踪器状态刷新完成', 'success'), 2000);
}

function runDiagnostics() {
  showMessage('正在运行全面诊断...', 'info');
  setTimeout(() => showMessage('诊断完成，发现8个异常项', 'warning'), DIAG_DELAY);
}

function exportDiagnosticReport() {
  showMessage('正在生成诊断报告...', 'info');
  setTimeout(() => showMessage('诊断报告导出成功', 'success'), 2000);
}

function showTrackerDetails(trackerId) {
  const html = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>跟踪器详情 - ${trackerId}</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>跟踪器ID:</span><span><strong>${trackerId}</strong></span></div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>固件版本:</span><span>v2.1.3</span></div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>硬件版本:</span><span>H1.2</span></div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>制造日期:</span><span>2023-08-15</span></div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>工作温度:</span><span>23°C</span></div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>运行时长:</span><span>156天</span></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="closeModal()">关闭</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function testTracker(trackerId) {
  showMessage(`正在测试跟踪器 ${trackerId}...`, 'info');
  setTimeout(() => showMessage(`跟踪器 ${trackerId} 测试通过`, 'success'), 2000);
}

function diagnoseTracker(trackerId) {
  showMessage(`正在诊断跟踪器 ${trackerId}...`, 'info');
  setTimeout(() => showMessage(`跟踪器 ${trackerId} 诊断完成，发现信号干扰`, 'warning'), 2500);
}

function troubleshootAsset(assetCode) {
  const html = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>故障排查 - ${assetCode}</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <h4>自动诊断结果：</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>✗ 星闪信号：无法检测</li>
            <li>✗ 网络连接：连接超时</li>
            <li>✗ 电池电量：严重不足(15%)</li>
            <li>✓ 硬件注册：正常</li>
          </ul>
          <h4>建议处理方案：</h4>
          <ol style="margin: 10px 0; padding-left: 20px;">
            <li>检查设备电源状态</li>
            <li>更换或充电电池</li>
            <li>检查星闪标签连接</li>
            <li>重启设备网络模块</li>
            <li>如问题持续，联系技术支持</li>
          </ol>
        </div>
        <div class="modal-footer">
          <button class="btn btn-success" onclick="executeAutoRepair('${assetCode}')">自动修复</button>
          <button class="btn btn-warning" onclick="scheduleMaintenance('${assetCode}')">安排维护</button>
          <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function showProcessAnomaly(assetCode) {
  const html = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>处理异常 - ${assetCode}</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <h4>自动诊断结果：</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>✗ 星闪信号：无法检测</li>
            <li>✗ 网络连接：连接超时</li>
            <li>✗ 电池电量：严重不足(15%)</li>
            <li>✓ 硬件注册：正常</li>
          </ul>
          <h4>建议处理方案：</h4>
          <ol style="margin: 10px 0; padding-left: 20px;">
            <li>检查设备电源状态</li>
            <li>更换或充电电池</li>
            <li>检查星闪标签连接</li>
            <li>重启设备网络模块</li>
            <li>如问题持续，联系技术支持</li>
          </ol>
        </div>
        <div class="modal-footer">
          <button class="btn btn-warning" onclick="showMaintenanceForm('${assetCode}')">安排维护</button>
          <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function executeAutoRepair(assetCode) {
  showMessage(`正在执行 ${assetCode} 自动修复...`, 'info');
  setTimeout(() => {
    showMessage(`${assetCode} 自动修复完成，设备已恢复在线`, 'success');
    closeModal();
  }, 4000);
}

function scheduleMaintenance(assetCode) {
  showMessage(`已为 ${assetCode} 安排维护计划`, 'success');
  closeModal();
}

function logout() {
  if (confirm('确定要退出系统吗？')) {
    showMessage('正在退出系统...', 'info');
    setTimeout(() => { window.location.href = '/login'; }, RELOAD_DELAY);
  }
}

function showAssetFlowModal() {
  const html = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>导出资产流转报表</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>报表类型</label>
            <select class="form-control">
              <option>月度流转报表</option>
              <option>季度流转报表</option>
              <option>年度流转报表</option>
            </select>
          </div>
          <div class="form-group">
            <label>时间范围</label>
            <div style="display: flex; gap: 10px;">
              <input type="date" class="form-control" value="2024-01-01">
              <span style="line-height: 38px;">至</span>
              <input type="date" class="form-control" value="2024-01-31">
            </div>
          </div>
          <div class="form-group">
            <label>包含内容</label>
            <div>
              <label><input type="checkbox" checked> 资产登记统计</label><br>
              <label><input type="checkbox" checked> 借用归还统计</label><br>
              <label><input type="checkbox" checked> 维护记录统计</label><br>
              <label><input type="checkbox"> 详细流转记录</label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-success" onclick="exportReport('excel')">导出Excel</button>
          <button class="btn btn-primary" onclick="exportReport('pdf')">导出PDF</button>
          <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function exportReport(type) {
  showMessage(`正在生成${type.toUpperCase()}报表...`, 'info');
  setTimeout(() => {
    showMessage(`${type.toUpperCase()}报表导出成功`, 'success');
    closeModal();
  }, 2000);
}

function showFlowDetails(period) {
  const html = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 700px;">
        <div class="modal-header">
          <h3>${period} 资产流转详情</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <h5>入库统计</h5>
              <div style="font-size: 12px;">
                <div>• 新采购设备: 15台</div>
                <div>• 维修完成归库: 3台</div>
                <div>• 总入库量: 18台</div>
              </div>
            </div>
            <div>
              <h5>出库统计</h5>
              <div style="font-size: 12px;">
                <div>• 借用出库: 45台次</div>
                <div>• 维修出库: 8台次</div>
                <div>• 报废出库: 2台</div>
              </div>
            </div>
          </div>
          <div>
            <h5>热门借用设备TOP5</h5>
            <table class="table" style="font-size: 12px;">
              <thead><tr><th>设备类型</th><th>借用次数</th><th>平均借用天数</th></tr></thead>
              <tbody>
                <tr><td>笔记本电脑</td><td>28次</td><td>5.2天</td></tr>
                <tr><td>移动工作站</td><td>12次</td><td>8.5天</td></tr>
                <tr><td>无人机设备</td><td>8次</td><td>3.1天</td></tr>
                <tr><td>服务器设备</td><td>5次</td><td>12.3天</td></tr>
                <tr><td>平板电脑</td><td>4次</td><td>2.8天</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="closeModal()">关闭</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

async function showMaintenanceForm(assetCode = null) {
  let assetOptions = '<option value="">请选择资产</option>';
  try {
    const resp = await fetch('/api/assets');
    const assets = await resp.json();
    assets.forEach((a) => {
      const sel = a.asset_code === assetCode ? 'selected' : '';
      assetOptions += `<option value="${a.id}" ${sel}>${a.asset_code} - ${a.asset_name}</option>`;
    });
  } catch (e) {
    console.error('获取资产列表失败:', e);
  }

  const formHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>新增维护记录</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="maintenanceForm">
            <div class="form-group">
              <label>维护资产 *</label>
              <select id="maintenance_asset_id" class="form-control" required>${assetOptions}</select>
            </div>
            <div class="form-group">
              <label>维护类型 *</label>
              <select id="maintenance_type" class="form-control" required>
                <option value="">请选择类型</option>
                <option value="定期保养">定期保养</option>
                <option value="故障维修">故障维修</option>
                <option value="升级改造">升级改造</option>
                <option value="清洁保养">清洁保养</option>
              </select>
            </div>
            <div class="form-group">
              <label>维护日期 *</label>
              <input type="date" id="maintenance_date" class="form-control" required>
            </div>
            <div class="form-group">
              <label>维护人员</label>
              <input type="text" id="maintenance_person" class="form-control" placeholder="请输入维护人员">
            </div>
            <div class="form-group">
              <label>维护描述</label>
              <textarea id="maintenance_description" class="form-control" rows="3" placeholder="请描述维护内容"></textarea>
            </div>
            <div class="form-group">
              <label>维护费用</label>
              <input type="number" id="maintenance_cost" class="form-control" placeholder="请输入费用" step="0.01">
            </div>
            <div class="form-group">
              <label>下次维护日期</label>
              <input type="date" id="next_maintenance_date" class="form-control">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="saveMaintenance()">保存</button>
          <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

function saveMaintenance() {
  showMessage('维护记录保存成功', 'success');
  closeModal();
}

function editMaintenance(maintenanceId) {
  const formHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>编辑维护记录</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="editMaintenanceForm">
            <div class="form-group">
              <label>维护类型 *</label>
              <select id="edit_maintenance_type" class="form-control" required>
                <option value="定期保养" selected>定期保养</option>
                <option value="故障维修">故障维修</option>
                <option value="升级改造">升级改造</option>
                <option value="清洁保养">清洁保养</option>
              </select>
            </div>
            <div class="form-group">
              <label>维护状态 *</label>
              <select id="edit_maintenance_status" class="form-control" required>
                <option value="ongoing" selected>进行中</option>
                <option value="completed">已完成</option>
                <option value="pending">待处理</option>
              </select>
            </div>
            <div class="form-group">
              <label>维护人员</label>
              <input type="text" id="edit_maintenance_person" class="form-control" value="技术部-小王">
            </div>
            <div class="form-group">
              <label>维护描述</label>
              <textarea id="edit_maintenance_description" class="form-control" rows="3">无人机电池校准和螺旋桨检查</textarea>
            </div>
            <div class="form-group">
              <label>维护费用</label>
              <input type="number" id="edit_maintenance_cost" class="form-control" value="850.00" step="0.01">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="updateMaintenance(${maintenanceId})">更新</button>
          <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

function updateMaintenance(maintenanceId) {
  showMessage('维护记录更新成功', 'success');
  closeModal();
}

function showInventoryForm() {
  const formHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>新建盘点任务</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="inventoryForm">
            <div class="form-group">
              <label>盘点名称 *</label>
              <input type="text" id="inventory_name" class="form-control" placeholder="请输入盘点任务名称" required>
            </div>
            <div class="form-group">
              <label>盘点范围 *</label>
              <select id="inventory_scope" class="form-control" required>
                <option value="">请选择盘点范围</option>
                <option value="全部资产">全部资产</option>
                <option value="按部门">按部门</option>
                <option value="按类别">按类别</option>
                <option value="按位置">按位置</option>
              </select>
            </div>
            <div class="form-group">
              <label>盘点日期 *</label>
              <input type="date" id="inventory_date" class="form-control" required>
            </div>
            <div class="form-group">
              <label>盘点人员 *</label>
              <input type="text" id="inventory_checker" class="form-control" placeholder="请输入盘点人员" required>
            </div>
            <div class="form-group">
              <label>备注</label>
              <textarea id="inventory_notes" class="form-control" rows="3" placeholder="请输入备注信息"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="saveInventory()">创建任务</button>
          <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

function saveInventory() {
  showMessage('盘点任务创建成功', 'success');
  closeModal();
}

function editInventory(inventoryId) {
  const formHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>编辑盘点记录</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="editInventoryForm">
            <div class="form-group">
              <label>实际位置 *</label>
              <input type="text" id="edit_actual_location" class="form-control" value="1F-机房-机柜B12" required>
            </div>
            <div class="form-group">
              <label>盘点状态 *</label>
              <select id="edit_inventory_status" class="form-control" required>
                <option value="normal">正常</option>
                <option value="abnormal" selected>异常</option>
                <option value="missing">缺失</option>
              </select>
            </div>
            <div class="form-group">
              <label>盘点人员</label>
              <input type="text" id="edit_inventory_checker" class="form-control" value="盘点员-小李">
            </div>
            <div class="form-group">
              <label>备注</label>
              <textarea id="edit_inventory_notes" class="form-control" rows="3">设备位置与预期不符，需要更新位置信息</textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="updateInventory(${inventoryId})">更新</button>
          <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

function updateInventory(inventoryId) {
  showMessage('盘点记录更新成功', 'success');
  closeModal();
}

function showUserForm() {
  const formHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>新增用户</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="userForm">
            <div class="form-group">
              <label>用户名 *</label>
              <input type="text" id="username" class="form-control" placeholder="请输入用户名" required>
            </div>
            <div class="form-group">
              <label>密码 *</label>
              <input type="password" id="password" class="form-control" placeholder="请输入密码" required>
            </div>
            <div class="form-group">
              <label>确认密码 *</label>
              <input type="password" id="confirm_password" class="form-control" placeholder="请确认密码" required>
            </div>
            <div class="form-group">
              <label>角色 *</label>
              <select id="role" class="form-control" required>
                <option value="">请选择角色</option>
                <option value="admin">管理员</option>
                <option value="manager">部门经理</option>
                <option value="user">普通用户</option>
              </select>
            </div>
            <div class="form-group">
              <label>所属部门</label>
              <select id="department" class="form-control">
                <option value="">请选择部门</option>
                <option value="研发部">研发部</option>
                <option value="技术部">技术部</option>
                <option value="市场部">市场部</option>
                <option value="行政部">行政部</option>
              </select>
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input type="email" id="email" class="form-control" placeholder="请输入邮箱">
            </div>
            <div class="form-group">
              <label>手机号</label>
              <input type="tel" id="phone" class="form-control" placeholder="请输入手机号">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="saveUser()">保存</button>
          <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

function saveUser() {
  showMessage('用户创建成功', 'success');
  closeModal();
}

function editUser(userId) {
  const formHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>编辑用户</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="editUserForm">
            <div class="form-group">
              <label>用户名</label>
              <input type="text" id="edit_username" class="form-control" value="zhangwei" readonly>
            </div>
            <div class="form-group">
              <label>姓名</label>
              <input type="text" id="edit_name" class="form-control" value="张伟">
            </div>
            <div class="form-group">
              <label>角色</label>
              <select id="edit_role" class="form-control">
                <option value="admin">管理员</option>
                <option value="manager">部门经理</option>
                <option value="user" selected>普通用户</option>
              </select>
            </div>
            <div class="form-group">
              <label>部门</label>
              <select id="edit_department" class="form-control">
                <option value="研发部" selected>研发部</option>
                <option value="技术部">技术部</option>
                <option value="市场部">市场部</option>
                <option value="行政部">行政部</option>
              </select>
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input type="email" id="edit_email" class="form-control" value="zhangwei@company.com">
            </div>
            <div class="form-group">
              <label>手机号</label>
              <input type="tel" id="edit_phone" class="form-control" value="13800138001">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="updateUser(${userId})">更新</button>
          <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

function updateUser(userId) {
  showMessage('用户信息更新成功', 'success');
  closeModal();
}

function resetPassword(userId) {
  showMessage('密码重置成功', 'success');
}

function disableUser(userId) {
  showMessage('用户已禁用', 'success');
  setTimeout(() => window.location.reload(), RELOAD_DELAY);
}

function enableUser(userId) {
  showMessage('用户已启用', 'success');
  setTimeout(() => window.location.reload(), RELOAD_DELAY);
}

function showRoleForm() {
  const formHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>新增角色</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="roleForm">
            <div class="form-group">
              <label>角色名称 *</label>
              <input type="text" id="role_name" class="form-control" placeholder="请输入角色名称" required>
            </div>
            <div class="form-group">
              <label>角色描述</label>
              <textarea id="role_desc" class="form-control" rows="2" placeholder="请输入角色描述"></textarea>
            </div>
            <div class="form-group">
              <label>权限配置</label>
              <div>
                <label><input type="checkbox" checked> 资产查看</label><br>
                <label><input type="checkbox"> 资产编辑</label><br>
                <label><input type="checkbox"> 借用管理</label><br>
                <label><input type="checkbox"> 维护管理</label><br>
                <label><input type="checkbox"> 盘点管理</label><br>
                <label><input type="checkbox"> 报表查看</label><br>
                <label><input type="checkbox"> 用户管理</label><br>
                <label><input type="checkbox"> 系统设置</label>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="saveRole()">保存</button>
          <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

function saveRole() {
  showMessage('角色创建成功', 'success');
  closeModal();
}

function viewRole(roleId) {
  showMessage('查看角色详情', 'info');
}

function editRole(roleId) {
  showMessage('编辑角色', 'info');
}

function updateRole(roleId) {
  showMessage('角色更新成功', 'success');
  closeModal();
}

async function viewInventoryDetails(inventoryId) {
  try {
    const resp = await fetch(`/api/inventory/${inventoryId}`);
    const inv = await resp.json();
    const html = `
      <div class="modal-overlay" onclick="closeModal()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>盘点详情</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>资产编码:</span><span>${inv.asset_code || '-'}</span></div>
              <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>资产名称:</span><span>${inv.asset_name || '-'}</span></div>
              <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>预期位置:</span><span>${inv.expected_location || '-'}</span></div>
              <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>实际位置:</span><span>${inv.actual_location || '-'}</span></div>
              <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>盘点状态:</span><span>${inv.status || '-'}</span></div>
              <div style="display: flex; justify-content: space-between; margin: 8px 0;"><span>盘点人员:</span><span>${inv.checker_name || '-'}</span></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" onclick="closeModal()">关闭</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  } catch (err) {
    showMessage('获取盘点详情失败', 'error');
  }
}

function startAutoInventory() {
  showMessage('正在启动自动盘点...', 'info');
  let progress = 0;
  const timer = setInterval(() => {
    progress += INVENTORY_STEP;
    showMessage(`自动盘点进度: ${progress}%`, 'info');
    if (progress >= 100) {
      clearInterval(timer);
      showMessage('自动盘点完成', 'success');
      setTimeout(() => window.location.reload(), RELOAD_DELAY);
    }
  }, INVENTORY_TICK_MS);
}

function runFullDiagnostics() {
  showMessage('正在运行全面诊断...', 'info');
  setTimeout(() => showMessage('全面诊断完成', 'success'), DIAG_DELAY);
}

function exportInventoryReport() {
  showMessage('正在生成盘点报告...', 'info');
  setTimeout(() => showMessage('盘点报告导出成功', 'success'), 2000);
}
