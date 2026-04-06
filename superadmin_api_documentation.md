# 📋 360Retail — SuperAdmin API Documentation (Full)

> **Base URL (Gateway):** `https://api.360retail.site` (production) hoặc `http://localhost:5001` (dev)
> **Auth:** JWT Bearer Token — Role = `SuperAdmin`
> **Header:** `Authorization: Bearer <access_token>`

---

## 🏗️ Kiến trúc Microservices & Routing

| Service | Gateway Prefix | Downstream |
|---------|---------------|------------|
| **Identity** | `/identity/...` | `→ /api/...` trên `identity-api:8080` |
| **SaaS** | `/saas/...` | `→ /api/...` trên `saas-api:8080` |
| **Sales** | `/sales/...` | `→ /api/...` trên `sales-api:8080` |
| **HR** | `/hr/...` | `→ /api/...` trên `hr-api:8080` |
| **CRM** | `/crm/...` | `→ /api/...` trên `crm-api:8080` |

> [!IMPORTANT]
> Tất cả URL bên dưới là **Gateway URL** — đã bao gồm prefix service. Frontend gọi thẳng vào Gateway, không cần biết downstream.

---

## 🔐 Hệ thống Role trong 360Retail

| Role | Mô tả |
|------|--------|
| `SuperAdmin` | Quản trị toàn hệ thống — quản lý users, stores, plans, subscriptions, payments |
| `PotentialOwner` | User vừa đăng ký, chưa tạo store (có thể start trial) |
| `StoreOwner` | Chủ cửa hàng đã có store |
| `Manager` | Quản lý cửa hàng |
| `Staff` | Nhân viên cửa hàng |

### User Status Flow

```
Pending → (verify email) → PotentialOwner → (start trial) → Trial → (payment) → Active
                                                                  → (expired) → TrialExpired
```

---

## 📑 Đề xuất các Trang SuperAdmin Dashboard

| # | Trang | Mô tả | API liên quan |
|---|-------|--------|---------------|
| 1 | **Dashboard (Tổng quan)** | KPI cards + biểu đồ doanh thu + phân bổ gói | Overview, Revenue Chart, Plan Dist, Funnel |
| 2 | **Quản lý Users** | CRUD users, xem/sửa role, lock/unlock, tạo user | SuperAdmin Users API |
| 3 | **Quản lý Stores** | Danh sách tất cả stores, chỉnh sửa, xóa, xem subscription status | Stores + Dashboard Stores |
| 4 | **Quản lý Subscriptions** | Xem tất cả subscriptions, filter theo status/plan, hủy/gia hạn | Dashboard Subscriptions |
| 5 | **Quản lý Plans (Gói dịch vụ)** | CRUD service plans, bật/tắt plan | SuperAdmin Plans API |
| 6 | **Quản lý Payments** | Xem tất cả thanh toán, filter theo status/ngày | Dashboard Payments |
| 7 | **Reviews & Feedback** | Xem reviews, dashboard thống kê, xóa spam | PlanReviews Admin API |
| 8 | **Thông báo hết hạn** | Trigger email cho subscription sắp hết hạn | SubscriptionNotifications |
| 9 | **Analytics & Tracking** | Thống kê đăng ký, funnel landing→signup, page views | User Stats + Tracking |

---

## 🟢 1. AUTHENTICATION (Đăng nhập SuperAdmin)

### POST `/identity/auth/login`
> **Role:** Public (không cần auth)
> **Mô tả:** Đăng nhập để lấy JWT token

**Request Body:**
```json
{
  "email": "superadmin@360retail.com",
  "password": "SuperSecurePassword123"
}
```

**Response Body (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
  "expiresAt": "2026-04-07T18:00:00Z",
  "mustChangePassword": false,
  "profilePictureUrl": null
}
```

> [!TIP]
> JWT token chứa claims: `sub` (userId), `role` (SuperAdmin), `email`, `exp`. Không chứa `store_id` cho SuperAdmin.

---

### GET `/identity/auth/me`
> **Role:** Bất kỳ user đã auth
> **Mô tả:** Debug/kiểm tra JWT claims hiện tại

**Response (200):**
```json
[
  { "type": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", "value": "guid-user-id" },
  { "type": "http://schemas.microsoft.com/ws/2008/06/identity/claims/role", "value": "SuperAdmin" },
  { "type": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress", "value": "superadmin@360retail.com" }
]
```

---

### POST `/identity/auth/logout`
> **Role:** Bất kỳ user đã auth
> **Mô tả:** Blacklist JWT token hiện tại trên Redis

**Response (200):**
```json
{ "message": "Logged out successfully" }
```

---

## 🟢 2. DASHBOARD — TỔNG QUAN (Trang Dashboard)

### GET `/saas/super-admin/saas/dashboard/overview`
> **Role:** `SuperAdmin`
> **Cache:** 10 phút
> **Mô tả:** Tổng quan KPI cho dashboard cards

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 15000000,
    "monthlyRecurringRevenue": 3000000,
    "activeStores": 25,
    "trialStores": 10,
    "expiredStores": 5,
    "trialToPaidConversionRate": 45.5
  }
}
```

---

### GET `/saas/super-admin/saas/dashboard/revenue-chart`
> **Role:** `SuperAdmin`
> **Cache:** 10 phút

**Query Parameters:**
| Param | Type | Default | Mô tả |
|-------|------|---------|--------|
| `from` | `DateTime?` | 12 tháng trước | Ngày bắt đầu |
| `to` | `DateTime?` | Hiện tại | Ngày kết thúc |
| `groupBy` | `string` | `"month"` | Nhóm theo: `day`, `week`, `month` |

**Example:** `GET /saas/super-admin/saas/dashboard/revenue-chart?from=2025-01-01&to=2026-04-06&groupBy=month`

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "date": "2026-01", "revenue": 2500000 },
    { "date": "2026-02", "revenue": 3000000 },
    { "date": "2026-03", "revenue": 3500000 }
  ]
}
```

---

### GET `/saas/super-admin/saas/dashboard/plan-distribution`
> **Role:** `SuperAdmin`
> **Cache:** 10 phút
> **Mô tả:** Phân bổ stores theo gói dịch vụ (cho Pie/Donut chart)

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "planName": "Basic", "count": 15 },
    { "planName": "Pro", "count": 8 },
    { "planName": "Enterprise", "count": 2 }
  ]
}
```

---

### GET `/identity/super-admin/users/stats/registrations`
> **Role:** `SuperAdmin`
> **Mô tả:** Thống kê đăng ký mới theo ngày (cho Line chart)

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| `from` | `DateTime?` | 30 ngày trước |
| `to` | `DateTime?` | Hiện tại |

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "date": "2026-04-01", "count": 5 },
    { "date": "2026-04-02", "count": 3 },
    { "date": "2026-04-03", "count": 8 }
  ]
}
```

---

### GET `/identity/super-admin/users/stats/funnel/landing-to-signup`
> **Role:** `SuperAdmin`
> **Mô tả:** Conversion funnel: Landing Page Views → Sign-ups

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| `from` | `DateTime?` | 30 ngày trước |
| `to` | `DateTime?` | Hiện tại |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-04-01",
      "landingPageViews": 150,
      "signups": 12,
      "conversionRate": 8.0
    },
    {
      "date": "2026-04-02",
      "landingPageViews": 200,
      "signups": 18,
      "conversionRate": 9.0
    }
  ]
}
```

---

### GET `/identity/tracking/page-views/{date}`
> **Role:** `SuperAdmin`
> **Mô tả:** Lấy tổng page views cho ngày cụ thể

**Path Parameters:**
| Param | Type | Example |
|-------|------|---------|
| `date` | `string` | `2026-04-06` |

**Response (200):**
```json
{
  "success": true,
  "date": "2026-04-06",
  "count": 523
}
```

---

## 🟢 3. QUẢN LÝ USERS (Trang Users)

### GET `/identity/super-admin/users`
> **Role:** `SuperAdmin`
> **Mô tả:** Lấy danh sách tất cả users trong hệ thống

**Response (200):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "isActivated": true,
    "status": "Active",
    "storeId": "8fab1234-...",
    "roles": ["StoreOwner"]
  },
  {
    "id": "...",
    "email": "trial@example.com",
    "isActivated": true,
    "status": "Trial",
    "storeId": "...",
    "roles": ["StoreOwner"]
  }
]
```

> [!NOTE]
> **User Status values:** `Pending`, `PotentialOwner`, `Trial`, `Active`, `TrialExpired`, `Suspended`
> **Roles:** `SuperAdmin`, `PotentialOwner`, `StoreOwner`, `Manager`, `Staff`

---

### GET `/identity/super-admin/users/{id}`
> **Role:** `SuperAdmin`
> **Mô tả:** Xem chi tiết 1 user

**Path Param:** `id` — GUID userId

**Response (200):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "isActivated": true,
  "status": "Active",
  "storeId": "8fab1234-...",
  "roles": ["StoreOwner"]
}
```

---

### POST `/identity/super-admin/users`
> **Role:** `SuperAdmin`
> **Mô tả:** Tạo user mới (admin tạo)

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "StrongPass123!",
  "roleName": "StoreOwner"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | `string` | ✅ | Email hợp lệ |
| `password` | `string` | ✅ | 8-100 ký tự |
| `roleName` | `string` | ✅ | `SuperAdmin`, `PotentialOwner`, `StoreOwner`, `Manager`, `Staff` |

**Response (200):**
```json
{
  "id": "new-guid",
  "email": "newuser@example.com",
  "isActivated": true,
  "status": "Active",
  "storeId": null,
  "roles": ["StoreOwner"]
}
```

---

### PUT `/identity/super-admin/users/{id}`
> **Role:** `SuperAdmin`
> **Mô tả:** Cập nhật user (activation status, user status)

**Request Body (Partial Update):**
```json
{
  "isActivated": false,
  "status": "Suspended"
}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|--------|
| `isActivated` | `bool?` | ❌ | `null` = giữ nguyên. `false` = khóa tài khoản |
| `status` | `string?` | ❌ | `null` = giữ nguyên. Values: `Pending`, `PotentialOwner`, `Trial`, `Active`, `TrialExpired`, `Suspended` |

**Response (204 No Content):**
Không có body.

---

### DELETE `/identity/super-admin/users/{id}`
> **Role:** `SuperAdmin`
> **Mô tả:** Xóa user khỏi hệ thống

**Response (204 No Content):**
Không có body.

---

## 🟢 4. QUẢN LÝ STORES (Trang Stores)

### GET `/saas/super-admin/saas/dashboard/stores`
> **Role:** `SuperAdmin`
> **Cache:** 5 phút
> **Mô tả:** Danh sách chi tiết tất cả stores (bao gồm thông tin subscription)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "store-guid",
      "storeName": "Cửa hàng ABC",
      "address": "123 Nguyễn Trãi, Q5, HCM",
      "isActive": true,
      "createdAt": "2026-01-15T10:30:00Z",
      "ownerEmail": "owner@abc.com",
      "currentPlan": "Pro",
      "subscriptionStatus": "Active",
      "subscriptionEndDate": "2026-07-15T10:30:00Z"
    }
  ]
}
```

---

### GET `/saas/stores`
> **Role:** `SuperAdmin`
> **Mô tả:** Lấy tất cả stores (dạng đơn giản)

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| `includeInactive` | `bool` | `false` |

**Response (200):**
```json
[
  {
    "id": "store-guid",
    "storeName": "Cửa hàng ABC",
    "address": "123 Nguyễn Trãi",
    "phone": "0901234567",
    "latitude": 10.762622,
    "longitude": 106.660172,
    "isActive": true,
    "createdAt": "2026-01-15T10:30:00Z"
  }
]
```

---

### GET `/saas/stores/{id}`
> **Role:** `AllowAnonymous` (public)
> **Mô tả:** Xem chi tiết 1 store

**Response (200):**
```json
{
  "id": "store-guid",
  "storeName": "Cửa hàng ABC",
  "address": "123 Nguyễn Trãi",
  "phone": "0901234567",
  "latitude": 10.762622,
  "longitude": 106.660172,
  "isActive": true,
  "createdAt": "2026-01-15T10:30:00Z"
}
```

---

### PUT `/saas/stores/{id}`
> **Role:** `SuperAdmin` hoặc `StoreOwner` (owner store đó)
> **Mô tả:** Cập nhật thông tin store

**Request Body (Partial Update):**
```json
{
  "storeName": "Cửa hàng ABC Mới",
  "address": "456 Lý Tự Trọng, Q1",
  "phone": "0909876543",
  "isActive": false,
  "latitude": 10.776530,
  "longitude": 106.700981
}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|--------|
| `storeName` | `string?` | ❌ | `null` = giữ nguyên |
| `address` | `string?` | ❌ | Tối đa 500 ký tự |
| `phone` | `string?` | ❌ | Phone format |
| `isActive` | `bool?` | ❌ | `false` = deactivate store |
| `latitude` | `double?` | ❌ | -90 đến 90 |
| `longitude` | `double?` | ❌ | -180 đến 180 |

**Response (200):**
```json
{ "success": true, "message": "Cập nhật cửa hàng thành công" }
```

---

### DELETE `/saas/stores/{id}`
> **Role:** `SuperAdmin` hoặc `StoreOwner`
> **Mô tả:** Xóa store

**Response (200):**
```json
{ "success": true, "message": "Xóa cửa hàng thành công" }
```

---

## 🟢 5. QUẢN LÝ SUBSCRIPTIONS (Trang Subscriptions)

### GET `/saas/super-admin/saas/dashboard/subscriptions`
> **Role:** `SuperAdmin`
> **Mô tả:** Danh sách tất cả subscriptions (có filter)

**Query Parameters:**
| Param | Type | Mô tả |
|-------|------|--------|
| `status` | `string?` | Filter: `Active`, `Trial`, `Trialing`, `Expired`, `Cancelled`, `Pending` |
| `planId` | `Guid?` | Filter theo plan cụ thể |

**Example:** `GET /saas/super-admin/saas/dashboard/subscriptions?status=Active`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "sub-guid",
      "storeName": "Cửa hàng ABC",
      "planName": "Pro",
      "planPrice": 500000,
      "status": "Active",
      "startDate": "2026-01-15T10:30:00Z",
      "endDate": "2026-07-15T10:30:00Z"
    }
  ]
}
```

---

### PUT `/saas/super-admin/saas/dashboard/subscriptions/{id}/cancel`
> **Role:** `SuperAdmin`
> **Mô tả:** Admin hủy 1 subscription

**Response (200):**
```json
{
  "success": true,
  "message": "Đã hủy subscription cho store 'Cửa hàng ABC'"
}
```

**Error Responses:**
- `404`: `{ "success": false, "message": "Không tìm thấy gói đăng ký" }`
- `400`: `{ "success": false, "message": "Subscription đã bị hủy trước đó" }`

---

### PUT `/saas/super-admin/saas/dashboard/subscriptions/{id}/extend`
> **Role:** `SuperAdmin`
> **Mô tả:** Admin gia hạn subscription thêm N ngày

**Request Body:**
```json
{
  "days": 30
}
```

| Field | Type | Default | Mô tả |
|-------|------|---------|--------|
| `days` | `int` | `30` | Số ngày gia hạn thêm |

**Response (200):**
```json
{
  "success": true,
  "message": "Đã gia hạn thêm 30 ngày cho store 'Cửa hàng ABC'",
  "data": {
    "oldEndDate": "2026-07-15T10:30:00Z",
    "newEndDate": "2026-08-14T10:30:00Z"
  }
}
```

---

## 🟢 6. QUẢN LÝ PLANS / GÓI DỊCH VỤ (Trang Plans)

### GET `/saas/super-admin/saas/plans`
> **Role:** `SuperAdmin`
> **Mô tả:** Lấy tất cả plans (bao gồm inactive)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "plan-guid",
      "planName": "Basic",
      "price": 200000,
      "durationDays": 30,
      "features": "Quản lý kho, Bán hàng, Nhân sự (5 NV)",
      "isActive": true,
      "createdAt": "2025-06-01T00:00:00Z",
      "activeSubscriptions": 15
    },
    {
      "id": "plan-guid-2",
      "planName": "Pro",
      "price": 500000,
      "durationDays": 30,
      "features": "Tất cả Basic + CRM, AI Chatbot, Loyalty, 20 NV",
      "isActive": true,
      "createdAt": "2025-06-01T00:00:00Z",
      "activeSubscriptions": 8
    }
  ]
}
```

---

### GET `/saas/super-admin/saas/plans/{id}`
> **Role:** `SuperAdmin`
> **Mô tả:** Chi tiết 1 plan

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "plan-guid",
    "planName": "Basic",
    "price": 200000,
    "durationDays": 30,
    "features": "Quản lý kho, Bán hàng",
    "isActive": true,
    "createdAt": "2025-06-01T00:00:00Z",
    "totalSubscriptions": 20,
    "activeSubscriptions": 15
  }
}
```

---

### POST `/saas/super-admin/saas/plans`
> **Role:** `SuperAdmin`
> **Mô tả:** Tạo gói dịch vụ mới

**Request Body:**
```json
{
  "planName": "Enterprise",
  "price": 1200000,
  "durationDays": 30,
  "features": "Tất cả tính năng, Unlimited nhân viên, Priority support"
}
```

| Field | Type | Required | Default | Mô tả |
|-------|------|----------|---------|--------|
| `planName` | `string` | ✅ | — | Tên gói (unique) |
| `price` | `decimal` | ✅ | — | Giá (VNĐ) |
| `durationDays` | `int` | ❌ | `30` | Số ngày hiệu lực |
| `features` | `string?` | ❌ | `null` | Mô tả tính năng |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "new-plan-guid",
    "planName": "Enterprise",
    "price": 1200000,
    "durationDays": 30,
    "features": "...",
    "isActive": true,
    "createdAt": "2026-04-06T16:00:00Z"
  }
}
```

**Error:** `409 Conflict` nếu `planName` đã tồn tại.

---

### PUT `/saas/super-admin/saas/plans/{id}`
> **Role:** `SuperAdmin`
> **Mô tả:** Cập nhật plan (partial update)

**Request Body:**
```json
{
  "planName": "Basic Plus",
  "price": 250000,
  "durationDays": 60,
  "features": "Quản lý kho, Bán hàng, Nhân sự (10 NV)",
  "isActive": true
}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|--------|
| `planName` | `string?` | ❌ | `null`/empty = giữ nguyên |
| `price` | `decimal?` | ❌ | `null` = giữ nguyên |
| `durationDays` | `int?` | ❌ | `null` = giữ nguyên |
| `features` | `string?` | ❌ | `null` = giữ nguyên |
| `isActive` | `bool?` | ❌ | `null` = giữ nguyên |

**Response (200):**
```json
{
  "success": true,
  "data": { "...updated plan..." },
  "message": "Cập nhật gói dịch vụ thành công"
}
```

---

### DELETE `/saas/super-admin/saas/plans/{id}`
> **Role:** `SuperAdmin`
> **Mô tả:** Vô hiệu hóa plan (soft delete — chỉ set `isActive = false`)

> [!WARNING]
> **Không thể xóa** nếu plan còn active subscriptions!

**Response (200):**
```json
{ "success": true, "message": "Đã vô hiệu hóa gói dịch vụ" }
```

**Error (400):**
```json
{ "success": false, "message": "Không thể vô hiệu hóa — còn 5 subscriptions đang active" }
```

---

## 🟢 7. QUẢN LÝ PAYMENTS (Trang Payments)

### GET `/saas/super-admin/saas/dashboard/payments`
> **Role:** `SuperAdmin`
> **Mô tả:** Liệt kê tất cả thanh toán (có filter)

**Query Parameters:**
| Param | Type | Mô tả |
|-------|------|--------|
| `status` | `string?` | Filter: `Pending`, `Completed`, `Failed`, `Expired` |
| `from` | `DateTime?` | Từ ngày |
| `to` | `DateTime?` | Đến ngày |

**Example:** `GET /saas/super-admin/saas/dashboard/payments?status=Completed&from=2026-01-01`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "payment-guid",
      "storeName": "Cửa hàng ABC",
      "planName": "Pro",
      "amount": 500000,
      "status": "Completed",
      "provider": "VNPay",
      "paymentDate": "2026-03-15T14:30:00Z",
      "transactionCode": "14045123"
    },
    {
      "id": "payment-guid-2",
      "storeName": "Cửa hàng XYZ",
      "planName": "Basic",
      "amount": 200000,
      "status": "Completed",
      "provider": "SePay",
      "paymentDate": "2026-03-20T09:15:00Z",
      "transactionCode": "SEPAY-REF123"
    }
  ]
}
```

---

### GET `/saas/payments/{paymentId}/status`
> **Role:** `AllowAnonymous` (FE polls)
> **Mô tả:** Kiểm tra trạng thái 1 payment cụ thể

**Response (200):**
```json
{
  "success": true,
  "paymentId": "payment-guid",
  "status": "Completed",
  "amount": 500000,
  "paymentDate": "2026-03-15T14:30:00Z",
  "transactionCode": "14045123"
}
```

---

## 🟢 8. REVIEWS & FEEDBACK (Trang Reviews)

### GET `/saas/plan-reviews/admin`
> **Role:** `SuperAdmin`
> **Mô tả:** Xem tất cả reviews, filter theo plan/rating, có phân trang

**Query Parameters:**
| Param | Type | Default | Mô tả |
|-------|------|---------|--------|
| `planId` | `Guid?` | — | Filter theo plan |
| `rating` | `int?` | — | Filter: 1-5 |
| `page` | `int` | `1` | Trang |
| `pageSize` | `int` | `20` | Số items/trang |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "review-guid",
      "planId": "plan-guid",
      "planName": "Pro",
      "userId": "user-guid",
      "storeId": "store-guid",
      "storeName": "Cửa hàng ABC",
      "rating": 5,
      "content": "Rất tuyệt vời, quản lý kho hiệu quả!",
      "createdAt": "2026-03-20T10:00:00Z"
    }
  ]
}
```

---

### GET `/saas/plan-reviews/admin/dashboard`
> **Role:** `SuperAdmin`
> **Mô tả:** Dashboard tổng hợp thống kê reviews

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalReviews": 45,
    "overallAvgRating": 4.2,
    "reviewsThisMonth": 8,
    "perPlanStats": [
      {
        "planId": "plan-guid",
        "planName": "Basic",
        "avgRating": 4.0,
        "totalReviews": 20,
        "distribution": { "1": 1, "2": 2, "3": 3, "4": 6, "5": 8 }
      },
      {
        "planId": "plan-guid-2",
        "planName": "Pro",
        "avgRating": 4.5,
        "totalReviews": 25,
        "distribution": { "1": 0, "2": 1, "3": 2, "4": 8, "5": 14 }
      }
    ]
  }
}
```

---

### DELETE `/saas/plan-reviews/admin/{reviewId}`
> **Role:** `SuperAdmin`
> **Mô tả:** Xóa review spam/vi phạm

**Response (200):**
```json
{ "success": true, "message": "Đã xóa review thành công" }
```

---

## 🟢 9. THÔNG BÁO HẾT HẠN SUBSCRIPTION

### POST `/saas/subscriptions/check-expiry`
> **Role:** `SuperAdmin`
> **Mô tả:** Kiểm tra & gửi email cảnh báo cho subscriptions sắp hết hạn

**Query Parameters:**
| Param | Type | Default | Mô tả |
|-------|------|---------|--------|
| `daysAhead` | `int` | `3` | Kiểm tra subscription hết hạn trong N ngày tới |

**Response (200):**
```json
{
  "message": "Đã gửi thông báo cho 3 subscription sắp hết hạn",
  "count": 3,
  "details": [
    {
      "storeId": "store-guid",
      "storeName": "Cửa hàng ABC",
      "planName": "Pro",
      "endDate": "2026-04-08T10:30:00Z",
      "daysRemaining": 2,
      "ownerEmail": "owner@abc.com"
    }
  ]
}
```

---

## 🟢 10. QUẢN LÝ NHÂN VIÊN (Invite Staff)

### POST `/identity/staff/invite`
> **Role:** `SuperAdmin` hoặc `StoreOwner`
> **Mô tả:** Mời nhân viên vào store qua email

**Request Body:**
```json
{
  "email": "staff@example.com",
  "role": "Manager",
  "storeId": "store-guid"
}
```

| Field | Type | Required | Mô tả |
|-------|------|----------|--------|
| `email` | `string` | ✅ | Email nhân viên cần mời |
| `role` | `string` | ✅ | `Manager` hoặc `Staff` |
| `storeId` | `Guid` | ✅ | Store cần gán |

**Response (200):**
```json
{ "message": "Invitation sent successfully" }
```

---

## 📊 TỔNG HỢP: API MATRIX CHO SUPERADMIN

| # | Endpoint | Method | Gateway URL | Role |
|---|----------|--------|-------------|------|
| | **— AUTH —** | | | |
| 1 | Login | POST | `/identity/auth/login` | Public |
| 2 | Me (Debug) | GET | `/identity/auth/me` | Auth |
| 3 | Logout | POST | `/identity/auth/logout` | Auth |
| | **— DASHBOARD —** | | | |
| 4 | Overview KPI | GET | `/saas/super-admin/saas/dashboard/overview` | SuperAdmin |
| 5 | Revenue Chart | GET | `/saas/super-admin/saas/dashboard/revenue-chart` | SuperAdmin |
| 6 | Plan Distribution | GET | `/saas/super-admin/saas/dashboard/plan-distribution` | SuperAdmin |
| 7 | Registration Stats | GET | `/identity/super-admin/users/stats/registrations` | SuperAdmin |
| 8 | Funnel Stats | GET | `/identity/super-admin/users/stats/funnel/landing-to-signup` | SuperAdmin |
| 9 | Page Views | GET | `/identity/tracking/page-views/{date}` | SuperAdmin |
| | **— USERS —** | | | |
| 10 | List Users | GET | `/identity/super-admin/users` | SuperAdmin |
| 11 | Get User | GET | `/identity/super-admin/users/{id}` | SuperAdmin |
| 12 | Create User | POST | `/identity/super-admin/users` | SuperAdmin |
| 13 | Update User | PUT | `/identity/super-admin/users/{id}` | SuperAdmin |
| 14 | Delete User | DELETE | `/identity/super-admin/users/{id}` | SuperAdmin |
| | **— STORES —** | | | |
| 15 | Dashboard Stores | GET | `/saas/super-admin/saas/dashboard/stores` | SuperAdmin |
| 16 | List All Stores | GET | `/saas/stores` | SuperAdmin |
| 17 | Get Store | GET | `/saas/stores/{id}` | Public |
| 18 | Update Store | PUT | `/saas/stores/{id}` | SuperAdmin/Owner |
| 19 | Delete Store | DELETE | `/saas/stores/{id}` | SuperAdmin/Owner |
| | **— SUBSCRIPTIONS —** | | | |
| 20 | List Subscriptions | GET | `/saas/super-admin/saas/dashboard/subscriptions` | SuperAdmin |
| 21 | Cancel Subscription | PUT | `/saas/super-admin/saas/dashboard/subscriptions/{id}/cancel` | SuperAdmin |
| 22 | Extend Subscription | PUT | `/saas/super-admin/saas/dashboard/subscriptions/{id}/extend` | SuperAdmin |
| 23 | Check Expiring | POST | `/saas/subscriptions/check-expiry` | SuperAdmin |
| | **— PLANS —** | | | |
| 24 | List Plans | GET | `/saas/super-admin/saas/plans` | SuperAdmin |
| 25 | Get Plan | GET | `/saas/super-admin/saas/plans/{id}` | SuperAdmin |
| 26 | Create Plan | POST | `/saas/super-admin/saas/plans` | SuperAdmin |
| 27 | Update Plan | PUT | `/saas/super-admin/saas/plans/{id}` | SuperAdmin |
| 28 | Deactivate Plan | DELETE | `/saas/super-admin/saas/plans/{id}` | SuperAdmin |
| | **— PAYMENTS —** | | | |
| 29 | List Payments | GET | `/saas/super-admin/saas/dashboard/payments` | SuperAdmin |
| 30 | Payment Status | GET | `/saas/payments/{paymentId}/status` | Public |
| | **— REVIEWS —** | | | |
| 31 | Admin List Reviews | GET | `/saas/plan-reviews/admin` | SuperAdmin |
| 32 | Admin Dashboard | GET | `/saas/plan-reviews/admin/dashboard` | SuperAdmin |
| 33 | Admin Delete Review | DELETE | `/saas/plan-reviews/admin/{reviewId}` | SuperAdmin |
| | **— STAFF —** | | | |
| 34 | Invite Staff | POST | `/identity/staff/invite` | SuperAdmin/Owner |

---

## 🗺️ Luồng nghiệp vụ SuperAdmin

### Luồng 1: Đăng nhập → Xem dashboard
```
POST /identity/auth/login → lưu accessToken
GET /saas/super-admin/saas/dashboard/overview → KPI cards
GET /saas/super-admin/saas/dashboard/revenue-chart → biểu đồ doanh thu
GET /saas/super-admin/saas/dashboard/plan-distribution → pie chart
GET /identity/super-admin/users/stats/registrations → line chart đăng ký
GET /identity/super-admin/users/stats/funnel/landing-to-signup → funnel
```

### Luồng 2: Quản lý Users
```
GET /identity/super-admin/users → danh sách
GET /identity/super-admin/users/{id} → chi tiết
PUT /identity/super-admin/users/{id} → sửa status/activation
POST /identity/super-admin/users → tạo user mới
DELETE /identity/super-admin/users/{id} → xóa
```

### Luồng 3: Quản lý Stores
```
GET /saas/super-admin/saas/dashboard/stores → danh sách (có sub info)
PUT /saas/stores/{id} → cập nhật store
DELETE /saas/stores/{id} → xóa store
```

### Luồng 4: Quản lý Subscription
```
GET /saas/super-admin/saas/dashboard/subscriptions → danh sách
PUT .../subscriptions/{id}/cancel → hủy
PUT .../subscriptions/{id}/extend → gia hạn (body: { days: 30 })
POST /saas/subscriptions/check-expiry → gửi email cảnh báo hết hạn
```

### Luồng 5: CRUD Plans
```
GET /saas/super-admin/saas/plans → danh sách
POST /saas/super-admin/saas/plans → tạo mới
PUT /saas/super-admin/saas/plans/{id} → sửa
DELETE /saas/super-admin/saas/plans/{id} → vô hiệu hóa (soft)
```

### Luồng 6: Quản lý Reviews
```
GET /saas/plan-reviews/admin/dashboard → tổng quan review
GET /saas/plan-reviews/admin → list chi tiết (filter plan/rating)
DELETE /saas/plan-reviews/admin/{reviewId} → xóa spam
```

---

## ⚠️ Lưu ý quan trọng cho Frontend

1. **Tất cả request SuperAdmin** phải gửi kèm header `Authorization: Bearer <token>`
2. **Token decode** chứa `role: "SuperAdmin"` — dùng để phân quyền trên client
3. **SuperAdmin KHÔNG có `store_id`** trong JWT — khác với StoreOwner/Manager
4. **Response format** nhất quán: `{ success: true, data: ... }` hoặc `{ success: false, message: "..." }`
5. **Cache** một số endpoint Dashboard được cache 5-10 phút → không cần gọi liên tục
6. **Pagination** dùng `?page=1&pageSize=20` cho các list lớn (reviews)
7. **Partial Update** — gửi `null` cho field không muốn update
8. **Soft Delete** cho Plans — chỉ set `isActive = false`, không xóa thật
