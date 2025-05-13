# 🏨 HotelWebsite_SupaBase

[![Angular](https://img.shields.io/badge/Angular-17-red.svg)](https://angular.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Platform-blue.svg)](https://supabase.io/)
[![Deployed](https://img.shields.io/badge/Deployed-Vercel-black.svg)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg" alt="Status"/>
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg" alt="Version"/>
</div>

## 📋 Project Overview

HotelWebsite_SupaBase is a luxurious hotel booking web application built with Angular and integrated with Supabase for backend data management. The application allows users to browse hotels, book stays with date restrictions, process mock payments, and view their bookings. The design is elegant and modern, featuring a coral-to-pink gradient theme, Playfair Display for headings, and Poppins for body text.

This project is deployed on Vercel and is actively maintained on GitHub at [`github.com/Ali-Ashraf-510/HotelWebsite_SupaBase`](https://github.com/Ali-Ashraf-510/HotelWebsite_SupaBase).

---

## ✨ Features

### 🏠 Hotel Booking
- Select check-in and check-out dates
- Specify number of guests
- Calculate total price based on hotel's price per night

### 📅 Date Restrictions
- Restricted to current date (e.g., 25 April 2025)
- Maximum booking window of 5 days in the future (e.g., 30 April 2025)
- Dynamic date calculations

### 💳 Payment Simulation
- Multiple payment methods:
  - Credit/Debit Card
  - PayPal
  - Bank Transfer
- Credit card number formatting (e.g., `1234 5678 9012 3456`)

### 📱 User Features
- **My Bookings Page**: View booking history with details
  - Hotel name and location
  - Booking dates
  - Total price
  - Booking status
- **Luxurious Design**:
  - Glassmorphic UI
  - Smooth animations
  - Coral-to-pink gradient (`#ff6f61` to `#ff4081`)
  - Responsive layout
- **Supabase Integration**: Secure data management
- **User Authentication**: Required for bookings and viewing history

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | Angular 17 (Standalone Components) |
| Backend | Supabase (PostgreSQL) |
| Styling | Angular Material, Bootstrap, Custom CSS |
| Deployment | Vercel |
| Version Control | GitHub |

---

## 📁 Project Structure

```bash
HotelWebsite_SupaBase/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── booking-form/           # Component for booking a hotel stay
│   │   │   │   ├── booking-form.component.ts
│   │   │   │   ├── booking-form.component.html
│   │   │   │   └── booking-form.component.css
│   │   │   ├── my-bookings/            # Component for viewing user's bookings
│   │   │   │   ├── my-bookings.component.ts
│   │   │   │   ├── my-bookings.component.html
│   │   │   │   └── my-bookings.component.css
│   │   │   └── navbar/                 # Navbar component
│   │   │       ├── navbar.component.ts
│   │   │       ├── navbar.component.html
│   │   │       └── navbar.component.css
│   │   ├── services/
│   │   │   └── supabase.service.ts     # Service for Supabase client and API calls
│   │   ├── app.component.ts            # Root component
│   │   ├── app.routes.ts               # Routing configuration
│   │   └── styles.css                  # Global styles
├── angular.json                        # Angular configuration
├── package.json                        # Dependencies and scripts
└── README.md                           # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later)
- npm (v9 or later)
- Angular CLI (`npm install -g @angular/cli`)
- Git
- A Supabase account and project for backend data

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ali-Ashraf-510/HotelWebsite_SupaBase.git
```

2. Install dependencies:
```bash
cd HotelWebsite_SupaBase
npm install
```

3. Start the development server:
```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by Ali Ashraf
</div>






