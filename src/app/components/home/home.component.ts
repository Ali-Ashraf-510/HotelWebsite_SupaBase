import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SupabaseService } from '../../services/supabase.service';

interface Hotel {
  id: number;
  name: string;
  location: string;
  description: string;
  price_per_night: number;
  image_url: string;
  rating: number;
  rooms: any[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredHotels: Hotel[] = [];
  loading = false;
  error: string | null = null;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadFeaturedHotels();
  }

  private async loadFeaturedHotels() {
    try {
      this.loading = true;
      const { data, error } = await this.supabase.getHotels();
      
      if (error) throw error;
      
      // Get first 3 hotels as featured
      this.featuredHotels = (data || []).slice(0, 3);
      
    } catch (error) {
      console.error('Error loading featured hotels:', error);
      this.error = 'Failed to load featured hotels';
    } finally {
      this.loading = false;
    }
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }
}