import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { NgIconComponent } from '@ng-icons/core';
import { ParticlesComponent } from './particles.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent, ParticlesComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);
  isSignUp = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Keep confirm_password in sync when password changes
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.registerForm.get('confirm_password')?.updateValueAndValidity();
    });
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirm_password')?.value;
    if (password && confirm && password !== confirm) {
      group.get('confirm_password')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleMode(): void {
    this.isSignUp.update(v => !v);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.loginForm.reset();
    this.registerForm.reset();
    this.showPassword.set(false);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        if (response.data?.login?.status === 'SUCCESS') {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.errorMessage.set(response.data?.login?.message || 'Login failed.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'An error occurred during login.');
        this.isLoading.set(false);
      }
    });
  }

  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { username, first_name, last_name, email, password } = this.registerForm.value;

    this.authService.register({ username, first_name, last_name, email, password }).subscribe({
      next: (response) => {
        if (response.data?.register?.status === 'SUCCESS') {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.errorMessage.set(response.data?.register?.message || 'Registration failed.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'An error occurred during registration.');
        this.isLoading.set(false);
      }
    });
  }
}
