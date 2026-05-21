import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Hotelservice } from '../../services/HotelService/hotelservice';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-new-hotel',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-new-hotel.html',
  styleUrl: './add-new-hotel.css',
})
export class AddNewHotel {

    public hotelService  = inject(Hotelservice);
    private fb = inject(FormBuilder);
    private subscription = new Subscription();

    hotels = signal<any[]>([])

   
     hotelForm:FormGroup = this.fb.group({
          name:['',Validators.required],
          location:['',Validators.required],
         roomsAvailable: this.fb.group({
          standard:['',[Validators.min(1),Validators.required]],
          deluxe:['',[Validators.min(1),Validators.required]],
         }),
         pricePerNight:this.fb.group({
          standard:[0,[Validators.required, Validators.min(0)]],
          deluxe:[0,[Validators.required, Validators.min(0)]],
         }),
         imageUrl:['',Validators.required],
         images:[''],
         amenities:[''],
        });
      
       submit():void{
        if(this.hotelForm.invalid){
          this.hotelForm.markAllAsTouched();
          return;
        }

        const rawValues = this.hotelForm.value;

        const formattedPayload = {
          ...rawValues,
          images:rawValues.images? rawValues.images.split(',').map((u: string)=>u.trim()):[],
          amenities:rawValues.amenities ? rawValues.amenities.split(',').map((a:string)=>a.trim()) : []
        };

        this.subscription.add(
          this.hotelService.addHotelsManager(formattedPayload).subscribe({
            next:(res)=>{
              if(res.success){
                console.log(res.data);
                this.resetForm();
                
              }
            }
          })
        );
      }

      resetForm():void{
          this.hotelForm.reset({
            rating:5,
            roomsAvailable: { standard: 0, deluxe: 0 },
            pricePerNight: { standard: 0, deluxe: 0 }
          });
      }

      ngOnDestroy():void{
        this.subscription.unsubscribe();
      }

        
} 
