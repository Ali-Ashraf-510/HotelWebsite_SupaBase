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
        this.snackBar.open('يرجى تسجيل الدخول لعرض حجوزاتك', 'إغلاق', {
          duration: 3000
        });
        this.router.navigate(['/auth']);
        return;
      }

      this.user = user;
      await this.loadBookings();
    } catch (error) {
      console.error('Auth check error:', error);
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
    } catch (error) {
      console.error('Error loading bookings:', error);
      this.snackBar.open('حدث خطأ أثناء تحميل الحجوزات', 'إغلاق', {
        duration: 3000,
        panelClass: ['error-snackbar']
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
    return new Date(date).toLocaleDateString('en-GB', {
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
      this.snackBar.open('يرجى تسجيل الدخول لإلغاء الحجز', 'إغلاق', {
        duration: 3000
      });
      return;
    }

    const confirmed = window.confirm('هل أنت متأكد من إلغاء هذا الحجز؟ سيتم حذفه نهائياً.');
    
    if (!confirmed) {
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
        throw new Error('غير مصرح لك بإلغاء هذا الحجز');
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
      
      this.snackBar.open('تم إلغاء الحجز بنجاح', 'إغلاق', {
        duration: 3000
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      this.snackBar.open('حدث خطأ أثناء إلغاء الحجز', 'إغلاق', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading = false;
    }
  }
}