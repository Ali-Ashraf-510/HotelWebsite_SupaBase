/**
 * مكون عرض وإدارة حجوزات المستخدم
 * يقوم بعرض قائمة الحجوزات الخاصة بالمستخدم وإمكانية إلغائها
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

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
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  // مصفوفة لتخزين حجوزات المستخدم
  bookings: any[] = [];
  // متغير للتحكم في حالة التحميل
  loading = true;
  // متغير لتخزين معلومات المستخدم الحالي
  user: any = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  /**
   * دالة تنفذ عند تهيئة المكون
   * تقوم بالتحقق من حالة تسجيل دخول المستخدم
   */
  async ngOnInit() {
    await this.checkAuth();
  }

  /**
   * دالة للتحقق من حالة تسجيل دخول المستخدم
   * إذا لم يكن المستخدم مسجل الدخول، يتم توجيهه لصفحة تسجيل الدخول
   */
  private async checkAuth() {
    try {
      const { data: { user }, error: authError } = await this.supabaseService.client.auth.getUser();
      
      if (authError || !user) {
        await Swal.fire({
          icon: 'warning',
          title: 'Login Required',
          text: 'Please log in to view your bookings.',
          confirmButtonText: 'Go to Login',
          showCancelButton: true,
          cancelButtonText: 'Cancel',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-secondary'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/auth']);
          }
        });
        return;
      }

      this.user = user;
      await this.loadBookings();
    } catch (error) {
      console.error('Auth check error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'There was an error checking your authentication status.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'btn btn-primary'
        }
      });
      this.router.navigate(['/auth']);
    }
  }

  /**
   * دالة لتحميل حجوزات المستخدم من قاعدة البيانات
   * تقوم بجلب الحجوزات مع معلومات الغرف والفنادق المرتبطة بها
   */
  async loadBookings() {
    if (!this.user) {
      return;
    }

    try {
      const { data: bookings, error } = await this.supabaseService.client
        .from('bookings')
        .select(`
          *,
          rooms (
            room_type,
            price_per_night,
            hotels (
              id,
              name,
              location,
              image_url
            )
          )
        `)
        .eq('user_id', this.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Loaded bookings:', bookings);
      this.bookings = bookings || [];

      if (this.bookings.length === 0) {
        await Swal.fire({
          icon: 'info',
          title: 'No Bookings Found',
          text: 'You haven\'t made any bookings yet.',
          confirmButtonText: 'Browse Hotels',
          showCancelButton: true,
          cancelButtonText: 'Close',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-secondary'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/']);
          }
        });
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error Loading Bookings',
        text: 'There was an error loading your bookings. Please try again.',
        confirmButtonText: 'Retry',
        showCancelButton: true,
        cancelButtonText: 'Close',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-secondary'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          this.loadBookings();
        }
      });
    } finally {
      this.loading = false;
    }
  }

  /**
   * دالة لتحديد لون حالة الحجز
   * @param status حالة الحجز (confirmed, pending, cancelled)
   * @returns لون مناسب للحالة
   */
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

  /**
   * دالة لتحديد لون حالة الدفع
   * @param status حالة الدفع (paid, pending, failed)
   * @returns لون مناسب للحالة
   */
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

  /**
   * دالة لتنسيق التاريخ بشكل مناسب
   * @param date التاريخ المراد تنسيقه
   * @returns التاريخ منسق بالشكل المطلوب
   */
  formatDate(date: string): string {
    console.log('Original date from DB:', date);
    
    // Ensure we're working with a valid date string
    if (!date) return '';
    
    // Create date in UTC to avoid timezone issues
    const [year, month, day] = date.split('T')[0].split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    
    console.log('Parsed date components:', { year, month, day });
    console.log('UTC date:', utcDate);
    
    return utcDate.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }

  /**
   * دالة لإلغاء حجز
   * @param bookingId معرف الحجز المراد إلغاؤه
   */
  async cancelBooking(bookingId: string) {
    if (!this.user) {
      await Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to cancel your booking.',
        confirmButtonText: 'Go to Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-secondary'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/auth']);
        }
      });
      return;
    }

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Cancel Booking',
      text: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      confirmButtonText: 'Yes, Cancel Booking',
      showCancelButton: true,
      cancelButtonText: 'No, Keep Booking',
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-secondary'
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      this.loading = true;
      
      // التحقق من أن الحجز يخص المستخدم الحالي
      const { data: bookingCheck, error: checkError } = await this.supabaseService.client
        .from('bookings')
        .select('id')
        .eq('id', bookingId)
        .eq('user_id', this.user.id)
        .single();

      if (checkError || !bookingCheck) {
        throw new Error('You are not authorized to cancel this booking');
      }

      // حذف الحجز من قاعدة البيانات
      const { error: deleteError } = await this.supabaseService.client
        .from('bookings')
        .delete()
        .eq('id', bookingId)
        .eq('user_id', this.user.id);

      if (deleteError) throw deleteError;
      
      // حذف الحجز من المصفوفة المحلية
      this.bookings = this.bookings.filter(booking => booking.id !== bookingId);
      
      await Swal.fire({
        icon: 'success',
        title: 'Booking Cancelled',
        text: 'Your booking has been successfully cancelled.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'btn btn-primary'
        }
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Cancellation Failed',
        text: 'There was an error cancelling your booking. Please try again.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'btn btn-primary'
        }
      });
    } finally {
      this.loading = false;
    }
  }
}