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
  bookings: any[] = [];
  loading = true;
  user: any = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.checkAuth();
  }

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
              name,
              location,
              image_url
            )
          )
        `)
        .eq('user_id', this.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
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
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }

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