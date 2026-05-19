import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PackageService } from '../../services/packageService/package-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sel-tour-packages-info',
  imports: [CommonModule],
  templateUrl: './sel-tour-packages-info.html',
  styleUrl: './sel-tour-packages-info.css',
})
export class SelTourPackagesInfo {
  PackService = inject(PackageService);
  router = inject(Router);
  confirmedPackageDetails = signal<any>({})
  ngOnInit(){
    this.PackService.bookedPackageDetails$.subscribe({
      next:(res)=>{
        if(res){
          debugger;
          this.confirmedPackageDetails.set(res);
          console.log(this.confirmedPackageDetails());
        }
      },
      error: (err)=>{console.log(err)}
    })
  }

  goHome(){
    const re = confirm('redirecting to booking page');
    if(re){
    this.router.navigateByUrl('/landingDash/traveller/tourPackages/tourPackagesForm');
    }
  }
}
