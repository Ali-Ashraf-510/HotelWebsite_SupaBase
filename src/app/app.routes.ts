import { Routes } from '@angular/router';
import { HotelListComponent } from './components/hotel-list/hotel-list.component';
import { AuthComponent } from './components/login/login.component';
import { HotelDetailsComponent } from './components/hotel-details/hotel-details.component';
import { BookingFormComponent } from './components/booking-form/booking-form.component';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';   
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { MyBookingsComponent } from './components/my-bookings/my-bookings.component'; 

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {path: 'home', component: HomeComponent},
  { path: 'hotels', component: HotelListComponent },
  {path: 'about', component: AboutComponent},
  { path: 'hotels/:id', component: HotelDetailsComponent },
  { 
    path: 'booking/:id', 
    loadComponent: () => import('./components/booking-form/booking-form.component').then(m => m.BookingFormComponent) 
  },
  { 
    path: 'my-bookings', 
    loadComponent: () => import('./components/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent) 
  },
  { path: 'auth', component: AuthComponent },
  { path: 'signup', component: SignUpComponent },
];