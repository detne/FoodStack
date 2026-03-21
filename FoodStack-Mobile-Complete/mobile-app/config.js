// Cấu hình cho ứng dụng FoodStack Mobile
// Thay đổi IP này theo địa chỉ IP của máy chạy backend

export const CONFIG = {
  // Địa chỉ IP của máy chạy backend (thay đổi theo máy của bạn)
  // Để tìm IP của máy:
  // - Windows: mở cmd và chạy "ipconfig"
  // - Mac/Linux: mở terminal và chạy "ifconfig" hoặc "ip addr"
  // - Tìm địa chỉ IPv4 của card mạng đang sử dụng (thường là 192.168.x.x)
  
  BACKEND_IP: '192.168.1.123', // IP máy bạn
  BACKEND_PORT: '3000',
  
  // Các cấu hình khác
  API_TIMEOUT: 15000,
  
  // Test data
  TEST_QR_TOKENS: {
    TABLE_1: 'test-table-token-123',
    TABLE_2: 'test-table-token-456', 
    TABLE_3: 'test-table-token-789',
  },
  
  TEST_BRANCH_ID: 'branch-1',
  TEST_RESTAURANT_ID: 'restaurant-1',
};

// Hướng dẫn tìm IP:
// 1. Mở Command Prompt (Windows) hoặc Terminal (Mac/Linux)
// 2. Chạy lệnh:
//    - Windows: ipconfig
//    - Mac/Linux: ifconfig hoặc ip addr show
// 3. Tìm địa chỉ IPv4 của card mạng đang kết nối internet
//    - Thường có dạng 192.168.x.x hoặc 10.x.x.x
// 4. Thay thế BACKEND_IP ở trên bằng IP vừa tìm được
// 5. Đảm bảo máy mobile và máy chạy backend cùng mạng WiFi