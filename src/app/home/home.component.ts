import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
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
      const { data, error } = await this.supabaseService.client
        .from('hotels')
        .select('*')
        .limit(3);
      if (error) {
        console.error('Error loading featured hotels:', error);
      } else {
        this.featuredHotels = data || [];
      }
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

  
}

