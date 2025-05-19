# Hotel Booking Website Workflow Documentation

## 1. Overview
The Hotel Booking Website is a full-stack web application built with:
- **Frontend**: Angular 17 (Latest Version)
- **Backend**: Supabase (Backend as a Service)
- **Database**: PostgreSQL (Hosted on Supabase)
- **UI Framework**: Angular Material Design
- **Authentication**: Supabase Auth
- **State Management**: Angular Services

## 2. Project Structure

### 2.1 Core Components
```
src/
├── app/
│   ├── components/
│   │   ├── auth/           # Authentication Components
│   │   │   ├── login/      # Login Component
│   │   │   └── signup/     # Signup Component
│   │   ├── hotels/         # Hotel Components
│   │   │   ├── list/       # Hotel List Component
│   │   │   └── details/    # Hotel Details Component
│   │   ├── bookings/       # Booking Components
│   │   │   ├── create/     # Create Booking Component
│   │   │   └── manage/     # Manage Bookings Component
│   │   └── shared/         # Shared Components
│   │       └── navabr/     # Footer Component
│___├── services/           # Application Services
        └── supabase.service.ts
```

## 3. Core Workflows

### 3.1 Authentication Flow
1. **Login Process**:
   ```typescript
   // 1. User enters credentials
   // 2. Form validation
   validateForm(): boolean {
     // Email validation
     // Password validation
   }

   // 3. Authentication request
   async login(email: string, password: string) {
     const { data, error } = await this.supabase.auth.signInWithPassword({
       email,
       password
     });
   }

   // 4. Handle response
   if (error) {
     // Show error message
   } else {
     // Store user data
     // Navigate to dashboard
   }
   ```

2. **Registration Process**:
   ```typescript
   // 1. User enters registration data
   // 2. Form validation
   validateRegistrationForm(): boolean {
     // Name validation
     // Email validation
     // Password validation
     // Password confirmation
   }

   // 3. Create account
   async signUp(email: string, password: string, userData: any) {
     const { data, error } = await this.supabase.auth.signUp({
       email,
       password,
       options: {
         data: userData
       }
     });
   }
   ```

### 3.2 Hotel Management Flow
1. **Hotel Listing**:
   ```typescript
   // 1. Fetch hotels
   async getHotels() {
     const { data, error } = await this.supabase
       .from('hotels')
       .select('*')
       .order('name');
   }

   // 2. Filter and search
   async searchHotels(query: string) {
     const { data, error } = await this.supabase
       .from('hotels')
       .select('*')
       .ilike('name', `%${query}%`);
   }
   ```

2. **Hotel Details**:
   ```typescript
   // 1. Fetch hotel details
   async getHotelDetails(hotelId: string) {
     const { data, error } = await this.supabase
       .from('hotels')
       .select(`
         *,
         rooms (*),
         amenities (*)
       `)
       .eq('id', hotelId)
       .single();
   }
   ```

### 3.3 Booking Process
1. **Room Selection**:
   ```typescript
   // 1. Check room availability
   async checkAvailability(roomId: string, dates: DateRange) {
     const { data, error } = await this.supabase
       .from('bookings')
       .select('*')
       .eq('room_id', roomId)
       .overlaps('check_in', dates);
   }

   // 2. Calculate price
   calculatePrice(room: Room, nights: number): number {
     return room.price_per_night * nights;
   }
   ```

2. **Booking Creation**:
   ```typescript
   // 1. Create booking
   async createBooking(bookingData: BookingData) {
     const { data, error } = await this.supabase
       .from('bookings')
       .insert([bookingData]);
   }

   // 2. Send confirmation
   async sendConfirmation(booking: Booking) {
     // Send email confirmation
   }
   ```

## 4. Services Implementation

### 4.1 SupabaseService
```typescript
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Authentication methods
  async signIn(email: string, password: string) {
    return await this.client.auth.signInWithPassword({
      email,
      password
    });
  }

  // Database operations
  async getHotels() {
    return await this.client
      .from('hotels')
      .select('*');
  }
}
```

### 4.2 AuthService
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user$ = new BehaviorSubject<User | null>(null);

  constructor(private supabase: SupabaseService) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    const { data: { user } } = await this.supabase.getUser();
    this.user$.next(user);
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.signIn(email, password);
    if (data?.user) {
      this.user$.next(data.user);
    }
    return { data, error };
  }
}
```

## 5. Database Schema

### 5.1 Tables Structure
```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR NOT NULL UNIQUE,
  full_name VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hotels Table
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  location JSONB,
  rating DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms Table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id),
  type VARCHAR NOT NULL,
  price_per_night DECIMAL NOT NULL,
  capacity INT NOT NULL,
  amenities JSONB
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  room_id UUID REFERENCES rooms(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status VARCHAR NOT NULL,
  total_price DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 6. Security Implementation

### 6.1 Authentication Guards
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.user$.pipe(
      map(user => {
        if (user) return true;
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
```

### 6.2 Data Protection
- Row Level Security (RLS) in Supabase
- Input validation
- XSS protection
- CSRF protection

## 7. User Experience

### 7.1 UI Components
- Responsive Material Design
- Loading indicators
- Error handling
- Success messages
- Form validation
- Confirmation dialogs

### 7.2 State Management
- Reactive forms
- Service-based state management
- Local storage for persistence
- Real-time updates

## 8. Testing Strategy

### 8.1 Unit Tests
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let supabaseService: jasmine.SpyObj<SupabaseService>;

  beforeEach(() => {
    supabaseService = jasmine.createSpyObj('SupabaseService', ['signIn']);
    service = new AuthService(supabaseService);
  });

  it('should login successfully', async () => {
    // Test implementation
  });
});
```

### 8.2 Integration Tests
- API integration tests
- Component integration tests
- End-to-end testing with Cypress

## 9. Future Enhancements

### 9.1 Planned Features
- Payment gateway integration
- Real-time chat support
- Mobile application
- Admin dashboard
- Analytics integration

### 9.2 Technical Improvements
- Performance optimization
- Caching implementation
- SEO optimization
- Progressive Web App (PWA) support 
