// 主要的JavaScript功能
document.addEventListener("DOMContentLoaded", function () {
  // 初始化页面
  initializePage();

  // 绑定事件监听器
  bindEventListeners();
});

function initializePage() {
  // 页面初始化逻辑
  console.log("设备资产定位管理系统已加载");

  // 模拟实时数据更新
  if (window.location.pathname.includes("location_tracking")) {
    startLocationUpdates();
  }

  // 模拟告警通知
  if (window.location.pathname.includes("alert_notification")) {
    checkNewAlerts();
  }
}

function bindEventListeners() {
  // 绑定所有按钮点击事件
  document.querySelectorAll(".btn").forEach((button) => {
    button.addEventListener("click", handleButtonClick);
  });

  // 绑定表格行点击事件
  document.querySelectorAll(".table tbody tr").forEach((row) => {
    row.addEventListener("click", handleRowClick);
  });
}

function handleButtonClick(event) {
  const button = event.target.closest(".btn");
  const buttonText = button.textContent.trim();

  // 根据按钮文本执行不同操作
  switch (buttonText) {
    case "新增资产":
      showAssetForm();
      break;
    case "刷新位置":
      refreshLocationData();
      break;
    case "开始盘点":
      startInventoryCheck();
      break;
    case "全部已读":
      markAllAlertsRead();
      break;
    default:
      // 其他按钮功能
      break;
  }
}

function handleRowClick(event) {
  const row = event.target.closest("tr");
  if (row && row.parentElement.tagName === "TBODY") {
    // 高亮选中行
    document
      .querySelectorAll(".table tbody tr")
      .forEach((r) => r.classList.remove("table-active"));
    row.classList.add("table-active");
  }
}

// 新增资产表单
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
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", formHtml);
}

// 保存资产
async function saveAsset() {
  const form = document.getElementById("assetForm");
  const formData = new FormData(form);

  const assetData = {
    asset_code: document.getElementById("asset_code").value,
    asset_name: document.getElementById("asset_name").value,
    category: document.getElementById("category").value,
    brand: document.getElementById("brand").value,
    model: document.getElementById("model").value,
    purchase_price:
      parseFloat(document.getElementById("purchase_price").value) || 0,
    current_location: document.getElementById("current_location").value,
    star_flash_tag_id: document.getElementById("star_flash_tag_id").value,
  };

  // 验证必填字段
  if (!assetData.asset_code || !assetData.asset_name || !assetData.category) {
    showMessage("请填写必填字段", "error");
    return;
  }

  try {
    const response = await fetch("/api/assets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assetData),
    });

    const result = await response.json();

    if (result.success) {
      showMessage("资产保存成功", "success");
      closeModal();
      // 刷新页面
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      showMessage(result.message, "error");
    }
  } catch (error) {
    showMessage("保存失败: " + error.message, "error");
  }
}

// 删除资产
async function deleteAsset(assetId) {
  if (!confirm("确定要删除这个资产吗？")) {
    return;
  }

  try {
    const response = await fetch(`/api/assets/${assetId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (result.success) {
      showMessage("资产删除成功", "success");
      // 移除表格行
      const row = document.querySelector(`tr[data-asset-id="${assetId}"]`);
      if (row) {
        row.remove();
      }
    } else {
      showMessage(result.message, "error");
    }
  } catch (error) {
    showMessage("删除失败: " + error.message, "error");
  }
}

// 编辑资产
function editAsset(assetId) {
  showMessage("编辑功能开发中...", "info");
}

// 归还资产
async function returnAsset(borrowId) {
  if (!confirm("确定要归还这个资产吗？")) {
    return;
  }

  try {
    const response = await fetch(`/api/borrows/${borrowId}/return`, {
      method: "POST",
    });

    const result = await response.json();

    if (result.success) {
      showMessage("资产归还成功", "success");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      showMessage(result.message, "error");
    }
  } catch (error) {
    showMessage("归还失败: " + error.message, "error");
  }
}

// 处理告警
async function resolveAlert(alertId) {
  try {
    const response = await fetch(`/api/alerts/${alertId}/resolve`, {
      method: "POST",
    });

    const result = await response.json();

    if (result.success) {
      showMessage("告警已处理", "success");
      // 更新表格行状态
      const row = document.querySelector(`tr[data-alert-id="${alertId}"]`);
      if (row) {
        const statusCell = row.cells[5];
        statusCell.innerHTML =
          '<span class="status-badge status-available">已处理</span>';
      }
    } else {
      showMessage(result.message, "error");
    }
  } catch (error) {
    showMessage("处理失败: " + error.message, "error");
  }
}

// 关闭模态框
function closeModal() {
  const modal = document.querySelector(".modal-overlay");
  if (modal) {
    modal.remove();
  }
}

// 模拟位置数据更新
function startLocationUpdates() {
  setInterval(() => {
    updateLocationData();
  }, 30000); // 每30秒更新一次
}

function updateLocationData() {
  const locationRows = document.querySelectorAll(".table tbody tr");
  locationRows.forEach((row) => {
    const timeCell = row.cells[5]; // 最后更新时间列
    if (timeCell && timeCell.textContent !== "未知") {
      const randomMinutes = Math.floor(Math.random() * 5) + 1;
      timeCell.textContent = `${randomMinutes}分钟前`;
    }
  });
}

function refreshLocationData() {
  showMessage("正在刷新位置数据...", "info");

  // 模拟加载过程
  setTimeout(() => {
    updateLocationData();
    showMessage("位置数据刷新完成", "success");
  }, 2000);
}

// 模拟盘点功能
function startInventoryCheck() {
  showMessage("开始盘点检查...", "info");

  // 模拟盘点进度
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    showMessage(`盘点进度: ${progress}%`, "info");

    if (progress >= 100) {
      clearInterval(interval);
      showMessage("盘点检查完成", "success");
    }
  }, 500);
}

// 模拟告警检查
function checkNewAlerts() {
  setInterval(() => {
    if (Math.random() < 0.1) {
      // 10%概率产生新告警
      showMessage("检测到新告警", "warning");
    }
  }, 60000); // 每分钟检查一次
}

function markAllAlertsRead() {
  const unreadBadges = document.querySelectorAll(
    ".status-badge.status-borrowed"
  );
  unreadBadges.forEach((badge) => {
    if (badge.textContent === "未读") {
      badge.textContent = "已读";
      badge.className = "status-badge status-available";
    }
  });

  showMessage("所有告警已标记为已读", "success");
}

// 移除"开发中"提示，这些功能已在后面实现

// 通用消息提示
function showMessage(message, type = "info") {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message message-${type}`;
  messageDiv.textContent = message;

  // 添加样式
  messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;

  // 根据类型设置背景色
  const colors = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  };
  messageDiv.style.backgroundColor = colors[type] || colors.info;

  document.body.appendChild(messageDiv);

  // 3秒后自动移除
  setTimeout(() => {
    messageDiv.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 300);
  }, 3000);
}

// 添加CSS动画和样式
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .table tbody tr:hover {
        background-color: #f8f9fa !important;
        cursor: pointer;
    }
    
    .table tbody tr.table-active {
        background-color: #e3f2fd !important;
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .modal-header {
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .modal-footer {
        padding: 20px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
    
    .btn-secondary {
        background-color: #6c757d;
        color: white;
    }
    
    .btn-secondary:hover {
        background-color: #5a6268;
    }
    
    .btn-sm {
        padding: 5px 10px;
        font-size: 12px;
    }
`;
document.head.appendChild(style);

// 其他功能函数
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
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", formHtml);
}

function saveBorrow() {
  showMessage("借用记录创建成功", "success");
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
                    <p>当前借用记录：BR${String(borrowId).padStart(3, "0")}</p>
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
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", formHtml);
}

function confirmExtend(borrowId) {
  showMessage("延期申请已提交", "success");
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
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>借用编号:</span>
                            <span>BR${String(borrowId).padStart(3, "0")}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>借用人:</span>
                            <span>王建国</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>所属部门:</span>
                            <span>市场部</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>借用资产:</span>
                            <span>联想ThinkPad P1</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>借用日期:</span>
                            <span>2024-01-10</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>预计归还:</span>
                            <span>2024-01-20</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>当前状态:</span>
                            <span style="color: #f39c12; font-weight: bold;">借用中</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeModal()">关闭</button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", detailHtml);
}

function locateAsset(assetId) {
  showMessage("正在定位资产...", "info");
  setTimeout(() => {
    showMessage("资产定位成功，已在地图上高亮显示", "success");
  }, 2000);
}

function showTrajectory(assetId) {
  const trajectoryHtml = `
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
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", trajectoryHtml);
}

function viewAlert(alertId) {
  const alertHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>告警详情</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>告警类型:</span>
                            <span>设备位置异常</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>资产编号:</span>
                            <span><strong>LAPTOP001</strong></span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>资产名称:</span>
                            <span>联想ThinkPad P1</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>严重程度:</span>
                            <span style="color: #e74c3c; font-weight: bold;">高级</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>发生时间:</span>
                            <span>2024-01-15 14:30</span>
                        </div>
                        <div style="margin: 15px 0;">
                            <span>详细描述:</span>
                            <p style="margin-top: 5px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                                设备检测到异常移动，当前位置与预期不符。建议立即核查设备状态。
                            </p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-success" onclick="resolveAlert(${alertId})">标记已处理</button>
                    <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", alertHtml);
}

function showAlertSettings() {
  const settingsHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>告警设置</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>位置异常告警</label>
                        <select class="form-control">
                            <option>启用</option>
                            <option>禁用</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>设备离线告警</label>
                        <select class="form-control">
                            <option>启用</option>
                            <option>禁用</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>借用逾期告警</label>
                        <select class="form-control">
                            <option>启用</option>
                            <option>禁用</option>
                        </select>
                    </div>
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
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", settingsHtml);
}

function saveAlertSettings() {
  showMessage("告警设置已保存", "success");
  closeModal();
}

// 星闪跟踪器诊断相关函数
function refreshTrackerStatus() {
  showMessage("正在刷新跟踪器状态...", "info");
  setTimeout(() => {
    showMessage("跟踪器状态刷新完成", "success");
  }, 2000);
}

function runDiagnostics() {
  showMessage("正在运行全面诊断...", "info");
  setTimeout(() => {
    showMessage("诊断完成，发现8个异常项", "warning");
  }, 3000);
}

function exportDiagnosticReport() {
  showMessage("正在生成诊断报告...", "info");
  setTimeout(() => {
    showMessage("诊断报告导出成功", "success");
  }, 2000);
}

function showTrackerDetails(trackerId) {
  const detailHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>跟踪器详情 - ${trackerId}</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>跟踪器ID:</span>
                            <span><strong>${trackerId}</strong></span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>固件版本:</span>
                            <span>v2.1.3</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>硬件版本:</span>
                            <span>H1.2</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>制造日期:</span>
                            <span>2023-08-15</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>工作温度:</span>
                            <span>23°C</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>运行时长:</span>
                            <span>156天</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeModal()">关闭</button>
                </div>
            </div>
        </div>
    `;
  document.body.insertAdjacentHTML("beforeend", detailHtml);
}

function testTracker(trackerId) {
  showMessage(`正在测试跟踪器 ${trackerId}...`, "info");
  setTimeout(() => {
    showMessage(`跟踪器 ${trackerId} 测试通过`, "success");
  }, 2000);
}

function diagnoseTracker(trackerId) {
  showMessage(`正在诊断跟踪器 ${trackerId}...`, "info");
  setTimeout(() => {
    showMessage(`跟踪器 ${trackerId} 诊断完成，发现信号干扰`, "warning");
  }, 2500);
}

function troubleshootTracker(trackerId) {
  const troubleshootHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>故障排查 - ${trackerId}</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <h4>自动诊断结果：</h4>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>✓ 硬件连接正常</li>
                        <li>✗ 网络连接异常</li>
                        <li>✗ 电池电量过低</li>
                        <li>✓ 固件版本正常</li>
                    </ul>
                    <h4>建议处理方案：</h4>
                    <ol style="margin: 10px 0; padding-left: 20px;">
                        <li>检查网络连接</li>
                        <li>更换电池</li>
                        <li>重启设备</li>
                        <li>联系技术支持</li>
                    </ol>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-success" onclick="executeRepair('${trackerId}')">执行修复</button>
                    <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
                </div>
            </div>
        </div>
    `;
  document.body.insertAdjacentHTML("beforeend", troubleshootHtml);
}

function resetTracker(trackerId) {
  if (confirm(`确定要重置跟踪器 ${trackerId} 吗？`)) {
    showMessage(`正在重置跟踪器 ${trackerId}...`, "info");
    setTimeout(() => {
      showMessage(`跟踪器 ${trackerId} 重置完成`, "success");
    }, 3000);
  }
}

function replaceBattery(trackerId) {
  showMessage(`跟踪器 ${trackerId} 需要更换电池，请联系维护人员`, "warning");
}

function executeRepair(trackerId) {
  showMessage(`正在执行自动修复 ${trackerId}...`, "info");
  setTimeout(() => {
    showMessage(`跟踪器 ${trackerId} 修复完成`, "success");
    closeModal();
  }, 4000);
}

// 盘点核查模块新功能
function startAutoInventory() {
  showMessage("正在启动自动盘点系统...", "info");
  setTimeout(() => {
    showMessage("自动盘点已启动，正在扫描所有设备...", "info");
    setTimeout(() => {
      showMessage("自动盘点完成，发现3个异常项", "warning");
    }, 3000);
  }, 1000);
}

function runFullDiagnostics() {
  showMessage("正在运行全面星闪诊断...", "info");
  setTimeout(() => {
    showMessage("诊断完成：156个在线，8个信号异常，3个离线", "warning");
  }, 4000);
}

function exportInventoryReport() {
  showMessage("正在生成盘点报告...", "info");
  setTimeout(() => {
    showMessage("盘点报告导出成功", "success");
  }, 2000);
}

function viewAssetDetails(assetCode) {
  const detailHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>资产详情 - ${assetCode}</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>资产编码:</span>
                            <span><strong>${assetCode}</strong></span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>当前位置:</span>
                            <span>15F-研发部-工位R12</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>星闪状态:</span>
                            <span style="color: #27ae60;">在线</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>信号强度:</span>
                            <span>-35dBm (优秀)</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>电池电量:</span>
                            <span>85%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>最后更新:</span>
                            <span>2分钟前</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeModal()">关闭</button>
                </div>
            </div>
        </div>
    `;
  document.body.insertAdjacentHTML("beforeend", detailHtml);
}

function confirmInventory(assetCode) {
  showMessage(`资产 ${assetCode} 盘点确认完成`, "success");
}

function verifyAssetLocation(assetCode) {
  const verifyHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>位置核查 - ${assetCode}</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <h4>核查结果：</h4>
                    <div style="margin: 15px 0; padding: 10px; background: #fff3cd; border-radius: 4px;">
                        <strong>位置异常检测</strong><br>
                        预期位置：15F-设计部-工位D05<br>
                        实际位置：15F-市场部-会议室<br>
                        偏差距离：约25米
                    </div>
                    <h4>可能原因：</h4>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>设备被借用到其他区域</li>
                        <li>星闪标签信号干扰</li>
                        <li>设备移动未及时更新位置</li>
                    </ul>
                    <h4>建议处理：</h4>
                    <ol style="margin: 10px 0; padding-left: 20px;">
                        <li>确认设备是否被授权移动</li>
                        <li>检查星闪信号质量</li>
                        <li>更新资产位置信息</li>
                    </ol>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-success" onclick="updateAssetLocation('${assetCode}')">更新位置</button>
                    <button class="btn btn-warning" onclick="reportAssetIssue('${assetCode}')">报告异常</button>
                    <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
                </div>
            </div>
        </div>
    `;
  document.body.insertAdjacentHTML("beforeend", verifyHtml);
}

function updateAssetLocation(assetCode) {
  showMessage(`正在更新 ${assetCode} 的位置信息...`, "info");
  setTimeout(() => {
    showMessage(`${assetCode} 位置信息已更新`, "success");
    closeModal();
  }, 2000);
}

function reportAssetIssue(assetCode) {
  showMessage(`已生成 ${assetCode} 异常报告`, "warning");
  closeModal();
}

function troubleshootAsset(assetCode) {
  const troubleshootHtml = `
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
        </div>
    `;
  document.body.insertAdjacentHTML("beforeend", troubleshootHtml);
}

function executeAutoRepair(assetCode) {
  showMessage(`正在执行 ${assetCode} 自动修复...`, "info");
  setTimeout(() => {
    showMessage(`${assetCode} 自动修复完成，设备已恢复在线`, "success");
    closeModal();
  }, 4000);
}

function scheduleMaintenance(assetCode) {
  showMessage(`已为 ${assetCode} 安排维护计划`, "success");
  closeModal();
}

// 退出登录功能
function logout() {
  if (confirm("确定要退出系统吗？")) {
    showMessage("正在退出系统...", "info");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  }
}

// 报表统计相关函数
function showAssetFlowModal() {
  const flowHtml = `
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
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", formHtml);
}

function exportReport(type) {
  showMessage(`正在生成${type.toUpperCase()}报表...`, "info");
  setTimeout(() => {
    showMessage(`${type.toUpperCase()}报表导出成功`, "success");
    closeModal();
  }, 2000);
}

function showFlowDetails(period) {
  const detailHtml = `
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
                            <thead>
                                <tr><th>设备类型</th><th>借用次数</th><th>平均借用天数</th></tr>
                            </thead>
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
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", detailHtml);
}
// 编辑资产表单
function editAsset(assetId) {
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
                            <input type="text" id="edit_asset_code" class="form-control" value="LAPTOP001" required>
                        </div>
                        <div class="form-group">
                            <label>资产名称 *</label>
                            <input type="text" id="edit_asset_name" class="form-control" value="联想ThinkPad P1" required>
                        </div>
                        <div class="form-group">
                            <label>资产类别 *</label>
                            <select id="edit_category" class="form-control" required>
                                <option value="移动工作站" selected>移动工作站</option>
                                <option value="笔记本电脑">笔记本电脑</option>
                                <option value="投影设备">投影设备</option>
                                <option value="打印设备">打印设备</option>
                                <option value="显示设备">显示设备</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>品牌</label>
                            <input type="text" id="edit_brand" class="form-control" value="联想">
                        </div>
                        <div class="form-group">
                            <label>型号</label>
                            <input type="text" id="edit_model" class="form-control" value="ThinkPad P1 Gen4">
                        </div>
                        <div class="form-group">
                            <label>购买价格</label>
                            <input type="number" id="edit_purchase_price" class="form-control" value="18999.00" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>当前位置</label>
                            <input type="text" id="edit_current_location" class="form-control" value="1F-研发部-工位A12">
                        </div>
                        <div class="form-group">
                            <label>资产状态</label>
                            <select id="edit_status" class="form-control">
                                <option value="available" selected>可用</option>
                                <option value="borrowed">借用中</option>
                                <option value="maintenance">维护中</option>
                                <option value="retired">已报废</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="updateAsset(${assetId})">更新</button>
                    <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", formHtml);
}

function updateAsset(assetId) {
  showMessage("资产信息更新成功", "success");
  closeModal();
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// 维护管理表单
function showMaintenanceForm() {
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
                            <select id="maintenance_asset_id" class="form-control" required>
                                <option value="">请选择资产</option>
                                <option value="1">LAPTOP001 - 联想ThinkPad P1</option>
                                <option value="4">DRONE004 - 大疆无人机</option>
                                <option value="6">SERVER006 - 移动存储服务器</option>
                            </select>
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
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", formHtml);
}

function saveMaintenance() {
  showMessage("维护记录保存成功", "success");
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
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", formHtml);
}

function updateMaintenance(maintenanceId) {
  showMessage("维护记录更新成功", "success");
  closeModal();
}

// 盘点管理表单
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
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", formHtml);
}

function saveInventory() {
  showMessage("盘点任务创建成功", "success");
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
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", formHtml);
}

function updateInventory(inventoryId) {
  showMessage("盘点记录更新成功", "success");
  closeModal();
}

// 权限管理表单
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
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", formHtml);
}

function saveUser() {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm_password").value;

  if (password !== confirmPassword) {
    showMessage("两次输入的密码不一致", "error");
    return;
  }

  showMessage("用户创建成功", "success");
  closeModal();
}

function editUser(userId) {
  const formHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>编辑用户信息</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editUserForm">
                        <div class="form-group">
                            <label>用户名</label>
                            <input type="text" id="edit_username" class="form-control" value="zhangsan" readonly>
                        </div>
                        <div class="form-group">
                            <label>角色 *</label>
                            <select id="edit_role" class="form-control" required>
                                <option value="admin">管理员</option>
                                <option value="manager">部门经理</option>
                                <option value="user" selected>普通用户</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>所属部门</label>
                            <select id="edit_department" class="form-control">
                                <option value="研发部">研发部</option>
                                <option value="技术部">技术部</option>
                                <option value="市场部" selected>市场部</option>
                                <option value="行政部">行政部</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>邮箱</label>
                            <input type="email" id="edit_email" class="form-control" value="zhangsan@company.com">
                        </div>
                        <div class="form-group">
                            <label>手机号</label>
                            <input type="tel" id="edit_phone" class="form-control" value="13800138001">
                        </div>
                        <div class="form-group">
                            <label>状态</label>
                            <select id="edit_status" class="form-control">
                                <option value="active" selected>激活</option>
                                <option value="inactive">禁用</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="updateUser(${userId})">更新</button>
                    <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", formHtml);
}

function updateUser(userId) {
  showMessage("用户信息更新成功", "success");
  closeModal();
}

function resetPassword(userId) {
  if (confirm("确定要重置该用户的密码吗？")) {
    showMessage("密码重置成功，新密码已发送到用户邮箱", "success");
  }
}

// 修复导出报表函数
function showAssetFlowModal() {
  const flowHtml = `
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
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", flowHtml);
}
// 权限管理相关函数
function disableUser(userId) {
  if (confirm("确定要禁用该用户吗？")) {
    showMessage("用户已禁用", "success");
    // 更新页面显示
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}

function enableUser(userId) {
  if (confirm("确定要启用该用户吗？")) {
    showMessage("用户已启用", "success");
    // 更新页面显示
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}

// 角色管理表单
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
                            <label>权限描述</label>
                            <textarea id="role_description" class="form-control" rows="3" placeholder="请描述角色权限"></textarea>
                        </div>
                        <div class="form-group">
                            <label>权限设置</label>
                            <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
                                <div><label><input type="checkbox" value="asset_view"> 资产查看</label></div>
                                <div><label><input type="checkbox" value="asset_add"> 资产新增</label></div>
                                <div><label><input type="checkbox" value="asset_edit"> 资产编辑</label></div>
                                <div><label><input type="checkbox" value="asset_delete"> 资产删除</label></div>
                                <div><label><input type="checkbox" value="borrow_view"> 借用查看</label></div>
                                <div><label><input type="checkbox" value="borrow_manage"> 借用管理</label></div>
                                <div><label><input type="checkbox" value="maintenance_view"> 维护查看</label></div>
                                <div><label><input type="checkbox" value="maintenance_manage"> 维护管理</label></div>
                                <div><label><input type="checkbox" value="inventory_view"> 盘点查看</label></div>
                                <div><label><input type="checkbox" value="inventory_manage"> 盘点管理</label></div>
                                <div><label><input type="checkbox" value="user_manage"> 用户管理</label></div>
                                <div><label><input type="checkbox" value="system_config"> 系统配置</label></div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="saveRole()">保存</button>
                    <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", formHtml);
}

function saveRole() {
  showMessage("角色创建成功", "success");
  closeModal();
}

function viewRole(roleId) {
  const roleNames = {
    1: "超级管理员",
    2: "资产管理员",
    3: "部门管理员",
    4: "普通用户",
  };

  const rolePermissions = {
    1: ["所有权限"],
    2: ["资产查看", "资产新增", "资产编辑", "资产删除", "借用管理", "维护管理"],
    3: ["资产查看", "借用查看", "借用管理", "维护查看", "盘点查看"],
    4: ["资产查看", "借用查看", "借用申请"],
  };

  const detailHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>角色权限详情</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                            <span>角色名称:</span>
                            <span style="font-weight: bold;">${
                              roleNames[roleId]
                            }</span>
                        </div>
                        <div style="margin: 15px 0;">
                            <span>权限列表:</span>
                            <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                                ${rolePermissions[roleId]
                                  .map((perm) => `<div>• ${perm}</div>`)
                                  .join("")}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeModal()">关闭</button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", detailHtml);
}

function editRole(roleId) {
  const roleNames = {
    2: "资产管理员",
    3: "部门管理员",
    4: "普通用户",
  };

  const formHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>编辑角色权限</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editRoleForm">
                        <div class="form-group">
                            <label>角色名称</label>
                            <input type="text" id="edit_role_name" class="form-control" value="${
                              roleNames[roleId]
                            }" readonly>
                        </div>
                        <div class="form-group">
                            <label>权限描述</label>
                            <textarea id="edit_role_description" class="form-control" rows="3">${
                              roleId === 2
                                ? "资产增删改查权限"
                                : roleId === 3
                                ? "部门资产管理权限"
                                : "基础查看和借用权限"
                            }</textarea>
                        </div>
                        <div class="form-group">
                            <label>权限设置</label>
                            <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
                                <div><label><input type="checkbox" value="asset_view" ${
                                  roleId >= 2 ? "checked" : ""
                                }> 资产查看</label></div>
                                <div><label><input type="checkbox" value="asset_add" ${
                                  roleId === 2 ? "checked" : ""
                                }> 资产新增</label></div>
                                <div><label><input type="checkbox" value="asset_edit" ${
                                  roleId === 2 ? "checked" : ""
                                }> 资产编辑</label></div>
                                <div><label><input type="checkbox" value="asset_delete" ${
                                  roleId === 2 ? "checked" : ""
                                }> 资产删除</label></div>
                                <div><label><input type="checkbox" value="borrow_view" ${
                                  roleId >= 3 ? "checked" : ""
                                }> 借用查看</label></div>
                                <div><label><input type="checkbox" value="borrow_manage" ${
                                  roleId <= 3 ? "checked" : ""
                                }> 借用管理</label></div>
                                <div><label><input type="checkbox" value="maintenance_view" ${
                                  roleId <= 3 ? "checked" : ""
                                }> 维护查看</label></div>
                                <div><label><input type="checkbox" value="maintenance_manage" ${
                                  roleId === 2 ? "checked" : ""
                                }> 维护管理</label></div>
                                <div><label><input type="checkbox" value="inventory_view" ${
                                  roleId === 3 ? "checked" : ""
                                }> 盘点查看</label></div>
                                <div><label><input type="checkbox" value="inventory_manage" ${
                                  roleId === 2 ? "checked" : ""
                                }> 盘点管理</label></div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="updateRole(${roleId})">更新</button>
                    <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", formHtml);
}

function updateRole(roleId) {
  showMessage("角色权限更新成功", "success");
  closeModal();
}
// 设备定位高亮功能
function highlightDevice(deviceId) {
  // 移除之前的高亮
  document.querySelectorAll(".device-highlight").forEach((el) => el.remove());

  // 找到设备标记
  const deviceMarker = document.querySelector(`[data-device-id="${deviceId}"]`);
  if (deviceMarker) {
    // 创建高亮圆圈
    const highlight = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    const rect = deviceMarker.getBoundingClientRect();
    const svg = deviceMarker.closest("svg");
    const svgRect = svg.getBoundingClientRect();

    // 获取设备在SVG中的坐标
    const deviceX = parseFloat(
      deviceMarker.querySelector("circle").getAttribute("cx")
    );
    const deviceY = parseFloat(
      deviceMarker.querySelector("circle").getAttribute("cy")
    );

    highlight.setAttribute("cx", deviceX);
    highlight.setAttribute("cy", deviceY);
    highlight.setAttribute("r", "30");
    highlight.setAttribute("fill", "none");
    highlight.setAttribute("stroke", "#e74c3c");
    highlight.setAttribute("stroke-width", "3");
    highlight.setAttribute("class", "device-highlight");
    highlight.setAttribute("opacity", "0.8");

    // 添加闪烁动画
    const animate = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "animate"
    );
    animate.setAttribute("attributeName", "opacity");
    animate.setAttribute("values", "0.8;0.2;0.8");
    animate.setAttribute("dur", "1s");
    animate.setAttribute("repeatCount", "5");
    highlight.appendChild(animate);

    svg.appendChild(highlight);

    // 5秒后移除高亮
    setTimeout(() => {
      if (highlight.parentNode) {
        highlight.parentNode.removeChild(highlight);
      }
    }, 5000);
  }

  showMessage("设备定位成功，已在地图上高亮显示", "success");

  // 关闭设备详情弹窗
  const modal = document.querySelector(".modal-overlay");
  if (modal) modal.remove();
}

// 显示设备轨迹
function showDeviceTrajectory(deviceId) {
  const trajectoryHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 700px;">
                <div class="modal-header">
                    <h3>设备移动轨迹 - 设备ID: ${deviceId}</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="height: 400px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; position: relative; margin-bottom: 15px;">
                        <canvas id="trajectoryCanvas" width="680" height="400" style="border-radius: 4px;"></canvas>
                    </div>
                    <div>
                        <h5>最近24小时位置记录：</h5>
                        <div style="font-size: 12px; max-height: 150px; overflow-y: auto;">
                            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                                <span>14:30</span>
                                <span>${getDeviceCurrentLocation(
                                  deviceId
                                )}</span>
                                <span style="color: #27ae60;">正常</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                                <span>12:15</span>
                                <span>会议室-201</span>
                                <span style="color: #27ae60;">正常</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                                <span>10:45</span>
                                <span>休息区-茶水间</span>
                                <span style="color: #f39c12;">围栏外</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                                <span>09:15</span>
                                <span>${getDeviceCurrentLocation(
                                  deviceId
                                )}</span>
                                <span style="color: #27ae60;">正常</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                                <span>昨天 17:45</span>
                                <span>${getDeviceCurrentLocation(
                                  deviceId
                                )}</span>
                                <span style="color: #27ae60;">正常</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="exportTrajectory(${deviceId})">导出轨迹</button>
                    <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", trajectoryHtml);

  // 绘制轨迹图
  setTimeout(() => drawTrajectoryChart(deviceId), 100);
}

// 绘制轨迹图
function drawTrajectoryChart(deviceId) {
  const canvas = document.getElementById("trajectoryCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制背景网格
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1;
  for (let i = 0; i <= canvas.width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= canvas.height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // 模拟轨迹点
  const trajectoryPoints = [
    { x: 100, y: 100, time: "09:15", status: "normal" },
    { x: 200, y: 120, time: "10:45", status: "warning" },
    { x: 300, y: 150, time: "12:15", status: "normal" },
    { x: 450, y: 180, time: "14:30", status: "normal" },
  ];

  // 绘制轨迹线
  ctx.strokeStyle = "#3498db";
  ctx.lineWidth = 3;
  ctx.beginPath();
  trajectoryPoints.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.stroke();

  // 绘制轨迹点
  trajectoryPoints.forEach((point, index) => {
    const color = point.status === "warning" ? "#f39c12" : "#27ae60";

    // 绘制点
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制时间标签
    ctx.fillStyle = "#2c3e50";
    ctx.font = "12px Arial";
    ctx.fillText(point.time, point.x - 15, point.y - 15);

    // 起点和终点特殊标记
    if (index === 0) {
      ctx.fillStyle = "#27ae60";
      ctx.font = "bold 10px Arial";
      ctx.fillText("起点", point.x - 10, point.y + 20);
    } else if (index === trajectoryPoints.length - 1) {
      ctx.fillStyle = "#e74c3c";
      ctx.font = "bold 10px Arial";
      ctx.fillText("当前", point.x - 10, point.y + 20);
    }
  });
}

// 获取设备当前位置
function getDeviceCurrentLocation(deviceId) {
  const locations = {
    1: "研发部-工位R12",
    2: "设计部-工位D05",
    3: "机房-机柜A15",
    4: "研发部-工位R08",
    5: "机房-存储区",
    6: "市场部-工位M03",
    7: "行政部-会议室",
    8: "产品部-工位P08",
    9: "技术部-网络机柜",
    10: "技术部-工位T05",
    11: "运维部-工位O12",
    12: "测试部-设备柜",
  };
  return locations[deviceId] || "未知位置";
}

// 设置电子围栏
function setElectronicFence(deviceId) {
  const fenceHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>设置电子围栏 - 设备ID: ${deviceId}</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="fenceForm">
                        <div class="form-group">
                            <label>围栏名称 *</label>
                            <input type="text" id="fence_name" class="form-control" placeholder="请输入围栏名称" required>
                        </div>
                        <div class="form-group">
                            <label>围栏类型 *</label>
                            <select id="fence_type" class="form-control" required>
                                <option value="">请选择类型</option>
                                <option value="department">部门区域</option>
                                <option value="floor">楼层范围</option>
                                <option value="building">建筑物内</option>
                                <option value="custom">自定义区域</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>允许区域 *</label>
                            <select id="allowed_areas" class="form-control" multiple required style="height: 120px;">
                                <option value="研发部">研发部</option>
                                <option value="设计部">设计部</option>
                                <option value="市场部">市场部</option>
                                <option value="机房">机房</option>
                                <option value="行政部">行政部</option>
                                <option value="产品部">产品部</option>
                                <option value="技术部">技术部</option>
                                <option value="运维部">运维部</option>
                                <option value="测试部">测试部</option>
                            </select>
                            <small style="color: #666;">按住Ctrl键可多选</small>
                        </div>
                        <div class="form-group">
                            <label>告警设置</label>
                            <div>
                                <label><input type="checkbox" checked> 立即告警</label><br>
                                <label><input type="checkbox" checked> 邮件通知</label><br>
                                <label><input type="checkbox"> 短信通知</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>围栏状态</label>
                            <select id="fence_status" class="form-control">
                                <option value="active">启用</option>
                                <option value="inactive">禁用</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="saveFence(${deviceId})">保存围栏</button>
                    <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", fenceHtml);
}

// 保存电子围栏设置
function saveFence(deviceId) {
  const fenceName = document.getElementById("fence_name").value;
  const fenceType = document.getElementById("fence_type").value;
  const allowedAreas = Array.from(
    document.getElementById("allowed_areas").selectedOptions
  ).map((option) => option.value);

  if (!fenceName || !fenceType || allowedAreas.length === 0) {
    showMessage("请填写完整的围栏信息", "error");
    return;
  }

  showMessage(`设备 ${deviceId} 的电子围栏设置成功`, "success");
  closeModal();
}

// 导出轨迹数据
function exportTrajectory(deviceId) {
  showMessage("轨迹数据导出中...", "info");
  setTimeout(() => {
    showMessage("轨迹数据导出成功", "success");
  }, 2000);
}
// 在平面图上显示轨迹
function showTrajectoryOnMap(deviceId) {
  // 清除之前的轨迹
  clearTrajectory();

  const svg = document.querySelector("#indoor-map-container svg");
  if (!svg) return;

  // 模拟轨迹点（根据设备ID生成不同的轨迹）
  const trajectoryPoints = getTrajectoryPoints(deviceId);

  // 创建轨迹组
  const trajectoryGroup = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  trajectoryGroup.setAttribute("class", "device-trajectory");

  // 绘制轨迹线
  if (trajectoryPoints.length > 1) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let pathData = `M ${trajectoryPoints[0].x} ${trajectoryPoints[0].y}`;

    for (let i = 1; i < trajectoryPoints.length; i++) {
      pathData += ` L ${trajectoryPoints[i].x} ${trajectoryPoints[i].y}`;
    }

    path.setAttribute("d", pathData);
    path.setAttribute("stroke", "#3498db");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-dasharray", "5,5");
    path.setAttribute("opacity", "0.8");

    // 添加动画
    const animate = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "animate"
    );
    animate.setAttribute("attributeName", "stroke-dashoffset");
    animate.setAttribute("values", "0;-10");
    animate.setAttribute("dur", "1s");
    animate.setAttribute("repeatCount", "indefinite");
    path.appendChild(animate);

    trajectoryGroup.appendChild(path);
  }

  // 绘制轨迹点
  trajectoryPoints.forEach((point, index) => {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", "4");
    circle.setAttribute(
      "fill",
      point.status === "warning" ? "#f39c12" : "#27ae60"
    );
    circle.setAttribute("stroke", "#fff");
    circle.setAttribute("stroke-width", "2");

    // 添加时间标签
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", point.x);
    text.setAttribute("y", point.y - 10);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "10");
    text.setAttribute("fill", "#2c3e50");
    text.setAttribute("font-weight", "bold");
    text.textContent = point.time;

    trajectoryGroup.appendChild(circle);
    trajectoryGroup.appendChild(text);

    // 起点和终点特殊标记
    if (index === 0) {
      const startLabel = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      startLabel.setAttribute("x", point.x);
      startLabel.setAttribute("y", point.y + 20);
      startLabel.setAttribute("text-anchor", "middle");
      startLabel.setAttribute("font-size", "8");
      startLabel.setAttribute("fill", "#27ae60");
      startLabel.setAttribute("font-weight", "bold");
      startLabel.textContent = "起点";
      trajectoryGroup.appendChild(startLabel);
    } else if (index === trajectoryPoints.length - 1) {
      const endLabel = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      endLabel.setAttribute("x", point.x);
      endLabel.setAttribute("y", point.y + 20);
      endLabel.setAttribute("text-anchor", "middle");
      endLabel.setAttribute("font-size", "8");
      endLabel.setAttribute("fill", "#e74c3c");
      endLabel.setAttribute("font-weight", "bold");
      endLabel.textContent = "当前";
      trajectoryGroup.appendChild(endLabel);
    }
  });

  svg.appendChild(trajectoryGroup);
}

// 获取设备轨迹点
function getTrajectoryPoints(deviceId) {
  // 根据设备ID生成不同的轨迹路径
  const baseTrajectories = {
    1: [
      { x: 100, y: 130, time: "09:15", status: "normal" },
      { x: 150, y: 140, time: "10:45", status: "normal" },
      { x: 200, y: 150, time: "12:15", status: "normal" },
      { x: 120, y: 130, time: "14:30", status: "normal" },
    ],
    2: [
      { x: 250, y: 120, time: "09:00", status: "normal" },
      { x: 300, y: 130, time: "11:30", status: "warning" },
      { x: 280, y: 120, time: "14:30", status: "normal" },
    ],
    3: [
      { x: 780, y: 130, time: "08:00", status: "normal" },
      { x: 800, y: 130, time: "14:30", status: "normal" },
    ],
  };

  return (
    baseTrajectories[deviceId] || [
      { x: 400, y: 300, time: "09:00", status: "normal" },
      { x: 450, y: 320, time: "12:00", status: "normal" },
      { x: 500, y: 350, time: "14:30", status: "normal" },
    ]
  );
}

// 清除轨迹
function clearTrajectory() {
  const trajectories = document.querySelectorAll(".device-trajectory");
  trajectories.forEach((trajectory) => trajectory.remove());
}

// 重写showDeviceTrajectory函数
function showDeviceTrajectory(deviceId) {
  // 先关闭设备详情弹窗
  const existingModal = document.querySelector(".modal-overlay");
  if (existingModal) existingModal.remove();

  // 在平面图上显示轨迹
  showTrajectoryOnMap(deviceId);

  const trajectoryHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>设备移动轨迹 - 设备ID: ${deviceId}</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
                        <p style="margin: 0; color: #666; font-size: 14px;">
                            <i class="fas fa-info-circle"></i> 轨迹已在平面图上显示，蓝色虚线为移动路径
                        </p>
                    </div>
                    <div>
                        <h5>最近24小时位置记录：</h5>
                        <div style="font-size: 12px; max-height: 200px; overflow-y: auto;">
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                                <span style="font-weight: bold;">14:30</span>
                                <span>${getDeviceCurrentLocation(
                                  deviceId
                                )}</span>
                                <span style="color: #27ae60;">●</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                                <span style="font-weight: bold;">12:15</span>
                                <span>会议室-201</span>
                                <span style="color: #27ae60;">●</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                                <span style="font-weight: bold;">10:45</span>
                                <span>休息区-茶水间</span>
                                <span style="color: #f39c12;">●</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                                <span style="font-weight: bold;">09:15</span>
                                <span>${getDeviceCurrentLocation(
                                  deviceId
                                )}</span>
                                <span style="color: #27ae60;">●</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                                <span style="font-weight: bold;">昨天 17:45</span>
                                <span>${getDeviceCurrentLocation(
                                  deviceId
                                )}</span>
                                <span style="color: #27ae60;">●</span>
                            </div>
                        </div>
                        <div style="margin-top: 10px; font-size: 11px; color: #666;">
                            <span style="color: #27ae60;">●</span> 正常范围 
                            <span style="color: #f39c12; margin-left: 15px;">●</span> 围栏外
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="exportTrajectory(${deviceId})">导出轨迹</button>
                    <button class="btn btn-warning" onclick="clearTrajectory()">清除轨迹</button>
                    <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", trajectoryHtml);
}
// 设备定位高亮功能 - 重新实现
function highlightDevice(deviceId) {
  // 移除之前的高亮
  document.querySelectorAll(".device-highlight").forEach((el) => el.remove());

  // 找到设备标记
  const deviceMarker = document.querySelector(`[data-device-id="${deviceId}"]`);
  if (deviceMarker) {
    const svg = deviceMarker.closest("svg");

    // 获取设备图标的坐标
    const deviceIcon = deviceMarker.querySelector("circle[fill]");
    if (deviceIcon) {
      const deviceX = parseFloat(deviceIcon.getAttribute("cx"));
      const deviceY = parseFloat(deviceIcon.getAttribute("cy"));

      // 创建高亮圆圈
      const highlight = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      highlight.setAttribute("cx", deviceX);
      highlight.setAttribute("cy", deviceY);
      highlight.setAttribute("r", "25");
      highlight.setAttribute("fill", "none");
      highlight.setAttribute("stroke", "#e74c3c");
      highlight.setAttribute("stroke-width", "4");
      highlight.setAttribute("class", "device-highlight");
      highlight.setAttribute("opacity", "0.8");

      // 添加脉冲动画
      const animateRadius = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "animate"
      );
      animateRadius.setAttribute("attributeName", "r");
      animateRadius.setAttribute("values", "15;35;15");
      animateRadius.setAttribute("dur", "1.5s");
      animateRadius.setAttribute("repeatCount", "4");
      highlight.appendChild(animateRadius);

      const animateOpacity = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "animate"
      );
      animateOpacity.setAttribute("attributeName", "opacity");
      animateOpacity.setAttribute("values", "0.8;0.2;0.8");
      animateOpacity.setAttribute("dur", "1.5s");
      animateOpacity.setAttribute("repeatCount", "4");
      highlight.appendChild(animateOpacity);

      svg.appendChild(highlight);

      // 6秒后移除高亮
      setTimeout(() => {
        if (highlight.parentNode) {
          highlight.parentNode.removeChild(highlight);
        }
      }, 6000);
    }
  }

  showMessage("设备定位成功，已在地图上高亮显示", "success");

  // 关闭设备详情弹窗
  const modal = document.querySelector(".modal-overlay");
  if (modal) modal.remove();
}
// 在平面图上显示轨迹 - 重新实现
function showTrajectoryOnMap(deviceId) {
  // 清除之前的轨迹
  clearTrajectory();

  const svg = document.querySelector("#indoor-map-container svg");
  if (!svg) {
    console.log("SVG not found");
    return;
  }

  // 模拟轨迹点（根据设备ID生成不同的轨迹）
  const trajectoryPoints = getTrajectoryPoints(deviceId);

  // 创建轨迹组
  const trajectoryGroup = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  trajectoryGroup.setAttribute("class", "device-trajectory");

  // 绘制轨迹线
  if (trajectoryPoints.length > 1) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let pathData = `M ${trajectoryPoints[0].x} ${trajectoryPoints[0].y}`;

    for (let i = 1; i < trajectoryPoints.length; i++) {
      pathData += ` L ${trajectoryPoints[i].x} ${trajectoryPoints[i].y}`;
    }

    path.setAttribute("d", pathData);
    path.setAttribute("stroke", "#3498db");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-dasharray", "8,4");
    path.setAttribute("opacity", "0.8");

    // 添加动画
    const animate = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "animate"
    );
    animate.setAttribute("attributeName", "stroke-dashoffset");
    animate.setAttribute("values", "0;-12");
    animate.setAttribute("dur", "2s");
    animate.setAttribute("repeatCount", "indefinite");
    path.appendChild(animate);

    trajectoryGroup.appendChild(path);
  }

  // 绘制轨迹点
  trajectoryPoints.forEach((point, index) => {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", "5");
    circle.setAttribute(
      "fill",
      point.status === "warning" ? "#f39c12" : "#27ae60"
    );
    circle.setAttribute("stroke", "#fff");
    circle.setAttribute("stroke-width", "2");

    // 添加时间标签
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", point.x);
    text.setAttribute("y", point.y - 12);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "10");
    text.setAttribute("fill", "#2c3e50");
    text.setAttribute("font-weight", "bold");
    text.textContent = point.time;

    trajectoryGroup.appendChild(circle);
    trajectoryGroup.appendChild(text);

    // 起点和终点特殊标记
    if (index === 0) {
      const startLabel = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      startLabel.setAttribute("x", point.x);
      startLabel.setAttribute("y", point.y + 20);
      startLabel.setAttribute("text-anchor", "middle");
      startLabel.setAttribute("font-size", "9");
      startLabel.setAttribute("fill", "#27ae60");
      startLabel.setAttribute("font-weight", "bold");
      startLabel.textContent = "起点";
      trajectoryGroup.appendChild(startLabel);
    } else if (index === trajectoryPoints.length - 1) {
      const endLabel = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      endLabel.setAttribute("x", point.x);
      endLabel.setAttribute("y", point.y + 20);
      endLabel.setAttribute("text-anchor", "middle");
      endLabel.setAttribute("font-size", "9");
      endLabel.setAttribute("fill", "#e74c3c");
      endLabel.setAttribute("font-weight", "bold");
      endLabel.textContent = "当前";
      trajectoryGroup.appendChild(endLabel);
    }
  });

  svg.appendChild(trajectoryGroup);
  console.log("Trajectory added to map");
}

// 获取设备轨迹点 - 重新实现
function getTrajectoryPoints(deviceId) {
  // 根据设备ID生成不同的轨迹路径
  const baseTrajectories = {
    1: [
      { x: 100, y: 130, time: "09:15", status: "normal" },
      { x: 150, y: 140, time: "10:45", status: "normal" },
      { x: 200, y: 150, time: "12:15", status: "normal" },
      { x: 120, y: 130, time: "14:30", status: "normal" },
    ],
    2: [
      { x: 250, y: 120, time: "09:00", status: "normal" },
      { x: 300, y: 130, time: "11:30", status: "warning" },
      { x: 280, y: 120, time: "14:30", status: "normal" },
    ],
    3: [
      { x: 780, y: 130, time: "08:00", status: "normal" },
      { x: 820, y: 140, time: "12:00", status: "normal" },
      { x: 800, y: 130, time: "14:30", status: "normal" },
    ],
    4: [
      { x: 140, y: 150, time: "09:00", status: "normal" },
      { x: 180, y: 160, time: "11:00", status: "normal" },
      { x: 160, y: 150, time: "14:30", status: "normal" },
    ],
    7: [
      { x: 90, y: 380, time: "09:30", status: "normal" },
      { x: 120, y: 390, time: "12:00", status: "warning" },
      { x: 110, y: 380, time: "14:30", status: "normal" },
    ],
    8: [
      { x: 230, y: 380, time: "09:00", status: "normal" },
      { x: 270, y: 390, time: "11:30", status: "normal" },
      { x: 250, y: 380, time: "14:30", status: "normal" },
    ],
  };

  return (
    baseTrajectories[deviceId] || [
      { x: 400, y: 300, time: "09:00", status: "normal" },
      { x: 450, y: 320, time: "12:00", status: "normal" },
      { x: 500, y: 350, time: "14:30", status: "normal" },
    ]
  );
}

// 清除轨迹 - 重新实现
function clearTrajectory() {
  const trajectories = document.querySelectorAll(".device-trajectory");
  trajectories.forEach((trajectory) => trajectory.remove());
}

// 重写showDeviceTrajectory函数 - 修复版本
function showDeviceTrajectory(deviceId) {
  console.log("Showing trajectory for device:", deviceId);

  // 先关闭设备详情弹窗
  const existingModal = document.querySelector(".modal-overlay");
  if (existingModal) existingModal.remove();

  // 在平面图上显示轨迹
  showTrajectoryOnMap(deviceId);

  const trajectoryHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>设备移动轨迹 - 设备ID: ${deviceId}</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
                        <p style="margin: 0; color: #666; font-size: 14px;">
                            <i class="fas fa-info-circle"></i> 轨迹已在平面图上显示，蓝色虚线为移动路径
                        </p>
                    </div>
                    <div>
                        <h5>最近24小时位置记录：</h5>
                        <div style="font-size: 12px; max-height: 200px; overflow-y: auto;">
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                                <span style="font-weight: bold;">14:30</span>
                                <span>${getDeviceCurrentLocation(
                                  deviceId
                                )}</span>
                                <span style="color: #27ae60;">●</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                                <span style="font-weight: bold;">12:15</span>
                                <span>会议室-201</span>
                                <span style="color: #27ae60;">●</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                                <span style="font-weight: bold;">10:45</span>
                                <span>休息区-茶水间</span>
                                <span style="color: #f39c12;">●</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                                <span style="font-weight: bold;">09:15</span>
                                <span>${getDeviceCurrentLocation(
                                  deviceId
                                )}</span>
                                <span style="color: #27ae60;">●</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                                <span style="font-weight: bold;">昨天 17:45</span>
                                <span>${getDeviceCurrentLocation(
                                  deviceId
                                )}</span>
                                <span style="color: #27ae60;">●</span>
                            </div>
                        </div>
                        <div style="margin-top: 10px; font-size: 11px; color: #666;">
                            <span style="color: #27ae60;">●</span> 正常范围 
                            <span style="color: #f39c12; margin-left: 15px;">●</span> 围栏外
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="exportTrajectory(${deviceId})">导出轨迹</button>
                    <button class="btn btn-warning" onclick="clearTrajectory(); showMessage('轨迹已清除', 'info');">清除轨迹</button>
                    <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", trajectoryHtml);
}
// 修复定位高亮功能
function highlightDevice(deviceId) {
  console.log("Highlighting device:", deviceId);

  // 移除之前的高亮
  document.querySelectorAll(".device-highlight").forEach((el) => el.remove());

  // 找到设备标记
  const deviceMarker = document.querySelector(`[data-device-id="${deviceId}"]`);
  console.log("Device marker found:", deviceMarker);

  if (deviceMarker) {
    const svg = deviceMarker.closest("svg");
    console.log("SVG found:", svg);

    // 获取设备图标背景圆圈的坐标（有fill属性且不是none的circle）
    const deviceIconBg = deviceMarker.querySelector(
      'circle[fill]:not([fill="none"])'
    );
    console.log("Device icon background found:", deviceIconBg);

    if (deviceIconBg) {
      const deviceX = parseFloat(deviceIconBg.getAttribute("cx"));
      const deviceY = parseFloat(deviceIconBg.getAttribute("cy"));
      console.log("Device coordinates:", deviceX, deviceY);

      // 创建高亮圆圈
      const highlight = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      highlight.setAttribute("cx", deviceX);
      highlight.setAttribute("cy", deviceY);
      highlight.setAttribute("r", "25");
      highlight.setAttribute("fill", "none");
      highlight.setAttribute("stroke", "#e74c3c");
      highlight.setAttribute("stroke-width", "4");
      highlight.setAttribute("class", "device-highlight");
      highlight.setAttribute("opacity", "0.8");

      // 添加脉冲动画
      const animateRadius = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "animate"
      );
      animateRadius.setAttribute("attributeName", "r");
      animateRadius.setAttribute("values", "15;35;15");
      animateRadius.setAttribute("dur", "1.5s");
      animateRadius.setAttribute("repeatCount", "4");
      highlight.appendChild(animateRadius);

      const animateOpacity = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "animate"
      );
      animateOpacity.setAttribute("attributeName", "opacity");
      animateOpacity.setAttribute("values", "0.8;0.2;0.8");
      animateOpacity.setAttribute("dur", "1.5s");
      animateOpacity.setAttribute("repeatCount", "4");
      highlight.appendChild(animateOpacity);

      svg.appendChild(highlight);
      console.log("Highlight added to SVG");

      // 6秒后移除高亮
      setTimeout(() => {
        if (highlight.parentNode) {
          highlight.parentNode.removeChild(highlight);
          console.log("Highlight removed");
        }
      }, 6000);

      showMessage("设备定位成功，已在地图上高亮显示", "success");
    } else {
      console.log("Device icon background not found");
      showMessage("无法找到设备位置", "error");
    }
  } else {
    console.log("Device marker not found");
    showMessage("无法找到设备标记", "error");
  }

  // 关闭设备详情弹窗
  const modal = document.querySelector(".modal-overlay");
  if (modal) modal.remove();
}

// 修复轨迹清除功能
function clearTrajectory() {
  console.log("Clearing trajectory");
  const trajectories = document.querySelectorAll(".device-trajectory");
  console.log("Found trajectories:", trajectories.length);
  trajectories.forEach((trajectory) => {
    trajectory.remove();
    console.log("Trajectory removed");
  });
  if (trajectories.length > 0) {
    showMessage("轨迹已清除", "info");
  }
}

// 修复列表中的轨迹显示功能
function showTrajectory(deviceId) {
  console.log("Showing trajectory from list for device:", deviceId);
  showDeviceTrajectory(deviceId);
}

// 修复定位功能（从列表调用）
function locateAsset(deviceId) {
  console.log("Locating asset from list:", deviceId);
  highlightDevice(deviceId);
}
// 修复轨迹显示功能
function showTrajectoryOnMap(deviceId) {
  console.log("Showing trajectory on map for device:", deviceId);

  // 清除之前的轨迹
  clearTrajectory();

  // 等待一下确保DOM更新
  setTimeout(() => {
    const svg = document.querySelector("#indoor-map-container svg");
    console.log("SVG element found:", svg);

    if (!svg) {
      console.log("SVG not found, trying alternative selector");
      // 尝试其他可能的选择器
      const svgAlt = document.querySelector("svg");
      if (svgAlt) {
        console.log("Alternative SVG found");
        displayTrajectoryOnSVG(svgAlt, deviceId);
      } else {
        console.log("No SVG found at all");
        showMessage("无法找到地图容器", "error");
      }
      return;
    }

    displayTrajectoryOnSVG(svg, deviceId);
  }, 100);
}

// 在指定SVG上显示轨迹
function displayTrajectoryOnSVG(svg, deviceId) {
  console.log("Displaying trajectory on SVG for device:", deviceId);

  // 模拟轨迹点（根据设备ID生成不同的轨迹）
  const trajectoryPoints = getTrajectoryPoints(deviceId);
  console.log("Trajectory points:", trajectoryPoints);

  // 创建轨迹组
  const trajectoryGroup = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  trajectoryGroup.setAttribute("class", "device-trajectory");
  trajectoryGroup.setAttribute("data-device-id", deviceId);

  // 绘制轨迹线
  if (trajectoryPoints.length > 1) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let pathData = `M ${trajectoryPoints[0].x} ${trajectoryPoints[0].y}`;

    for (let i = 1; i < trajectoryPoints.length; i++) {
      pathData += ` L ${trajectoryPoints[i].x} ${trajectoryPoints[i].y}`;
    }

    path.setAttribute("d", pathData);
    path.setAttribute("stroke", "#3498db");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-dasharray", "8,4");
    path.setAttribute("opacity", "0.8");

    // 添加动画
    const animate = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "animate"
    );
    animate.setAttribute("attributeName", "stroke-dashoffset");
    animate.setAttribute("values", "0;-12");
    animate.setAttribute("dur", "2s");
    animate.setAttribute("repeatCount", "indefinite");
    path.appendChild(animate);

    trajectoryGroup.appendChild(path);
  }

  // 绘制轨迹点
  trajectoryPoints.forEach((point, index) => {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", "5");
    circle.setAttribute(
      "fill",
      point.status === "warning" ? "#f39c12" : "#27ae60"
    );
    circle.setAttribute("stroke", "#fff");
    circle.setAttribute("stroke-width", "2");

    // 添加时间标签
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", point.x);
    text.setAttribute("y", point.y - 12);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "10");
    text.setAttribute("fill", "#2c3e50");
    text.setAttribute("font-weight", "bold");
    text.textContent = point.time;

    trajectoryGroup.appendChild(circle);
    trajectoryGroup.appendChild(text);

    // 起点和终点特殊标记
    if (index === 0) {
      const startLabel = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      startLabel.setAttribute("x", point.x);
      startLabel.setAttribute("y", point.y + 20);
      startLabel.setAttribute("text-anchor", "middle");
      startLabel.setAttribute("font-size", "9");
      startLabel.setAttribute("fill", "#27ae60");
      startLabel.setAttribute("font-weight", "bold");
      startLabel.textContent = "起点";
      trajectoryGroup.appendChild(startLabel);
    } else if (index === trajectoryPoints.length - 1) {
      const endLabel = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      endLabel.setAttribute("x", point.x);
      endLabel.setAttribute("y", point.y + 20);
      endLabel.setAttribute("text-anchor", "middle");
      endLabel.setAttribute("font-size", "9");
      endLabel.setAttribute("fill", "#e74c3c");
      endLabel.setAttribute("font-weight", "bold");
      endLabel.textContent = "当前";
      trajectoryGroup.appendChild(endLabel);
    }
  });

  svg.appendChild(trajectoryGroup);
  console.log("Trajectory group added to SVG");
  showMessage("轨迹已显示在地图上", "success");
}
