# FoodStack Mobile - Phân công thuyết trình nhóm 5 người

**Thời gian:** 25 phút
**Cấu trúc:** Mỗi người 5 phút

---

## 👤 NGƯỜI 1: GIỚI THIỆU & TỔNG QUAN (5 phút)

### Slides phụ trách: 1-4

### Nội dung trình bày:

**Slide 1: Title Slide**
- Giới thiệu tên dự án: FoodStack Mobile
- Giới thiệu các thành viên nhóm
- Chào mừng và mở đầu

**Slide 2: Tổng quan dự án**
- Nêu vấn đề thực tế:
  - Khách hàng chờ đợi lâu khi gọi món
  - Nhà hàng khó quản lý đơn hàng
  - Thiếu công cụ quản trị tập trung
- Giới thiệu giải pháp FoodStack Mobile
- 3 vai trò chính: Khách hàng, Nhà hàng, Admin

**Slide 3: Công nghệ sử dụng**
- Frontend: React Native, TypeScript, Expo
- Backend: Node.js, Express, PostgreSQL
- Tools: Git, VS Code, Postman
- Giải thích tại sao chọn công nghệ này

**Slide 4: Kiến trúc hệ thống**
- Giải thích kiến trúc 3 tầng
- Mobile App → REST API → Database
- Luồng dữ liệu và tương tác

### Script mẫu:
```
"Xin chào quý thầy cô và các bạn. Hôm nay nhóm em xin phép được giới thiệu 
dự án FoodStack Mobile - một giải pháp đặt món thông minh cho nhà hàng.

Trong thực tế, chúng ta thường gặp tình trạng phải chờ đợi lâu để gọi món, 
nhà hàng khó quản lý đơn hàng hiệu quả. FoodStack Mobile được sinh ra để 
giải quyết vấn đề này với 3 vai trò: Khách hàng, Nhà hàng và Quản trị viên.

Về công nghệ, chúng em sử dụng React Native cho mobile app, Node.js cho 
backend và PostgreSQL cho database..."
```

---

## 👤 NGƯỜI 2: CHỨC NĂNG KHÁCH HÀNG (5 phút)

### Slides phụ trách: 5, 8-9

### Nội dung trình bày:

**Slide 5: Chức năng - Khách hàng**
- Xác thực: Đăng ký, đăng nhập, quên mật khẩu
- Đặt món: QR code, chọn nhà hàng, duyệt menu
- Tiện ích: Lịch sử, ưu đãi, voucher

**Slide 8: Giao diện người dùng**
- Thiết kế hiện đại với Material Design
- Gradient màu sắc
- Icon đơn giản, dễ hiểu
- Animation mượt mà
- Trải nghiệm người dùng tốt

**Slide 9: Luồng đặt món**
- Giải thích từng bước trong quy trình đặt món
- Từ đăng nhập → chọn nhà hàng → đặt món → thanh toán
- Nhấn mạnh tính tiện lợi và nhanh chóng

### Demo thực tế:
- Mở app và đăng nhập bằng tài khoản customer
- Quét QR hoặc chọn nhà hàng thủ công
- Duyệt menu, thêm món vào giỏ
- Xem lịch sử đơn hàng
- Áp dụng voucher

### Script mẫu:
```
"Tiếp theo, em xin giới thiệu về chức năng dành cho khách hàng. 

Khách hàng có thể đăng ký tài khoản, đăng nhập và đặt món rất dễ dàng. 
Đặc biệt, app hỗ trợ quét QR code tại bàn để tự động nhận diện nhà hàng 
và số bàn, hoặc khách có thể chọn nhà hàng thủ công.

Về giao diện, chúng em thiết kế theo phong cách hiện đại với màu sắc 
gradient, icon đơn giản và animation mượt mà để mang lại trải nghiệm 
tốt nhất cho người dùng.

Bây giờ em xin demo thực tế..."
```

---

## 👤 NGƯỜI 3: CHỨC NĂNG NHÀ HÀNG (5 phút)

### Slides phụ trách: 6, 10-11

### Nội dung trình bày:

**Slide 6: Chức năng - Nhà hàng**
- Dashboard: Thống kê doanh thu, đơn hàng
- Quản lý Menu: CRUD món ăn, phân loại
- Quản lý Đơn hàng: Xác nhận, cập nhật trạng thái
- Cài đặt: Thông tin nhà hàng, giờ hoạt động

**Slide 10: Database Schema**
- Giải thích các bảng chính
- Quan hệ giữa các bảng
- Cách lưu trữ dữ liệu
- Tối ưu hóa query

**Slide 11: Tài khoản Demo**
- Giới thiệu 3 tài khoản test
- Hướng dẫn cách đăng nhập
- Giải thích vai trò của từng tài khoản

### Demo thực tế:
- Đăng nhập bằng tài khoản restaurant owner
- Xem dashboard với thống kê
- Quản lý menu: thêm/sửa món
- Xử lý đơn hàng mới
- Cập nhật cài đặt nhà hàng

### Script mẫu:
```
"Phần tiếp theo em xin giới thiệu về chức năng dành cho nhà hàng.

Nhà hàng có một dashboard tổng quan với các thống kê quan trọng như 
doanh thu hôm nay, số đơn hàng, đơn chờ xử lý. Họ có thể quản lý menu 
một cách dễ dàng: thêm món mới, chỉnh sửa giá, phân loại theo danh mục.

Về database, chúng em thiết kế với các bảng chính như users, restaurants, 
menu_items, orders... với các quan hệ rõ ràng để đảm bảo tính toàn vẹn 
dữ liệu.

Để test, chúng em đã chuẩn bị 3 tài khoản demo cho từng vai trò. 
Bây giờ em xin demo..."
```

---

## 👤 NGƯỜI 4: CHỨC NĂNG ADMIN & KỸ THUẬT (5 phút)

### Slides phụ trách: 7, 12-14

### Nội dung trình bày:

**Slide 7: Chức năng - Admin**
- Dashboard tổng quan hệ thống
- Quản lý nhà hàng: Phê duyệt, tạm ngưng
- Quản lý người dùng
- Báo cáo & thống kê chi tiết

**Slide 12: Tính năng nổi bật**
- Điểm mạnh của hệ thống
- Đa vai trò
- QR Code scanning
- Real-time tracking
- UI/UX hiện đại
- Khả năng mở rộng

**Slide 13: Thách thức & Giải pháp**
- Các thách thức gặp phải:
  - Đồng bộ dữ liệu
  - Quản lý nhiều vai trò
  - Bảo mật
- Giải pháp áp dụng:
  - JWT authentication
  - Role-based access control
  - Validation & error handling

**Slide 14: Kết quả đạt được**
- Số liệu cụ thể: 25+ màn hình, 3 module
- Chức năng hoàn thành
- Thành tựu đạt được

### Demo thực tế:
- Đăng nhập bằng tài khoản admin
- Xem dashboard tổng quan
- Quản lý nhà hàng: phê duyệt, tạm ngưng
- Xem báo cáo thống kê

### Script mẫu:
```
"Em xin giới thiệu về module Admin - phần quan trọng nhất của hệ thống.

Admin có quyền cao nhất, có thể quản lý toàn bộ hệ thống. Dashboard 
hiển thị tổng quan với số liệu về nhà hàng, người dùng, đơn hàng và 
doanh thu. Admin có thể phê duyệt nhà hàng mới, tạm ngưng hoặc kích 
hoạt lại nhà hàng.

Về kỹ thuật, chúng em gặp một số thách thức như đồng bộ dữ liệu, 
quản lý nhiều vai trò và bảo mật. Chúng em đã giải quyết bằng cách 
sử dụng JWT authentication, role-based access control...

Kết quả là chúng em đã hoàn thành 25+ màn hình với 3 module chính..."
```

---

## 👤 NGƯỜI 5: DEMO TỔNG HỢP & KẾT LUẬN (5 phút)

### Slides phụ trách: 15-20

### Nội dung trình bày:

**Slide 15: Demo**
- Tổng hợp demo 3 vai trò
- Luồng hoàn chỉnh từ đầu đến cuối
- Highlight các tính năng chính

**Slide 16: Hướng phát triển**
- Giai đoạn tiếp theo
- Tích hợp API backend thực
- Payment gateway
- Push notifications
- Tối ưu hóa performance

**Slide 17: Kết luận**
- Tổng kết thành tựu
- Bài học rút ra
- Kinh nghiệm làm việc nhóm

**Slide 18: Q&A**
- Chuẩn bị trả lời câu hỏi
- Giải đáp thắc mắc

**Slide 19: Tài liệu tham khảo**
- Source code
- Documentation
- Contact information

**Slide 20: Thank You**
- Cảm ơn và kết thúc

### Demo tổng hợp:
- Chạy lại toàn bộ luồng từ customer → restaurant → admin
- Highlight các tính năng đặc biệt
- Trả lời câu hỏi từ khán giả

### Script mẫu:
```
"Cuối cùng, em xin tổng hợp lại toàn bộ demo và kết luận.

Như các bạn đã thấy, FoodStack Mobile là một hệ thống hoàn chỉnh với 
3 vai trò, mỗi vai trò có những chức năng riêng biệt nhưng kết nối 
chặt chẽ với nhau.

Trong tương lai, chúng em dự định tích hợp API backend thực, payment 
gateway, push notifications và nhiều tính năng khác để hoàn thiện 
sản phẩm.

Qua dự án này, nhóm em đã học được rất nhiều về React Native, quản lý 
state, navigation phức tạp và làm việc nhóm hiệu quả.

Vậy là nhóm em đã hoàn thành phần thuyết trình. Em xin cảm ơn quý 
thầy cô và các bạn đã lắng nghe. Nhóm em sẵn sàng trả lời câu hỏi ạ!"
```

---

## 📋 PHÂN CÔNG CHI TIẾT

### Người 1: [Tên]
- **Vai trò:** Leader, Giới thiệu
- **Slides:** 1-4
- **Thời gian:** 5 phút
- **Chuẩn bị:** Tổng quan dự án, công nghệ, kiến trúc

### Người 2: [Tên]
- **Vai trò:** Frontend Developer, Demo Customer
- **Slides:** 5, 8-9
- **Thời gian:** 5 phút
- **Chuẩn bị:** Chức năng khách hàng, UI/UX, demo app

### Người 3: [Tên]
- **Vai trò:** Backend Developer, Demo Restaurant
- **Slides:** 6, 10-11
- **Thời gian:** 5 phút
- **Chuẩn bị:** Chức năng nhà hàng, database, demo restaurant

### Người 4: [Tên]
- **Vai trò:** Full-stack Developer, Demo Admin
- **Slides:** 7, 12-14
- **Thời gian:** 5 phút
- **Chuẩn bị:** Chức năng admin, kỹ thuật, thách thức

### Người 5: [Tên]
- **Vai trò:** Tester, Kết luận
- **Slides:** 15-20
- **Thời gian:** 5 phút
- **Chuẩn bị:** Demo tổng hợp, Q&A, kết luận

---

## 🎯 CHECKLIST CHUẨN BỊ

### Trước buổi thuyết trình (1 tuần):
- [ ] Phân công rõ ràng cho từng người
- [ ] Mỗi người chuẩn bị script riêng
- [ ] Tập dượt ít nhất 3 lần
- [ ] Chuẩn bị backup slides (PDF)
- [ ] Test demo trên nhiều thiết bị

### Trước buổi thuyết trình (1 ngày):
- [ ] Kiểm tra thiết bị chiếu
- [ ] Cài đặt app trên điện thoại demo
- [ ] Chuẩn bị tài khoản test
- [ ] In tài liệu backup (nếu cần)
- [ ] Họp nhóm lần cuối

### Trong buổi thuyết trình:
- [ ] Đến sớm 15 phút
- [ ] Test thiết bị và kết nối
- [ ] Chuẩn bị tinh thần
- [ ] Hỗ trợ nhau khi cần
- [ ] Ghi chú câu hỏi để trả lời

---

## 💡 TIPS THUYẾT TRÌNH

### Cho tất cả thành viên:
1. **Nói rõ ràng, tự tin**
   - Giọng to, rõ ràng
   - Nhìn vào khán giả
   - Không đọc slides

2. **Quản lý thời gian**
   - Đúng 5 phút mỗi người
   - Có đồng hồ để kiểm tra
   - Chuyển tiếp mượt mà

3. **Tương tác**
   - Đặt câu hỏi cho khán giả
   - Sử dụng body language
   - Tạo sự hứng thú

4. **Xử lý sự cố**
   - Bình tĩnh khi có lỗi
   - Có plan B
   - Hỗ trợ nhau

### Chuyển tiếp giữa các người:
```
Người 1 → Người 2:
"Vậy là em đã giới thiệu tổng quan về dự án. Tiếp theo, 
[Tên Người 2] sẽ trình bày chi tiết về chức năng khách hàng."

Người 2 → Người 3:
"Cảm ơn [Tên Người 1]. Sau khi tìm hiểu về khách hàng, 
[Tên Người 3] sẽ giới thiệu về phần nhà hàng."

Người 3 → Người 4:
"Tiếp theo, [Tên Người 4] sẽ trình bày về module Admin 
và các vấn đề kỹ thuật."

Người 4 → Người 5:
"Cuối cùng, [Tên Người 5] sẽ tổng hợp demo và kết luận."
```

---

## 📱 THIẾT BỊ CẦN CHUẨN BỊ

### Hardware:
- [ ] Laptop (có adapter HDMI/VGA)
- [ ] Điện thoại Android/iOS để demo
- [ ] Cáp kết nối (HDMI, VGA, USB-C)
- [ ] Chuột không dây (optional)
- [ ] Pointer laser (optional)

### Software:
- [ ] PowerPoint/Google Slides
- [ ] Expo Go app
- [ ] FoodStack Mobile app
- [ ] Backup PDF slides
- [ ] Screen recording (nếu cần)

### Tài liệu:
- [ ] Script thuyết trình
- [ ] Tài khoản demo
- [ ] Source code (USB backup)
- [ ] Documentation
- [ ] Danh sách câu hỏi dự kiến

---

## ❓ CÂU HỎI DỰ KIẾN & CÁCH TRẢ LỜI

### Q1: "App có hoạt động offline không?"
**A:** "Hiện tại app chưa hỗ trợ offline mode vì cần kết nối với server 
để đồng bộ dữ liệu real-time. Tuy nhiên, đây là một tính năng chúng em 
dự định phát triển trong tương lai với caching strategy."

### Q2: "Bảo mật thông tin người dùng như thế nào?"
**A:** "Chúng em sử dụng JWT authentication cho việc xác thực, mã hóa 
password bằng bcrypt, và áp dụng role-based access control để phân quyền. 
Tất cả API calls đều được validate và sanitize input."

### Q3: "Có tích hợp thanh toán online không?"
**A:** "Hiện tại chưa có, nhưng chúng em đã thiết kế kiến trúc sẵn sàng 
để tích hợp các payment gateway như VNPay, Momo trong tương lai."

### Q4: "Làm thế nào để scale khi có nhiều nhà hàng?"
**A:** "Database được thiết kế với indexing hợp lý, API có pagination, 
và chúng em có thể áp dụng caching, load balancing khi cần scale."

### Q5: "Tại sao chọn React Native thay vì native?"
**A:** "React Native cho phép code một lần chạy trên cả iOS và Android, 
tiết kiệm thời gian phát triển. Performance cũng đủ tốt cho app này."

---

## 🎬 TIMELINE THUYẾT TRÌNH

```
00:00 - 05:00  │ Người 1: Giới thiệu & Tổng quan
05:00 - 10:00  │ Người 2: Chức năng Khách hàng + Demo
10:00 - 15:00  │ Người 3: Chức năng Nhà hàng + Demo
15:00 - 20:00  │ Người 4: Chức năng Admin + Kỹ thuật
20:00 - 25:00  │ Người 5: Demo tổng hợp + Kết luận
25:00 - 30:00  │ Q&A (Tất cả cùng trả lời)
```

---

## ✅ ĐÁNH GIÁ SAU THUYẾT TRÌNH

### Tự đánh giá nhóm:
- Điểm mạnh của buổi thuyết trình?
- Điểm cần cải thiện?
- Bài học rút ra?
- Feedback cho từng thành viên?

### Ghi chú:
- Câu hỏi nào khó trả lời?
- Phần nào được đánh giá cao?
- Cần bổ sung gì cho lần sau?

---

**Chúc nhóm thuyết trình thành công! 🎉**
