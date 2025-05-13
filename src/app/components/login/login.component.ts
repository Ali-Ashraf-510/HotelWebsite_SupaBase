import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

interface AuthResponse {
  data: any;
  error: {
    message: string;
  } | null;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class AuthComponent {
  email: string = '';
  password: string = '';
  hidePassword: boolean = true;
  loading: boolean = false;
  errorMessage: string | null = null;
  formErrors: { [key: string]: string } = {};

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  validateForm(): boolean {
    this.formErrors = {};

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
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    try {
      const { error } = await this.supabaseService.signIn(this.email, this.password) as AuthResponse;

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
}