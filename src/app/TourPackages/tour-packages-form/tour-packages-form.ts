import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Authservice } from '../../services/AuthService/authservice';
import { PackageService } from '../../services/packageService/package-service';

@Component({
  selector: 'app-tour-packages-form',
  imports: [CommonModule,FormsModule],
  templateUrl: './tour-packages-form.html',
  styleUrl: './tour-packages-form.css',
})
export class TourPackagesForm {

   private router = inject(Router);
   private authService=inject(Authservice);
   packService = inject(PackageService);


  // Signals for the three search criteria
  dest! :string
  startDate!:Date;

  onSearch() {
    const sDate = new Date(this.startDate).toString();
    this.packService.searchPackage(this.dest, sDate).subscribe();
    this.authService.currentUser.subscribe(res=>{
      if(res){
         this.router.navigate(['/landingDash/traveller/tourPackages/searchedtourPackages'], {
      queryParams: {
        dest: this.dest,
        start: this.startDate
      }
    });

      }else{
        this.router.navigate(['/landingDash/tourPackages/searchedtourPackages'], {
      queryParams: {
        dest: this.dest,
        start: this.startDate,
      }
    });

      }
    });
  }

}
