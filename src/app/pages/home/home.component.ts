import { Component, Inject, OnInit, PLATFORM_ID, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DOCUMENT, isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  isDarkMode = false;

  // Carousel State
  currentSlide = 0;
  slideInterval: any;
  slides = [
    { image: 'carousel_arch_1.png' },
    { image: 'carousel_arch_2.png' },
    { image: 'carousel_arch_3.png' }
  ];

  testimonials = [
    { quote: '"Quoco seamlessly merged our tender estimations onto a single pane of glass."', author: '— Sarah J., Apex Construction' },
    { quote: '"Relying strictly on Quoco\'s BOQ automation for infrastructure budgets."', author: '— Marcus V., Bridgeway Logistics' },
    { quote: '"The dashboard clarity saved us from a multi-million-dollar overrun."', author: '— David R., MegaMall Partners LLC' }
  ];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const currentTheme = this.document.documentElement.getAttribute('data-theme');
      if (currentTheme === 'dark') {
        this.isDarkMode = true;
      }
    }
    
    if (isPlatformBrowser(this.platformId)) {
      this.startSlideShow();
    }
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  startSlideShow() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      this.document.documentElement.setAttribute('data-theme', 'light');
    }
  }
}
