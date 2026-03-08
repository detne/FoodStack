

## Plan: Pricing Page + Multi-step Branch Setup Wizard

### Overview
Khi người dùng nhấn "Start Free Trial", chuyển đến trang `/pricing` hiển thị 3 gói (Free, Pro, VIP) với giá và ưu đãi. Sau khi chọn gói, chuyển đến `/onboarding` là multi-step wizard 4 bước (theo hình tham khảo) để thiết lập nhà hàng/chi nhánh đầu tiên.

### Files to Create

1. **`src/pages/Pricing.tsx`** — Trang chọn gói dịch vụ
   - 3 card: Free (0đ/tháng), Pro (499K/tháng), VIP (999K/tháng)
   - Mỗi card liệt kê tính năng: số bàn, QR order, gọi phục vụ, tách bill, feedback, analytics...
   - Gói Pro được highlight "Popular"
   - Nút "Get Started" trên mỗi card → navigate đến `/onboarding?plan=free|pro|vip`

2. **`src/pages/Onboarding.tsx`** — Multi-step wizard (theo UI tham khảo)
   - Progress bar + 4 step indicators (General, Location, Hours, Manager)
   - Quản lý state bằng `useState` cho currentStep và formData
   - Nút Back / Next Step / Save as Draft
   - Footer info cards (Need help?, Data Privacy, Auto-Sync)

3. **`src/components/onboarding/StepGeneral.tsx`** — Step 1: General Info
   - Fields: Branch Name, Branch Code, Primary Phone, Public Email
   - Location Preview placeholder (disabled, "active in Step 2")
   - Operating hours preview (Mon-Fri, Saturday, Sunday)
   - Unassigned Manager indicator

4. **`src/components/onboarding/StepLocation.tsx`** — Step 2: Location
   - Address fields (Street, City, State, Zip)
   - Map placeholder area

5. **`src/components/onboarding/StepHours.tsx`** — Step 3: Operating Hours
   - Configurable hours per day of week
   - Open/Closed toggle per day

6. **`src/components/onboarding/StepManager.tsx`** — Step 4: Manager Assignment
   - Manager name, email, phone
   - Role assignment
   - Final review summary

### Files to Modify

7. **`src/App.tsx`** — Add routes `/pricing` and `/onboarding`

8. **`src/components/landing/Navbar.tsx`** + **`HeroSection.tsx`** + **`CTASection.tsx`** — Update "Start Free Trial" buttons to `Link` navigating to `/pricing`

### Design
- Consistent with existing dark navy/purple theme
- Cards use `bg-card` with `border` and hover effects
- Wizard uses white/light background matching the reference image
- Step indicators: active = filled purple circle, inactive = outlined gray
- Progress bar with gradient fill
- Form inputs use existing shadcn Input components

