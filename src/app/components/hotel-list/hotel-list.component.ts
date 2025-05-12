import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface Hotel {
  id: number;
  name: string;
  location: string;
  description: string;
  price_per_night: number;
  image_url: string;
  average_rating: number;
  rooms_count: number;
}

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './hotel-list.component.html',
  styleUrls: ['./hotel-list.component.css']
})
export class HotelListComponent implements OnInit {
  hotels: Hotel[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {
    this.fetchHotels();
  }

  private async fetchHotels() {
    try {
      this.isLoading = true;
      const { data, error } = await this.supabase.getHotels();
      
      if (error) {
        throw new Error(error);
      }

      if (!data) {
        throw new Error('No data received');
      }

      this.hotels = data;
      console.log('Fetched hotels:', this.hotels);
      
    } catch (error) {
      console.error('Error fetching hotels:', error);
      this.error = 'Failed to load hotels. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }

  getStarRating(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  trackByHotelId(index: number, hotel: Hotel): number {
    return hotel.id;
  }
}