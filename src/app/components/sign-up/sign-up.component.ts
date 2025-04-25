import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class SignUpComponent {
  formData = {
    email: '',
    password: '',
    confirmPassword: ''
  };

  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  formErrors: { [key: string]: string } = {};

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  validateForm(): boolean {
    this.formErrors = {};

    if (!this.formData.email) {
      this.formErrors['email'] = 'Email is required';
    } else if (!this.formData.email.includes('@')) {
      this.formErrors['email'] = 'Please enter a valid email';
    }

    if (!this.formData.password) {
      this.formErrors['password'] = 'Password is required';
    } else if (this.formData.password.length < 6) {
      this.formErrors['password'] = 'Password must be at least 6 characters';
    }

    if (!this.formData.confirmPassword) {
      this.formErrors['confirmPassword'] = 'Please confirm your password';
    } else if (this.formData.password !== this.formData.confirmPassword) {
      this.formErrors['confirmPassword'] = 'Passwords do not match';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  async onSubmit() {
    if (!this.validateForm()) return;

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const { error } = await this.supabaseService.signUp(this.formData.email, this.formData.password) as { error?: { message: string } };

      if (error) {
        this.errorMessage = error.message || 'An unexpected error occurred';
      } else {
        this.successMessage = 'Sign-up successful! Please check your email to confirm your account.';
        setTimeout(() => {
          this.router.navigate(['/auth']);
        }, 3000);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to connect to the server. Please check your connection.';
    } finally {
      this.loading = false;
    }
  }
}
