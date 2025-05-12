import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  bookingForm: FormGroup;
  hotel: any;
  selectedRoom: any;
  loading = false;
  totalPrice = 0;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      check_in: ['', Validators.required],
      check_out: ['', Validators.required],
      guests: [1, [Validators.required, Validators.min(1)]]
    });
  }

  async ngOnInit() {
    const hotelId = this.route.snapshot.paramMap.get('id');
    const roomId = this.route.snapshot.queryParamMap.get('roomId');

    if (hotelId && roomId) {
      await this.loadHotelAndRoom(hotelId, roomId);
    }
  }

  async loadHotelAndRoom(hotelId: string, roomId: string) {
    this.loading = true;
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
    } finally {
      this.loading = false;
    }
  }

  calculateTotalPrice() {
    if (!this.bookingForm.valid || !this.selectedRoom) return;

    const checkIn = new Date(this.bookingForm.get('check_in')?.value);
    const checkOut = new Date(this.bookingForm.get('check_out')?.value);
    
    if (checkIn && checkOut && checkOut > checkIn) {
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      this.totalPrice = nights * this.selectedRoom.price_per_night;
    }
  }

  async onSubmit() {
    if (this.bookingForm.valid && this.selectedRoom) {
      this.loading = true;
      try {
        const bookingData = {
          room_id: this.selectedRoom.id,
          check_in: this.bookingForm.get('check_in')?.value,
          check_out: this.bookingForm.get('check_out')?.value,
          total_price: this.totalPrice
        };

        const { error } = await this.supabaseService.createBooking(bookingData);
        if (error) throw error;

        // Handle successful booking
        console.log('Booking successful');
      } catch (error) {
        console.error('Error creating booking:', error);
      } finally {
        this.loading = false;
      }
    }
  }
} 