import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Hotel } from '../../shared/types';

// واجهة معايير البحث
interface SearchParams {
  location: string; // موقع الفندق
  guests: number; // عدد الضيوف
  checkIn: string | null; // تاريخ الدخول
  checkOut: string | null; // تاريخ الخروج
}

// واجهة بيانات الفندق مع تفاصيل إضافية
interface HotelWithDetails extends Hotel {
  average_rating: number; // متوسط التقييمات
  rooms_count: number; // عدد الغرف المتاحة
}

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [
    // استيراد الوحدات اللازمة للنموذج وواجهة المستخدم
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './hotel-list.component.html',
  styleUrls: ['./hotel-list.component.css']
})
export class HotelListComponent implements OnInit {
  // قائمة جميع الفنادق مع التفاصيل
  hotels: HotelWithDetails[] = [];
  // مؤشر التحميل
  isLoading = true;
  // رسالة الخطأ (إن وجدت)
  error: string | null = null;

  constructor(
    private supabase: SupabaseService, // خدمة التعامل مع Supabase
    private route: ActivatedRoute // لجلب معايير البحث من الرابط
  ) {}

  // عند تحميل المكون
  ngOnInit() {
    // لم يعد هناك حاجة للاشتراك في queryParams
    this.fetchHotels(); // جلب الفنادق عند بدء الصفحة
  }

  // جلب جميع الفنادق من قاعدة البيانات عبر الخدمة
  private async fetchHotels() {
    try {
      this.isLoading = true;
      const { data, error } = await this.supabase.getHotels();
      
      if (error) {
        throw new Error(error);
      }

      if (!data) {
        throw new Error('No data received');
      }

      this.hotels = data as HotelWithDetails[];
      
    } catch (error) {
      console.error('Error fetching hotels:', error);
      this.error = 'Failed to load hotels. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }

  // دالة مساعدة لعرض عدد النجوم حسب التقييم
  getStarRating(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  // دالة تتبع العناصر في القائمة (لتحسين الأداء)
  trackByHotelId(index: number, hotel: HotelWithDetails): string {
    return hotel.id;
  }
}