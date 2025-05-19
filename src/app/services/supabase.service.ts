import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  // ============== المتغيرات الأساسية ==============
  private supabase: SupabaseClient;
  private supabaseUrl = 'https://dkzrqbsqxqrzmjffqzwc.supabase.co';
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrenJxYnNxeHFyem1qZmZxendjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MjAwMTgsImV4cCI6MjA2MTA5NjAxOH0.heSe87mSxCEvzwY6wSx-6AtY3u4h9WyTEhnEpLzeVgg';

  // متغير لتخزين حالة المستخدم الحالي - يستخدم في جميع المكونات التي تحتاج معرفة حالة المستخدم
  public currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    console.log('Initializing Supabase client with URL:', this.supabaseUrl);
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.loadCurrentUser();
  }

  // الحصول على عميل Supabase - يستخدم في المكونات التي تحتاج الوصول المباشر لـ Supabase
  get client() {
    return this.supabase;
  }

  // ============== طرق المصادقة ==============

  /**
   * تحميل بيانات المستخدم الحالي
   * تستخدم في: 
   * - app.component.ts (عند بدء التطبيق)
   * - auth.guard.ts (للتحقق من حالة تسجيل الدخول)
   */
  private async loadCurrentUser() {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) {
      console.error('Error fetching current user:', error);
      this.currentUser.next(null);
    } else {
      this.currentUser.next(data.user);
    }
  }

  /**
   * تسجيل الدخول
   * تستخدم في:
   * - login.component.ts (عند تسجيل دخول المستخدم)
   * @param email البريد الإلكتروني
   * @param password كلمة المرور
   */
  async signIn(email: string, password: string) {
    console.log('Calling Supabase signInWithPassword with:', { email });
    try {
      const response = await Promise.race([
        this.supabase.auth.signInWithPassword({ email, password }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Sign-in request timed out')), 10000)
        ),
      ]);
      console.log('Sign-in response:', response);
      const typedResponse = response as { data: { user: User | null } };
      this.currentUser.next(typedResponse.data.user);
      return response;
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    }
  }

  /**
   * إنشاء حساب جديد
   * تستخدم في:
   * - sign-up.component.ts (عند إنشاء حساب جديد)
   * @param email البريد الإلكتروني
   * @param password كلمة المرور
   * @param name اسم المستخدم
   */
  async signUp(email: string, password: string, name: string) {
    console.log('Calling Supabase signUp with:', { email, name });
    try {
      const response = await Promise.race([
        this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Sign-up request timed out')), 10000)
        ),
      ]);
      console.log('Sign-up response:', response);
      const typedResponse = response as { data: { user: User | null } };
      this.currentUser.next(typedResponse.data.user);
      return response;
    } catch (error) {
      console.error('Sign-up error:', error);
      throw error;
    }
  }

  /**
   * تسجيل الخروج
   * تستخدم في:
   * - header.component.ts (عند الضغط على زر تسجيل الخروج)
   */
  async signOut() {
    await this.supabase.auth.signOut();
    this.currentUser.next(null);
  }

  /**
   * الحصول على بيانات المستخدم الحالي
   * تستخدم في:
   * - booking-form.component.ts (للتحقق من المستخدم قبل الحجز)
   * - my-bookings.component.ts (لعرض حجوزات المستخدم)
   */
  async getCurrentUser() {
    return await this.supabase.auth.getUser();
  }

  // ============== طرق الفنادق ==============

  /**
   * الحصول على جميع الفنادق
   * تستخدم في:
   * - home.component.ts (عرض قائمة الفنادق في الصفحة الرئيسية)
   * - hotel-list.component.ts (عرض قائمة الفنادق في صفحة البحث)
   */
  async getHotels() {
    try {
      const { data, error } = await this.supabase
        .from('hotels')
        .select(`
          *,
          rooms (
            count
          ),
          reviews (
            rating
          )
        `)
        .order('name');

      if (error) {
        console.error('Error fetching hotels:', error);
        throw error;
      }

      // حساب متوسط التقييم لكل فندق
      const hotelsWithRating = data?.map(hotel => ({
        ...hotel,
        average_rating: hotel.reviews?.length 
          ? hotel.reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / hotel.reviews.length 
          : 0,
        rooms_count: hotel.rooms?.[0]?.count || 0
      }));

      return { data: hotelsWithRating, error: null };
    } catch (error) {
      console.error('Error in getHotels:', error);
      return { data: null, error: 'Failed to fetch hotels' };
    }
  }

  /**
   * الحصول على فندق محدد
   * تستخدم في:
   * - hotel-details.component.ts (عرض تفاصيل الفندق)
   * @param id معرف الفندق
   */
  async getHotelById(id: string) {
    return await this.supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single();
  }

  // ============== طرق الغرف ==============

  /**
   * الحصول على غرف فندق محدد
   * تستخدم في:
   * - hotel-details.component.ts (عرض الغرف المتاحة في الفندق)
   * @param hotelId معرف الفندق
   */
  async getRoomsByHotelId(hotelId: string) {
    return await this.supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotelId);
  }

  // ============== طرق الحجوزات ==============

  /**
   * إنشاء حجز جديد
   * تستخدم في:
   * - booking-form.component.ts (عند تأكيد الحجز)
   * @param bookingData بيانات الحجز
   */
  async createBooking(bookingData: {
    room_id: string;
    check_in: string;
    check_out: string;
    total_price: number;
  }) {
    const user = await this.getCurrentUser();
    if (!user.data.user) throw new Error('User not authenticated');

    return await this.supabase
      .from('bookings')
      .insert({
        user_id: user.data.user.id,
        room_id: bookingData.room_id,
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        total_price: bookingData.total_price,
        status: 'pending',
        payment_status: 'pending'
      });
  }

  /**
   * الحصول على حجوزات المستخدم
   * تستخدم في:
   * - my-bookings.component.ts (عرض حجوزات المستخدم)
   */
  async getUserBookings() {
    const user = await this.getCurrentUser();
    if (!user.data.user) throw new Error('User not authenticated');

    return await this.supabase
      .from('bookings')
      .select(`
        *,
        rooms (
          *,
          hotels (*)
        )
      `)
      .eq('user_id', user.data.user.id);
  }

  /**
   * تحديث حالة الحجز
   * تستخدم في:
   * - my-bookings.component.ts (عند إلغاء الحجز)
   * @param bookingId معرف الحجز
   * @param status الحالة الجديدة
   */
  async updateBookingStatus(bookingId: string, status: string) {
    return await this.supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);
  }

  /**
   * تحديث حالة الدفع
   * تستخدم في:
   * - payment.component.ts (عند إتمام عملية الدفع)
   * @param bookingId معرف الحجز
   * @param paymentStatus حالة الدفع الجديدة
   */
  async updatePaymentStatus(bookingId: string, paymentStatus: string) {
    return await this.supabase
      .from('bookings')
      .update({ payment_status: paymentStatus })
      .eq('id', bookingId);
  }

  // ============== طرق التقييمات ==============

  /**
   * إنشاء تقييم جديد
   * تستخدم في:
   * - hotel-details.component.ts (عند إضافة تقييم جديد)
   * @param reviewData بيانات التقييم
   */
  async createReview(reviewData: {
    hotel_id: string;
    rating: number;
    comment: string;
  }) {
    const user = await this.getCurrentUser();
    if (!user.data.user) throw new Error('User not authenticated');

    return await this.supabase
      .from('reviews')
      .insert({
        user_id: user.data.user.id,
        hotel_id: reviewData.hotel_id,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
  }

  /**
   * الحصول على تقييمات فندق محدد
   * تستخدم في:
   * - hotel-details.component.ts (عرض تقييمات الفندق)
   * @param hotelId معرف الفندق
   */
  async getHotelReviews(hotelId: string) {
    return await this.supabase
      .from('reviews')
      .select(`
        *,
        users (name)
      `)
      .eq('hotel_id', hotelId);
  }
}