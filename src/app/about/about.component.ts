import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SupabaseService } from '../services/supabase.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class AboutComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  testimonials = [
    {
      text: 'StaySphere made booking our dream vacation so easy! The platform is intuitive, and the hotel selection is fantastic.',
      author: 'Sarah M., Dubai',
    },
    {
      text: 'I love how seamless the booking process is. The real-time availability and secure payments give me peace of mind.',
      author: 'Ahmed K., Riyadh',
    },
    {
      text: 'The customer support team was incredibly helpful when I needed to adjust my reservation. Highly recommend StaySphere!',
      author: 'Emma L., London',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: [''],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {}

  async onSubmitContactForm() {
    if (this.contactForm.invalid) {
      this.snackBar.open('Please fill out all required fields correctly.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    this.isSubmitting = true;
    try {
      const { error, data } = await this.supabaseService.client
        .from('contact_submissions')
        .insert({
          name: this.contactForm.value.name,
          email: this.contactForm.value.email,
          subject: this.contactForm.value.subject || 'General Inquiry',
          message: this.contactForm.value.message,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Error submitting form: ${error.message}`);
      }

      console.log('Submission successful:', data);
      this.contactForm.reset();
      this.snackBar.open('Thank you for your message! We’ll get back to you soon.', 'Close', {
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Submission failed:', error);
      this.snackBar.open(error.message, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (control?.hasError('required')) return 'This field is required.';
    if (control?.hasError('email')) return 'Please enter a valid email address.';
    if (control?.hasError('minlength')) return `Must be at least ${control.errors?.['minlength'].requiredLength} characters.`;
    return '';
  }
}