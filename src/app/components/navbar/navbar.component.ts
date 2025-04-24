import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  user: any;

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  ngOnInit() {
    this.supabaseService.currentUser.subscribe(user => {
      this.user = user;
    });
  }
  

  async signOut() {
    await this.supabaseService.signOut();
    this.router.navigate(['/hotels']);
  }
}
