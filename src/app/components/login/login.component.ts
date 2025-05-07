import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class AuthComponent {
  name: string = ''; // Added name field for sign-up
  email: string = '';
  password: string = '';
  isSignUp: boolean = false;
  loading: boolean = false;
  errorMessage: string | null = null;
  formErrors: { [key: string]: string } = {}; // Added for form validation

  constructor(private supabaseService: SupabaseService, private router: Router) {
    console.log('SupabaseService in AuthComponent:', this.supabaseService);
  }

  validateForm(): boolean {
    this.formErrors = {};

    if (this.isSignUp) {
      // Validate name (only for sign-up)
      if (!this.name) {
        this.formErrors['name'] = 'Name is required';
      } else if (this.name.length < 2) {
        this.formErrors['name'] = 'Name must be at least 2 characters';
      }
    }

    // Validate email
    if (!this.email) {
      this.formErrors['email'] = 'Email is required';
    } else if (!this.email.includes('@')) {
      this.formErrors['email'] = 'Please enter a valid email';
    }

    // Validate password
    if (!this.password) {
      this.formErrors['password'] = 'Password is required';
    } else if (this.password.length < 6) {
      this.formErrors['password'] = 'Password must be at least 6 characters';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  async onSubmit() {
    if (!this.validateForm()) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    try {
      let response: { data: any; error: any };

      if (this.isSignUp) {
        response = await this.supabaseService.signUp(this.email, this.password, this.name) as { data: any; error: any };
      } else {
        response = await this.supabaseService.signIn(this.email, this.password) as { data: any; error: any };
      }

      const { data, error } = response;

      if (error) {
        this.errorMessage = error.message || 'An unexpected error occurred';
      } else {
        this.router.navigate(['/hotels']);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to connect to the server. Please check your connection.';
    } finally {
      this.loading = false;
    }
  }

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    this.errorMessage = null;
    this.formErrors = {}; // Clear form errors when toggling mode
    this.name = ''; // Reset name field
    this.email = '';
    this.password = '';
  }
}