import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Hotelservice } from '../../services/HotelService/hotelservice';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-hotelrooms',
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './hotelrooms.html',
  styleUrl: './hotelrooms.css',
})
export class Hotelrooms {
      private fb = inject(FormBuilder);
      public hotelService = inject(Hotelservice);
      private  subscription = new Subscription();

      hotels  = signal<any[]>([]);
      isModelOpen = false;
      selectedHotelId = '';
      selectedHotelName = '';
 
      modelStandardRooms = 0;
      modelDeluxeRooms = 0;
      modelStandardPrice =0;
      modelDeluxePrice = 0;



      ngOnInit(){
        this.loadEverything()
      }

    
        hotelForm:FormGroup = this.fb.group({
          name:['',Validators.required],
          location:['',Validators.required],
         roomsAvailable: this.fb.group({
          standard:['',[Validators.min(1),Validators.required]],
          deluxe:['',[Validators.min(1),Validators.required]],
         }),
         rating:[5,Validators.required],
         pricePerNight:this.fb.group({
          standard:[0,[Validators.required, Validators.min(0)]],
          deluxe:[0,[Validators.required, Validators.min(0)]],
         }),
         imageUrl:['',Validators.required],
         images:[''],
         amenities:[''],
        });
      

      loadEverything():void{
        this.subscription.add(
          this.hotelService.getAllHotelsManager().subscribe({
            next:(res)=>{
              if(res.success && res.data){
                this.hotels.set(res.data)
              }
            },
            error:(err)=>console.log("Error", err)
          })
        )
      }

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
                this.loadEverything();
              }
            }
          })
        )
      }

      resetForm():void{
          this.hotelForm.reset({
            rating:5,
            roomsAvailable: { standard: 0, deluxe: 0 },
            pricePerNight: { standard: 0, deluxe: 0 }
          });
      }


       theUpdateModelOpen(hotel:any){
        this.selectedHotelId = hotel._id;
        this.selectedHotelName = hotel.name;
 
        this.modelStandardRooms = hotel.roomsAvailable?.standard || 0;
        this.modelDeluxeRooms = hotel.roomsAvailable?.deluxe || 0;
        this.modelStandardPrice = hotel.pricePerNight?.standard || 0;
        this.modelDeluxePrice = hotel.pricePerNight?.deluxe || 0;
 
        this.isModelOpen =true;
      }
 
      closeModel():void{
        this.isModelOpen = false;
        this.selectedHotelId = '';
      }
 
      submitTheUpdate():void{
        this.subscription.add(
          this.hotelService.updateHotels(
            this.selectedHotelId,
            this.modelStandardRooms,
            this.modelDeluxeRooms,
            this.modelStandardPrice,
            this.modelDeluxePrice,
          ).subscribe({
              next: (res)=>{
                if(res.success){
                  this.closeModel();
                  this.loadEverything();
                }
              },
              error:(err) =>console.log('Update Failed', err)
          })
        )
      }


      deleteTheHotel(hotelId:string):void{
          if(confirm('Are you really really sure you want to delete it? like really?')){
            this.subscription.add(
              this.hotelService.deleteHotel(hotelId).subscribe({
                next:(res)=>{
                  if(res.success){
                    this.loadEverything();
                  }
                },
                error:(err) => console.log('Deletion failed', err)
              })
            );
          }
      }

      ngOnDestroy():void{
        this.subscription.unsubscribe();
      }

      
}
