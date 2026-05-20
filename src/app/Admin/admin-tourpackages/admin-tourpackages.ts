import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/AdminService/admin-service';

@Component({
  selector: 'app-admin-tourpackages',
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-tourpackages.html',
  styleUrl: './admin-tourpackages.css',
})
export class AdminTourpackages {

  adminService =inject(AdminService);

  packages = signal<any[]>([]);
  searchVal = signal<string>('');


   filteredPackages = computed(() =>
    this.packages().filter(p =>
      p.destination.toLowerCase().includes(this.searchVal().toLowerCase()) ||
      p.user_id?.name.toLowerCase().includes(this.searchVal().toLowerCase())
    )
  );


  ngOnInit(){
  this.adminService.getAllPackages().subscribe();
  this.adminService.allTourPackage$.subscribe({
    next:(res)=>{
      if(res){
        this.packages.set(res);
        
      }
    },
    error:(err)=>{console.log(err)}
  });
}


getCompletionRate(maxCapacity: number, totalCapacity: number = 20) {
  const filled = totalCapacity - maxCapacity;  
  return (filled / totalCapacity) * 100;        
}


}
