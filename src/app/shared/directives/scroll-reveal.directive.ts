import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input('appScrollReveal') revealClass = 'fade-in';
  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const element = this.el.nativeElement;

    if (prefersReduced) {
      element.classList.add(this.revealClass);
      return;
    }

    element.classList.add('sr-hidden');

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          element.classList.add(this.revealClass);
          element.classList.remove('sr-hidden');
          this.observer?.unobserve(element);
        }
      });
    }, { threshold: 0.1 });

    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
