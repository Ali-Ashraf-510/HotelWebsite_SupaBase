export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  role?: string;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface Room {
  id: string;
  hotel_id: string;
  room_type: string;
  price_per_night: number;
  max_occupancy: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  created_at: string;
  deleted_at: string | null;
}

export interface Review {
  id: string;
  user_id: string;
  hotel_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

// Extended interfaces for detailed views
export interface BookingWithDetails extends Booking {
  user: User;
  room: Room & {
    hotel: Hotel;
  };
}

export interface ReviewWithDetails extends Review {
  user: User;
  hotel: Hotel;
}

export interface HotelWithDetails extends Hotel {
  rooms: Room[];
  reviews: Review[];
} 