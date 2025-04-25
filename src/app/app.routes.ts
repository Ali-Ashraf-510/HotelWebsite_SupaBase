import { Routes } from '@angular/router';
import { HotelListComponent } from './components/hotel-list/hotel-list.component';
import { AuthComponent } from './components/auth/auth.component';
import { HotelDetailsComponent } from './components/hotel-details/hotel-details.component';
import { BookingFormComponent } from './components/booking-form/booking-form.component';
import { HomeComponent } from './home/home.component';
import { ContactComponent } from './contact/contact.component';
import { AboutComponent } from './about/about.component';   
import { SignUpComponent } from './components/sign-up/sign-up.component';
export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {path: 'home', component: HomeComponent},
  { path: 'hotels', component: HotelListComponent },
  {path: 'contact', component: ContactComponent},
  {path: 'about', component: AboutComponent},
  { path: 'hotels/:id', component: HotelDetailsComponent },
  { path: 'booking/:id', component: BookingFormComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'signup', component: SignUpComponent },
];