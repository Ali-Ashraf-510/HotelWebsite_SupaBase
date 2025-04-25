import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

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
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
  ],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css'],
})
export class BookingFormComponent implements OnInit {
  hotel: any;
  user: any;
  booking = { id: null, check_in: null, check_out: null, guests: 1 };
  payment = {
    method: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    paypalEmail: '',
  };
  loading: boolean = false;
  showPaymentSection: boolean = false;

  // Date Restrictions (Set Dynamically)
  minDate: Date;
  maxDate: Date;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService
  ) {
    // Set minDate to current date and maxDate to 5 days from current date
    this.minDate = new Date(); // Current date (25 April 2025 based on the system date)
    this.maxDate = new Date();
    this.maxDate.setDate(this.minDate.getDate() + 5); // 5 days from current date (30 April 2025)
  }

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
    this.user = userData?.user;
    this.loading = false;
  }

  // Format Credit Card Number (Add space every 4 digits)
  formatCardNumber() {
    let value = this.payment.cardNumber.replace(/\D/g, ''); // Remove non-digits
    value = value.substring(0, 16); // Limit to 16 digits
    this.payment.cardNumber = value
      .replace(/(\d{4})/g, '$1 ') // Add space every 4 digits
      .trim();
  }

  // Calculate Total Price Based on Check-in and Check-out Dates
  calculateTotalPrice(): number {
    if (!this.booking.check_in || !this.booking.check_out) {
      return 0;
    }

    const checkIn = new Date(this.booking.check_in);
    const checkOut = new Date(this.booking.check_out);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights * this.hotel.price_per_night;
  }

  // Submit Booking Form (Proceed to Payment)
  async onSubmit() {
    if (!this.user) {
      alert('Please log in to book your stay.');
      this.router.navigate(['/auth']);
      return;
    }

    if (!this.booking.check_in || !this.booking.check_out || !this.booking.guests) {
      alert('Please fill in all required fields.');
      return;
    }

    this.loading = true;

    // Save Initial Booking with "pending" Status
    const { data, error } = await this.supabaseService.client
      .from('bookings')
      .insert({
        user_id: this.user.id,
        hotel_id: this.hotel.id,
        check_in: this.booking.check_in,
        check_out: this.booking.check_out,
        total_price: this.calculateTotalPrice(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      alert('Error creating booking: ' + error.message);
      this.loading = false;
      return;
    }

    // Store the booking ID to update the status later
    this.booking.id = data.id;
    this.showPaymentSection = true;
    this.loading = false;

    // Scroll to Payment Section
    setTimeout(() => {
      document.querySelector('.payment-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // Submit Payment Form (Mock Payment Processing)
  async onSubmitPayment() {
    if (this.payment.method === 'credit_card') {
      if (!this.payment.cardNumber || !this.payment.expiryDate || !this.payment.cvv || !this.payment.cardholderName) {
        alert('Please fill in all credit card details.');
        return;
      }
    } else if (this.payment.method === 'paypal') {
      if (!this.payment.paypalEmail) {
        alert('Please provide a PayPal email.');
        return;
      }
    }

    // Mock Payment Processing
    this.loading = true;
    setTimeout(async () => {
      // Update Booking Status to "confirmed"
      const { error } = await this.supabaseService.client
        .from('bookings')
        .update({
          status: 'confirmed',
        })
        .eq('id', this.booking.id);

      if (error) {
        console.error('Error updating booking status:', error);
        alert('There was an error processing your payment. Please try again.');
      } else {
        alert('Booking confirmed! Thank you for your reservation. View your bookings now!');
        this.router.navigate(['/my-bookings']);
      }
      this.loading = false;
    }, 2000); // Simulate a 2-second payment processing delay
  }
}