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
  ],
  templateUrl: './hotel-details.component.html',
  styleUrls: ['./hotel-details.component.css'],
})
export class HotelDetailsComponent implements OnInit {
  hotel: any;
  reviews: any[] = [];
  user: any;
  newReview = { rating: 1, comment: '' };
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    this.loading = true;
    const hotelId = this.route.snapshot.paramMap.get('id');
    const { data: hotelData } = await this.supabaseService.client
      .from('hotels')
      .select('*')
      .eq('id', hotelId)
      .single();
    this.hotel = hotelData;

    const { data: reviewsData } = await this.supabaseService.client
      .from('reviews')
      .select('*, users(email)')
      .eq('hotel_id', hotelId);
    this.reviews = reviewsData?.map(review => ({
      ...review,
      user_email: review.users.email,
    })) || [];

    const { data: userData } = await this.supabaseService.getCurrentUser();
    this.user = userData.user;
    this.loading = false;
  }

  async onSubmitReview() {
    if (!this.user) return;

    const { error } = await this.supabaseService.client
      .from('reviews')
      .insert({
        user_id: this.user.id,
        hotel_id: this.hotel.id,
        rating: this.newReview.rating,
        comment: this.newReview.comment,
      });

    if (error) {
      alert('Error submitting review: ' + error.message);
    } else {
      this.newReview = { rating: 1, comment: '' };
      this.ngOnInit();
    }
  }
}