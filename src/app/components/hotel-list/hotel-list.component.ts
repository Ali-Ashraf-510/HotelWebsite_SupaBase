import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
})
export class HotelListComponent implements OnInit {
  hotels: any[] = [];
  loading: boolean = false;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    this.loading = true;
    const { data, error } = await this.supabaseService.client
      .from('hotels')
      .select('*');
    if (error) {
      console.error(error);
    } else {
      this.hotels = data;
    }
    this.loading = false;
  }
}