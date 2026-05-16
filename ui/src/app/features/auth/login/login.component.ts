import { Component, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { NgIconComponent } from '@ng-icons/core';

class Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  density: number;
  ctx: CanvasRenderingContext2D;

  constructor(x: number, y: number, color: string, ctx: CanvasRenderingContext2D) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.size = Math.random() * 2 + 1;
    this.color = color;
    this.density = (Math.random() * 40) + 5;
    this.ctx = ctx;
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    // Drawing tiny vertical lines/rectangles as requested
    this.ctx.fillRect(this.x, this.y, 2, this.size * 3);
  }

  update(mouse: { x: number | null, y: number | null, radius: number }) {
    if (mouse.x !== null && mouse.y !== null) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let forceDirectionX = dx / distance;
      let forceDirectionY = dy / distance;
      let maxDistance = mouse.radius;
      let force = (maxDistance - distance) / maxDistance;
      let directionX = forceDirectionX * force * this.density;
      let directionY = forceDirectionY * force * this.density;

      if (distance < mouse.radius) {
        this.x += directionX;
        this.y += directionY;
      } else {
        if (this.x !== this.baseX) {
          let dx = this.x - this.baseX;
          this.x -= dx / 15;
        }
        if (this.y !== this.baseY) {
          let dy = this.y - this.baseY;
          this.y -= dy / 15;
        }
      }
    } else {
      if (this.x !== this.baseX) {
        let dx = this.x - this.baseX;
        this.x -= dx / 20;
      }
      if (this.y !== this.baseY) {
        let dy = this.y - this.baseY;
        this.y -= dy / 20;
      }
    }
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private mouse = {
    x: null as number | null,
    y: null as number | null,
    radius: 150
  };

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  private googlePalette = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#A142F4', '#F482B1'];

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

  ngAfterViewInit() {
    this.initCanvas();
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.initCanvas();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouse.x = event.x;
    this.mouse.y = event.y;
  }

  @HostListener('window:mouseout')
  onMouseOut() {
    this.mouse.x = null;
    this.mouse.y = null;
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.particles = [];
    const numberOfParticles = 400;
    for (let i = 0; i < numberOfParticles; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const color = this.googlePalette[Math.floor(Math.random() * this.googlePalette.length)];
      this.particles.push(new Particle(x, y, color, this.ctx));
    }
  }

  private animate() {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update(this.mouse);
      this.particles[i].draw();
    }
    this.animationId = requestAnimationFrame(() => this.animate());
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
