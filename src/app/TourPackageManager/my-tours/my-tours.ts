import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PackageService } from '../../services/packageService/package-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-tours',
  imports: [CommonModule,FormsModule],
  templateUrl: './my-tours.html',
  styleUrl: './my-tours.css',
})
export class MyTours {
packService = inject(PackageService);
  allPackages = signal<any[]>([]);
  isModelOpen = false;
  selectedPackageId: string = '';
  selectedDestination: string = '';
  modelPrice: number = 0;
  modelMaxCapacity: number = 0;
  modelStatus: string = 'Draft';

  ngOnInit() {
    this.loadPackages();
    
    this.packService.getAllPackage$.subscribe({
      next: (res) => {
        if (res) {
          this.allPackages.set(res);
          console.log("Loaded packages:", this.allPackages());
        }
      },
      error: (err) => { console.log(err) }
    });
  }

  loadPackages() {
    this.packService.getAllPackages().subscribe();
  }

  update(tour: any) {
    this.selectedPackageId = tour._id; 
    this.selectedDestination = tour.destination;
    this.modelPrice = tour.price;
    this.modelMaxCapacity = tour.max_capacity;
    this.modelStatus = tour.status;
    this.isModelOpen = true;
  }
  closeModel() {
    this.isModelOpen = false;
  }

  submitUpdate() {
    const updateBody = {
      price: this.modelPrice,
      max_capacity: this.modelMaxCapacity,
      status: this.modelStatus
    };

    this.packService.updatePackage(this.selectedPackageId, updateBody).subscribe({
      next: (res) => {
        this.closeModel();
        this.loadPackages(); 
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

delete(id: string) {
    const confirmDelete = confirm("Are you sure you want to permanently delete this tour package?");
    if (confirmDelete) {
      this.packService.deletePackage(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.packService.getAllPackages().subscribe();
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }

}