/**
 * مكون التسجيل
 * يقوم بإدارة عملية إنشاء حساب جديد للمستخدم باستخدام Supabase
 * يرتبط مع SupabaseService للتعامل مع عمليات التسجيل
 */

// استيراد المكونات الأساسية من Angular
import { Component } from '@angular/core';

// استيراد SupabaseService من ملف الخدمة
// هذا الملف موجود في المسار: ../../services/supabase.service
// ويحتوي على كل الدوال اللازمة للتعامل مع Supabase
import { SupabaseService } from '../../services/supabase.service';

// استيراد خدمات التوجيه من Angular
import { Router, RouterLink } from '@angular/router';

// استيراد المكونات المطلوبة من Angular Material
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

/**
 * واجهة تحدد شكل الاستجابة من Supabase
 * تحتوي على البيانات ورسالة الخطأ إن وجدت
 * هذه الواجهة تستخدم في معالجة استجابة SupabaseService
 */
interface AuthResponse {
  data: any;
  error: {
    message: string;
  } | null;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  // تعريف الحركات الانتقالية للمكون
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class SignUpComponent {
  // نموذج البيانات
  formData = {
    name: '',           // اسم المستخدم
    email: '',          // البريد الإلكتروني
    password: '',       // كلمة المرور
    confirmPassword: '' // تأكيد كلمة المرور
  };

  // متغيرات التحكم في العرض
  hidePassword: boolean = true;        // إخفاء/إظهار كلمة المرور
  hideConfirmPassword: boolean = true; // إخفاء/إظهار تأكيد كلمة المرور
  loading: boolean = false;            // حالة التحميل
  errorMessage: string | null = null;  // رسالة الخطأ
  successMessage: string | null = null;// رسالة النجاح
  formErrors: { [key: string]: string } = {}; // أخطاء النموذج

  /**
   * حقن الخدمات المطلوبة في المكون
   * @param supabaseService خدمة Supabase للتعامل مع المصادقة
   *                    - هذه الخدمة تحتوي على كل الدوال اللازمة للتعامل مع Supabase
   *                    - يتم حقنها تلقائياً من خلال نظام Dependency Injection في Angular
   * @param router خدمة التوجيه للتنقل بين الصفحات
   */
  constructor(private supabaseService: SupabaseService, private router: Router) {}

  /**
   * التحقق من صحة بيانات النموذج
   * @returns true إذا كان النموذج صحيحاً، false إذا كان هناك أخطاء
   */
  validateForm(): boolean {
    this.formErrors = {};

    // التحقق من الاسم
    if (!this.formData.name) {
      this.formErrors['name'] = 'Name is required';
    } else if (this.formData.name.length < 2) {
      this.formErrors['name'] = 'Name must be at least 2 characters';
    }

    // التحقق من البريد الإلكتروني
    if (!this.formData.email) {
      this.formErrors['email'] = 'Email is required';
    } else if (!this.formData.email.includes('@')) {
      this.formErrors['email'] = 'Please enter a valid email';
    }

    // التحقق من كلمة المرور
    if (!this.formData.password) {
      this.formErrors['password'] = 'Password is required';
    } else if (this.formData.password.length < 6) {
      this.formErrors['password'] = 'Password must be at least 6 characters';
    }

    // التحقق من تأكيد كلمة المرور
    if (!this.formData.confirmPassword) {
      this.formErrors['confirmPassword'] = 'Please confirm your password';
    } else if (this.formData.password !== this.formData.confirmPassword) {
      this.formErrors['confirmPassword'] = 'Passwords do not match';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  /**
   * معالجة عملية التسجيل
   * يتم استدعاؤها عند الضغط على زر التسجيل
   * 
   * سير العمل:
   * 1. التحقق من صحة النموذج
   * 2. تفعيل حالة التحميل
   * 3. استدعاء دالة signUp من SupabaseService
   * 4. معالجة النتيجة (نجاح/فشل)
   * 5. عرض رسالة نجاح وتوجيه المستخدم
   * 6. عرض رسالة خطأ في حالة الفشل
   */
  async onSubmit() {
    if (!this.validateForm()) return;

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      // استخدام SupabaseService للتعامل مع التسجيل
      // دالة signUp موجودة في ملف supabase.service.ts
      // تقوم بإرسال طلب إنشاء حساب جديد إلى Supabase
      const { error } = await this.supabaseService.signUp(
        this.formData.email,
        this.formData.password,
        this.formData.name
      ) as AuthResponse;

      if (error) {
        // معالجة الخطأ في حالة فشل التسجيل
        // رسالة الخطأ تأتي من Supabase
        this.errorMessage = error.message || 'An unexpected error occurred';
      } else {
        // نجاح التسجيل - عرض رسالة نجاح والتوجيه
        this.successMessage = 'Sign-up successful! Please check your email to confirm your account.';
        setTimeout(() => {
          this.router.navigate(['/auth']);
        }, 3000);
      }
    } catch (error: any) {
      // معالجة أخطاء الاتصال
      // هذه الأخطاء تحدث عند وجود مشكلة في الاتصال بـ Supabase
      this.errorMessage = error.message || 'Failed to connect to the server. Please check your connection.';
    } finally {
      // إيقاف حالة التحميل بغض النظر عن نتيجة العملية
      this.loading = false;
    }
  }
}