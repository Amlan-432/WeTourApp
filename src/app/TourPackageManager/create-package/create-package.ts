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

  // Enums pulled explicitly from your Mongoose Schema limits
  travelModes = ['Flight', 'Train', 'Bus', 'Cruise'];
  statusOptions = ['Active', 'Draft', 'Archived'];

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
        amenities: [''] // Text input tracked as a comma-separated string, split on submit
      }),

      // Nested Travel Object Block
      travel: this.fb.group({
        mode: ['Flight', Validators.required],
        departure_from: ['', Validators.required],
        arrival_at: ['', Validators.required],
        carrier: [''],
        is_round_trip: [true]
      }),

      // Nested Guide Object Block
      guide: this.fb.group({
        name: [''],
        languages: [''], // Text input tracked as a comma-separated string, split on submit
        is_included: [true],
        guide_rating: [0, [Validators.min(0), Validators.max(5)]]
      })
    }, { validators: this.dateTimelineValidator }); // Interlocks baseline timeline targets
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

  /**
   * Process and transform raw user parameters into strict arrays matching Mongoose shapes
   */
  onSubmit(): void {
    if (this.packageForm.invalid) {
      this.packageForm.markAllAsTouched();
      return;
    }

    const rawValue = this.packageForm.value;
    
    // Transform text inputs containing commas into strict string[] values for MongoDB
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
    // Call your backend service save method here...
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
}
