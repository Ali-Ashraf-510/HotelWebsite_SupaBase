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
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent {
  email: string = '';
  password: string = '';
  isSignUp: boolean = false;
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(private supabaseService: SupabaseService, private router: Router) {
    console.log('SupabaseService in AuthComponent:', this.supabaseService);
  }

  async onSubmit() {
    this.loading = true;
    this.errorMessage = null;
  
    try {
      let response: { data: any; error: any };
  
      if (this.isSignUp) {
        response = await this.supabaseService.signUp(this.email, this.password) as { data: any; error: any };
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
  }
}
