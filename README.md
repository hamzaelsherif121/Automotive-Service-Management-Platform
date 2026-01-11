# 🚗 Automotive Service Management Platform

A comprehensive, full-stack web application for managing automotive service operations, specifically designed for Opel vehicle workshops. Built with modern technologies and featuring a beautiful Arabic RTL interface.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

### 📅 Customer Booking System
- **Multi-step Booking Form**: Intuitive wizard-style booking with real-time validation
- **Opel Model Selection**: Comprehensive list of Opel models with year specifications
- **Service Selection**: Choose from multiple maintenance services
- **Time Slot Management**: Available appointment slots with conflict prevention
- **Form Validation**: Robust validation using Zod schema and React Hook Form
- **Confirmation Actions**: WhatsApp integration and Google Calendar event creation

### 🛠️ Admin Dashboard
- **Secure Authentication**: Protected admin panel with session management
- **Interactive Calendar**: Monthly view with booking indicators and day details
- **Today's Work Overview**: Quick view of daily scheduled appointments
- **Booking Management**: 
  - Update booking status (Pending → Confirmed → Completed/Cancelled)
  - Reschedule appointments with automatic status update
  - Delete bookings with confirmation
  - WhatsApp quick contact for each customer
- **Advanced Filtering**: Filter bookings by status, date range, phone number, and ticket ID
- **Real-time Notifications**: Browser audio alerts for new bookings
- **Telegram Integration**: Instant notifications for new reservations

### 📦 Parts Inventory Management
- **Full CRUD Operations**: Add, edit, and delete spare parts
- **Stock Tracking**: Monitor availability status (Available/Out of Stock)
- **Low Stock Alerts**: Visual indicators for inventory management
- **Excel Export**: Export all bookings and parts data to Excel spreadsheets

### 🌐 Public Pages
- **Services Catalog**: Detailed list of available maintenance services
- **Rare Parts Finder**: Specialized page for hard-to-find Opel parts
- **Offers Page**: Current promotions and special deals
- **Contact Page**: Workshop location and contact information
- **SEO Optimized**: Dynamic sitemap and meta tags

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16.1 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | Supabase (PostgreSQL) |
| **Styling** | TailwindCSS 4 |
| **UI Components** | Radix UI Primitives |
| **Forms** | React Hook Form + Zod |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Date Handling** | date-fns, dayjs |
| **Notifications** | Sonner (Toast) |
| **Excel Export** | XLSX |

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hamzaelsherif121/Automotive-Service-Management-Platform.git
   cd Automotive-Service-Management-Platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_telegram_chat_id
   ```

4. **Set up Supabase database**
   
   Run the SQL commands from `supabase_rls_policies.sql` in your Supabase SQL editor to set up the required tables and Row Level Security policies.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/
│   ├── admin/           # Admin dashboard
│   ├── api/             # API routes (admin, book, lead)
│   ├── booking/         # Customer booking page
│   ├── contact/         # Contact information
│   ├── models/          # Opel models showcase
│   ├── offers/          # Current offers
│   ├── rare-parts/      # Rare parts finder
│   ├── services/        # Services catalog
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Homepage
│   └── sitemap.ts       # Dynamic sitemap
├── components/
│   ├── layout/          # Header, Footer, Navigation
│   └── ui/              # Reusable UI components
├── lib/
│   └── supabase/        # Supabase client configuration
├── public/              # Static assets
└── middleware.ts        # Route middleware
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control via Supabase
- **Session Management**: Secure admin authentication
- **Input Validation**: Server and client-side validation with Zod
- **API Route Protection**: Middleware-based route guarding

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices
- 📟 Tablets
- 💻 Desktop screens
- 🖥️ Large displays

## 🌍 Localization

- **Primary Language**: Arabic (العربية)
- **Text Direction**: RTL (Right-to-Left) support
- **Date Formatting**: Arabic locale with date-fns

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 📞 Contact

For inquiries about this project, please reach out through the repository's issue tracker.

---

<p align="center">
  Built with ❤️ using Next.js and Supabase
</p>
