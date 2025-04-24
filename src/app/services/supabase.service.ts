import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseUrl = 'https://dkzrqbsqxqrzmjffqzwc.supabase.co'; // URL بتاعك
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrenJxYnNxeHFyem1qZmZxendjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MjAwMTgsImV4cCI6MjA2MTA5NjAxOH0.heSe87mSxCEvzwY6wSx-6AtY3u4h9WyTEhnEpLzeVgg'; // Key بتاعك

  public currentUser = new BehaviorSubject<User | null>(null); // المتغير اللي بيخزن حالة المستخدم

  constructor() {
    console.log('Initializing Supabase client with URL:', this.supabaseUrl);
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.loadCurrentUser(); // تحميل المستخدم الحالي عند بداية الخدمة
  }

  get client() {
    return this.supabase;
  }

  private async loadCurrentUser() {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) {
      console.error('Error fetching current user:', error);
      this.currentUser.next(null);
    } else {
      this.currentUser.next(data.user);
    }
  }

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
      this.currentUser.next(typedResponse.data.user); // تحديث المستخدم بعد تسجيل الدخول
      return response;
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string) {
    console.log('Calling Supabase signUp with:', { email });
    try {
      const response = await Promise.race([
        this.supabase.auth.signUp({ email, password }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Sign-up request timed out')), 10000)
        ),
      ]);
      console.log('Sign-up response:', response);
      const typedResponse = response as { data: { user: User | null } };
      this.currentUser.next(typedResponse.data.user); // تحديث المستخدم بعد الاشتراك
      return response;
    } catch (error) {
      console.error('Sign-up error:', error);
      throw error;
    }
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.currentUser.next(null); // إزالة المستخدم بعد تسجيل الخروج
  }

  async getCurrentUser() {
    return await this.supabase.auth.getUser();
  }
}
