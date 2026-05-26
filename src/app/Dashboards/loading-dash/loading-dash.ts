import { Component } from '@angular/core';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-loading-dash',
  imports: [LottieComponent],
  templateUrl: './loading-dash.html',
  styleUrl: './loading-dash.css',
})
export class LoadingDash {
  options: AnimationOptions = {
    path: '/assets/Traveler.json', 
    loop: true,
    autoplay: true,
  };
  animationCreated(animationItem: any): void {
    console.log('Lottie animation fully loaded and playing!');
  }

}
