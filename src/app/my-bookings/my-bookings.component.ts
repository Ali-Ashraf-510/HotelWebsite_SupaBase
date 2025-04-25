import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css'],
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  user: any;
  loading: boolean = false;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}
  async cancelBooking(bookingId: number) {
    const confirmed = confirm('Are you sure you want to cancel this booking?');
    if (!confirmed) return;
  
    const { error } = await this.supabaseService.client
      .from('bookings')
      .delete()
      .eq('id', bookingId);
  
    if (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking.');
      return;
    }
  
    // Remove from local list
    this.bookings = this.bookings.filter(b => b.id !== bookingId);
  }
  
  async ngOnInit() {
    this.loading = true;

    // Check if User is Logged In
    const { data: userData } = await this.supabaseService.getCurrentUser();
    this.user = userData?.user;

    if (!this.user) {
      this.router.navigate(['/auth']);
      this.loading = false;
      return;
    }

    // Fetch User's Bookings with Hotel Details
    const { data, error } = await this.supabaseService.client
      .from('bookings')
      .select(`
        *,
        hotels (name, location, price_per_night)
      `)
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      this.loading = false;
      return;
    }

    this.bookings = data;
    this.loading = false;
  }

  // Navigate to Booking Form for a New Booking
  bookAnother() {
    this.router.navigate(['/hotels']);
  }
}