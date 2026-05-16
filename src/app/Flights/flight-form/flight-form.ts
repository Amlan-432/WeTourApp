import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Hotelservice } from '../../services/HotelService/hotelservice';
import { FlightSearchCriteria, Flightservice } from '../../services/FlightService/flightservice';
import { debounceTime, distinctUntilChanged, EMPTY, from, Subscription, switchMap } from 'rxjs';
import { Authservice } from '../../services/AuthService/authservice';

type locationarr = {
  origin: {
    airport_code: string,
    city: string
  },
  destination: {
    airport_code: string,
    city: string
  }
}

@Component({
  selector: 'app-flight-form',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './flight-form.html',
  styleUrl: './flight-form.css',
})
export class FlightForm {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private flightService = inject(Flightservice);
  private authService = inject(Authservice);

  flightForm!: FormGroup;
  private searchSub?: Subscription;
  filteredOrigins: locationarr[] = [];
  filteredDestinations: locationarr[] = [];

  ngOnInit() {
    this.initForm();

    this.setUpSearch('from', 'filteredOrigins');
    this.setUpSearch('to', 'filteredDestinations');


    this.searchSub = this.flightService.currentSearch$.subscribe(criteria => {
      if (criteria) {
        this.flightForm.patchValue({
          to: criteria.destination,
          people: criteria.people
        });
      }
    });


  }

  private initForm() {
    this.flightForm = this.fb.group({
      from: ['', [Validators.required]],
      to: ['', [Validators.required]],
      date: ['', Validators.required],
      people: [1, [Validators.required, Validators.min(1), Validators.max(9)]]
    });
  }

  private setUpSearch(code: 'from' | 'to', target: 'filteredOrigins' | 'filteredDestinations') {

    this.flightForm.get(code)?.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(v => {
        if (v && v.length >= 1) {
          return this.flightService.getOriginAndDest(v);
        } else {
          return EMPTY;
        }
      })).subscribe({
        next: (res) => {
          if (res.success) {
            if (target === 'filteredOrigins') {
              this.filteredOrigins = [
                ...new Map(
                  [...this.filteredOrigins, ...res.data].map(item => [item.origin.airport_code, item])
                ).values()
              ];
            } else {
              this.filteredDestinations = [
                ...new Map(
                  [...this.filteredDestinations, ...res.data].map(item => [item.destination.airport_code, item])
                ).values()
              ];
            }
          }
        },
        error: (err) => console.error('search Error:', err)
      });

  }

  onSearchFlights() {
    if (this.flightForm.valid) {
      const formValue = this.flightForm.value;

      const criteria: FlightSearchCriteria = {
        from: formValue.from,
        destination: formValue.to,
        date: formValue.date,
        people: formValue.people
      };
      console.log(formValue);
      

      this.flightService.updateSearch(criteria);
      this.flightService.getFlight(criteria.from!, criteria.destination!, criteria.date!).subscribe();

      this.authService.currentUser.subscribe(res => {
        if (res) {
          this.router.navigate(['/landingDash/traveller/flights/searchedflights']);
        } else {
          this.router.navigate(['/landingDash/flights/searchedflights']);
        }
      });

    } else {
      this.flightForm.markAllAsTouched();
    }
  }

  getCurrentDate() {
    const date = new Date(Date.now());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

}
