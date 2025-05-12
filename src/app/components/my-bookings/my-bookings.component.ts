import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatChipsModule
  ],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  loading = true;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadBookings();
  }

  async loadBookings() {
    try {
      const { data: bookings, error } = await this.supabaseService.client
        .from('bookings')
        .select(`
          *,
          rooms (
            room_type,
            price_per_night,
            hotels (
              name,
              location,
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      this.bookings = bookings;
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      this.loading = false;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'cancelled':
        return 'warn';
      default:
        return 'default';
    }
  }

  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'failed':
        return 'warn';
      default:
        return 'default';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  async cancelBooking(bookingId: string) {
    try {
      const { error } = await this.supabaseService.client
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
      await this.loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  }
}