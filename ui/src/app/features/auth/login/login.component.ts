import { Component, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { NgIconComponent } from '@ng-icons/core';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Medusae, MedusaeConfig } from 'antigravity-particle';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('particleContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('googleButton') googleButtonRef!: ElementRef<HTMLDivElement>;
  
  private reactRoot!: Root;
  private resizeTimeout: number | null = null;
  private googleInitialized = false;

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

  ngAfterViewInit() {
    this.initReactParticles();
    this.loadGoogleScript();
  }

  ngOnDestroy() {
    if (this.reactRoot) {
      this.reactRoot.unmount();
    }
    if (this.resizeTimeout) {
      window.clearTimeout(this.resizeTimeout);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.resizeTimeout) {
      window.clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = window.setTimeout(() => this.renderGoogleButton(), 150);
  }

  private initReactParticles() {
    const container = this.containerRef.nativeElement;
    this.reactRoot = createRoot(container);

    const config: any = {
      particles: {
        colorBase: "#0d9488", // Teal base
        colorOne: "#2563eb",  // Blue (Sign In primary)
        colorTwo: "#10b981",  // Emerald (Sign Up primary)
        colorThree: "#fbbf24", // Yellow/Amber
        baseSize: 0.016,
        activeSize: 0.044,
      },
      cursor: {
        radius: 0.065,
        strength: 4,
        dragFactor: 0.015,
      },
      background: {
        color: "transparent",
      }
    };

    this.reactRoot.render(
      React.createElement(Medusae as any, { config })
    );
  }

  loadGoogleScript(): void {
    if (typeof google !== 'undefined') {
      this.initGoogleAuth();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initGoogleAuth();
    };
    script.onerror = () => {
      console.error('Failed to load Google Identity Services script.');
    };
    document.head.appendChild(script);
  }

  initGoogleAuth(): void {
    if (typeof google === 'undefined') return;

    if (!this.googleInitialized) {
      google.accounts.id.initialize({
        client_id: '853052679545-ph5bitniubfnm4cq2pnmdogsnqn2qdre.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleCredentialResponse(response)
      });
      this.googleInitialized = true;
    }

    this.renderGoogleButton();
  }

  renderGoogleButton(): void {
    const btnContainer = this.googleButtonRef?.nativeElement;
    if (btnContainer && typeof google !== 'undefined') {
      btnContainer.replaceChildren();
      google.accounts.id.renderButton(
        btnContainer,
        {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text: 'continue_with',
          logo_alignment: 'left',
          width: Math.floor(btnContainer.parentElement?.clientWidth || btnContainer.clientWidth || 382)
        }
      );
    }
  }

  handleGoogleCredentialResponse(response: any): void {
    if (!response.credential) {
      this.errorMessage.set('Google authentication failed.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.loginWithGoogle(response.credential).subscribe({
      next: (res) => {
        if (res.errors && res.errors.length > 0) {
          this.errorMessage.set(res.errors[0].message || 'Google login failed.');
          this.isLoading.set(false);
          return;
        }

        const data = res.data?.loginWithGoogle;
        if (data && data.status === 'SUCCESS') {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.errorMessage.set(data?.message || 'Google login failed.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'An error occurred during Google login.');
        this.isLoading.set(false);
      }
    });
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

    if (!this.isSignUp()) {
      setTimeout(() => {
        this.renderGoogleButton();
      }, 0);
    }
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
