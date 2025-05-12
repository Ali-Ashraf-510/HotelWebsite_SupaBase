import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  // المتغيرات الأساسية
  private supabase: SupabaseClient;
  private supabaseUrl = 'https://dkzrqbsqxqrzmjffqzwc.supabase.co';
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrenJxYnNxeHFyem1qZmZxendjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MjAwMTgsImV4cCI6MjA2MTA5NjAxOH0.heSe87mSxCEvzwY6wSx-6AtY3u4h9WyTEhnEpLzeVgg';

  // متغير لتخزين حالة المستخدم الحالي
  public currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    console.log('Initializing Supabase client with URL:', this.supabaseUrl);
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.loadCurrentUser();
  }

  // الحصول على عميل Supabase
  get client() {
    return this.supabase;
  }

  // ============== طرق المصادقة ==============

  /**
   * تحميل بيانات المستخدم الحالي
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
   */
  async signOut() {
    await this.supabase.auth.signOut();
    this.currentUser.next(null);
  }

  /**
   * الحصول على بيانات المستخدم الحالي
   */
  async getCurrentUser() {
    return await this.supabase.auth.getUser();
  }

  // ============== طرق الفنادق ==============

  /**
   * الحصول على جميع الفنادق
   */
  async getHotels() {
    return await this.supabase
      .from('hotels')
      .select('*');
  }

  /**
   * الحصول على فندق محدد
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
   * @param hotelId معرف الفندق
   */
  async getRoomsByHotelId(hotelId: string) {
    return await this.supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotelId);
  }

  /**
   * الحصول على الغرف المتاحة في فندق محدد
   * @param hotelId معرف الفندق
   */
  async getAvailableRooms(hotelId: string) {
    return await this.supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotelId)
      .eq('is_available', true);
  }

  /**
   * تحديث حالة توفر الغرفة
   * @param roomId معرف الغرفة
   * @param isAvailable حالة التوفر
   */
  async updateRoomAvailability(roomId: string, isAvailable: boolean) {
    return await this.supabase
      .from('rooms')
      .update({ is_available: isAvailable })
      .eq('id', roomId);
  }

  // ============== طرق الحجوزات ==============

  /**
   * إنشاء حجز جديد
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

  // ============== طرق الملف الشخصي ==============

  /**
   * تحديث الملف الشخصي للمستخدم
   * @param profileData بيانات الملف الشخصي
   */
  async updateUserProfile(profileData: { name: string }) {
    const user = await this.getCurrentUser();
    if (!user.data.user) throw new Error('User not authenticated');

    return await this.supabase
      .from('users')
      .update(profileData)
      .eq('id', user.data.user.id);
  }

  /**
   * الحصول على الملف الشخصي للمستخدم
   */
  async getUserProfile() {
    const user = await this.getCurrentUser();
    if (!user.data.user) throw new Error('User not authenticated');

    return await this.supabase
      .from('users')
      .select('*')
      .eq('id', user.data.user.id)
      .single();
  }
}