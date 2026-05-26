import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavBar } from './nav-bar/nav-bar';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Tokenservice } from './services/tokenService/tokenservice';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NavBar,CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  
  showNavbar = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateNavbarVisibility(this.router.url); 

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log("Navigated to:", event.urlAfterRedirects);
      this.updateNavbarVisibility(event.urlAfterRedirects);
    });
  }

  private updateNavbarVisibility(url: string) {
    const isDashboard = url.includes('admin')|| url.includes('hotelManager') || url.includes('packageManDash') ;
    this.showNavbar = !isDashboard;
  }

   
  
  
}
