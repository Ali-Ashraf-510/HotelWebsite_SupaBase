import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseUrl = 'https://dkzrqbsqxqrzmjffqzwc.supabase.co'; // Your Supabase URL
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrenJxYnNxeHFyem1qZmZxendjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MjAwMTgsImV4cCI6MjA2MTA5NjAxOH0.heSe87mSxCEvzwY6wSx-6AtY3u4h9WyTEhnEpLzeVgg'; // Your Supabase Key

  public currentUser = new BehaviorSubject<User | null>(null); // Store the current user state

  constructor() {
    console.log('Initializing Supabase client with URL:', this.supabaseUrl);
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.loadCurrentUser(); // Load the current user on service initialization
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
      this.currentUser.next(typedResponse.data.user); // Update user after sign-in
      return response;
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string, name: string) {
    console.log('Calling Supabase signUp with:', { email, name });
    try {
      const response = await Promise.race([
        this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name } // Store name in user metadata
          }
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Sign-up request timed out')), 10000)
        ),
      ]);
      console.log('Sign-up response:', response);
      const typedResponse = response as { data: { user: User | null } };
      this.currentUser.next(typedResponse.data.user); // Update user after sign-up
      return response;
    } catch (error) {
      console.error('Sign-up error:', error);
      throw error;
    }
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.currentUser.next(null); // Clear user after sign-out
  }

  async getCurrentUser() {
    return await this.supabase.auth.getUser();
  }
}