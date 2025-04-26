# HotelWebsite_SupaBase

## Project Overview

HotelWebsite_SupaBase is a luxurious hotel booking web application built with Angular and integrated with Supabase for backend data management. The application allows users to browse hotels, book stays with date restrictions, process mock payments, and view their bookings. The design is elegant and modern, featuring a coral-to-pink gradient theme, Playfair Display for headings, and Poppins for body text.

This project is deployed on Vercel and is actively maintained on GitHub at `github.com/Ali-Ashraf-510/HotelWebsite_SupaBase`.

---

## Features

- **Hotel Booking**: Users can book a hotel stay by selecting check-in and check-out dates, specifying the number of guests, and calculating the total price based on the hotel's price per night.
- **Date Restrictions**: Booking dates are restricted to the current date (e.g., 25 April 2025) and a maximum of 5 days in the future (e.g., 30 April 2025), dynamically calculated.
- **Payment Simulation**: Supports mock payment processing with three methods: Credit/Debit Card, PayPal, and Bank Transfer. Credit card numbers are formatted with spaces every 4 digits (e.g., `1234 5678 9012 3456`).
- **My Bookings Page**: Users can view their booking history with details like hotel name, location, dates, total price, and status.
- **Luxurious Design**: Features a glassmorphic UI with smooth animations, a coral-to-pink gradient (`#ff6f61` to `#ff4081`) for buttons, and a responsive layout.
- **Supabase Integration**: Uses Supabase for managing hotel data and bookings with tables like `hotels` and `bookings`.
- **User Authentication**: Requires users to log in to book a stay or view their bookings.

---

## Tech Stack

- **Frontend**: Angular 17 (Standalone Components)
- **Backend**: Supabase (PostgreSQL database for storing hotels and bookings)
- **Styling**: Angular Material, Bootstrap (customized), Custom CSS with Playfair Display and Poppins fonts
- **Deployment**: Vercel
- **Version Control**: GitHub (`github.com/Ali-Ashraf-510/HotelWebsite_SupaBase`)

---

## Project Structure

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
│   │   │   └── navbar/                 # Navbar component (optional, for navigation)
│   │   │       ├── navbar.component.ts
│   │   │       ├── navbar.component.html
│   │   │       └── navbar.component.css
│   │   ├── services/
│   │   │   └── supabase.service.ts     # Service for Supabase client and API calls
│   │   ├── app.component.ts            # Root component
│   │   ├── app.routes.ts               # Routing configuration
│   │   └── styles.css                  # Global styles
├── angular.json                        # Angular configuration (budgets, build options)
├── package.json                        # Dependencies and scripts
└── README.txt                          # Project documentation

```


---

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later)
- npm (v9 or later)
- Angular CLI (`npm install -g @angular/cli`)
- Git
- A Supabase account and project for backend data

---






