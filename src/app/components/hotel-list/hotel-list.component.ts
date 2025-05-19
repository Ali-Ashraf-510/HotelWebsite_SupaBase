import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Hotel } from '../../shared/types';

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
  hotels: HotelWithDetails[] = []; // جميع الفنادق مع التفاصيل
  isLoading = true; // مؤشر التحميل
  error: string | null = null; // رسالة الخطأ

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {
    this.fetchHotels(); // جلب الفنادق عند بدء الصفحة
  }

  // جلب جميع الفنادق من قاعدة البيانات عبر الخدمة
  private async fetchHotels() {
    this.isLoading = true;
    try {
      const { data, error } = await this.supabase.getHotels();
      if (error) throw new Error(error);
      if (!data) throw new Error('No data received');
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