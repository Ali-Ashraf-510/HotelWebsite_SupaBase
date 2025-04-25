import { Component, OnInit, OnDestroy } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
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

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  ngOnInit() {
    // Subscribe to currentUser to get user and name
    this.userSubscription = this.supabaseService.currentUser.subscribe((user) => {
      this.user = user;
      this.userName = user?.user_metadata?.['name'] || null;
    });
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.isDropdownOpen = false; // Close dropdown when opening mobile menu
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
}