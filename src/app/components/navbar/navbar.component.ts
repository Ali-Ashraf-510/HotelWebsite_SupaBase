import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { Subscription } from 'rxjs';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen: boolean = false;
  isDropdownOpen: boolean = false;
  user: User | null = null;
  userName: string | null = null;
  private userSubscription: Subscription | null = null;
  isScrolled: boolean = false;
  bookingsCount: number = 0;
  private bookingsSubscription: Subscription | null = null;

  constructor(
    private supabaseService: SupabaseService, 
    private router: Router
  ) {}

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  ngOnInit() {
    // Subscribe to currentUser to get user and name
    this.userSubscription = this.supabaseService.currentUser.subscribe((user) => {
      this.user = user;
      this.userName = user?.user_metadata?.['name'] || null;
      if (user) {
        this.loadBookingsCount();
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.bookingsSubscription) {
      this.bookingsSubscription.unsubscribe();
    }
  }

  private async loadBookingsCount() {
    try {
      const { data } = await this.supabaseService.getUserBookings();
      this.bookingsCount = data?.length || 0;
    } catch (error) {
      console.error('Error loading bookings count:', error);
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.isDropdownOpen = false; // Close dropdown when opening mobile menu
      document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    } else {
      document.body.style.overflow = ''; // Restore scrolling when menu is closed
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  async signOut() {
    try {
      await this.supabaseService.signOut();
      this.isMenuOpen = false;
      this.isDropdownOpen = false;
      this.router.navigate(['/auth']);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  }

  closeMenu() {
    this.isMenuOpen = false;
    document.body.style.overflow = ''; // Restore scrolling
  }
}