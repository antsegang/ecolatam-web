import { NgModule } from '@angular/core';
import { ScrollRevealDirective } from './directives/scroll-reveal.directive';

@NgModule({
  imports: [ScrollRevealDirective],
  exports: [ScrollRevealDirective]
})
export class SharedUxModule {}
