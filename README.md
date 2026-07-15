# 🛍️ ShopEase — React Native E-Commerce App

A full-featured e-commerce mobile app built with **Expo SDK 54**, **React Navigation 7**, **Redux Toolkit + RTK Query**, and **React Hook Form + Yup**. Connects to a MERN backend API.

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React Native 0.81 + Expo SDK 54 |
| Navigation | React Navigation 7 (Native Stack + Bottom Tabs) |
| State | Redux Toolkit + Redux Persist (AsyncStorage) |
| Server State | RTK Query |
| Forms & Validation | React Hook Form + Yup |
| Image Picker | expo-image-picker v17 |
| Animations | React Native Reanimated 4 |
| Gestures | React Native Gesture Handler |
| Payment | react-native-razorpay v3 (requires custom dev build) |
| Toast | react-native-toast-message |

---

## Quick Start

### 1. Install dependencies

```bash
cd EcommerceApp
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Replace with your machine's LAN IP (not localhost — phones can't reach it)
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.XXX:5000/api

# Razorpay test key (only needed for online payments)
EXPO_PUBLIC_RAZORPAY_KEY=rzp_test_XXXXXXXXXXXXXXX
```

> **Find your LAN IP:** `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows)
> Both your phone and dev machine must be on the same Wi-Fi network.

### 3. Start the backend

Make sure your MERN backend is running on port 5000.

### 4. Start Expo

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone.

---

## Project Structure

```
src/
├── AppEntry/         App root — Redux Provider + NavigationContainer + linking
├── api/              RTK Query slices (auth, products, cart, orders, …)
├── components/
│   ├── common/       AppButton, AppInput, SearchBar, SkeletonLoader, …
│   └── product/      ProductCard, ImageCarousel, ProductFilterSheet
├── constants/        BASE_URL, ORDER_STATUSES, SORT_OPTIONS, …
├── hooks/            useAuth, useCart, useWishlist, useToast, …
├── models/           All TypeScript interfaces + navigation param lists
├── navigation/
│   ├── RootNavigator.tsx   Auth vs Main routing
│   ├── AuthStack.tsx
│   ├── MainTabs.tsx        5-tab bottom navigator
│   ├── HomeStack.tsx
│   ├── CategoriesStack.tsx ← NEW (fixes Categories → ProductList navigation)
│   ├── WishlistStack.tsx   ← NEW (fixes Wishlist → ProductDetail navigation)
│   ├── CartStack.tsx
│   ├── ProfileStack.tsx
│   └── AdminStack.tsx
├── redux/            store + authSlice, cartSlice, wishlistSlice, themeSlice
├── screens/
│   ├── auth/         Login, Register, ForgotPassword, ResetPassword
│   ├── home/         Home, Categories, Search
│   ├── product/      ProductList, ProductDetail, AddReviewModal
│   ├── cart/         Cart
│   ├── checkout/     Checkout, OrderSuccess
│   ├── wishlist/     Wishlist
│   ├── orders/       OrderHistory, OrderDetail
│   ├── profile/      Profile, EditProfile, ChangePassword
│   ├── address/      AddressList, AddAddress, EditAddress
│   └── admin/        Dashboard, Users, Categories, Products, Orders (+Edit)
├── services/         razorpay.service.ts, storage.service.ts
├── theme/            colors, spacing, typography
├── utils/            formatCurrency, formatDate, extractErrorMessage, …
└── validations/      Yup schemas for all forms
```

---

## Features

### Authentication
- Register / Login with JWT
- Forgot Password (email link) + Reset Password via deep link
- Change Password
- Edit Profile with photo upload (expo-image-picker)
- Auto-logout on 401 (RTK Query base query)
- Persisted login via redux-persist + AsyncStorage

### Shopping
- Home screen — featured products, categories, pull-to-refresh
- Product list with infinite scroll, search, price/rating/sort filters
- Product detail — image carousel, specifications tab, reviews tab
- Add to Cart / Wishlist with optimistic updates
- Cart — quantity controls, remove item, clear all, price summary
- Checkout — address selector, COD + Razorpay payment

### Orders
- Order history with pagination
- Order detail with tracking stepper
- Cancel order (processing/confirmed status only)

### Admin Panel (role: admin only)
- Dashboard — stats (users, orders, revenue), latest orders
- Users — list, search, delete, promote/demote admin
- Categories — CRUD with image upload
- Products — CRUD with multi-image upload (up to 10), full edit form
- Orders — list by status, update order status

---

## Deep Links

The app handles `ecommerceapp://reset-password/:token` for password reset emails.

In `app.json` the scheme is already configured as `ecommerceapp`.

---

## Razorpay (Online Payments)

`react-native-razorpay` is a **native module** — it does **not** work in Expo Go.

To test online payments you need a custom dev build:

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

Or use EAS Build:

```bash
npx eas build --profile development --platform android
```

When running in Expo Go, selecting "Razorpay" at checkout will show a clear "not available" alert. COD works fine in Expo Go.

---

## Path Aliases

Configured in `babel.config.js` via `babel-plugin-module-resolver`:

| Alias | Path |
|---|---|
| `@api/*` | `src/api/*` |
| `@components/*` | `src/components/*` |
| `@screens/*` | `src/screens/*` |
| `@navigation/*` | `src/navigation/*` |
| `@redux/*` | `src/redux/*` |
| `@hooks/*` | `src/hooks/*` |
| `@models/*` | `src/models/*` |
| `@theme/*` | `src/theme/*` |
| `@constants/*` | `src/constants/*` |
| `@utils/*` | `src/utils/*` |
| `@validations/*` | `src/validations/*` |
| `@services/*` | `src/services/*` |

---

## Fixes Applied

| Area | Fix |
|---|---|
| Navigation | Added `CategoriesStack` and `WishlistStack` — Categories and Wishlist tabs now correctly navigate to `ProductList` and `ProductDetail` |
| Navigation | `ProductList` screen title is now dynamic (`route.params.title`) in all stacks |
| Navigation | Fixed all `getParent()` chains — Cart→HomeTab, Checkout→AddAddress, OrderSuccess→OrderDetail, Admin panel |
| Navigation | `RootNavigator` simplified — `Admin` stack always registered when authenticated |
| Navigation | `AdminStack` guarded with `useAuth` — non-admins are redirected back |
| Navigation | Deep link config added for `reset-password/:token` |
| Admin | `AdminEditProductScreen` fully rebuilt — form now populates via `reset()` after data loads, category selector, featured toggle, image replace |
| Image Picker | Updated all screens from deprecated `MediaTypeOptions.Images` to `'images'` |
| Razorpay | Service updated to detect native module availability; graceful error in Expo Go |
| Checkout | Razorpay "not available in Expo Go" alert shown instead of crash |
| Cart Hook | `useGetCartQuery` now correctly skips when user is not authenticated |
| Redux Persist | Removed incorrect `keyPrefix` (was causing double-prefix on AsyncStorage keys) |
| ProductDetail | "Buy Now" navigates to CartTab Checkout from any stack (HomeStack, CategoriesStack, WishlistStack) |
| SearchScreen | `headerShown: false` so screen manages its own header bar |
