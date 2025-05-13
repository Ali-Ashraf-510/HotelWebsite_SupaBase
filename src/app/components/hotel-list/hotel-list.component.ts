import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { RouterLink, ActivatedRoute } from '@angular/router';
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

interface SearchParams {
  location: string;
  guests: number;
  checkIn: string | null;
  checkOut: string | null;
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
  filteredHotels: Hotel[] = [];
  isLoading = true;
  error: string | null = null;
  searchParams: SearchParams = {
    location: '',
    guests: 1,
    checkIn: null,
    checkOut: null
  };

  constructor(
    private supabase: SupabaseService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get search parameters from URL
    this.route.queryParams.subscribe(params => {
      this.searchParams = {
        location: params['location'] || '',
        guests: params['guests'] ? parseInt(params['guests']) : 1,
        checkIn: params['checkIn'] || null,
        checkOut: params['checkOut'] || null
      };
      this.fetchHotels();
    });
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
      this.filterHotels();
      
    } catch (error) {
      console.error('Error fetching hotels:', error);
      this.error = 'Failed to load hotels. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }

  private filterHotels() {
    this.filteredHotels = this.hotels.filter(hotel => {
      // If location is specified, filter by location
      if (this.searchParams.location && 
          !hotel.location.toLowerCase().includes(this.searchParams.location.toLowerCase())) {
        return false;
      }
      return true;
    });
  }

  getStarRating(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  trackByHotelId(index: number, hotel: Hotel): number {
    return hotel.id;
  }
}