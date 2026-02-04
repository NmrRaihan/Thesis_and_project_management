// Auto-generated script to initialize browser localStorage with admin data
window.initializeAdminData = function() {
  const adminData = [
  {
    "id": "Admin_1766386224875_tfrw1t4x3",
    "created_at": "2025-12-22T06:50:24.874Z",
    "username": "TestAdmin",
    "password_hash": "testpassword123",
    "role": "superuser"
  },
  {
    "id": "Admin_1766386618722_nvx2l0fzs",
    "created_at": "2025-12-22T06:13:43.111Z",
    "username": "myadmin",
    "password_hash": "mypassword123",
    "role": "superuser"
  },
  {
    "id": "Admin_1766386618726_9ksdq3qh4",
    "created_at": "2025-12-22T06:24:52.263Z",
    "username": "meheraj",
    "password_hash": "12345@raj",
    "role": "superuser"
  },
  {
    "id": "Admin_1766386618729_obwqsj1rz",
    "created_at": "2025-12-22T06:41:10.288Z",
    "username": "Meheraj",
    "password_hash": "12345@raj",
    "role": "superuser"
  },
  {
    "id": "Admin_1766387256909_zavxh9rz1",
    "created_at": "2025-12-22T07:07:36.909Z",
    "username": "TestAdmin2",
    "password_hash": "testpassword456",
    "role": "superuser"
  },
  {
    "id": "Admin_1766387885060_xz2hrldwb",
    "created_at": "2025-12-22T07:18:05.059Z",
    "username": "TestAdmin3",
    "password_hash": "testpassword789",
    "role": "superuser"
  }
];
  localStorage.setItem('entity_Admin', JSON.stringify(adminData));
  console.log('Admin data initialized in localStorage');
};

// Run initialization if in browser environment
if (typeof window !== 'undefined') {
  window.initializeAdminData();
}