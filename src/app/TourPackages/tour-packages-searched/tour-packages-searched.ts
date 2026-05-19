import { Component, computed, inject, signal } from '@angular/core';
import { PackageService } from '../../services/packageService/package-service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Authservice } from '../../services/AuthService/authservice';

@Component({
  selector: 'app-tour-packages-searched',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './tour-packages-searched.html',
  styleUrl: './tour-packages-searched.css',
})
export class TourPackagesSearched {
  public packageService = inject(PackageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(Authservice);
  searchedPackage = signal<any[]>([]);
  selectedPackage = signal<any>({});
  travellersList = signal<any[]>([]);


  formName: string = '';
  formEmail: string = '';
  formGender: string = '';
  formIdType: string = 'Passport';
  formIdNumber: string = '';



  ngOnInit() {
    this.packageService.packages.subscribe({
      next: res => {
        if (res) {
          this.searchedPackage.set(res)
        }
      },
      error: err => { console.log(err) }
    })
  }


  getUrl(endpoint: string): string {
    let url = `/landingDash/tourPackages/${endpoint}`;
    this.authService.currentUser.subscribe(res => {
      if (res) {
        url = `/landingDash/traveller/tourPackages/${endpoint}`;
      }
      return url;
    });

    return url;

  }

  goToPayment(pkgId: string) {
    console.log(pkgId);
    this.packageService.bookPackage(pkgId, this.travellersList()).subscribe({
      next: (res) => {
        if (res) {
          this.authService.currentUser.subscribe((res: any) => {
            if (res) {
              this.router.navigate(['/landingDash/traveller/tourPackages/tourPackagesinfo', pkgId]);
            }
          })
        }
      },
      error: (err) => { console.log(err) }
    });
  }


  // Appends current input row values into the formatted array context 
  addTraveller() {
    if (!this.formName || !this.formEmail || !this.formGender || !this.formIdNumber) {
      alert('Please fill out all companion information fields before adding.');
      return;
    }

    const structuredTraveller = {
      name: this.formName,
      email: this.formEmail,
      gender: this.formGender,
      id_proof: {
        id_type: this.formIdType,
        id_number: this.formIdNumber
      }
    };

    this.travellersList.update(prev => [...prev, structuredTraveller]);

    this.formName = '';
    this.formEmail = '';
    this.formGender = '';
    this.formIdType = 'Passport';
    this.formIdNumber = '';
  }

  // Slice out target element indexing positional changes
  removeTraveller(index: number) {
    this.travellersList.update(prev => prev.filter((_, i) => i !== index));
  }

  // Clean context clear helper when modal close exits
  closeModal() {
    this.selectedPackage.set({});
    this.travellersList.set([]); // Flush list
  }

}
