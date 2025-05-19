import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SupabaseService } from '../../services/supabase.service';
import { Hotel, HotelWithDetails } from '../../shared/types';

// واجهة فندق مع التقييم
interface HotelWithRating extends HotelWithDetails {
  rating: number; // متوسط تقييمات الفندق
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // قائمة الفنادق المميزة (أعلى 3 تقييمًا)
  featuredHotels: HotelWithRating[] = [];
  // مؤشر التحميل لإظهار سبينر أثناء جلب البيانات
  loading = false;
  // رسالة الخطأ (إن وجدت)
  error: string | null = null;

  // حقن خدمة Supabase لجلب البيانات من الباك اند
  constructor(private supabase: SupabaseService) {}

  // عند تحميل الصفحة الرئيسية يتم جلب الفنادق المميزة
  async ngOnInit() {
    await this.loadFeaturedHotels(); // تحميل الفنادق المميزة عند بدء الصفحة
  }

  // تحميل أعلى 3 فنادق من حيث التقييم من قاعدة البيانات
  private async loadFeaturedHotels() {
    try {
      this.loading = true; // تفعيل مؤشر التحميل
      // جلب جميع الفنادق من Supabase عبر الخدمة
      const { data, error } = await this.supabase.getHotels();
      
      if (error) throw error; // معالجة الخطأ إذا وجد
      
      // حساب متوسط التقييم لكل فندق (إذا كان لديه تقييمات)
      const hotelsWithRating = (data || []).map(hotel => ({
        ...hotel,
        rating: hotel.reviews.length 
          ? hotel.reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) / hotel.reviews.length 
          : 0
      })) as HotelWithRating[];
      
      // ترتيب الفنادق حسب التقييم بشكل تنازلي وأخذ أعلى 3 فقط
      this.featuredHotels = hotelsWithRating
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
      
    } catch (error) {
      // في حال حدوث خطأ أثناء جلب البيانات
      console.error('Error loading featured hotels:', error);
      this.error = 'Failed to load featured hotels';
    } finally {
      this.loading = false; // إيقاف مؤشر التحميل
    }
  }

  // دالة مساعدة لعرض عدد النجوم حسب التقييم (تستخدم في القالب)
  getStars(rating: number): number[] {
    // تُرجع مصفوفة بعدد النجوم (للتكرار في *ngFor)
    return Array(Math.round(rating)).fill(0);
  }
}
// شرح مختصر:
// - عند تحميل الصفحة يتم جلب جميع الفنادق من SupabaseService (تتواصل مع الباك اند)
// - يتم حساب متوسط التقييم لكل فندق
// - يتم ترتيب الفنادق وأخذ أعلى 3 فقط لعرضها في الصفحة الرئيسية
// - getStars تستخدم في القالب لعرض أيقونات النجوم حسب التقييم