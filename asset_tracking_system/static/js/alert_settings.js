function showAlertSettings() {
  var html = '<div class="modal-overlay" onclick="window.closeModal()">' +
    '<div class="modal-content" onclick="event.stopPropagation()">' +
    '<div class="modal-header"><h3>告警设置</h3><button class="modal-close" onclick="window.closeModal()">&times;</button></div>' +
    '<div class="modal-body">' +
    '<div class="form-group"><label>位置异常告警</label><select class="form-control"><option>启用</option><option>禁用</option></select></div>' +
    '<div class="form-group"><label>设备离线告警</label><select class="form-control"><option>启用</option><option>禁用</option></select></div>' +
    '<div class="form-group"><label>借用逾期告警</label><select class="form-control"><option>启用</option><option>禁用</option></select></div>' +
    '<div class="form-group"><label>告警通知方式</label><div>' +
    '<label><input type="checkbox" checked> 系统通知</label><br>' +
    '<label><input type="checkbox" checked> 邮件通知</label><br>' +
    '<label><input type="checkbox"> 短信通知</label></div></div>' +
    '</div><div class="modal-footer">' +
    '<button class="btn btn-primary" onclick="window.saveAlertSettings()">保存设置</button>' +
    '<button class="btn btn-secondary" onclick="window.closeModal()">取消</button></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}
