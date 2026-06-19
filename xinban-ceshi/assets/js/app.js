// 鑫办办公协作平台 - 核心数据管理
// 使用 localStorage 模拟云数据库

const APP_KEY = 'xinban_data';

// 默认数据
const defaultData = {
  users: [
    {
      _id: 'admin_user',
      username: 'admin',
      password: '123456',
      name: '超级管理员',
      department: '系统管理部',
      role: 'super_admin',
      roleName: '超级管理员',
      createTime: new Date().toISOString()
    },
    {
      _id: 'dept_admin_user',
      username: 'manager',
      password: '123456',
      name: '张经理',
      department: '技术部',
      role: 'dept_admin',
      roleName: '部门管理员',
      createTime: new Date().toISOString()
    },
    {
      _id: 'employee_user',
      username: 'employee',
      password: '123456',
      name: '李员工',
      department: '技术部',
      role: 'employee',
      roleName: '普通员工',
      createTime: new Date().toISOString()
    }
  ],
  departments: [
    { _id: 'd1', name: '系统管理部', adminId: 'admin_user' },
    { _id: 'd2', name: '技术部', adminId: 'dept_admin_user' },
    { _id: 'd3', name: '市场部', adminId: '' },
    { _id: 'd4', name: '财务部', adminId: '' },
    { _id: 'd5', name: '人力资源部', adminId: '' },
    { _id: 'd6', name: '运营部', adminId: '' }
  ],
  clockRecords: [],
  approvals: [],
  messages: {},
  notices: [
    {
      _id: 'n1',
      content: '欢迎使用鑫办智能办公协作平台！本平台提供考勤打卡、审批中心、通讯录管理和实时聊天功能。',
      publisher: '系统公告',
      publisherId: 'admin_user',
      scope: 'all',
      createTime: new Date().toISOString()
    }
  ],
  conversations: [
    {
      _id: 'conv_all',
      name: '公司全员群',
      type: 'group',
      lastMessage: '欢迎加入公司全员群！',
      lastTime: new Date().toISOString()
    },
    {
      _id: 'conv_tech',
      name: '技术部',
      type: 'group',
      lastMessage: '技术部交流群',
      lastTime: new Date().toISOString()
    }
  ]
};

// 数据管理对象
const DB = {
  // 初始化数据
  init() {
    const existing = localStorage.getItem(APP_KEY);
    if (!existing) {
      localStorage.setItem(APP_KEY, JSON.stringify(defaultData));
    }
  },

  // 获取所有数据
  getAll() {
    const data = localStorage.getItem(APP_KEY);
    return data ? JSON.parse(data) : defaultData;
  },

  // 保存数据
  save(data) {
    localStorage.setItem(APP_KEY, JSON.stringify(data));
  },

  // 用户相关
  users: {
    getAll() {
      return DB.getAll().users;
    },
    getByUsername(username) {
      return DB.getAll().users.find(u => u.username === username);
    },
    getById(id) {
      return DB.getAll().users.find(u => u._id === id);
    },
    add(user) {
      const data = DB.getAll();
      user._id = 'u_' + Date.now();
      user.createTime = new Date().toISOString();
      data.users.push(user);
      DB.save(data);
      return user;
    },
    update(id, updates) {
      const data = DB.getAll();
      const idx = data.users.findIndex(u => u._id === id);
      if (idx !== -1) {
        data.users[idx] = { ...data.users[idx], ...updates };
        DB.save(data);
        return data.users[idx];
      }
      return null;
    },
    getByDepartment(dept) {
      return DB.getAll().users.filter(u => u.department === dept);
    }
  },

  // 部门相关
  departments: {
    getAll() {
      return DB.getAll().departments;
    },
    add(dept) {
      const data = DB.getAll();
      dept._id = 'd_' + Date.now();
      dept.adminId = dept.adminId || '';
      data.departments.push(dept);
      DB.save(data);
      return dept;
    }
  },

  // 打卡记录相关
  clock: {
    getAll() {
      return DB.getAll().clockRecords;
    },
    getByUserId(userId) {
      return DB.getAll().clockRecords.filter(r => r.userId === userId);
    },
    add(record) {
      const data = DB.getAll();
      record._id = 'c_' + Date.now();
      record.createTime = new Date().toISOString();
      data.clockRecords.unshift(record);
      DB.save(data);
      return record;
    }
  },

  // 审批相关
  approval: {
    getAll() {
      return DB.getAll().approvals;
    },
    getByApplicantId(userId) {
      return DB.getAll().approvals.filter(a => a.applicantId === userId);
    },
    getByDepartment(dept) {
      return DB.getAll().approvals.filter(a => a.department === dept);
    },
    add(approval) {
      const data = DB.getAll();
      approval._id = 'a_' + Date.now();
      approval.status = 'pending';
      approval.createTime = new Date().toISOString();
      data.approvals.unshift(approval);
      DB.save(data);
      return approval;
    },
    updateStatus(id, status) {
      const data = DB.getAll();
      const idx = data.approvals.findIndex(a => a._id === id);
      if (idx !== -1) {
        data.approvals[idx].status = status;
        data.approvals[idx].approveTime = new Date().toISOString();
        DB.save(data);
        return data.approvals[idx];
      }
      return null;
    }
  },

  // 消息相关
  messages: {
    getByRoom(roomId) {
      const data = DB.getAll();
      return data.messages[roomId] || [];
    },
    add(roomId, message) {
      const data = DB.getAll();
      if (!data.messages[roomId]) {
        data.messages[roomId] = [];
      }
      message._id = 'm_' + Date.now();
      message.createTime = new Date().toISOString();
      data.messages[roomId].push(message);

      // 更新会话列表的最后消息
      const convIdx = data.conversations.findIndex(c => c._id === roomId);
      if (convIdx !== -1) {
        data.conversations[convIdx].lastMessage = message.content || '[图片]';
        data.conversations[convIdx].lastTime = message.createTime;
      }

      DB.save(data);
      return message;
    }
  },

  // 会话相关
  conversations: {
    getAll() {
      return DB.getAll().conversations;
    },
    add(conversation) {
      const data = DB.getAll();
      conversation._id = 'conv_' + Date.now();
      conversation.lastTime = new Date().toISOString();
      data.conversations.push(conversation);
      DB.save(data);
      return conversation;
    }
  },

  // 公告相关
  notice: {
    getAll() {
      return DB.getAll().notices;
    },
    add(notice) {
      const data = DB.getAll();
      notice._id = 'n_' + Date.now();
      notice.createTime = new Date().toISOString();
      data.notices.unshift(notice);
      DB.save(data);
      return notice;
    }
  }
};

// 会话管理
const Session = {
  getCurrentUser() {
    const userData = localStorage.getItem('current_user');
    return userData ? JSON.parse(userData) : null;
  },

  setCurrentUser(user) {
    localStorage.setItem('current_user', JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('current_user');
  },

  isLoggedIn() {
    return !!localStorage.getItem('current_user');
  },

  checkAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

// 工具函数
const Utils = {
  // 格式化时间
  formatTime(dateStr) {
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 格式化日期时间
  formatDateTime(dateStr) {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  },

  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  },

  // 今天日期
  getTodayDate() {
    const today = new Date();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${today.getFullYear()}年${String(today.getMonth() + 1).padStart(2, '0')}月${String(today.getDate()).padStart(2, '0')}日 ${weekDays[today.getDay()]}`;
  },

  // 显示 Toast
  showToast(message, duration = 2000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, duration);
  },

  // 显示确认对话框
  showConfirm(title, message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">${title}</div>
          <button class="modal-close">&times;</button>
        </div>
        <div style="padding: 10px 0; color: #666;">${message}</div>
        <div class="modal-actions">
          <button class="btn-secondary">取消</button>
          <button class="btn-primary">确定</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.btn-secondary');
    const confirmBtn = modal.querySelector('.btn-primary');

    const close = () => modal.remove();

    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);
    confirmBtn.addEventListener('click', () => {
      close();
      if (onConfirm) onConfirm();
    });
  },

  // 获取用户头像文字
  getAvatarText(name) {
    return name ? name.charAt(0) : '?';
  },

  // 将图片文件转为 base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

// 初始化数据库
DB.init();

// 页面加载时检查登录状态（登录页面除外）
document.addEventListener('DOMContentLoaded', () => {
  const isLoginPage = document.body.classList.contains('login-page');
  if (!isLoginPage) {
    if (!Session.isLoggedIn()) {
      window.location.href = 'login.html';
    }
  }
});
