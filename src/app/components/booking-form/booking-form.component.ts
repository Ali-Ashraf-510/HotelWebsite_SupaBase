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
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

// تنسيقات التاريخ المخصصة للنموذج
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

// تخصيص NativeDateAdapter
class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: string): string {
    if (displayFormat === 'DD/MM/YYYY') {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return super.format(date, displayFormat);
  }
}

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    // استيراد الوحدات اللازمة للنموذج وواجهة المستخدم
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
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ]
})
export class BookingFormComponent implements OnInit {
  // بيانات الفندق الحالي
  hotel: any;
  // بيانات الغرفة المختارة
  selectedRoom: any;
  // بيانات المستخدم الحالي
  user: any;
  // بيانات الحجز (تاريخ الدخول والخروج وعدد الضيوف)
  booking = { id: null, check_in: null, check_out: null, guests: 1 };
  // بيانات الدفع (بطاقة ائتمان)
  payment = {
    method: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  };
  // مؤشر التحميل
  loading: boolean = false;
  // إظهار/إخفاء قسم الدفع
  showPaymentSection: boolean = false;
  // أقل وأقصى تاريخ للحجز
  minDate: Date;
  maxDate: Date;
  // أقل تاريخ لانتهاء البطاقة
  cardExpiryMinDate: Date;

  constructor(
    private route: ActivatedRoute, // لجلب بيانات من الرابط
    private router: Router, // للتوجيه بين الصفحات
    private supabaseService: SupabaseService // خدمة التعامل مع Supabase
  ) {
    // تحديد أقل وأقصى تاريخ للحجز (اليوم وحتى 5 أيام قادمة)
    this.minDate = new Date();
    this.maxDate = new Date();
    this.maxDate.setDate(this.minDate.getDate() + 5);
    // أقل تاريخ لانتهاء البطاقة (أبريل 2025)
    this.cardExpiryMinDate = new Date(2025, 3, 1);
  }

  // عند تحميل المكون
  async ngOnInit() {
    this.loading = true;
    // جلب معرف الفندق والغرفة من الرابط
    const hotelId = this.route.snapshot.paramMap.get('id');
    const roomId = this.route.snapshot.queryParamMap.get('roomId');

    // تحميل بيانات الفندق والغرفة إذا توفرت
    if (hotelId && roomId) {
      await this.loadHotelAndRoom(hotelId, roomId);
    }

    // جلب بيانات المستخدم الحالي من Supabase
    const { data: userData } = await this.supabaseService.getCurrentUser();
    this.user = userData?.user;
    this.loading = false;
  }

  // تحميل بيانات الفندق والغرفة من Supabase
  async loadHotelAndRoom(hotelId: string, roomId: string) {
    try {
      // جلب بيانات الفندق
      const { data: hotelData, error: hotelError } = await this.supabaseService.client
        .from('hotels')
        .select('*')
        .eq('id', hotelId)
        .single();
      
      if (hotelError) throw hotelError;
      this.hotel = hotelData;

      // جلب بيانات الغرفة
      const { data: roomData, error: roomError } = await this.supabaseService.client
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (roomError) throw roomError;
      this.selectedRoom = roomData;
    } catch (error) {
      // في حال حدوث خطأ أثناء التحميل
      console.error('Error loading data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Data',
        text: 'Could not load hotel or room information.',
        confirmButtonText: 'OK',
      });
    }
  }

  // تنسيق رقم البطاقة ليظهر بشكل 4-4-4-4
  formatCardNumber() {
    let value = this.payment.cardNumber.replace(/\D/g, '');
    value = value.substring(0, 16);
    this.payment.cardNumber = value
      .match(/.{1,4}/g)
      ?.join(' ')
      .trim() || value;
  }

  // تنسيق تاريخ انتهاء البطاقة ليظهر بشكل MM/YY
  formatExpiryDate() {
    let value = this.payment.expiryDate.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length > 2) {
      this.payment.expiryDate = `${value.slice(0, 2)}/${value.slice(2)}`;
    } else {
      this.payment.expiryDate = value;
    }
  }

  // حساب السعر الكلي للحجز بناءً على عدد الليالي وعدد الضيوف
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
    // إضافة تكلفة إضافية إذا زاد عدد الضيوف عن الحد الأقصى للغرفة
    if (this.booking.guests > this.selectedRoom.max_occupancy) {
      total += nights * 100 * (this.booking.guests - this.selectedRoom.max_occupancy);
    }

    return total;
  }

  // عند إرسال نموذج الحجز
  async onSubmit() {
    // إذا لم يكن المستخدم مسجلاً الدخول
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

    // التحقق من اكتمال البيانات
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

    // تنسيق التواريخ قبل إرسالها
    const checkInDate = new Date(this.booking.check_in);
    const checkOutDate = new Date(this.booking.check_out);
    
    // تنسيق التاريخ إلى YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // إضافة الحجز في جدول bookings في Supabase
    const { data, error } = await this.supabaseService.client
      .from('bookings')
      .insert({
        user_id: this.user.id,
        room_id: this.selectedRoom.id,
        check_in: formatDate(checkInDate),
        check_out: formatDate(checkOutDate),
        total_price: this.calculateTotalPrice(),
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      // في حال حدوث خطأ أثناء الحجز
      Swal.fire({
        icon: 'error',
        title: 'Booking Error',
        text: 'Error creating booking: ' + error.message,
        confirmButtonText: 'OK',
      });
      this.loading = false;
      return;
    }

    // حفظ رقم الحجز وإظهار قسم الدفع
    this.booking.id = data.id;
    this.showPaymentSection = true;
    this.loading = false;

    Swal.fire({
      icon: 'success',
      title: 'Booking Submitted',
      text: 'Proceed to payment.',
      confirmButtonText: 'OK',
    });

    // تمرير المستخدم لقسم الدفع
    setTimeout(() => {
      document.querySelector('.payment-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // عند إرسال بيانات الدفع
  async onSubmitPayment() {
    // التحقق من صحة بيانات البطاقة
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
    // محاكاة عملية الدفع (انتظار 2 ثانية)
    setTimeout(async () => {
      // تحديث حالة الحجز في قاعدة البيانات بعد الدفع
      const { error } = await this.supabaseService.client
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_status: 'paid'
        })
        .eq('id', this.booking.id);

      if (error) {
        // في حال حدوث خطأ أثناء تحديث حالة الحجز
        console.error('Error updating booking status:', error);
        Swal.fire({
          icon: 'error',
          title: 'Payment Error',
          text: 'There was an error processing your payment. Please try again.',
          confirmButtonText: 'OK',
        });
      } else {
        // نجاح الدفع وتأكيد الحجز
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
