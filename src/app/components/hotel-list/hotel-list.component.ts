import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { trigger, style, animate, transition } from '@angular/animations';

interface Hotel {
  id: number;
  name: string;
  location: string;
  price_per_night: number;
  image_url: string;
}

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './hotel-list.component.html',
  styleUrls: ['./hotel-list.component.css'],
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class HotelListComponent implements OnInit {
  hotels: Hotel[] = [];
  loading: boolean = false;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.fetchHotels();
  }

  async fetchHotels() {
    try {
      this.loading = true;
      const { data, error } = await this.supabaseService.client
        .from('hotels')
        .select('id, name, location, price_per_night, image_url');
      
      if (error) {
        console.error('Error fetching hotels:', error);
        return;
      }
      
      this.hotels = data || [];
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      this.loading = false;
    }
  }

  trackByHotelId(index: number, hotel: Hotel): number {
    return hotel.id;
  }
}