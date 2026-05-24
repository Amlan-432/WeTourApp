import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Authservice } from '../../services/AuthService/authservice';
import { PackageService } from '../../services/packageService/package-service';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, Subscription, switchMap } from 'rxjs';
import { Userservice } from '../../services/UserService/userservice';

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
   

  dest! :string
  startDate!:Date;
  public destinations = signal<any[]>([]);

  private searchTerms = new Subject<string>();
  private searchSubscription!: Subscription;

  ngOnInit(){
    this.searchSubscription = this.searchTerms.pipe(
      debounceTime(300),       
      distinctUntilChanged(),     
      switchMap((term: string) => {
        debugger;
        if (!term.trim() || term.trim().length < 2) {
          return of({ data: [] }); 
        }

        return this.packService.getdestination(term).pipe(
          catchError((err) => {
            console.error('API Error:', err);
            return of({ data: [] }); 
          })
        );
      })
    ).subscribe({
      next: (res: any) => {
        this.destinations.set(res?.data || []);
      }
    });
  }

  public onSearchChange(value: string): void {
    this.searchTerms.next(value);
  }





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

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }


}
