import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root', // هنا بيتعرف إن الخدمة متاحة في كل التطبيق
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseUrl = 'https://dkzrqbsqxqrzmjffqzwc.supabase.co'; // استبدلها بالـ URL بتاعك
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrenJxYnNxeHFyem1qZmZxendjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MjAwMTgsImV4cCI6MjA2MTA5NjAxOH0.heSe87mSxCEvzwY6wSx-6AtY3u4h9WyTEhnEpLzeVgg'; // استبدلها بالـ Key بتاعك

  constructor() {
    console.log('Initializing Supabase client with URL:', this.supabaseUrl);
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  get client() {
    return this.supabase;
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
      return response;
    } catch (error) {
      console.error('Sign-up error:', error);
      throw error;
    }
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async getCurrentUser() {
    return await this.supabase.auth.getUser();
  }
}