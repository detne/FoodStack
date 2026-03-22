-- Insert default roles for the QR Service Platform
-- This script adds the three main roles: STAFF, MANAGER, and OWNER

INSERT INTO public.roles (id, name, description, created_at, updated_at) VALUES
(
  'role_staff_001',
  'STAFF',
  'Nhân viên phục vụ - có thể xem và xử lý đơn hàng, quản lý bàn trong ca làm việc',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'role_manager_001', 
  'MANAGER',
  'Quản lý chi nhánh - có thể quản lý nhân viên cùng chi nhánh, xem báo cáo, quản lý menu và thiết lập chi nhánh',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'role_owner_001',
  'OWNER', 
  'Chủ nhà hàng - có toàn quyền quản lý tất cả các chi nhánh, nhân viên, và thiết lập hệ thống',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Verify the inserted roles
SELECT * FROM public.roles ORDER BY name;