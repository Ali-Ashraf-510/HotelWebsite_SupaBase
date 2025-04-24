import { Routes } from '@angular/router';
import { HotelListComponent } from './components/hotel-list/hotel-list.component';
import { AuthComponent } from './components/auth/auth.component';
import { HotelDetailsComponent } from './components/hotel-details/hotel-details.component';
import { BookingFormComponent } from './components/booking-form/booking-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/hotels', pathMatch: 'full' },
  { path: 'hotels', component: HotelListComponent },
  { path: 'hotels/:id', component: HotelDetailsComponent },
  { path: 'booking/:id', component: BookingFormComponent },
  { path: 'auth', component: AuthComponent },
];