# 360 Retail - Hướng dẫn đồng bộ Web → Mobile

> Tài liệu mô tả chi tiết toàn bộ luồng hoạt động, role, CRUD, API endpoints, data models của Web App **360 Retail** để đội Mobile có thể đồng bộ 1:1.

---

## Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Roles & Quyền truy cập](#2-roles--quyền-truy-cập)
3. [API Base URL & Axios Instances](#3-api-base-url--axios-instances)
4. [Authentication Flow](#4-authentication-flow)
5. [Data Models (TypeScript Interfaces)](#5-data-models)
6. [Luồng đi từng Role](#6-luồng-đi-từng-role)
7. [Chi tiết từng Module/Page](#7-chi-tiết-từng-modulepage)
8. [State Management (Zustand Stores)](#8-state-management)
9. [Trial & Subscription Feature Gating](#9-trial--subscription-feature-gating-quan-trọng)
10. [API Endpoints tổng hợp](#10-api-endpoints-tổng-hợp)

---

## 1. Tổng quan hệ thống

**360 Retail** là hệ thống quản lý bán lẻ (Retail Management SaaS) gồm:
- **Landing Page** (public) - Giới thiệu sản phẩm
- **Auth** (public) - Đăng ký, đăng nhập, xác thực email, quên mật khẩu
- **Dashboard** (authenticated) - Quản lý cửa hàng, sản phẩm, đơn hàng, nhân viên, kho, CRM
- **Customer Portal** (authenticated - Customer role) - Xem đơn hàng, loyalty points
- **Super Admin Console** (authenticated - SuperAdmin role) - Quản trị hệ thống
- **Feedback** (public) - Khách hàng đánh giá qua QR code

### Tech Stack Web
- React + TypeScript + Vite
- Zustand (state management)
- React Router v6
- Axios (HTTP client)
- Tailwind CSS + shadcn/ui
- Leaflet (bản đồ GPS)
- Recharts (biểu đồ)
- Google OAuth
- VNPay + SePay (thanh toán)

---

## 2. Roles & Quyền truy cập

### 2.1 Danh sách Roles

| Role | Mã trong code | Mô tả |
|------|--------------|--------|
| **Super Admin** | `SuperAdmin` | Quản trị hệ thống, quản lý users, plans, reviews |
| **Store Owner** | `StoreOwner` | Chủ cửa hàng - toàn quyền dashboard |
| **Manager** | `Manager` | Quản lý cửa hàng - gần như = StoreOwner trừ subscription |
| **Staff** | `Staff` | Nhân viên - quyền hạn chế |
| **Customer** | `Customer` | Khách hàng - xem đơn hàng, loyalty |
| **Potential Owner** | `PotentialOwner` | User đã đăng ký nhưng chưa có store |

### 2.2 Route Protection

```
Public (không cần đăng nhập):
  /                         → HomePage (Landing)
  /login                    → LoginPage
  /signup                   → SignupPage
  /verify-email             → VerifyEmailPage
  /forgot-password          → ForgotPasswordRequestPage
  /reset-password           → ForgotPasswordResetPage
  /feedback/:orderId        → FeedbackPage (QR code feedback)
  /payment/success          → PaymentSuccessPage
  /payment/failed           → PaymentFailedPage

Protected - Dashboard (StoreOwner | Manager | Staff | PotentialOwner):
  /dashboard                → DashboardPage
  /dashboard/staff          → StaffManagementPage
  /dashboard/staff/:id      → EmployeeDetailPage
  /dashboard/sales          → SalePostPage (POS)
  /dashboard/my-tasks       → MyTasksPage
  /dashboard/orders         → OrdersPage
  /dashboard/orders/:id     → OrderDetailPage
  /dashboard/reports        → ReportPage
  /dashboard/settings       → SettingPage
  /dashboard/customers      → CustomerPage
  /dashboard/crm            → CrmDashboardPage
  /dashboard/stores         → StoreManagementPage
  /dashboard/products       → ProductManagementPage
  /dashboard/inventory      → InventoryManagementPage
  /dashboard/profile        → ProfilePage
  /dashboard/subscription   → SubscriptionPlansPage
  /dashboard/timekeeping    → TimekeepingPage

Protected - Customer (Customer):
  /customer                 → CustomerDashboardPage
  /customer/orders/:orderId → CustomerOrderDetailPage

Protected - Admin (SuperAdmin):
  /admin                    → SuperAdminPage
```

### 2.3 Sidebar Navigation & Quyền theo Role

| Menu Item (tên hiển thị) | Route | Roles được thấy |
|---------------------------|-------|-----------------|
| Dashboard 360° | `/dashboard` | StoreOwner, Manager, Staff |
| Timekeeping (Chấm công) | `/dashboard/timekeeping` | StoreOwner, Manager, Staff |
| My Tasks (Công việc) | `/dashboard/my-tasks` | StoreOwner, Manager, Staff |
| Staff (Nhân sự) | `/dashboard/staff` | StoreOwner, Manager |
| Stores (Cửa hàng) | `/dashboard/stores` | StoreOwner, Manager |
| Products (Sản phẩm) | `/dashboard/products` | StoreOwner, Manager |
| Inventory (Kho hàng) | `/dashboard/inventory` | StoreOwner, Manager |
| Sales & POS (Bán hàng) | `/dashboard/sales` | StoreOwner, Manager, Staff |
| Orders (Đơn hàng) | `/dashboard/orders` | StoreOwner, Manager, Staff |
| Customers (Khách hàng) | `/dashboard/customers` | StoreOwner, Manager, Staff |
| CRM & Loyalty | `/dashboard/crm` | StoreOwner, Manager, Staff |
| Reports (Báo cáo) | `/dashboard/reports` | StoreOwner, Manager |
| Subscription (Gói dịch vụ) | `/dashboard/subscription` | StoreOwner |
| Settings (Cài đặt) | `/dashboard/settings` | Tất cả |

### 2.4 Quick Actions (Sidebar)

| Action | Chức năng |
|--------|----------|
| Create Order | Mở modal tạo đơn hàng nhanh |
| Staff Check-in | Mở modal chấm công |
| Record Feedback | Mở modal ghi nhận phản hồi |

---

## 3. API Base URL & Axios Instances

```
Base URL: VITE_API_BASE_URL (default: http://localhost:5001)

5 Axios instances chia theo microservice:
  identityApi  → {baseURL}/identity/...     (Auth, Users, Staff invite)
  saasApi      → {baseURL}/saas/...         (Stores, Subscriptions, Chatbot, Plan Reviews)
  salesApi     → {baseURL}/sales/...        (Products, Categories, Orders, Inventory, Dashboard)
  hrApi        → {baseURL}/hr/...           (Employees, Tasks, Timekeeping)
  crmApi       → {baseURL}/crm/...          (Customers, Feedback, Loyalty)
```

### Interceptors
- **Request**: Tự động gắn `Authorization: Bearer {token}` từ `localStorage.getItem("token")`
- **Response 403**: Tự động detect `TrialExpired`, `SubscriptionExpired`, `FeatureNotAvailable` → mở UpgradeModal

### API Response Format chuẩn

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | null;
}
```

---

## 4. Authentication Flow

### 4.1 Đăng ký (Register)

```
SignupPage → POST /identity/auth/register { email, password }
  → Redirect /verify-email?email=xxx
  → VerifyEmailPage → POST /identity/auth/verify-email { email, otpCode }
    → Thành công → Redirect /login

Resend OTP: POST /identity/auth/resend-otp { email }
```

### 4.2 Đăng nhập (Login)

```
LoginPage → POST /identity/auth/login { email, password }
  → Response: { accessToken, expiresAt, mustChangePassword }
  → Gọi GET /identity/auth/me → lấy User claims
  → Lưu token vào localStorage, user vào authStore (Zustand persist)
  → Redirect /dashboard
```

### 4.3 Google OAuth Login

```
LoginPage/SignupPage → POST /identity/auth/external { provider: "Google", idToken }
  → Response: { accessToken, expiresAt, isNewUser, email, profilePictureUrl }
  → Nếu isNewUser → lưu vào sessionStorage("pendingGoogleNewUser") → redirect signup
  → Nếu existing → Gọi /identity/auth/me → setAuth → redirect /dashboard
```

### 4.4 Quên mật khẩu

```
ForgotPasswordRequestPage → POST /identity/auth/forgot-password { email }
  → Redirect /reset-password?email=xxx
  → ForgotPasswordResetPage → POST /identity/auth/reset-password { email, code, newPassword }
    → Thành công → Redirect /login
```

### 4.5 Đổi mật khẩu

```
SettingPage (tab Security) → POST /identity/auth/change-password 
  { currentPassword, newPassword, confirmNewPassword }
```

### 4.6 Refresh Token (Switch Store)

```
POST /identity/auth/refresh-access?storeId={storeId}
  → Response: { accessToken, expiresAt }
  → Cập nhật localStorage + authStore
```

### 4.7 JWT Token Claims

Token chứa các claims quan trọng:
```
sub            → User ID
email          → Email
role           → System role (StoreOwner, Manager, Staff, ...)
store_id       → Current store ID
store_role     → Role in current store
status         → Subscription status (Registered|Active|Trial|Inactive|Suspended)
trial_expired  → "true"/"false"
trial_end_date → ISO date
trial_days_remaining → number
subscription_expired → "true"/"false"
subscription_end_date → ISO date
```

---

## 5. Data Models

### 5.1 User

```typescript
interface User {
  id: string;
  email: string;
  role: string;       // "StoreOwner" | "Manager" | "Staff" | "Customer" | "SuperAdmin" | "PotentialOwner"
  name: string;
  avatar?: string;
}
```

### 5.2 Store

```typescript
interface Store {
  id: string;
  storeName: string;
  address?: string;
  phone?: string;
  latitude?: number | null;
  longitude?: number | null;
  email?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  isDefault?: boolean;
}

interface CreateStoreDto {
  storeName: string;
  address?: string;
  phone?: string;
  planId?: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface UpdateStoreDto {
  storeName: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  latitude?: number | null;
  longitude?: number | null;
}
```

### 5.3 Product

```typescript
interface Product {
  id: string;
  productName: string;
  barCode?: string | null;
  description?: string | null;
  price: number;
  costPrice?: number | null;
  stockQuantity: number;
  categoryId: string;
  categoryName?: string;
  imageUrl?: string | null;
  isActive: boolean;
  hasVariants?: boolean;
  isInStock?: boolean;
  totalStock?: number;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

interface ProductVariant {
  id?: string;
  sku?: string;
  size?: string;
  color?: string;
  variantName?: string;
  priceOverride?: number;
  stockQuantity?: number;
}

interface CreateProductDto {
  productName: string;
  categoryId: string;
  barCode?: string;
  description?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  isActive?: boolean;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  imageFile?: File;            // Upload qua FormData
}

interface UpdateProductDto {
  id: string;
  productName: string;
  barCode?: string;
  description?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  categoryId: string;
  isActive: boolean;
  imageFile?: File;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  variantsJson?: string;       // JSON string của variants
}
```

### 5.4 Category

```typescript
interface Category {
  id: string;
  categoryName: string;
  parentId?: string;
  parentName?: string;
  isActive: boolean;
  children?: Category[];       // Cây phân cấp
  createdAt?: string;
  updatedAt?: string;
}

interface CreateCategoryDto {
  categoryName: string;
  parentId?: string;
}

interface UpdateCategoryDto {
  id: string;
  categoryName?: string;
  parentId?: string;
  isActive?: boolean;
}
```

### 5.5 Order

```typescript
interface Order {
  id: string;
  code?: string;               // VD: "ORD-260114-1234"
  storeId?: string;
  employeeId?: string;
  customerId?: string | null;
  customerName?: string;
  totalAmount: number;
  discountAmount: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: string;      // "Paid" | "Unpaid"
  createdAt: string;
  updatedAt?: string;
  orderItems: OrderItem[];
}

interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  barCode?: string;
  productVariantId?: string | null;
  sku?: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled" | "Refunded";

interface CreateOrderDto {
  customerId?: string;
  paymentMethod?: string;
  discountAmount: number;
  items: CreateOrderItemDto[];
}

interface CreateOrderItemDto {
  productId: string;
  quantity: number;
  productVariantId?: string;
}

interface GetOrdersParams {
  status?: OrderStatus;
  fromDate?: string;           // ISO date-time
  toDate?: string;
  page?: number;
  pageSize?: number;
}
```

### 5.6 Employee

```typescript
interface Employee {
  id: string;
  appUserId: string;
  storeId: string;
  fullName: string;
  position: string;
  userName: string;
  email: string;
  phoneNumber?: string | null;
  baseSalary?: number;
  joinDate?: string;
  isActive: boolean;
  avatarUrl?: string | null;
}

interface UpdateEmployeeProfileDto {   // Employee tự cập nhật
  fullName?: string;
  userName?: string;
  phoneNumber?: string;
}

interface UpdateEmployeeByOwnerDto {   // Owner/Manager cập nhật
  fullName?: string;
  position?: string;
  baseSalary?: number;
  isActive?: boolean;
}
```

### 5.7 Customer

```typescript
interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  createdAt?: string;
  isActive?: boolean;
  totalOrders?: number;
  totalSpend?: number;
}

interface CreateCustomerDto {
  fullName: string;
  phoneNumber: string;
  email?: string;
}

interface UpdateCustomerDto {
  fullName: string;
  phoneNumber: string;
  email?: string;
  isActive?: boolean;
}
```

### 5.8 Task

```typescript
interface Task {
  id: string;
  storeId: string;
  assigneeId: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  description?: string | null;
  deadline?: string | null;
  createdAt?: string;
  isActive: boolean;
  assigneeName?: string;
  assigneePosition?: string;
}

type TaskStatus = "Pending" | "InProgress" | "Completed" | "Cancelled";
type TaskPriority = "Low" | "Medium" | "High";

interface CreateTaskDto {
  title: string;
  assigneeId: string;
  priority?: TaskPriority;
  description?: string;
  deadline?: string;
}

interface UpdateTaskDto {
  title?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  description?: string;
  deadline?: string;
  isActive?: boolean;
}
```

### 5.9 Inventory Ticket

```typescript
type InventoryTicketType = "Import" | "Export";
type InventoryTicketStatus = "Draft" | "Confirmed" | "Cancelled";

interface InventoryTicket {
  id: string;
  code: string;
  type: InventoryTicketType;
  status: InventoryTicketStatus;
  note?: string;
  items: InventoryItem[];
  createdAt: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
}

interface InventoryItem {
  productId: string;
  productName?: string;
  quantity: number;
  productVariantId?: string | null;
  note?: string;
}

interface CreateInventoryTicketDto {
  type: InventoryTicketType;     // "Import" = nhập kho, "Export" = xuất kho
  note?: string;
  items: {
    productId: string;
    quantity: number;
    productVariantId?: string | null;
    note?: string;
  }[];
}
```

### 5.10 Loyalty

```typescript
interface LoyaltyRule {
  id: string;
  name: string;
  type: number;
  earningRate: number;
  minSpend: number;
  status: number;
  createdAt?: string;
}

interface LoyaltySummary {
  customerId: string;
  customerName: string;
  totalPoints: number;
  rank: string;
}

interface LoyaltyTransaction {
  id: string;
  customerId?: string;
  points: number;
  description?: string;
  type?: string;
  createdAt: string;
}
```

### 5.11 Feedback

```typescript
interface Feedback {
  id: string;
  customerId: string;
  customerName: string;
  content: string;
  rating: number;              // 1-5
  source: string;              // "QR" | "InStore" | ...
  createdAt: string;
}

interface FeedbackSummary {
  avgRating: number;
  totalCount: number;
  distribution: Record<string, number>;  // {"1": 5, "2": 3, ...}
}
```

### 5.12 Subscription

```typescript
interface Plan {
  id: string;
  planName: string;
  price: number;
  durationDays: number;
  description?: string;
  features?: string[];
  isPopular?: boolean;
}

interface MySubscription {
  subscriptionId?: string;
  planName: string | null;
  price?: number;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  daysRemaining: number | null;
}

interface SubscriptionStatus {
  status: "Registered" | "Active" | "Trial" | "Inactive" | "Suspended";
  hasStore: boolean;
  storeId: string | null;
  trialStartDate: string | null;
  trialEndDate: string | null;
  daysRemaining: number | null;
  planName: string | null;
  planId?: string | null;
  subscriptionEndDate?: string | null;
  isTrialExpired?: boolean;
}
```

### 5.13 Timekeeping

```typescript
interface TodayTimekeepingResponse {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  isGpsConfigured: boolean;
  warning: string | null;
  record: TodayTimekeepingRecord | null;
}

interface TodayTimekeepingRecord {
  id: string;
  employeeName: string;
  checkInTime: string;
  isLate: boolean;
  workHours: number | null;
  warning: string | null;
}

interface TimekeepingHistoryRecord {
  id: string;
  employeeName?: string;
  checkInTime: string;
  checkOutTime?: string | null;
  isLate?: boolean;
  workHours?: number | null;
  warning?: string | null;
}
```

### 5.14 Admin User (SuperAdmin)

```typescript
interface AdminUser {
  id: string;
  email: string;
  fullName?: string | null;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

interface CreateAdminUserDto {
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  role: string;                // "StoreOwner" | "Manager" | "Staff" | "Customer" | "PotentialOwner"
}

interface UpdateAdminUserDto {
  fullName?: string;
  phoneNumber?: string;
  role?: string;
  isActive?: boolean;
}
```

### 5.15 UserStore (Multi-store)

```typescript
interface UserStore {
  storeId: string;
  storeName: string;
  roleInStore: string;
  isDefault: boolean;
}
```

### 5.16 Plan Review

```typescript
interface PlanReview {
  id: string;
  planId: string;
  planName: string;
  userId: string;
  storeId: string;
  storeName: string;
  rating: number;
  content?: string;
  createdAt: string;
}

interface PlanReviewSummary {
  planId: string;
  planName: string;
  avgRating: number;
  totalReviews: number;
  distribution?: Record<string, number>;
}
```

### 5.17 Chatbot

```typescript
interface ChatbotAnswer {
  answer: string;
  source: string;
  timestamp: string;
}

interface ChatbotSuggestion {
  text: string;
  question: string;
}
```

### 5.18 Sales Dashboard

```typescript
interface SalesOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  avgOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
}

interface RevenueChartPoint {
  label: string;
  revenue: number;
  orderCount: number;
}

interface TopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

interface InventorySummary {
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockProducts: {
    productId: string;
    productName: string;
    stockQuantity: number;
    sku?: string;
  }[];
}
```

---

## 6. Luồng đi từng Role

### 6.1 🔵 SuperAdmin Flow

```
/login → Đăng nhập → /admin

Trang SuperAdminPage có 3 section:

1. USER MANAGEMENT (Quản lý người dùng)
   - Xem danh sách tất cả users
   - Tạo user mới (email, password, fullName, phoneNumber, role)
   - Sửa user (fullName, phoneNumber, role, isActive)
   - Xóa user
   
2. PLAN REVIEWS (Đánh giá gói dịch vụ)
   - Dashboard: tổng reviews, avg rating, reviews tháng này
   - Danh sách reviews (planName, storeName, rating, content)
   - Xóa review

3. SUBSCRIPTION PLANS (Gói dịch vụ)
   - Xem danh sách plans
   - Check Expiry → gửi email cảnh báo hết hạn (days = 7)
```

### 6.2 🟢 StoreOwner Flow

```
/login → Đăng nhập → /dashboard

NẾU CHƯA CÓ STORE:
  → DashboardPage hiện onboarding: "Bắt đầu dùng thử" 
  → Tạo store trial (storeName) → POST /identity/subscription/start-trial
  → Hoặc tạo store mới với plan → StoreManagementPage

ĐÃ CÓ STORE:
  ├── Dashboard 360° (/dashboard)
  │   ├── Overview: Revenue, Orders, Avg Order Value, Active Staff
  │   ├── Top-selling Products Chart
  │   ├── Revenue Line Chart
  │   ├── Recent Transactions
  │   ├── Low Stock Alerts
  │   └── Subscription Expiry Warning
  │
  ├── Timekeeping (/dashboard/timekeeping)
  │   ├── Check-in/Check-out (GPS + Selfie)
  │   ├── Bản đồ vị trí
  │   ├── Lịch sử chấm công cá nhân
  │   └── Monthly Summary (thống kê tháng - chỉ Owner/Manager)
  │
  ├── My Tasks (/dashboard/my-tasks)
  │   ├── Xem tasks được giao
  │   └── Cập nhật trạng thái task
  │
  ├── Staff (/dashboard/staff)
  │   ├── Danh sách nhân viên + thống kê
  │   ├── Mời nhân viên (email invite)
  │   ├── Tạo task cho nhân viên
  │   └── Chi tiết nhân viên → sửa/vô hiệu hóa
  │
  ├── Stores (/dashboard/stores)
  │   ├── Danh sách cửa hàng sở hữu
  │   ├── Tạo cửa hàng mới (kèm chọn plan + thanh toán)
  │   ├── Sửa thông tin cửa hàng
  │   └── Toggle Active/Inactive
  │
  ├── Products (/dashboard/products)
  │   ├── Tab Products: CRUD sản phẩm (ảnh, variants, barcode)
  │   └── Tab Categories: CRUD danh mục (cây phân cấp)
  │
  ├── Inventory (/dashboard/inventory)
  │   ├── Tạo phiếu nhập/xuất kho
  │   ├── Xem danh sách phiếu (filter type/status)
  │   ├── Xem chi tiết phiếu
  │   ├── Xác nhận phiếu (cập nhật stock)
  │   ├── Hủy phiếu
  │   └── Xóa phiếu (Draft/Cancelled)
  │
  ├── Sales & POS (/dashboard/sales)
  │   ├── Tab POS: Grid sản phẩm → chọn → giỏ hàng → tạo đơn
  │   ├── Tab Inventory: Xem tồn kho
  │   └── Tab Reports: Top-selling chart
  │
  ├── Orders (/dashboard/orders)
  │   ├── Danh sách đơn hàng (filter status, date range, phân trang)
  │   └── Chi tiết đơn → cập nhật trạng thái / hủy đơn / QR feedback
  │
  ├── Customers (/dashboard/customers)
  │   ├── CRUD khách hàng
  │   ├── Xem loyalty summary + transactions
  │   └── Xem feedback của khách
  │
  ├── CRM & Loyalty (/dashboard/crm)
  │   ├── Feedback analytics (avg rating, distribution chart)
  │   ├── Feedback list + filters
  │   ├── Tạo staff feedback cho khách
  │   ├── CRUD loyalty rules
  │   └── Redeem points cho khách
  │
  ├── Reports (/dashboard/reports)
  │   ├── Feedback summary
  │   └── Rating distribution chart
  │
  ├── Subscription (/dashboard/subscription)
  │   ├── Xem plans hiện có
  │   ├── Xem subscription hiện tại
  │   ├── Mua plan (SePay QR / VNPay)
  │   ├── Check payment status
  │   └── Submit review cho plan
  │
  ├── Settings (/dashboard/settings)
  │   ├── Tab Store Info: Sửa tên, địa chỉ (geocoding), GPS (Leaflet map), SĐT
  │   ├── Tab Notifications: Toggle thông báo, check low-stock email
  │   ├── Tab Loyalty Rules: CRUD loyalty rules
  │   └── Tab Security: Đổi mật khẩu
  │
  └── Profile (/dashboard/profile)
      ├── Thông tin cá nhân + avatar
      ├── Subscription info
      ├── Danh sách stores
      ├── Active tasks → mark complete
      └── Timekeeping history summary
```

### 6.3 🟡 Manager Flow

```
/login → Đăng nhập → /dashboard

Giống StoreOwner NGOẠI TRỪ:
  ✗ KHÔNG thấy menu "Subscription"
  ✗ KHÔNG tạo cửa hàng mới
  ✓ CÒN LẠI giống StoreOwner (staff, products, orders, CRM, inventory, ...)
```

### 6.4 🟠 Staff Flow

```
/login → Đăng nhập → /dashboard

Quyền hạn chế:
  ├── Dashboard 360° → Xem overview (READ only)
  ├── Timekeeping → Check-in/Check-out (KHÔNG thấy monthly summary)
  ├── My Tasks → Xem tasks + cập nhật status
  ├── Sales & POS → Bán hàng, tạo đơn
  ├── Orders → Xem danh sách, KHÔNG sửa status/hủy đơn
  ├── Customers → Xem khách hàng, KHÔNG xóa
  ├── CRM & Loyalty → Xem feedback, KHÔNG CRUD loyalty rules, KHÔNG redeem
  ├── Settings → Chỉ tab Security (đổi mật khẩu)
  └── Profile → Xem profile

KHÔNG THẤY MENU:
  ✗ Staff Management
  ✗ Stores
  ✗ Products
  ✗ Inventory
  ✗ Reports
  ✗ Subscription
```

### 6.5 🔴 Customer Flow

```
/login → Đăng nhập → /customer

CustomerDashboardPage:
  ├── Danh sách đơn hàng gần đây (tối đa 10)
  ├── Loyalty points summary (totalPoints, rank)
  ├── Loyalty transactions (lịch sử tích/dùng điểm)
  └── Click đơn hàng → /customer/orders/:orderId

CustomerOrderDetailPage:
  ├── Mã đơn, ngày tạo, trạng thái
  ├── Danh sách sản phẩm (tên, SL, giá)
  └── Tổng tiền
```

### 6.6 ⚪ PotentialOwner Flow

```
/login → Đăng nhập → /dashboard

DashboardPage hiện onboarding CTA:
  → "Bắt đầu dùng thử miễn phí"
  → StartTrialDialog: nhập tên cửa hàng
  → POST /identity/subscription/start-trial { storeName }
  → Refresh token → chuyển thành StoreOwner flow
```

### 6.7 🟣 Public (Không đăng nhập)

```
/                   → HomePage (Landing page)
/feedback/:orderId  → FeedbackPage
  → URL có query params: ?customerId=xxx&storeId=yyy
  → Rating (1-5 sao) + Comment
  → POST /crm/feedback/public/{orderId}
```

---

## 7. Chi tiết từng Module/Page

### 7.1 AUTH MODULE

#### 7.1.1 LoginPage (`/login`)
- **Tên hiển thị**: Đăng nhập
- **UI**: Split-screen (form trái, gradient phải), email/password, remember me, Google OAuth
- **API**: `POST /identity/auth/login`, `POST /identity/auth/external`, `GET /identity/auth/me`
- **Actions**: Login email/password, Login Google, Forgot Password link, Signup link
- **Redirect sau login**: `/dashboard` (StoreOwner/Manager/Staff), `/customer` (Customer), `/admin` (SuperAdmin)

#### 7.1.2 SignupPage (`/signup`)
- **Tên hiển thị**: Đăng ký
- **UI**: Name, email, password, confirm password, Google OAuth
- **Validation**: Zod - password min 8 chars, password match
- **API**: `POST /identity/auth/register`
- **Redirect**: `/verify-email?email=xxx`

#### 7.1.3 VerifyEmailPage (`/verify-email`)
- **Tên hiển thị**: Xác thực Email
- **UI**: Email (pre-filled from query), 6-digit OTP input
- **API**: `POST /identity/auth/verify-email`, `POST /identity/auth/resend-otp`
- **Redirect**: `/login`

#### 7.1.4 ForgotPasswordRequestPage (`/forgot-password`)
- **Tên hiển thị**: Quên mật khẩu
- **UI**: Email input
- **API**: `POST /identity/auth/forgot-password`
- **Redirect**: `/reset-password?email=xxx`

#### 7.1.5 ForgotPasswordResetPage (`/reset-password`)
- **Tên hiển thị**: Đặt lại mật khẩu
- **UI**: Email (pre-filled), 6-digit OTP, new password, confirm password
- **API**: `POST /identity/auth/reset-password`
- **Redirect**: `/login`

---

### 7.2 DASHBOARD MODULE

#### 7.2.1 DashboardPage (`/dashboard`)
- **Tên hiển thị**: Dashboard 360°
- **Roles**: StoreOwner, Manager, Staff
- **CRUD**: READ only
- **Sections**:
  - Stats Row: Total Revenue, Total Orders, Avg Order Value, Active Staff
  - Quick Actions: Go to POS, View Orders, Manage Products
  - Top-selling Products Chart (BarChart)
  - Revenue Chart (LineChart) - group by day/week/month
  - Recent Transactions list
  - Low Stock Alerts
  - Subscription Expiry Warning (StoreOwner only)
- **API calls**:
  - `GET /sales/dashboard/overview`
  - `GET /sales/dashboard/revenue-chart`
  - `GET /sales/dashboard/top-products`
  - `GET /sales/dashboard/recent-activity`
  - `GET /hr/employees`
  - `GET /sales/Products`
  - `GET /sales/orders`
  - `GET /saas/subscriptions/my-expiry`
- **Onboarding (chưa có store)**: Hiện CTA "Start Trial" → `POST /identity/subscription/start-trial`

#### 7.2.2 StaffManagementPage (`/dashboard/staff`)
- **Tên hiển thị**: Quản lý Nhân sự
- **Roles**: StoreOwner, Manager
- **CRUD**:
  - **CREATE**: Invite staff (email) → `POST /identity/staff/invite`
  - **CREATE**: Create task → `POST /hr/tasks`
  - **READ**: Employee list → `GET /hr/employees`
  - **READ**: Task list → `GET /hr/tasks`
- **UI**: DataTable, search, invite modal, create task modal

#### 7.2.3 EmployeeDetailPage (`/dashboard/staff/:id`)
- **Tên hiển thị**: Chi tiết Nhân viên
- **Roles**: StoreOwner, Manager (edit/delete); Staff (view only)
- **CRUD**:
  - **READ**: `GET /hr/employees/{id}`
  - **UPDATE**: `PUT /hr/employees/{id}` (fullName, position, baseSalary, isActive)
  - **DELETE**: Soft-delete via `isActive: false`

#### 7.2.4 SalePostPage (`/dashboard/sales`)
- **Tên hiển thị**: Bán hàng & POS
- **Roles**: StoreOwner, Manager, Staff
- **Tabs**:
  - **POS**: Product grid → select → cart → create order
  - **Inventory**: View stock levels
  - **Reports**: Top-selling chart & table
- **CRUD**:
  - **CREATE**: Order → `POST /sales/orders`
  - **READ**: Products → `GET /sales/Products`
  - **READ**: Top products → `GET /sales/dashboard/top-products`

#### 7.2.5 OrdersPage (`/dashboard/orders`)
- **Tên hiển thị**: Đơn hàng
- **Roles**: StoreOwner, Manager, Staff
- **CRUD**: READ → `GET /sales/orders` (with filters: status, fromDate, toDate, page, pageSize)
- **UI**: Paginated table, status badge colors, date range filter, click → detail

#### 7.2.6 OrderDetailPage (`/dashboard/orders/:id`)
- **Tên hiển thị**: Chi tiết Đơn hàng
- **Roles**: StoreOwner, Manager (full), Staff (view only)
- **CRUD**:
  - **READ**: `GET /sales/orders/{id}`
  - **UPDATE**: `PUT /sales/orders/{id}/status?status=xxx` (StoreOwner/Manager)
  - **DELETE**: `PUT /sales/orders/{id}/cancel` (StoreOwner/Manager)
- **QR Feedback**: Tạo URL `{origin}/feedback/{orderId}?customerId=xxx&storeId=yyy`

#### 7.2.7 ReportPage (`/dashboard/reports`)
- **Tên hiển thị**: Báo cáo
- **Roles**: StoreOwner, Manager
- **CRUD**: READ only
- **API**:
  - `GET /crm/feedback/summary`
  - `GET /crm/feedback`

#### 7.2.8 SettingPage (`/dashboard/settings`)
- **Tên hiển thị**: Cài đặt
- **Roles**: All (nhưng edit store chỉ StoreOwner/Manager)
- **Tabs**:
  | Tab | Tên hiển thị | CRUD | API |
  |-----|-------------|------|-----|
  | Store Info | Thông tin cửa hàng | READ + UPDATE | `GET/PUT /saas/stores/{id}` |
  | Notifications | Thông báo | Local storage toggles | `POST /sales/notifications/low-stock-check` |
  | Loyalty Rules | Quy tắc tích điểm | CRUD | `GET/POST/PUT /crm/loyalty-rules` |
  | Security | Bảo mật | UPDATE | `POST /identity/auth/change-password` |

#### 7.2.9 CustomerPage (`/dashboard/customers`)
- **Tên hiển thị**: Khách hàng
- **Roles**: StoreOwner, Manager, Staff (delete: chỉ Owner/Manager)
- **CRUD**:
  - **CREATE**: `POST /crm/customers`
  - **READ**: `GET /crm/customers`, `GET /crm/customers/{id}/loyalty-summary`, `GET /crm/customers/{id}/loyalty-transactions`, `GET /crm/customers/{id}/feedback`
  - **UPDATE**: `PUT /crm/customers/{id}`
  - **DELETE**: `DELETE /crm/customers/{id}`

#### 7.2.10 StoreManagementPage (`/dashboard/stores`)
- **Tên hiển thị**: Quản lý Cửa hàng
- **Roles**: StoreOwner (multi-store), Manager (view only)
- **CRUD**:
  - **CREATE**: `POST /saas/stores` (with planId → payment flow)
  - **READ**: `GET /saas/stores/my-owned-stores`
  - **UPDATE**: `PUT /saas/stores/{id}`
  - Toggle Active/Inactive
- **Payment Flow**: Tạo store → chọn plan → initiate payment → redirect VNPay/SePay

#### 7.2.11 ProductManagementPage (`/dashboard/products`)
- **Tên hiển thị**: Quản lý Sản phẩm
- **Roles**: StoreOwner, Manager
- **Tab Products - CRUD**:
  - **CREATE**: `POST /sales/Products` (FormData: image + variants)
  - **READ**: `GET /sales/Products` (filter: keyword, categoryId, includeInactive)
  - **UPDATE**: `PUT /sales/Products/{id}` (FormData)
  - **DELETE**: Toggle inactive (soft-delete)
- **Tab Categories - CRUD**:
  - **CREATE**: `POST /sales/Categories`
  - **READ**: `GET /sales/Categories`
  - **UPDATE**: `PUT /sales/Categories/{id}`
  - **DELETE**: `DELETE /sales/Categories/{id}` hoặc toggle inactive

#### 7.2.12 InventoryManagementPage (`/dashboard/inventory`)
- **Tên hiển thị**: Quản lý Kho hàng
- **Roles**: StoreOwner, Manager
- **CRUD**:
  - **CREATE**: `POST /sales/inventory` (Import/Export ticket with items)
  - **READ**: `GET /sales/inventory` (filter: type, status, page), `GET /sales/inventory/{id}`
  - **UPDATE**: `PUT /sales/inventory/{id}/confirm` (xác nhận → cập nhật stock)
  - **DELETE**: `PUT /sales/inventory/{id}/cancel`, `DELETE /sales/inventory/{id}` (Draft/Cancelled)
- **Check Low Stock**: `POST /sales/notifications/low-stock-check?threshold=10`

#### 7.2.13 ProfilePage (`/dashboard/profile`)
- **Tên hiển thị**: Hồ sơ cá nhân
- **Roles**: All
- **CRUD**:
  - **READ**: Subscription, stores, tasks, timekeeping history
  - **UPDATE**: Task status → `PUT /hr/tasks/{id}/status`
  - **UPDATE**: Profile → `PUT /hr/employees/me`
  - **UPDATE**: Avatar → `POST /hr/employees/me/avatar`
- **API**:
  - `GET /saas/subscriptions/my`
  - `GET /saas/subscriptions/store/{storeId}/status`
  - `GET /saas/stores/my-owned-stores`
  - `GET /hr/tasks/me`
  - `GET /hr/timekeeping`

#### 7.2.14 TimekeepingPage (`/dashboard/timekeeping`)
- **Tên hiển thị**: Chấm công
- **Roles**: StoreOwner, Manager, Staff
- **CRUD**:
  - **CREATE**: Check-in → `POST /hr/timekeeping/check-in { locationGps, checkInImageUrl }`
  - **CREATE**: Check-out → `POST /hr/timekeeping/check-out { locationGps }`
  - **CREATE**: Upload selfie → `POST /hr/timekeeping/upload-selfie` (FormData)
  - **READ**: Today → `GET /hr/timekeeping/today`
  - **READ**: History → `GET /hr/timekeeping`
  - **READ**: Monthly Summary → `GET /hr/timekeeping/summary` (Owner/Manager only)
- **GPS**: Sử dụng `navigator.geolocation`, Leaflet map hiển thị vị trí user + store

#### 7.2.15 MyTasksPage (`/dashboard/my-tasks`)
- **Tên hiển thị**: Công việc của tôi
- **Roles**: StoreOwner, Manager, Staff
- **CRUD**:
  - **READ**: `GET /hr/tasks/me`
  - **UPDATE**: `PUT /hr/tasks/{id}/status?status=xxx`
- **Filter**: status (Pending, InProgress, Completed, Cancelled)

#### 7.2.16 CrmDashboardPage (`/dashboard/crm`)
- **Tên hiển thị**: CRM & Loyalty
- **Roles**: StoreOwner, Manager, Staff (nhưng CRUD loyalty chỉ Owner/Manager)
- **Sections**:
  1. **Feedback Analytics**: Summary + distribution chart
  2. **Feedback List**: Filter by rating, date range, paginated
  3. **Staff Feedback**: Tạo feedback thay khách (InStore) → `POST /crm/feedback`
  4. **Loyalty Rules**: CRUD → `/crm/loyalty-rules`
  5. **Redeem Points**: Tìm khách → quy đổi điểm → `POST /crm/customers/{id}/redeem`

---

### 7.3 SUBSCRIPTION MODULE

#### 7.3.1 SubscriptionPlansPage (`/dashboard/subscription`)
- **Tên hiển thị**: Gói dịch vụ
- **Roles**: StoreOwner
- **Flow**:
  1. Xem plans → `GET /saas/subscriptions/plans`
  2. Xem current subscription → `GET /saas/subscriptions/my`
  3. Purchase → `POST /saas/subscriptions/purchase { planId }`
  4. Initiate Payment → `GET /saas/payments/initiate?paymentId=xxx&provider=sepay|vnpay`
  5. SePay: Hiện QR code → poll `GET /saas/payments/{paymentId}/status` mỗi 5s
  6. VNPay: Redirect URL → callback `/payment/success` hoặc `/payment/failed`
  7. Sau thanh toán: Refresh access token → cập nhật claims
- **Reviews**:
  - Xem summaries → `GET /saas/plan-reviews/summary`
  - Submit review → `POST /saas/plan-reviews { planId, rating, content }`

#### 7.3.2 PaymentSuccessPage (`/payment/success`)
- Verify payment bằng refresh token
- API: `POST /identity/auth/refresh-access`, `GET /identity/subscription/status`
- Redirect → `/dashboard`

#### 7.3.3 PaymentFailedPage (`/payment/failed`)
- Hiện error message
- Button retry → `/dashboard/subscription`

---

### 7.4 CUSTOMER MODULE

#### 7.4.1 CustomerDashboardPage (`/customer`)
- **Tên hiển thị**: Trang khách hàng
- **Roles**: Customer
- **CRUD**: READ only
- **Sections**:
  - Order History (10 recent) → `GET /sales/orders`
  - Loyalty Points Summary → `GET /crm/customers/{id}/loyalty-summary`
  - Loyalty Transactions → `GET /crm/customers/{id}/loyalty-transactions`

#### 7.4.2 CustomerOrderDetailPage (`/customer/orders/:orderId`)
- **Tên hiển thị**: Chi tiết đơn hàng
- **Roles**: Customer
- **CRUD**: READ → `GET /sales/orders/{id}`

---

### 7.5 ADMIN MODULE

#### 7.5.1 SuperAdminPage (`/admin`)
- **Tên hiển thị**: Quản trị hệ thống
- **Roles**: SuperAdmin
- **3 Sections**:

| Section | Tên | CRUD | API Endpoints |
|---------|-----|------|---------------|
| Users | Quản lý người dùng | CREATE, READ, UPDATE, DELETE | `GET/POST/PUT/DELETE /identity/admin/users` |
| Plan Reviews | Đánh giá gói dịch vụ | READ, DELETE | `GET /saas/plan-reviews/admin/dashboard`, `GET /saas/plan-reviews/admin`, `DELETE /saas/plan-reviews/admin/{id}` |
| Plans | Gói dịch vụ | READ | `GET /saas/subscriptions/plans` |
| Check Expiry | Kiểm tra hết hạn | ACTION | `POST /saas/subscriptions/check-expiry?days=7` |

---

### 7.6 FEEDBACK MODULE

#### 7.6.1 FeedbackPage (`/feedback/:orderId`)
- **Tên hiển thị**: Phản hồi đơn hàng
- **Roles**: Public (không cần đăng nhập)
- **Params**: URL param `orderId`, query params `customerId`, `storeId`
- **CRUD**: CREATE → `POST /crm/feedback/public/{orderId} { customerId, storeId, rating, content }`
- **UI**: 5-star rating + text comment → submit

---

### 7.7 HOME MODULE

#### 7.7.1 HomePage (`/`)
- **Tên hiển thị**: Trang chủ (Landing Page)
- **Roles**: Public
- **Features**: Hero section, features showcase, pricing, chatbot widget
- **Chatbot API**: `POST /saas/chatbot`, `GET /saas/chatbot/suggestions`

---

## 8. State Management

### 8.1 Zustand Stores

| Store | File | Persist? | Mô tả |
|-------|------|----------|--------|
| `useAuthStore` | `shared/store/authStore.ts` | ✅ localStorage | User, token, isAuthenticated |
| `useStoreStore` | `shared/store/storeStore.ts` | ✅ localStorage | Current store (multi-store switching) |
| `useAppTheme` | `shared/store/themeStore.ts` | localStorage manual | Dark mode toggle |
| `useFeatureGateStore` | `shared/store/featureGateStore.ts` | ❌ | Subscription upgrade modal state |
| `useDashboardEventsStore` | `shared/store/dashboardEventsStore.ts` | ❌ | Order created event (cross-component refresh) |

### 8.2 Multi-Store Switching Flow

```
1. StoreSelector component → liệt kê stores từ:
   - GET /identity/user-stores/stores-my (UserStore[])
   - GET /saas/stores/my-owned-stores (Store[])
2. User chọn store → useStoreStore.switchStore(store)
3. switchStore() → POST /identity/auth/refresh-access?storeId=xxx
   → Lấy accessToken mới chứa store_id claim
   → Cập nhật localStorage("token") + authStore
4. Tất cả API tiếp theo tự động dùng token mới (interceptor gắn Bearer)
```

---

## 9. Trial & Subscription Feature Gating (QUAN TRỌNG)

Đây là cơ chế **khóa tính năng** dựa trên trạng thái subscription. Mobile **BẮT BUỘC** phải implement đồng bộ.

### 9.1 Tổng quan trạng thái Subscription

```
User Status Flow:
  Registered → PotentialOwner (chưa có store)
       ↓
  Start Trial → Trial (dùng thử miễn phí, có thời hạn)
       ↓
  Trial hết hạn → trial_expired = true (BỊ LOCK features)
       ↓
  Mua plan → Active (đầy đủ tính năng)
       ↓
  Plan hết hạn → subscription_expired = true (BỊ LOCK features)
```

### 9.2 Cách đọc trạng thái từ JWT Token

Token chứa các claims liên quan subscription:

```typescript
// Decode JWT payload
{
  status: "Registered" | "Active" | "Trial" | "Inactive" | "Suspended",
  store_id: "xxx" | "",           // rỗng = chưa có store
  trial_expired: "true" | "false",
  trial_end_date: "2026-04-01T00:00:00Z",
  trial_days_remaining: "5",
  subscription_expired: "true" | "false",
  subscription_end_date: "2026-12-31T00:00:00Z"
}
```

**Cách check nhanh (client-side, không cần gọi API):**

```typescript
// 1. Đang trial?
isTrial = (status === "Trial")

// 2. Trial hết hạn?
isTrialExpired = (status === "Trial" && trial_expired === "true")

// 3. Subscription active?
isActiveSubscription = (status === "Active")

// 4. Subscription hết hạn?
isSubscriptionExpired = (subscription_expired === "true")

// 5. Chưa có store?
hasNoStore = (!store_id || store_id === "" || status === "Registered")
```

### 9.3 Cơ chế Feature Gating (3 tầng)

#### Tầng 1: Server-side 403 Response (Bắt buộc handle)

Khi user gọi API mà **không đủ quyền subscription**, server trả HTTP **403** với body:

```json
// Case 1: Trial hết hạn
{
  "error": "TrialExpired",
  "message": "Thời gian dùng thử đã hết. Vui lòng mua gói để tiếp tục sử dụng."
}

// Case 2: Subscription hết hạn  
{
  "error": "SubscriptionExpired",
  "message": "Gói dịch vụ của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng."
}

// Case 3: Feature không có trong gói hiện tại
{
  "error": "FeatureNotAvailable",
  "message": "Tính năng này không khả dụng trong gói hiện tại của bạn.",
  "currentPlan": "Basic",           // Gói hiện tại
  "requiredPlan": "Professional",    // Gói tối thiểu cần có
  "feature": "Inventory Management"  // Tên tính năng bị lock
}
```

**Mobile cần:** Intercept tất cả HTTP 403, parse body, hiện dialog/bottomsheet tương ứng:

| Error Code | Tiêu đề dialog | Nội dung | Action |
|-----------|----------------|----------|--------|
| `TrialExpired` | "Thời gian dùng thử đã hết" | `message` từ server | Button "Nâng cấp gói ngay" → navigate Subscription |
| `SubscriptionExpired` | "Gói dịch vụ đã hết hạn" | `message` từ server | Button "Nâng cấp gói ngay" → navigate Subscription |
| `FeatureNotAvailable` | "Tính năng không khả dụng trong gói hiện tại" | `message` + "Gói hiện tại: {currentPlan}. Để sử dụng tính năng {feature}, vui lòng nâng cấp lên gói {requiredPlan} hoặc cao hơn." | Button "Nâng cấp gói ngay" → navigate Subscription |

Tất cả dialog đều có button "Để sau" (dismiss) + "Nâng cấp gói ngay" (navigate to subscription page).

#### Tầng 2: Client-side UI Gating (Sidebar Lock)

Sidebar kiểm tra `userStatus`:
- Nếu user **chưa có store** (`store_id` rỗng hoặc `status === "Registered"`):
  - Tất cả menu có `requiresStore: true` sẽ bị **LOCK** (hiện icon 🔒)
  - Click vào menu bị lock → hiện **Setup Store Dialog** thay vì navigate

```typescript
// Menu items với requiresStore flag
const menuItems = [
  { label: "Dashboard 360°", path: "/dashboard",        requiresStore: false },  // ✅ Luôn mở
  { label: "Timekeeping",    path: "/dashboard/timekeeping", requiresStore: true },  // 🔒 Lock nếu chưa có store
  { label: "My Tasks",       path: "/dashboard/my-tasks",   requiresStore: true },  // 🔒
  { label: "Staff",          path: "/dashboard/staff",      requiresStore: true },  // 🔒
  { label: "Stores",         path: "/dashboard/stores",     requiresStore: true },  // 🔒
  { label: "Products",       path: "/dashboard/products",   requiresStore: true },  // 🔒
  { label: "Inventory",      path: "/dashboard/inventory",  requiresStore: true },  // 🔒
  { label: "Sales & POS",    path: "/dashboard/sales",      requiresStore: true },  // 🔒
  { label: "Orders",         path: "/dashboard/orders",     requiresStore: true },  // 🔒
  { label: "Customers",      path: "/dashboard/customers",  requiresStore: true },  // 🔒
  { label: "CRM & Loyalty",  path: "/dashboard/crm",        requiresStore: true },  // 🔒
  { label: "Reports",        path: "/dashboard/reports",     requiresStore: true },  // 🔒
  { label: "Subscription",   path: "/dashboard/subscription",requiresStore: true },  // 🔒
  { label: "Settings",       path: "/dashboard/settings",    requiresStore: true },  // 🔒
];

// Lock logic
const isLocked = item.requiresStore && userStatus === "noStore";
// Nếu isLocked → hiện icon Lock, text màu xám, click → showSetupDialog
```

#### Tầng 3: UI Banner/Badge cảnh báo Trial

Web hiển thị các component cảnh báo tùy trạng thái:

| Component | Khi nào hiển thị | Giao diện |
|-----------|-----------------|-----------|
| **TrialBanner** (banner sticky top) | `status === "Trial"` && chưa expired | 🔵 Banner xanh: "Dùng thử miễn phí — Bạn còn {N} ngày dùng thử" + Button "Nâng cấp ngay" |
| **TrialBanner** (expired) | `status === "Trial"` && `trialExpired === true` | 🔴 Banner đỏ: "Hết hạn dùng thử — Thời gian dùng thử đã hết. Vui lòng mua gói để tiếp tục sử dụng." + Button "Nâng cấp ngay" |
| **TrialBanner** (subscription expired) | `subscriptionExpired === true` | 🔴 Banner đỏ: "Hết hạn gói đăng ký" + Button "Nâng cấp ngay" |
| **TrialBanner** (registered, no subscription) | `status === "Registered"` | 🔴 Banner đỏ: "Bạn chưa có gói đăng ký. Vui lòng mua gói để sử dụng." |
| **TrialWarningBadge** (compact) | `status === "Trial"` | Badge nhỏ: "Còn {N} ngày" (vàng) hoặc "Hết hạn" (đỏ nếu ≤ 3 ngày) |
| **SubscriptionStatusBadge** | `status === "Active"` | 🟢 Badge: "Đang hoạt động" |
| **SubscriptionStatusBadge** | `status === "Trial"` | 🔵 Badge: "Dùng thử" |
| **Subscription Expiry Warning** (Dashboard) | StoreOwner + subscription sắp hết hạn | Card cảnh báo trên DashboardPage |

**Mobile cần implement:**
1. Banner/bar cảnh báo trial ở đầu dashboard (dismiss được)
2. Badge trạng thái subscription ở header/profile
3. Cảnh báo khi trial sắp hết (≤ 3 ngày = đỏ, > 3 ngày = vàng)

### 9.4 Flow xử lý chi tiết cho Mobile

```
APP LAUNCH:
  1. Đọc token từ secure storage
  2. Decode JWT → lấy status, trial_expired, trial_days_remaining, store_id
  3. Hiển thị UI tương ứng:

  CASE status === "Registered" && !store_id:
    → Hiện onboarding: "Tạo cửa hàng" hoặc "Bắt đầu dùng thử"
    → Lock tất cả menu (trừ Dashboard)
    → Dashboard hiện CTA: "Bắt đầu dùng thử miễn phí"
    → API: POST /identity/subscription/start-trial { storeName }

  CASE status === "Trial" && trial_expired === "false":
    → Mở đầy đủ tính năng (giống Active)
    → Hiện TrialBanner: "Bạn còn {N} ngày dùng thử"
    → Nếu N ≤ 3: Banner đỏ, nhấn mạnh cần nâng cấp

  CASE status === "Trial" && trial_expired === "true":
    → Hiện Banner đỏ: "Hết hạn dùng thử"
    → FEATURES VẪN HIỆN trên UI nhưng khi gọi API sẽ nhận 403
    → Intercept 403 → hiện Upgrade Dialog
    → Chỉ Subscription page hoạt động bình thường (để user mua gói)

  CASE status === "Active":
    → Đầy đủ tính năng theo plan
    → Badge xanh: "Đang hoạt động"
    → Một số feature cao cấp có thể bị 403 "FeatureNotAvailable" nếu plan thấp

  CASE status === "Active" && subscription_expired === "true":
    → Giống trial expired: hiện banner đỏ + 403 khi gọi API
    → Navigate đến Subscription để gia hạn

  CASE status === "Inactive" hoặc "Suspended":
    → Block toàn bộ, chỉ cho xem profile + subscription
```

### 9.5 Subscription Upgrade Dialog - Mobile Implementation

```
┌──────────────────────────────────┐
│ ⚠️  {Title dựa trên errorType}   │
│                                    │
│  {message từ server}               │
│                                    │
│  [Nếu FeatureNotAvailable:]       │
│  Gói hiện tại: {currentPlan}      │
│  Để sử dụng tính năng {feature},  │
│  vui lòng nâng cấp lên gói       │
│  {requiredPlan} hoặc cao hơn.     │
│                                    │
│  ┌──────────┐  ┌───────────────┐  │
│  │  Để sau  │  │ Nâng cấp ngay │  │
│  └──────────┘  └───────────────┘  │
└──────────────────────────────────┘

Title mapping:
  TrialExpired        → "Thời gian dùng thử đã hết"
  SubscriptionExpired → "Gói dịch vụ đã hết hạn"
  FeatureNotAvailable → "Tính năng không khả dụng trong gói hiện tại"

Actions:
  "Để sau"         → dismiss dialog, quay lại màn hình trước
  "Nâng cấp ngay"  → navigate đến Subscription Plans screen
```

### 9.6 HTTP Interceptor Template (cho Mobile)

```
// Pseudo-code cho Mobile HTTP interceptor
onResponse(response):
  if response.statusCode === 403:
    body = parseJSON(response.body)
    errorCode = body.error
    
    if errorCode in ["TrialExpired", "SubscriptionExpired", "FeatureNotAvailable"]:
      showUpgradeDialog(
        errorType: errorCode,
        message: body.message,
        currentPlan: body.currentPlan,      // chỉ có khi FeatureNotAvailable
        requiredPlan: body.requiredPlan,     // chỉ có khi FeatureNotAvailable
        feature: body.feature               // chỉ có khi FeatureNotAvailable
      )
    else:
      // 403 thường (không phải feature gate) → xử lý bình thường
      handleForbiddenError()
```

---

## 10. API Endpoints tổng hợp

### 10.1 Identity Service (`/identity/...`)

| Method | Endpoint | Mô tả | Role |
|--------|----------|--------|------|
| POST | `/identity/auth/register` | Đăng ký | Public |
| POST | `/identity/auth/login` | Đăng nhập | Public |
| POST | `/identity/auth/external` | Google OAuth | Public |
| POST | `/identity/auth/verify-email` | Xác thực email OTP | Public |
| POST | `/identity/auth/resend-otp` | Gửi lại OTP | Public |
| POST | `/identity/auth/forgot-password` | Yêu cầu reset password | Public |
| POST | `/identity/auth/reset-password` | Reset password với OTP | Public |
| GET | `/identity/auth/me` | Lấy user claims | Authenticated |
| POST | `/identity/auth/refresh-access?storeId=` | Refresh token (switch store) | Authenticated |
| POST | `/identity/auth/change-password` | Đổi mật khẩu | Authenticated |
| POST | `/identity/auth/assign-store` | Gán store cho user | Authenticated |
| GET | `/identity/subscription/status` | Trạng thái subscription | Authenticated |
| POST | `/identity/subscription/start-trial` | Bắt đầu trial | PotentialOwner |
| POST | `/identity/staff/invite` | Mời nhân viên | StoreOwner, Manager |
| GET | `/identity/user-stores/stores-my` | DS stores của user | Authenticated |
| GET | `/identity/admin/users` | DS tất cả users | SuperAdmin |
| GET | `/identity/admin/users/{id}` | Chi tiết user | SuperAdmin |
| POST | `/identity/admin/users` | Tạo user | SuperAdmin |
| PUT | `/identity/admin/users/{id}` | Sửa user | SuperAdmin |
| DELETE | `/identity/admin/users/{id}` | Xóa user | SuperAdmin |

### 10.2 SaaS Service (`/saas/...`)

| Method | Endpoint | Mô tả | Role |
|--------|----------|--------|------|
| GET | `/saas/stores` | DS stores | Authenticated |
| GET | `/saas/stores/my-owned-stores` | DS stores sở hữu | StoreOwner |
| GET | `/saas/stores/my-store` | Store hiện tại | Authenticated |
| GET | `/saas/stores/{id}` | Chi tiết store | Authenticated |
| POST | `/saas/stores` | Tạo store | StoreOwner |
| PUT | `/saas/stores/{id}` | Sửa store | StoreOwner, Manager |
| GET | `/saas/subscriptions/plans` | DS plans | Public/Authenticated |
| POST | `/saas/subscriptions/purchase` | Mua plan | StoreOwner |
| GET | `/saas/subscriptions/my` | Subscription hiện tại | Authenticated |
| GET | `/saas/subscriptions/my-expiry` | Hạn subscription | Authenticated |
| GET | `/saas/subscriptions/store/{storeId}/status` | Status subscription per store | Authenticated |
| POST | `/saas/subscriptions/check-expiry?days=` | Check & notify expiry | SuperAdmin |
| GET | `/saas/payments/initiate?paymentId=&provider=` | Initiate payment | Authenticated |
| GET | `/saas/payments/{paymentId}/status` | Check payment status | Authenticated |
| POST | `/saas/chatbot` | Chat AI | Authenticated |
| GET | `/saas/chatbot/suggestions` | Gợi ý câu hỏi | Authenticated |
| GET | `/saas/plan-reviews/summary` | Tổng hợp reviews per plan | Public |
| POST | `/saas/plan-reviews` | Submit review | StoreOwner |
| GET | `/saas/plan-reviews/me/{planId}` | Review của mình | Authenticated |
| GET | `/saas/plan-reviews/plan/{planId}` | Reviews theo plan | Public |
| GET | `/saas/plan-reviews/plan/{planId}/summary` | Summary theo plan | Public |
| GET | `/saas/plan-reviews/admin/dashboard` | Admin dashboard reviews | SuperAdmin |
| GET | `/saas/plan-reviews/admin` | DS reviews (admin) | SuperAdmin |
| DELETE | `/saas/plan-reviews/admin/{id}` | Xóa review | SuperAdmin |

### 10.3 Sales Service (`/sales/...`)

| Method | Endpoint | Mô tả | Role |
|--------|----------|--------|------|
| GET | `/sales/Products` | DS sản phẩm (paginated) | Authenticated |
| GET | `/sales/Products/{id}` | Chi tiết sản phẩm | Authenticated |
| POST | `/sales/Products` | Tạo sản phẩm (FormData) | StoreOwner, Manager |
| PUT | `/sales/Products/{id}` | Sửa sản phẩm (FormData) | StoreOwner, Manager |
| DELETE | `/sales/Products/{id}` | Xóa sản phẩm | StoreOwner, Manager |
| GET | `/sales/Categories` | DS danh mục | Authenticated |
| POST | `/sales/Categories` | Tạo danh mục | StoreOwner, Manager |
| PUT | `/sales/Categories/{id}` | Sửa danh mục | StoreOwner, Manager |
| DELETE | `/sales/Categories/{id}` | Xóa danh mục | StoreOwner, Manager |
| GET | `/sales/orders` | DS đơn hàng (paginated) | Authenticated |
| GET | `/sales/orders/{id}` | Chi tiết đơn hàng | Authenticated |
| POST | `/sales/orders` | Tạo đơn hàng | Authenticated |
| PUT | `/sales/orders/{id}/status?status=` | Cập nhật trạng thái | StoreOwner, Manager |
| PUT | `/sales/orders/{id}/cancel` | Hủy đơn hàng | StoreOwner, Manager |
| GET | `/sales/inventory` | DS phiếu kho (paginated) | Authenticated |
| GET | `/sales/inventory/{id}` | Chi tiết phiếu kho | Authenticated |
| POST | `/sales/inventory` | Tạo phiếu kho | StoreOwner, Manager |
| PUT | `/sales/inventory/{id}/confirm` | Xác nhận phiếu | StoreOwner, Manager |
| PUT | `/sales/inventory/{id}/cancel` | Hủy phiếu | StoreOwner, Manager |
| DELETE | `/sales/inventory/{id}` | Xóa phiếu (Draft/Cancelled) | StoreOwner, Manager |
| POST | `/sales/notifications/low-stock-check?threshold=` | Check low stock email | StoreOwner, Manager |
| GET | `/sales/dashboard/overview` | Tổng quan doanh số | Authenticated |
| GET | `/sales/dashboard/revenue-chart` | Chart doanh thu | Authenticated |
| GET | `/sales/dashboard/top-products` | Top sản phẩm bán chạy | Authenticated |
| GET | `/sales/dashboard/order-status` | Phân bố trạng thái đơn | Authenticated |
| GET | `/sales/dashboard/inventory-summary` | Tổng kho | Authenticated |
| GET | `/sales/dashboard/recent-activity` | Hoạt động gần đây | Authenticated |

### 10.4 HR Service (`/hr/...`)

| Method | Endpoint | Mô tả | Role |
|--------|----------|--------|------|
| GET | `/hr/employees` | DS nhân viên | StoreOwner, Manager |
| GET | `/hr/employees/{id}` | Chi tiết nhân viên | StoreOwner, Manager |
| GET | `/hr/employees/me` | Thông tin nhân viên hiện tại | Authenticated |
| PUT | `/hr/employees/me` | Cập nhật profile | Authenticated |
| POST | `/hr/employees/me/avatar` | Upload avatar (FormData) | Authenticated |
| PUT | `/hr/employees/{id}` | Cập nhật nhân viên (owner) | StoreOwner, Manager |
| GET | `/hr/tasks` | DS tasks (store) | StoreOwner, Manager |
| GET | `/hr/tasks/me` | DS tasks của tôi | Authenticated |
| GET | `/hr/tasks/{id}` | Chi tiết task | Authenticated |
| POST | `/hr/tasks` | Tạo task | StoreOwner, Manager |
| PUT | `/hr/tasks/{id}` | Sửa task | StoreOwner, Manager |
| PUT | `/hr/tasks/{id}/status?status=` | Cập nhật trạng thái task | Authenticated |
| DELETE | `/hr/tasks/{id}` | Xóa task | StoreOwner, Manager |
| GET | `/hr/timekeeping/today` | Chấm công hôm nay | Authenticated |
| GET | `/hr/timekeeping` | Lịch sử chấm công | Authenticated |
| POST | `/hr/timekeeping/check-in` | Check-in | Authenticated |
| POST | `/hr/timekeeping/check-out` | Check-out | Authenticated |
| POST | `/hr/timekeeping/upload-selfie` | Upload selfie (FormData) | Authenticated |
| GET | `/hr/timekeeping/summary` | Thống kê chấm công tháng | StoreOwner, Manager |

### 10.5 CRM Service (`/crm/...`)

| Method | Endpoint | Mô tả | Role |
|--------|----------|--------|------|
| GET | `/crm/customers` | DS khách hàng (paginated) | Authenticated |
| GET | `/crm/customers/{id}` | Chi tiết khách hàng | Authenticated |
| POST | `/crm/customers` | Tạo khách hàng | Authenticated |
| PUT | `/crm/customers/{id}` | Sửa khách hàng | Authenticated |
| DELETE | `/crm/customers/{id}` | Xóa khách hàng | StoreOwner, Manager |
| GET | `/crm/customers/{id}/loyalty-summary` | Tổng loyalty | Authenticated |
| GET | `/crm/customers/{id}/loyalty-transactions` | Lịch sử loyalty | Authenticated |
| POST | `/crm/customers/{id}/redeem` | Quy đổi điểm | StoreOwner, Manager |
| GET | `/crm/customers/{id}/feedback` | Feedback theo khách | Authenticated |
| GET | `/crm/feedback` | DS feedback (paginated) | Authenticated |
| POST | `/crm/feedback` | Tạo feedback (staff) | Authenticated |
| POST | `/crm/feedback/public/{orderId}` | Feedback public (QR) | Public |
| GET | `/crm/feedback/summary` | Tổng hợp feedback | Authenticated |
| GET | `/crm/loyalty-rules` | DS loyalty rules | Authenticated |
| POST | `/crm/loyalty-rules` | Tạo loyalty rule | StoreOwner, Manager |
| PUT | `/crm/loyalty-rules/{id}` | Sửa loyalty rule | StoreOwner, Manager |
| DELETE | `/crm/loyalty-rules/{id}` | Xóa loyalty rule | StoreOwner, Manager |

---

## Phụ lục

### A. Status Enums

```
OrderStatus:        Pending | Processing | Completed | Cancelled | Refunded
TaskStatus:         Pending | InProgress | Completed | Cancelled
TaskPriority:       Low | Medium | High
InventoryTicketType:   Import | Export
InventoryTicketStatus: Draft | Confirmed | Cancelled
SubscriptionStatus: Registered | Active | Trial | Inactive | Suspended
UserStatus:         Registered | Active | Trial | Inactive | Suspended
```

### B. Payment Providers

| Provider | Flow |
|----------|------|
| **SePay** | QR Code bank transfer → poll payment status mỗi 5s |
| **VNPay** | Redirect tới VNPay gateway → callback `/payment/success` hoặc `/payment/failed` |

### C. Feature Gating (403 Response)

> ⚠️ **Xem chi tiết đầy đủ tại [Mục 9. Trial & Subscription Feature Gating](#9-trial--subscription-feature-gating-quan-trọng)**

Tóm tắt: Khi API trả 403 với body chứa `error`:
- `TrialExpired` → Modal "Hết hạn dùng thử"
- `SubscriptionExpired` → Modal "Hết hạn gói dịch vụ"  
- `FeatureNotAvailable` → Modal "Tính năng không khả dụng" (+ currentPlan, requiredPlan, feature)
- Sidebar lock 🔒 khi chưa có store
- TrialBanner / TrialWarningBadge / SubscriptionStatusBadge hiện UI cảnh báo

### D. Geocoding

- Sử dụng **Nominatim API** (OpenStreetMap) cho autocomplete địa chỉ
- store.latitude + store.longitude lưu GPS coordinates
- TimekeepingPage dùng `navigator.geolocation.getCurrentPosition()` và tính khoảng cách GPS

### E. Image Upload

- Products: `multipart/form-data` với field `ImageFile`
- Avatar: `multipart/form-data` với field `file`
- Timekeeping selfie: `multipart/form-data` với field `file`

### F. Pagination Format

```typescript
// Response format chung cho paginated endpoints
{
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

// Query params
?page=1&pageSize=20
```

### G. Store Selector

Hầu hết các trang dashboard đều có component `StoreSelector` ở header để chuyển đổi store. Khi chọn store mới:
1. Gọi `switchStore(store)` → refresh access token
2. Tất cả dữ liệu trên trang tự động reload (dựa vào `useEffect` watch `currentStore`)
