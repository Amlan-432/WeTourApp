import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PackageService } from '../../services/packageService/package-service';

@Component({
  selector: 'app-my-tours',
  imports: [CommonModule],
  templateUrl: './my-tours.html',
  styleUrl: './my-tours.css',
})
export class MyTours {
packService = inject(PackageService);
allPackages = signal<any[]>([]);
ngOnInit(){
  this.packService.getAllPackages().subscribe();
  this.packService.getAllPackage$.subscribe({
    next:(res)=>{
      if(res){
        this.allPackages.set(res);
        console.log("we",this.allPackages());
      }
    },
    error:(err)=>{console.log(err)}
  })
}
update(){
  

}

delete(){

}

}
