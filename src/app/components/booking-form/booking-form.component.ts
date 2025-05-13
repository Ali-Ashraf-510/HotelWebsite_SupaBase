import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

// Custom date formats
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class BookingFormComponent implements OnInit {
  hotel: any;
  selectedRoom: any;
  user: any;
  booking = { id: null, check_in: null, check_out: null, guests: 1 };
  payment = {
    method: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  };
  loading: boolean = false;
  showPaymentSection: boolean = false;
  minDate: Date;
  maxDate: Date;
  cardExpiryMinDate: Date;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService
  ) {
    this.minDate = new Date();
    this.maxDate = new Date();
    this.maxDate.setDate(this.minDate.getDate() + 5);
    this.cardExpiryMinDate = new Date(2025, 3, 1);
  }

  async ngOnInit() {
    this.loading = true;
    const hotelId = this.route.snapshot.paramMap.get('id');
    const roomId = this.route.snapshot.queryParamMap.get('roomId');

    if (hotelId && roomId) {
      await this.loadHotelAndRoom(hotelId, roomId);
    }

    const { data: userData } = await this.supabaseService.getCurrentUser();
    this.user = userData?.user;
    this.loading = false;
  }

  async loadHotelAndRoom(hotelId: string, roomId: string) {
    try {
      // Load hotel
      const { data: hotelData, error: hotelError } = await this.supabaseService.client
        .from('hotels')
        .select('*')
        .eq('id', hotelId)
        .single();
      
      if (hotelError) throw hotelError;
      this.hotel = hotelData;

      // Load room
      const { data: roomData, error: roomError } = await this.supabaseService.client
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (roomError) throw roomError;
      this.selectedRoom = roomData;
    } catch (error) {
      console.error('Error loading data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Data',
        text: 'Could not load hotel or room information.',
        confirmButtonText: 'OK',
      });
    }
  }

  formatCardNumber() {
    let value = this.payment.cardNumber.replace(/\D/g, '');
    value = value.substring(0, 16);
    this.payment.cardNumber = value
      .match(/.{1,4}/g)
      ?.join(' ')
      .trim() || value;
  }

  formatExpiryDate() {
    let value = this.payment.expiryDate.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length > 2) {
      this.payment.expiryDate = `${value.slice(0, 2)}/${value.slice(2)}`;
    } else {
      this.payment.expiryDate = value;
    }
  }

  calculateTotalPrice(): number {
    if (!this.booking.check_in || !this.booking.check_out || !this.selectedRoom) {
      return 0;
    }

    const checkIn = new Date(this.booking.check_in);
    const checkOut = new Date(this.booking.check_out);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    let total = nights * this.selectedRoom.price_per_night;
    if (this.booking.guests > this.selectedRoom.max_occupancy) {
      total += nights * 100 * (this.booking.guests - this.selectedRoom.max_occupancy);
    }

    return total;
  }

  async onSubmit() {
    if (!this.user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to book your stay.',
        confirmButtonText: 'Go to Login',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/auth']);
        }
      });
      return;
    }

    if (!this.booking.check_in || !this.booking.check_out || !this.booking.guests || !this.selectedRoom) {
      Swal.fire({
        icon: 'error',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields.',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.loading = true;

    const { data, error } = await this.supabaseService.client
      .from('bookings')
      .insert({
        user_id: this.user.id,
        room_id: this.selectedRoom.id,
        check_in: this.booking.check_in,
        check_out: this.booking.check_out,
        total_price: this.calculateTotalPrice(),
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Booking Error',
        text: 'Error creating booking: ' + error.message,
        confirmButtonText: 'OK',
      });
      this.loading = false;
      return;
    }

    this.booking.id = data.id;
    this.showPaymentSection = true;
    this.loading = false;

    Swal.fire({
      icon: 'success',
      title: 'Booking Submitted',
      text: 'Proceed to payment.',
      confirmButtonText: 'OK',
    });

    setTimeout(() => {
      document.querySelector('.payment-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  async onSubmitPayment() {
    if (
      !this.payment.cardNumber ||
      !this.payment.expiryDate ||
      !this.payment.cvv ||
      !this.payment.cardholderName
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Incomplete Payment Details',
        text: 'Please fill in all credit card details.',
        confirmButtonText: 'OK',
      });
      return;
    }

    const cardNumberDigits = this.payment.cardNumber.replace(/\s/g, '');
    if (cardNumberDigits.length !== 16) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Card Number',
        text: 'Card number must be 16 digits.',
        confirmButtonText: 'OK',
      });
      return;
    }

    const [month, year] = this.payment.expiryDate.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (isNaN(expiryDate.getTime()) || expiryDate < this.cardExpiryMinDate) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Expiry Date',
        text: 'Invalid or expired card date. Expiry must be April 2025 or later.',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (!/^\d{3,4}$/.test(this.payment.cvv)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid CVV',
        text: 'CVV must be 3 or 4 digits.',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.loading = true;
    setTimeout(async () => {
      const { error } = await this.supabaseService.client
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_status: 'paid'
        })
        .eq('id', this.booking.id);

      if (error) {
        console.error('Error updating booking status:', error);
        Swal.fire({
          icon: 'error',
          title: 'Payment Error',
          text: 'There was an error processing your payment. Please try again.',
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Booking Confirmed',
          text: 'Thank you for your reservation. View your bookings now!',
          confirmButtonText: 'View Bookings',
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/my-bookings']);
          }
        });
      }
      this.loading = false;
    }, 2000);
  }
}
