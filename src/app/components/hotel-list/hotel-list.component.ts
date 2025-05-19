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
  // قائمة الفنادق بعد التصفية
  filteredHotels: HotelWithDetails[] = [];
  // مؤشر التحميل
  isLoading = true;
  // رسالة الخطأ (إن وجدت)
  error: string | null = null;
  // معايير البحث الحالية
  searchParams: SearchParams = {
    location: '',
    guests: 1,
    checkIn: null,
    checkOut: null
  };

  constructor(
    private supabase: SupabaseService, // خدمة التعامل مع Supabase
    private route: ActivatedRoute // لجلب معايير البحث من الرابط
  ) {}

  // عند تحميل المكون
  ngOnInit() {
    // الاشتراك في متغيرات البحث من الرابط
    this.route.queryParams.subscribe(params => {
      this.searchParams = {
        location: params['location'] || '',
        guests: params['guests'] ? parseInt(params['guests']) : 1,
        checkIn: params['checkIn'] || null,
        checkOut: params['checkOut'] || null
      };
      this.fetchHotels(); // جلب الفنادق عند تغيير معايير البحث
    });
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
      this.filterHotels(); // تصفية الفنادق حسب معايير البحث
      
    } catch (error) {
      console.error('Error fetching hotels:', error);
      this.error = 'Failed to load hotels. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }

  // تصفية الفنادق حسب الموقع (ويمكن إضافة معايير أخرى)
  private filterHotels() {
    this.filteredHotels = this.hotels.filter(hotel => {
      if (this.searchParams.location && 
          !hotel.location.toLowerCase().includes(this.searchParams.location.toLowerCase())) {
        return false;
      }
      return true;
    });
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