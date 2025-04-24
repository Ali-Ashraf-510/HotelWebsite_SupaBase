import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css'],
})
export class BookingFormComponent implements OnInit {
  hotel: any;
  user: any;
  booking = { check_in: '', check_out: '' };
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

    const { data: userData } = await this.supabaseService.getCurrentUser();
    this.user = userData.user;
    this.loading = false;
  }

  async onSubmit() {
    if (!this.user) return;

    const checkIn = new Date(this.booking.check_in);
    const checkOut = new Date(this.booking.check_out);
    const nights = (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24);
    const totalPrice = nights * this.hotel.price_per_night;

    const { error } = await this.supabaseService.client
      .from('bookings')
      .insert({
        user_id: this.user.id,
        hotel_id: this.hotel.id,
        check_in: this.booking.check_in,
        check_out: this.booking.check_out,
        total_price: totalPrice,
        status: 'confirmed',
      });

    if (error) {
      alert('Error creating booking: ' + error.message);
    } else {
      alert('Booking confirmed!');
      this.router.navigate(['/hotels']);
    }
  }
}