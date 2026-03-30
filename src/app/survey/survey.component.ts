// src/app/survey/survey.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export type AppState =
  | 'idle'
  | 'celebrate'
  | 'sorry'
  | 'submitting'
  | 'success'
  | 'error';

export interface RatingOption {
  value: 1 | 2 | 3 | 4;
  emoji: string;
  label: string;
  color: string;       // border + hover accent color
  colorBg: string;     // hover background tint
  iconColor: string;   // ✏️ the actual thumb SVG fill color — change this freely!
  count: 1 | 2;        // how many thumbs to show
  direction: 'up' | 'down';
}

export interface Particle {
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  delay: number;
  duration: number;
  shape: 'circle' | 'rect' | 'triangle';
}

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css'],
  standalone: false
})
export class SurveyComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  state: AppState = 'idle';
  errorMsg = '';
  selectedRating: RatingOption | null = null;
  particles: Particle[] = [];
  teardrops: { x: number; delay: number; duration: number }[] = [];
  private animTimer: any;

  // // ✏️ To change thumb color: edit iconColor (any valid CSS color)
  // // ✏️ To change hover accent: edit color + colorBg
  // ratings: RatingOption[] = [
  //   // GREEN
  //   { value: 4, emoji: '👍👍', label: 'Two Thumbs Up',   color: '#16a34a', colorBg: '#f0fdf4', iconColor: '#16a34a', count: 2, direction: 'up'   },
  //   // LIGHT GREEN
  //   { value: 3, emoji: '👍',   label: 'Thumbs Up',       color: '#4ade80', colorBg: '#f0fdf4', iconColor: '#4ade80', count: 1, direction: 'up'   },
  //   // ORANGE
  //   { value: 2, emoji: '👎',   label: 'Thumbs Down',     color: '#f97316', colorBg: '#fff7ed', iconColor: '#f97316', count: 1, direction: 'down' },
  //   // DARK ORANGE
  //   { value: 1, emoji: '👎👎', label: 'Two Thumbs Down', color: '#ea580c', colorBg: '#fff7ed', iconColor: '#ea580c', count: 2, direction: 'down' },
  // ];

  // ✏️ To change thumb color: edit iconColor 
  // ✏️ To change hover accent: edit color + colorBg
  ratings: RatingOption[] = [
    // DARK ORANGE (Two Thumbs Down)
    { value: 1, emoji: '👎👎', label: 'Two Thumbs Down', color: '#ea580c', colorBg: '#fff7ed', iconColor: '#ea580c', count: 2, direction: 'down' },
    
    // ORANGE (Thumbs Down)
    { value: 2, emoji: '👎',   label: 'Thumbs Down',     color: '#f97316', colorBg: '#fff7ed', iconColor: '#f97316', count: 1, direction: 'down' },
    
    // LIGHT GREEN (Thumbs Up)
    { value: 3, emoji: '👍',   label: 'Thumbs Up',       color: '#4ade80', colorBg: '#f0fdf4', iconColor: '#4ade80', count: 1, direction: 'up'   },

    // GREEN (Two Thumbs Up)
    { value: 4, emoji: '👍👍', label: 'Two Thumbs Up',   color: '#16a34a', colorBg: '#f0fdf4', iconColor: '#16a34a', count: 2, direction: 'up'   },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      comment: ['', Validators.maxLength(500)],
    });
  }

  ngOnDestroy(): void { clearTimeout(this.animTimer); }

  // selectRating(r: RatingOption): void {
  //   this.selectedRating = r;
  //   this.particles = [];
  //   this.teardrops = [];
  //   if (r.value >= 3) {
  //     this.state = 'celebrate';
  //     this.spawnConfetti();
  //   } else {
  //     this.state = 'sorry';
  //     this.spawnTeardrops();
  //   }
  // }

  selectRating(r: RatingOption): void {
    this.selectedRating = r;
    this.particles = [];
    this.teardrops = [];
    
    if (r.value >= 3) {
      // FOR THUMBS UP: Skip the celebrate screen and automatically submit!
      this.submit();
    } else {
      // FOR THUMBS DOWN: Keep the "We're Sorry" screen so they can type a comment
      this.state = 'sorry';
      this.spawnTeardrops();
    }
  }

  spawnConfetti(): void {
    const colors = ['#fbbf24','#34d399','#60a5fa','#f472b6','#a78bfa','#fb923c','#f43f5e','#38bdf8'];
    const shapes: Particle['shape'][] = ['circle','rect','triangle'];
    this.particles = Array.from({ length: 60 }, (_, i) => ({
      x: 10 + Math.random() * 80,
      y: -10 - Math.random() * 30,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 8,
      angle: Math.random() * 720 - 360,
      delay: Math.random() * 800,
      duration: 900 + Math.random() * 700,
      shape: shapes[i % shapes.length],
    }));
  }

  spawnTeardrops(): void {
    this.teardrops = Array.from({ length: 8 }, () => ({
      x: 10 + Math.random() * 80,
      delay: Math.random() * 1200,
      duration: 1000 + Math.random() * 600,
    }));
  }

  get commentLength(): number {
    return this.form.get('comment')?.value?.length ?? 0;
  }

  submit(): void {
    if (this.state === 'submitting' || !this.selectedRating) return;
    this.state = 'submitting';

    // 🎉 Trigger confetti immediately if it's a positive rating!
    if (this.selectedRating.value >= 3) {
      this.spawnConfetti();
    }

    // ⏳ Simulated submit — replace with real API call when Supabase is ready
    this.animTimer = setTimeout(() => {
      this.state = 'success';
      this.spawnConfetti();
    }, 1500);
  }

  reset(): void {
    this.state = 'idle';
    this.selectedRating = null;
    this.errorMsg = '';
    this.particles = [];
    this.teardrops = [];
    this.form.reset();
  }
}