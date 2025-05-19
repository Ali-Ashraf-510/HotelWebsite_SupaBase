/**
 * مكون تسجيل الدخول
 * يقوم بإدارة عملية تسجيل دخول المستخدم باستخدام Supabase
 * يرتبط مع SupabaseService للتعامل مع عمليات المصادقة
 */
import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

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
  selector: 'app-auth',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
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
export class AuthComponent {
  // متغيرات النموذج
  email: string = '';          // البريد الإلكتروني
  password: string = '';       // كلمة المرور
  hidePassword: boolean = true; // إخفاء/إظهار كلمة المرور
  loading: boolean = false;    // حالة التحميل
  errorMessage: string | null = null; // رسالة الخطأ
  formErrors: { [key: string]: string } = {}; // أخطاء النموذج

  /**
   * حقن الخدمات المطلوبة في المكون
   * @param supabaseService خدمة Supabase للتعامل مع المصادقة
   *                    - هذه الخدمة تحتوي على كل الدوال اللازمة للتعامل مع Supabase
   *                    - يتم حقنها تلقائياً من خلال نظام Dependency Injection في Angular
   * @param router خدمة التوجيه للتنقل بين الصفحات
   */
  constructor(
    private supabaseService: SupabaseService, 
    private router: Router
  ) {}

  /**
   * التحقق من صحة بيانات النموذج
   * @returns true إذا كان النموذج صحيحاً، false إذا كان هناك أخطاء
   */
  validateForm(): boolean {
    this.formErrors = {};

    // التحقق من البريد الإلكتروني
    if (!this.email) {
      this.formErrors['email'] = 'Email is required';
    } else if (!this.email.includes('@')) {
      this.formErrors['email'] = 'Please enter a valid email';
    }

    // التحقق من كلمة المرور
    if (!this.password) {
      this.formErrors['password'] = 'Password is required';
    } else if (this.password.length < 6) {
      this.formErrors['password'] = 'Password must be at least 6 characters';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  /**
   * معالجة عملية تسجيل الدخول
   * يتم استدعاؤها عند الضغط على زر تسجيل الدخول
   * 
   * سير العمل:
   * 1. التحقق من صحة النموذج
   * 2. تفعيل حالة التحميل
   * 3. استدعاء دالة signIn من SupabaseService
   * 4. معالجة النتيجة (نجاح/فشل)
   * 5. التوجيه في حالة النجاح
   * 6. عرض رسالة خطأ في حالة الفشل
   */
  async onSubmit() {
    // التحقق من صحة النموذج قبل الإرسال
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    try {
      // استخدام SupabaseService للتعامل مع تسجيل الدخول
      // دالة signIn موجودة في ملف supabase.service.ts
      // تقوم بإرسال طلب تسجيل الدخول إلى Supabase
      const { error } = await this.supabaseService.signIn(
        this.email, 
        this.password
      ) as AuthResponse;

      if (error) {
        // معالجة الخطأ في حالة فشل تسجيل الدخول
        // رسالة الخطأ تأتي من Supabase
        this.errorMessage = error.message || 'An unexpected error occurred';
      } else {
        // نجاح تسجيل الدخول - التوجيه لصفحة الفنادق
        this.router.navigate(['/hotels']);
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