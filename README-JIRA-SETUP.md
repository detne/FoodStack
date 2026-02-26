# Hướng dẫn tạo Issues trong Jira

## Cách 1: Tạo thủ công (Đơn giản nhất)

### Bước 1: Tạo Epic
1. Vào Jira project → Click nút **"Create"**
2. Chọn **Issue Type = Epic**
3. Điền thông tin:
   - **Epic Name**: Authentication & Authorization
   - **Summary**: Authentication & Authorization
   - **Description**: Copy từ file CSV
   - **Priority**: Highest
   - **Labels**: auth, security, backend
4. Click **Create**

### Bước 2: Tạo Story và link vào Epic
1. Click **"Create"** → **Issue Type = Story**
2. Điền:
   - **Summary**: RegisterRestaurantUseCase
   - **Epic Link**: Chọn Epic vừa tạo
   - **Description**: Copy từ CSV
   - **Priority**: Highest
   - **Story Points**: 5
   - **Labels**: auth, registration, backend
3. Click **Create**

Lặp lại cho tất cả Stories.

---

## Cách 2: Dùng Jira REST API (Tự động hóa)

### Bước 1: Lấy API Token
1. Vào https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **"Create API token"**
3. Copy token (chỉ hiện 1 lần)

### Bước 2: Cài đặt dependencies
```bash
npm install axios
```

### Bước 3: Cấu hình script
Mở file `create-jira-issues.js` và sửa:
```javascript
const JIRA_CONFIG = {
  domain: 'your-domain.atlassian.net',
  email: 'your-email@example.com',
  apiToken: 'YOUR_API_TOKEN',
  projectKey: 'FoodStack'
};
```

### Bước 4: Tìm Custom Field IDs
Jira dùng custom field IDs khác nhau cho mỗi instance. Cần tìm:

**Cách 1: Qua UI**
1. Tạo 1 issue thủ công
2. Vào issue → Click "..." → View in JSON
3. Tìm field IDs:
   - `customfield_10011` = Epic Name
   - `customfield_10016` = Story Points
   - `customfield_10014` = Epic Link

**Cách 2: Qua API**
```bash
curl -u your-email@example.com:YOUR_API_TOKEN \
  https://your-domain.atlassian.net/rest/api/3/field
```

### Bước 5: Chạy script
```bash
node create-jira-issues.js
```

---

## Cách 3: Import CSV đơn giản (Đã làm)

Dùng file `jira-import-simple.csv` - chỉ tạo Story, sau đó:

1. **Bulk convert thành Epic:**
   - Filter: `key in (AUTH-001, REST-001, BRANCH-001, ...)`
   - Bulk Change → Change Issue Type → Epic

2. **Link Stories vào Epic:**
   - Filter: `labels = auth AND key != AUTH-001`
   - Bulk Change → Edit Issues → Epic Link = AUTH-001

---

## Cách 4: Dùng Jira Automation (Nâng cao)

Tạo automation rule để tự động:
- Convert issue thành Epic nếu Summary chứa "Management"
- Link Story vào Epic dựa trên Labels

**Tạo rule:**
1. Project Settings → Automation → Create rule
2. Trigger: Issue created
3. Condition: Summary contains "Management"
4. Action: Edit issue → Change type to Epic

---

## So sánh các cách

| Cách | Ưu điểm | Nhược điểm | Thời gian |
|------|---------|------------|-----------|
| Thủ công | Đơn giản, không cần setup | Chậm, dễ sai | ~2-3 giờ |
| REST API | Nhanh, tự động, chính xác | Cần setup, code | ~30 phút |
| CSV Import | Không cần code | Không tạo Epic hierarchy | ~15 phút |
| Automation | Tự động hoàn toàn | Phức tạp setup | ~1 giờ |

## Khuyến nghị

**Nếu < 50 issues:** Tạo thủ công
**Nếu > 50 issues:** Dùng REST API script
**Nếu cần import nhiều lần:** Setup Automation

---

## Troubleshooting

### Lỗi: "Field 'customfield_xxxxx' cannot be set"
→ Field ID sai hoặc field không có trong project. Check lại field IDs.

### Lỗi: "Priority 'Highest' does not exist"
→ Project dùng priority khác. Check: Project Settings → Issues → Priorities

### Lỗi: "Epic Link field not found"
→ Project là Next-gen, dùng `parent` thay vì Epic Link:
```javascript
parent: { key: epicJiraKey }
```

### Rate limit (429 Too Many Requests)
→ Tăng delay giữa các request:
```javascript
await sleep(1000); // 1 giây
```
