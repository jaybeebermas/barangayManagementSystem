import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { GraphqlService } from '../../services/graphql/graphql.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [DatePipe],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly gql = inject(GraphqlService);
  private readonly router = inject(Router);

  events = signal<any[]>([]);
  isLoading = signal(true);
  selectedEvent = signal<any | null>(null);
  isModalOpen = signal(false);
  isNavScrolled = signal(false);
  activeSection = signal<string>('hero');

  private ctx!: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private particles: LandingParticle[] = [];

  readonly currentYear = new Date().getFullYear();

  readonly services = [
    {
      icon: 'heroDocumentText',
      title: 'Barangay Clearance',
      description: 'Obtain your barangay clearance quickly for employment, business, or legal purposes.',
      color: 'teal',
    },
    {
      icon: 'heroMapPin',
      title: 'Zone Information',
      description: 'Learn about your zone, boundaries, and local zone officials in your community.',
      color: 'blue',
    },
    {
      icon: 'heroCalendarDays',
      title: 'Community Events',
      description: 'Stay updated on upcoming barangay events, assemblies, and community activities.',
      color: 'violet',
    },
    {
      icon: 'heroUserGroup',
      title: 'Resident Registry',
      description: 'Register and maintain your resident profile in the barangay information system.',
      color: 'amber',
    },
  ];

  ngOnInit(): void {
    this.loadPublicEvents();
  }

  ngAfterViewInit(): void {
    this.initCanvas();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isNavScrolled.set(window.scrollY > 60);

    const sections = ['hero', 'services', 'events'];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          this.activeSection.set(id);
        }
      }
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.initCanvas();
  }

  async loadPublicEvents(): Promise<void> {
    this.isLoading.set(true);
    try {
      const res = await this.gql.requestFromFile<any>('event', 'get-public-events.gql', { first: 12 });
      this.events.set(res.publicEvents?.data ?? []);
    } catch {
      this.events.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  openEventModal(event: any): void {
    this.selectedEvent.set(event);
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedEvent.set(null);
    document.body.style.overflow = '';
  }

  navigateToPortal(): void {
    this.router.navigate(['/login']);
  }

  scrollToSection(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PUBLISHED': return 'status-published';
      case 'DRAFT': return 'status-draft';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-draft';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PUBLISHED': return 'Upcoming';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  }

  formatEventDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
  }

  getEventCardAccent(index: number): string {
    const accents = ['accent-teal', 'accent-violet', 'accent-amber', 'accent-rose', 'accent-blue'];
    return accents[index % accents.length];
  }

  private initCanvas(): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    this.particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 8000);
    for (let i = 0; i < count; i++) {
      this.particles.push(new LandingParticle(canvas.width, canvas.height));
    }
  }

  private animate(): void {
    if (!this.ctx || !this.canvasRef) {
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of this.particles) {
      p.update(canvas.width, canvas.height);
      p.draw(this.ctx);
    }
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

class LandingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;

  private readonly colors = ['#14b8a6', '#818cf8', '#f59e0b', '#34d399', '#60a5fa'];

  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.size = Math.random() * 2.5 + 0.5;
    this.opacity = Math.random() * 0.35 + 0.05;
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  update(w: number, h: number): void {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0) this.x = w;
    if (this.x > w) this.x = 0;
    if (this.y < 0) this.y = h;
    if (this.y > h) this.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
