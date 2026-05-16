import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NgxParticlesModule } from '@tsparticles/angular';
import { Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxParticlesModule, NgIconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  async particlesInit(engine: any): Promise<void> {
    console.log("Initializing tsParticles engine...");
    await loadSlim(engine); 
  }

  particlesOptions = {
    background: {
      color: { value: "transparent" } 
    },
    particles: {
      color: { 
        value: ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#8E24AA"] 
      },
      move: {
        enable: true,
        speed: { min: 0.2, max: 1 },
        direction: "none" as const,
        random: true,
        straight: false,
        outModes: "out" as const,
      },
      number: {
        value: 200,
        density: { enable: true, area: 800 }
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 }
      },
      opacity: {
        value: { min: 0.3, max: 0.9 },
        animation: {
          enable: true,
          speed: 0.5,
          minimumValue: 0.1
        }
      }
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse"
        }
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 }
      }
    },
    detectRetina: true
  };

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
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
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
}
