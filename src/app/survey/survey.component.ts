// src/app/survey/survey.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export type AppState =
  | 'idle'
  | 'celebrate'
  | 'sorry'
  | 'submitting'
  | 'success'
  | 'error'
  | 'invalid-branch';

export interface RatingOption {
  value: 1 | 2 | 3 | 4;
  emoji: string;
  label: string;
  color: string;       // border + hover accent color
  colorBg: string;     // hover background tint
  iconColor: string;   
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

const BRANCHES: Record<string, string> = {
  'jakosalem':   'Jakosalem Service Center',
  'parkmall':     'Parkmall Service Center',
  'liloan':      'Liloan Service Center',
  'banilad':        'Banilad Service Center',
  'talisay':     'Talisay Service Center',
  'banawa': 'Banawa Service Center',
  'naga':        'Naga Service Center',
};


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

  branchName = '';
  branchKey = '';

  // banner
  bannerImageUrl = '';
  bannerLinkUrl = '';

  // banner carousel
  banners: any[] = [];
  currentBannerIndex: number = 0;
  private carouselTimer: any;
  transitionStyle: string = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';

  showDetails: boolean = true; // control visibility of details section

  // Expose the branches to the HTML template
  availableBranches = Object.entries(BRANCHES).map(([key, name]) => ({ key, name }));

  // Function to update the branch when the dropdown changes
  changeBranch(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newKey = selectElement.value;
    
    // Update the internal state to the newly selected branch
    this.branchKey = newKey;
    this.branchName = BRANCHES[newKey] || newKey;
  }

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
    //  { value: 1, emoji: '👎👎', label: 'Two Thumbs Down', color: '#ea580c', colorBg: '#fff7ed', iconColor: '#ea580c', count: 2, direction: 'down' },
    
    // // ORANGE (Thumbs Down)
    // { value: 2, emoji: '👎',   label: 'Unsatisfied',     color: '#f97316', colorBg: '#fff7ed', iconColor: '#f97316', count: 1, direction: 'down' },
    // DARK RED (Two Thumbs Down)
    //{ value: 1, emoji: '👎👎', label: 'Very Unsatisfied', color: '#dc2626', colorBg: '#fef2f2', iconColor: '#dc2626', count: 2, direction: 'down' },
    
    // RED (Unsatisfied)
    //{ value: 2, emoji: '👎',   label: 'Unsatisfied',     color: '#ef4444', colorBg: '#fef2f2', iconColor: '#ef4444', count: 1, direction: 'down' },
    
    // LIGHT GREEN (Thumbs Up)
    //{ value: 3, emoji: '👍',   label: 'Satisfied',       color: '#4ade80', colorBg: '#f0fdf4', iconColor: '#4ade80', count: 1, direction: 'up'   },

    // GREEN (Two Thumbs Up)
     //{ value: 4, emoji: '👍👍', label: 'Very Satisfied',   color: '#16a34a', colorBg: '#f0fdf4', iconColor: '#16a34a', count: 2, direction: 'up'   },

    // GREEN (Two Thumbs Up)
    { value: 4, emoji: '👍👍', label: 'Very Satisfied',   color: '#16a34a', colorBg: '#f0fdf4', iconColor: '#16a34a', count: 2, direction: 'up'   },

    // LIGHT GREEN (Thumbs Up)
    { value: 3, emoji: '👍',   label: 'Satisfied',       color: '#4ade80', colorBg: '#f0fdf4', iconColor: '#4ade80', count: 1, direction: 'up'   },

    // RED (Unsatisfied)
    { value: 2, emoji: '👎',   label: 'Unsatisfied',     color: '#ef4444', colorBg: '#fef2f2', iconColor: '#ef4444', count: 1, direction: 'down' },
    
    // DARK RED (Two Thumbs Down)
    { value: 1, emoji: '👎👎', label: 'Very Unsatisfied', color: '#dc2626', colorBg: '#fef2f2', iconColor: '#dc2626', count: 2, direction: 'down' },

  ];

  constructor(private fb: FormBuilder) {}

  // ngOnInit(): void {
  //   this.form = this.fb.group({
  //     comment: ['', Validators.maxLength(500)],
  //   });
  // }


  ngOnInit(): void {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('branch')?.toLowerCase().trim() ?? '';

  if (key && BRANCHES[key]) {
    this.branchKey  = key;
    this.branchName = BRANCHES[key];
  } else if (key) {
    // Has a branch param but it's not in the list
    this.state = 'invalid-branch';
  } else {
    // No branch param at all — use default (good for local dev)
    this.branchKey  = 'banilad';
    this.branchName = BRANCHES['banilad'];
  }

  this.form = this.fb.group({
    comment: ['', Validators.maxLength(500)],
    ticketNum: ['', Validators.maxLength(50)],
    phoneNum:  ['', Validators.maxLength(12)],
    accountNum: ['', Validators.maxLength(50)],
  });

  this.loadBanner();
}

// banner load

// loadBanner(): void {
//   fetch('https://tinwiwrhvexmwrctihdh.supabase.co/functions/v1/getBanner', {
//     headers: {
//       'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbndpd3JodmV4bXdyY3RpaGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzgyNDUsImV4cCI6MjA4OTkxNDI0NX0.t12NPSjXjqf4XI4b-nchpZY5ebFANS8t8fo3dbyZysY',
//     }
//   })
//   .then(res => res.json())
//   .then(data => {
//     if (data?.banner) {
//       this.bannerImageUrl = data.banner.image_url ?? '';
//       this.bannerLinkUrl  = data.banner.link_url  ?? '#';
//     }
//   })
//   .catch(() => {
//     // Banner failure is silent — survey still works
//   });
// }

isLoading = true;

loadBanner(): void {
    fetch('https://tinwiwrhvexmwrctihdh.supabase.co/functions/v1/getBanner', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbndpd3JodmV4bXdyY3RpaGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzgyNDUsImV4cCI6MjA4OTkxNDI0NX0.t12NPSjXjqf4XI4b-nchpZY5ebFANS8t8fo3dbyZysY',
      }
    })
    .then(res => res.json())
    .then(data => {
      // Check for our new array of banners
      if (data?.banners && data.banners.length > 0) {
        this.banners = data.banners;
        this.startCarousel();
      }
      this.isLoading  = false;
    })
    .catch(() => {
      // Banner failure is silent — survey still works
      this.isLoading  = false;
    });
  }

  // Add this new function to handle the rotation
  // startCarousel(): void {
  //   // Only start the timer if there is more than 1 banner
  //   if (this.banners.length > 1) {
  //     this.carouselTimer = setInterval(() => {
  //       this.currentBannerIndex = (this.currentBannerIndex + 1) % this.banners.length;
  //     }, 5000); // 5000 milliseconds = 5 seconds
  //   }
  // }
  startCarousel(): void {
    if (this.banners.length > 1) {
      this.carouselTimer = setInterval(() => {
        this.currentBannerIndex++;

        // If we just slid to the "clone" (the extra slide at the end)
        if (this.currentBannerIndex === this.banners.length) {
          
          // Wait 600ms for the slide animation to finish
          setTimeout(() => {
            // 1. Turn off the smooth animation
            this.transitionStyle = 'none'; 
            
            // 2. Snap instantly back to the real first slide (index 0)
            this.currentBannerIndex = 0;

            // 3. Turn the smooth animation back on a tiny moment later
            setTimeout(() => {
              this.transitionStyle = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
            }, 50);

          }, 600); // 600ms matches our CSS animation speed
        }
      }, 5000);
    }
  }

// end banner load

  ngOnDestroy(): void { 
    clearTimeout(this.animTimer); 
    clearInterval(this.carouselTimer);
  }

  selectRating(r: RatingOption): void {
    this.selectedRating = r;
    this.particles = [];
    this.teardrops = [];
    if (r.value >= 3) {
      this.state = 'celebrate';
      this.spawnConfetti();
    } else {
      this.state = 'sorry';
      this.spawnTeardrops();
    }
  }


  reloadPage(): void {
  // Re-inject the loader before reloading so it's visible instantly
  const loader = document.createElement('div');
  loader.id = 'init-loader';
  loader.innerHTML = '<div id="init-spinner"></div>';
  loader.style.cssText = `
    position: fixed;
    inset: 0;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;
  document.body.appendChild(loader);

  // Small delay so the loader paints before the reload fires
  setTimeout(() => {
    window.location.href = this.surveyUrl;
  }, 50);
}

  // selectRating(r: RatingOption): void {
  //   this.selectedRating = r;
  //   this.particles = [];
  //   this.teardrops = [];
    
  //   if (r.value >= 3) {
  //     // FOR THUMBS UP: Skip the celebrate screen and automatically submit!
  //     this.submit();
  //   } else {
  //     // FOR THUMBS DOWN: Keep the "We're Sorry" screen so they can type a comment
  //     this.state = 'sorry';
  //     this.spawnTeardrops();
  //   }
  // }

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

  // submit(): void {
  //   if (this.state === 'submitting' || !this.selectedRating) return;
  //   this.state = 'submitting';

  //   // 🎉 Trigger confetti immediately if it's a positive rating!
  //   if (this.selectedRating.value >= 3) {
  //     this.spawnConfetti();
  //   }

  //   // ⏳ Simulated submit — replace with real API call when Supabase is ready
  //   this.animTimer = setTimeout(() => {
  //     this.state = 'success';
  //     this.spawnConfetti();
  //   }, 1500);
  // }

  // submit(): void {
  //   if (this.state === 'submitting' || !this.selectedRating) return;
  //   this.state = 'submitting';

  //   fetch('https://tinwiwrhvexmwrctihdh.supabase.co/functions/v1/submitSurvey', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       branch:  this.branchKey,
  //       rating:  this.selectedRating.value,
  //       label:   this.selectedRating.label,
  //       comment: this.form.get('comment')?.value?.trim() || '',
  //     }),
  //   })
  //   .then(res => res.json())
  //   .then(() => { this.state = 'success'; this.spawnConfetti(); })
  //   .catch(() => {
  //     this.state = 'error';
  //     this.errorMsg = 'Submission failed. Please try again.';
  //   });
  // }

  // ======================================================================//

  // for positive feedback
  // Add this array of options (you can customize these electric services!)
  // positiveFeedbackOptions: string[] = [
  //   'Fast service',
  //   'Friendly Staff',
  //   'Clean facility',
  //   'Clear Staff communication',
  //   'Clear Billing Explanation',
  //   'Quick Issue Resolution',
  //   'Smooth Application Process'
  // ];

  // // Add this function to handle when a user clicks a feedback button
  // selectPositiveFeedback(option: string): void {
  //   // This updates the existing form 'comment' control with the button's text
  //   this.form.patchValue({
  //     comment: option
  //   });
  // }

  // // ==========================================


  // // for negative feedback (keep the comment box and add optional buttons for common complaints)
  // negativeFeedbackOptions: string[] = [
  //   'Long Waiting Time',
  //   'Unfriendly Staff',
  //   'Unclear Billing',
  //   'Unresolved Issue',
  //   'Slow Process',
  //   'Poor Communication',
  // ];

  // selectNegativeFeedback(option: string): void {
  //   this.form.patchValue({ comment: option });
  // }


  // Helper to toggle feedback options in the comma-separated string
  toggleFeedbackOption(option: string): void {
    const currentComment = this.form.get('comment')?.value || '';
    
    // Split the current string into an array, removing empty spaces
    let selectedOptions = currentComment
      .split(', ')
      .filter((val: string) => val.trim() !== '');

    if (selectedOptions.includes(option)) {
      // If already selected, remove it
      selectedOptions = selectedOptions.filter((val: string) => val !== option);
    } else {
      // If not selected, add it
      selectedOptions.push(option);
    }

    // Join the array back into a string with a comma and a space
    this.form.patchValue({ comment: selectedOptions.join(', ') });
  }

  // Helper for the HTML to check if a pill is currently selected
  isOptionSelected(option: string): boolean {
    const currentComment = this.form.get('comment')?.value || '';
    const selectedOptions = currentComment
      .split(', ')
      .filter((val: string) => val.trim() !== '');
      
    return selectedOptions.includes(option);
  }

  // for positive feedback
  positiveFeedbackOptions: string[] = [
    'Fast service',
    'Friendly Staff',
    'Clean facility',
    'Clear Staff communication',
    'Clear Billing Explanation',
    'Quick Issue Resolution',
    'Smooth Application Process'
  ];

  selectPositiveFeedback(option: string): void {
    this.toggleFeedbackOption(option);
  }

  // for negative feedback
  negativeFeedbackOptions: string[] = [
    'Long Waiting Time',
    'Unfriendly Staff',
    'Unclear Billing',
    'Unresolved Issue',
    'Slow Process',
    'Poor Communication',
  ];

  selectNegativeFeedback(option: string): void {
    this.toggleFeedbackOption(option);
  }



// ==========================================
  submit(): void {
    if (this.state === 'submitting' || !this.selectedRating) return;
    this.state = 'submitting';

    fetch('https://tinwiwrhvexmwrctihdh.supabase.co/functions/v1/submitSurvey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'BeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbndpd3JodmV4bXdyY3RpaGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzgyNDUsImV4cCI6MjA4OTkxNDI0NX0.t12NPSjXjqf4XI4b-nchpZY5ebFANS8t8fo3dbyZysY',  // ← paste anon key here
      },
      body: JSON.stringify({
        branch:  this.branchKey,
        rating:  this.selectedRating.value,
        label:   this.selectedRating.label,
        comment: this.form.get('comment')?.value?.trim() || '',
        ticketNum: this.form.get('ticketNum')?.value?.trim() || '',
        phoneNum:  this.form.get('phoneNum')?.value?.trim()
             ? '0' + this.form.get('phoneNum')?.value?.trim()   // ← prepends 0
             : '',
        accountNum: this.form.get('accountNum')?.value?.trim() || '',
      }),
    })
    .then(res => res.json())
    .then(() => { this.state = 'success'; this.spawnConfetti(); })
    .catch(() => {
      this.state = 'error';
      this.errorMsg = 'Submission failed. Please try again.';
    });
  }

  reset(): void {
    this.state = 'idle';
    this.selectedRating = null;
    this.errorMsg = '';
    this.particles = [];
    this.teardrops = [];
    this.showDetails = true;
    this.form.reset();
  }

  get surveyUrl(): string {
    return this.branchKey ? `?branch=${this.branchKey}` : '?branch=banilad';
  }
}