import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class HomeComponent implements OnInit {
  featuredHotels: any[] = [];
  searchQuery: string = '';
  loading: boolean = false;

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async ngOnInit() {
    await this.loadFeaturedHotels();
  }

  async loadFeaturedHotels() {
    this.loading = true;
    try {
      // الخطوة 1: جيب كل الفنادق
      const { data: hotels, error: hotelsError } = await this.supabaseService.client
        .from('hotels')
        .select('*');

      if (hotelsError) {
        console.error('Error loading hotels:', hotelsError);
        return;
      }

      if (!hotels || hotels.length === 0) {
        console.warn('No hotels found');
        return;
      }

      // الخطوة 2: جيب كل الـ reviews
      const { data: reviews, error: reviewsError } = await this.supabaseService.client
        .from('reviews')
        .select('hotel_id, rating');

      if (reviewsError) {
        console.error('Error loading reviews:', reviewsError);
        return;
      }

      // الخطوة 3: احسب متوسط الـ rating لكل فندق
      const hotelRatings: { [key: number]: { total: number, count: number } } = {};

      reviews.forEach((review: any) => {
        const hotelId = review.hotel_id;
        if (!hotelRatings[hotelId]) {
          hotelRatings[hotelId] = { total: 0, count: 0 };
        }
        hotelRatings[hotelId].total += review.rating;
        hotelRatings[hotelId].count += 1;
      });

      // الخطوة 4: أضف الـ average rating لكل فندق
      const hotelsWithRatings = hotels.map((hotel: any) => {
        const ratingData = hotelRatings[hotel.id] || { total: 0, count: 0 };
        const averageRating = ratingData.count > 0 ? ratingData.total / ratingData.count : 0;
        return {
          ...hotel,
          rating: parseFloat(averageRating.toFixed(1)), // تقريب لأقرب رقم عشري واحد
        };
      });

      // الخطوة 5: رتب الفنادق بناءً على الـ rating وجيب أعلى 3
      const sortedHotels = hotelsWithRatings
        .sort((a: any, b: any) => b.rating - a.rating) // ترتيب تنازلي
        .slice(0, 3); // أعلى 3 فنادق

      // الخطوة 6: استبدل الـ mock data بالبيانات الحقيقية
      this.featuredHotels = sortedHotels.length > 0 ? sortedHotels : this.featuredHotels;
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      this.loading = false;
    }
  }

  searchHotels() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/hotels'], { queryParams: { search: this.searchQuery } });
    }
  }

  // دالة لعرض النجوم بناءً على الـ rating
  getStars(rating: number): { class: string }[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = 5;

    for (let i = 0; i < fullStars; i++) {
      stars.push({ class: 'full' });
    }
    if (hasHalfStar && stars.length < totalStars) {
      stars.push({ class: 'half' });
    }
    while (stars.length < totalStars) {
      stars.push({ class: 'empty' });
    }

    return stars;
  }
}