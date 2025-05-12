import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Hotel {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url: string;
}

interface Room {
  id: string;
  hotel_id: string;
  room_type: string;
  price_per_night: number;
  max_occupancy: number;
  description: string;
  image_url: string;
  is_available: boolean;
}

interface Review {
  id: string;
  hotel_id: string;
  user_id: string;
  rating: number;
  comment: string;
  user_email: string;
}

interface User {
  id: string;
  email: string;
}

@Component({
  selector: 'app-hotel-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './hotel-details.component.html',
  styleUrls: ['./hotel-details.component.css'],
})
export class HotelDetailsComponent implements OnInit {
  hotel: Hotel | null = null;
  rooms: Room[] = [];
  reviews: Review[] = [];
  user: User | null = null;
  newReview = { rating: 1, comment: '' };
  loading: boolean = false;
  reviewLoading: boolean = false;
  selectedRoom: Room | null = null;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const hotelId = this.route.snapshot.paramMap.get('id');
      if (!hotelId) throw new Error('Hotel ID not found');

      // Load hotel
      const { data: hotelData, error: hotelError } = await this.supabaseService.client
        .from('hotels')
        .select('*')
        .eq('id', hotelId)
        .single();
      if (hotelError) throw new Error(`Error loading hotel: ${hotelError.message}`);
      this.hotel = hotelData;

      // Load rooms
      const { data: roomsData, error: roomsError } = await this.supabaseService.client
        .from('rooms')
        .select('*')
        .eq('hotel_id', hotelId);
      if (roomsError) throw new Error(`Error loading rooms: ${roomsError.message}`);
      this.rooms = roomsData || [];

      // Load reviews
      const { data: reviewsData, error: reviewsError } = await this.supabaseService.client
        .from('reviews')
        .select('*, users(email)')
        .eq('hotel_id', hotelId);
      if (reviewsError) throw new Error(`Error loading reviews: ${reviewsError.message}`);
      this.reviews = reviewsData?.map(review => ({
        id: review.id,
        hotel_id: review.hotel_id,
        user_id: review.user_id,
        rating: review.rating,
        comment: review.comment,
        user_email: review.users.email,
      })) || [];

      // Load user
      const { data: userData, error: userError } = await this.supabaseService.getCurrentUser();
      if (userError) console.warn('Error loading user:', userError.message);
      this.user = userData?.user && userData.user.email ? { id: userData.user.id, email: userData.user.email } : null;
    } catch (error: any) {
      this.showError(error.message);
    } finally {
      this.loading = false;
    }
  }

  selectRoom(room: Room) {
    this.selectedRoom = room;
  }

  async onSubmitReview() {
    if (!this.user || !this.hotel) {
      this.showError('Please log in to submit a review.');
      return;
    }

    if (!this.newReview.rating || !this.newReview.comment.trim()) {
      this.showError('Please provide a rating and comment.');
      return;
    }

    this.reviewLoading = true;
    try {
      const { error } = await this.supabaseService.client.from('reviews').insert({
        user_id: this.user.id,
        hotel_id: this.hotel.id,
        rating: this.newReview.rating,
        comment: this.newReview.comment,
      });

      if (error) throw new Error(`Error submitting review: ${error.message}`);

      this.newReview = { rating: 1, comment: '' };
      await this.loadData();
      this.snackBar.open('Review submitted successfully!', 'Close', { duration: 3000 });
    } catch (error: any) {
      this.showError(error.message);
    } finally {
      this.reviewLoading = false;
    }
  }

  async deleteReview(reviewId: string) {
    if (!this.user) {
      this.showError('Please log in to delete a review.');
      return;
    }

    if (!confirm('Are you sure you want to delete this review?')) return;

    this.reviewLoading = true;
    try {
      const { error } = await this.supabaseService.client
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', this.user.id);

      if (error) throw new Error(`Error deleting review: ${error.message}`);

      await this.loadData();
      this.snackBar.open('Review deleted successfully!', 'Close', { duration: 3000 });
    } catch (error: any) {
      this.showError(error.message);
    } finally {
      this.reviewLoading = false;
    }
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
  }
}