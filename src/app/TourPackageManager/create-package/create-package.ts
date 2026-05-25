import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PackageService } from '../../services/packageService/package-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-package',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-package.html',
  styleUrl: './create-package.css',
})
export class CreatePackage {
  packService = inject(PackageService);
  private fb = inject(FormBuilder);
   router = inject(Router);

  packageForm!: FormGroup;
  travelModes = ['Flight', 'Train', 'Bus', 'Cruise'];
  statusOptions = ['Active', 'Draft', 'Archieved'];

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.packageForm = this.fb.group({
      
      destination: ['', [Validators.required, Validators.minLength(2)]],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      image_url: [''],
      activities: [''],
      max_capacity: [20, [Validators.required, Validators.min(1)]],
      status: ['Active', Validators.required],

      // Nested Accommodation Object Block
      accommodation: this.fb.group({
        hotel_name: ['', Validators.required],
        star_rating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
        room_type: [''],
        amenities: [''] 
      }),

      travel: this.fb.group({
        mode: ['Flight', Validators.required],
        departure_from: ['', Validators.required],
        arrival_at: ['', Validators.required],
        carrier: [''],
        is_round_trip: [true]
      }),
      guide: this.fb.group({
        name: [''],
        languages: [''], 
        is_included: [true],
        guide_rating: [0, [Validators.min(0), Validators.max(5)]]
      })
    }, { validators: this.dateTimelineValidator }); 
  }

//date validator
  private dateTimelineValidator(group: FormGroup): { [key: string]: boolean } | null {
    const start = group.get('start_date')?.value;
    const end = group.get('end_date')?.value;
    
    if (start && end && new Date(start) >= new Date(end)) {
      return { 'invalidDates': true };
    }
    return null;
  }


  onSubmit(): void {
    if (this.packageForm.invalid) {
      this.packageForm.markAllAsTouched();
      return;
    }

    const rawValue = this.packageForm.value;
    const schemaCompliantPayload = {
      ...rawValue,
      accommodation: {
        ...rawValue.accommodation,
        amenities: rawValue.accommodation.amenities 
          ? rawValue.accommodation.amenities.split(',').map((item: string) => item.trim()).filter((item: string) => item !== '')
          : []
      },
      guide: {
        ...rawValue.guide,
        languages: rawValue.guide.languages 
          ? rawValue.guide.languages.split(',').map((lang: string) => lang.trim()).filter((lang: string) => lang !== '')
          : []
      }
    };

    console.log('Processed Form Payload ready for your backend API:', schemaCompliantPayload);
    this.packService.addPackage(schemaCompliantPayload).subscribe({
      next:(res)=>{
        if(res){
          setTimeout(()=>{
            this.router.navigateByUrl('/landingDash/packageManDash/myTours');
          }, 2000);
        }
      },
      error:(err)=>{console.log(err)}
    })
  }

  goBack(): void {
    this.router.navigateByUrl('/landingDash/packageManDash');
  }

  getCurrentDate(){
    const date = new Date(Date.now());
    const year = date.getFullYear();
    const month = String(date.getMonth()+1).padStart(2,'0');
    const day = date.getDate().toString().padStart(2,'0');
    return `${year}-${month}-${day}`;
  }

    getMinCheckoutDate(): string {
    if (!this.packageForm.value.start_date) {
      return this.getCurrentDate();
    }
 
    const checkIn = new Date(this.packageForm.value.start_date);
    checkIn.setDate(checkIn.getDate() + 1);
 
    const year = checkIn.getFullYear();
    const month = String(checkIn.getMonth() + 1).padStart(2, '0');
    const day = String(checkIn.getDate()).padStart(2, '0');
 
    return `${year}-${month}-${day}`;
  }
  onCheckInChange() {
  if (this.packageForm.value.start_date && this.packageForm.value.end_date) {
    if (new Date(this.packageForm.value.end_date) <= new Date(this.packageForm.value.start_date)) {
      this.packageForm.value.end_date = ''; 
    }
  }
}
}
