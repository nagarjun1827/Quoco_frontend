import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isDarkMode = false;

  // OTP Modal state
  showOtpModal = false;
  otpDigits: string[] = ['', '', '', '', '', ''];
  otpError = '';
  otpVerified = false;
  resendDisabled = false;
  countdown = 60;
  private countdownInterval: any;

  // Mock OTP for demo
  private mockOtp = '123456';
  maskedEmail = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const currentTheme = this.document.documentElement.getAttribute('data-theme');
      if (currentTheme === 'dark') this.isDarkMode = true;
    }
  }

  ngOnDestroy() {
    this.clearCountdown();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const email: string = this.loginForm.value.email;
      const [local, domain] = email.split('@');
      this.maskedEmail = local.slice(0, 2) + '***@' + domain;
      this.openOtpModal();
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  openOtpModal() {
    this.otpDigits = ['', '', '', '', '', ''];
    this.otpError = '';
    this.otpVerified = false;
    this.showOtpModal = true;
    this.startCountdown();
  }

  closeOtpModal() {
    this.showOtpModal = false;
    this.clearCountdown();
    this.otpDigits = ['', '', '', '', '', ''];
    this.otpError = '';
  }

  startCountdown() {
    this.countdown = 60;
    this.resendDisabled = true;
    this.clearCountdown();
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.resendDisabled = false;
        this.clearCountdown();
      }
    }, 1000);
  }

  clearCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  resendOtp() {
    this.otpDigits = ['', '', '', '', '', ''];
    this.otpError = '';
    this.startCountdown();
    // In real app: call API to resend OTP
    console.log('OTP resent to', this.maskedEmail);
  }

  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Take only the newest digit if multiple are present (browser-independent)
    const digits = value.replace(/\D/g, '');
    const lastDigit = digits ? digits[digits.length - 1] : '';
    
    // Update model and DOM immediately
    this.otpDigits[index] = lastDigit;
    input.value = lastDigit;

    if (lastDigit && index < 5) {
      // Use settimeout to ensure focus happens after current event cycle
      setTimeout(() => {
        const nextInput = this.document.getElementById(`login-otp-${index + 1}`) as HTMLInputElement;
        nextInput?.focus();
      }, 5);
    }
    this.otpError = '';
  }

  onOtpKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const prevInput = this.document.getElementById(`login-otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const digits = text.replace(/\D/g, '').slice(0, 6).split('');
    digits.forEach((d, i) => { if (i < 6) this.otpDigits[i] = d; });
    const focusIdx = Math.min(digits.length, 5);
    (this.document.getElementById(`login-otp-${focusIdx}`) as HTMLInputElement)?.focus();
  }

  verifyOtp() {
    const entered = this.otpDigits.join('');
    if (entered.length < 6) {
      this.otpError = 'Please enter all 6 digits.';
      return;
    }
    if (entered === this.mockOtp) {
      this.otpVerified = true;
      this.clearCountdown();
      setTimeout(() => {
        this.showOtpModal = false;
        this.router.navigate(['/home']);
      }, 1500);
    } else {
      this.otpError = 'Invalid OTP. Please try again. (Hint: 123456)';
      this.otpDigits = ['', '', '', '', '', ''];
      (this.document.getElementById('login-otp-0') as HTMLInputElement)?.focus();
    }
  }
}
