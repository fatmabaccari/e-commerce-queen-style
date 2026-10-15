# Queen Style Admin Dashboard

Next.js admin dashboard for Queen Style E-Commerce platform.

## Features

- 🔐 Authentication (JWT-based)
- 📦 Product Management (CRUD)
- 📁 Category Management (CRUD)
- 🛒 Order Management with status updates
- 🏷️ Discount Management (Percentage & Fixed)
- 📊 Stock Movement Tracking
- 📱 Responsive Design
- 🎨 Modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend API running on `http://localhost:5500` (or configure `NEXT_PUBLIC_API_URL`)

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:5500
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3001](http://localhost:3001) in your browser

## Project Structure

```
frontend/
├── app/
│   ├── dashboard/          # Admin dashboard pages
│   │   ├── products/       # Product management
│   │   ├── categories/     # Category management
│   │   ├── orders/         # Order management
│   │   ├── discounts/      # Discount management
│   │   └── stock-movements/ # Stock tracking
│   ├── login/              # Login page
│   └── layout.tsx          # Root layout
├── components/
│   └── DashboardLayout.tsx # Main dashboard layout with sidebar
├── lib/
│   ├── api.ts              # API client and endpoints
│   └── auth.ts             # Authentication utilities
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The dashboard connects to the backend API at `/api/v1`. All API calls are handled through the `lib/api.ts` file.

### Authentication

- Admin users sign in at `/login`
- JWT token is stored in cookies
- Token is automatically included in API requests
- Unauthorized requests redirect to login

## Features Overview

### Products
- List all products with search and pagination
- Create, edit, and delete products
- Filter by category

### Categories
- Manage product categories
- Support for parent/child categories
- Full CRUD operations

### Orders
- View all orders with filters
- Update order status
- Filter by status (pending, processing, shipped, delivered, cancelled)
- Pagination support

### Discounts
- Create percentage or fixed amount discounts
- Set start and end dates
- Filter active discounts
- Full CRUD operations

### Stock Movements
- Track stock changes
- Add or subtract inventory
- View movement history with reasons

## Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **date-fns** - Date formatting

## Notes

- The dashboard requires admin authentication
- All API endpoints require JWT token (except login)
- Session-based cart is handled on the backend
- File uploads for product images require multipart/form-data

