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
import { User } from '@supabase/supabase-js';
import { Hotel, Room, Review } from '../../shared/types';

interface ReviewWithUser extends Review {
  user_email: string;
}

interface HotelWithRating extends Hotel {
  rating: number;
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
  hotel: HotelWithRating | null = null;
  rooms: Room[] = [];
  reviews: ReviewWithUser[] = [];
  user: { id: string; email: string } | null = null;
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
    this.supabaseService.currentUser.subscribe(async (user) => {
      if (user) {
        this.user = { id: user.id, email: user.email || '' };
      } else {
        this.user = null;
      }
    });
  }

  async loadData() {
    this.loading = true;
    try {
      const hotelId = this.route.snapshot.paramMap.get('id');
      if (!hotelId) throw new Error('Hotel ID not found');

      const { data: hotelData, error: hotelError } = await this.supabaseService.getHotelById(hotelId);
      if (hotelError) throw new Error(`Error loading hotel: ${hotelError}`);
      if (!hotelData) throw new Error('Hotel not found');
      
      const { data: reviewsData } = await this.supabaseService.client
        .from('reviews')
        .select('rating')
        .eq('hotel_id', hotelId);
      
      const averageRating = reviewsData?.length 
        ? reviewsData.reduce((acc, review) => acc + review.rating, 0) / reviewsData.length 
        : 0;

      this.hotel = { ...hotelData, rating: averageRating };

      const { data: roomsData, error: roomsError } = await this.supabaseService.getRoomsByHotelId(hotelId);
      if (roomsError) throw new Error(`Error loading rooms: ${roomsError}`);
      this.rooms = roomsData || [];

      const { data: reviewsWithUsers, error: reviewsError } = await this.supabaseService.client
        .from('reviews')
        .select('*, users(email)')
        .eq('hotel_id', hotelId);
      if (reviewsError) throw new Error(`Error loading reviews: ${reviewsError.message}`);
      
      this.reviews = reviewsWithUsers?.map(review => ({
        ...review,
        user_email: review.users?.email || 'Anonymous',
      })) || [];

    } catch (error: any) {
      console.error('Error in loadData:', error);
      this.showError(error.message);
    } finally {
      this.loading = false;
    }
  }

  selectRoom(room: Room) {
    this.selectedRoom = room === this.selectedRoom ? null : room;
  }

  async onSubmitReview() {
    if (!this.user || !this.hotel) {
      this.showError('Please log in to submit a review.');
      return;
    }

    if (!this.newReview.rating || !this.newReview.comment.trim()) {
      this.showError('Please provide both a rating and comment.');
      return;
    }

    this.reviewLoading = true;
    try {
      const { error } = await this.supabaseService.createReview({
        hotel_id: this.hotel.id,
        rating: this.newReview.rating,
        comment: this.newReview.comment.trim()
      });

      if (error) throw new Error(`Error submitting review: ${error}`);

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