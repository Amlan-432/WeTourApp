import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Userservice } from '../../services/UserService/userservice';
import { Hotelservice } from '../../services/HotelService/hotelservice';
import { PackageService } from '../../services/packageService/package-service';

@Component({
  selector: 'app-my-bookings',
  imports: [CommonModule,FormsModule],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css',
})
export class MyBookings {
  userService = inject(Userservice);
  hotelService = inject(Hotelservice);
  packageService = inject(PackageService);
  allBookings = signal<any[]>([]);
  filterStatus = signal<string>('All');
  searchQuery = signal<string>('');

  showReviewModal = signal<boolean>(false);
  selectedBooking = signal<any | null>(null);

  reviewComment = signal<string>('');
  dynamicCriteria = signal<string[]>([]);
  criteriaRatings = signal<{ [key: string]: number }>({});

filteredBookings = computed(() => {
    const data = this.allBookings();
    const filter = this.filterStatus().toLowerCase();
    const search = this.searchQuery().toLowerCase().trim();

    return data.filter(booking => {
      let matchesStatus = true;
      if (filter === 'confirmed') {
        matchesStatus = booking.status.toLowerCase() === 'confirmed' || booking.status.toLowerCase() === 'pending';
      } else if (filter !== 'all') {
        matchesStatus = booking.status.toLowerCase() === filter;
      }
      const matchesSearch = !search || 
        booking.bookingId.toLowerCase().includes(search) || 
        booking.title.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  });

  ngOnInit(){
    this.userService.myBookings().subscribe();
    this.userService.myBookings$.subscribe({
      next:res=>{
        if(res){
          this.allBookings.set(res);
        }
      },
      error:err=>{console.log(err);
      }
    })
  }

updateFilter(status: string) {
    this.filterStatus.set(status);
  }

  openReviewModal(booking: any) {
    this.selectedBooking.set(booking);
    this.reviewComment.set('');
    if (booking.type === 'Hotel') {
      this.dynamicCriteria.set(['Cleanliness', 'Comfort', 'Location', 'Service']);
    } else {
      this.dynamicCriteria.set(['Itinerary', 'Transport', 'Food', 'Value']);
    }

    const initialRatings: { [key: string]: number } = {};
    this.dynamicCriteria().forEach(criterion => {
      initialRatings[criterion] = 5;
    });
    this.criteriaRatings.set(initialRatings);
    
    this.showReviewModal.set(true);
  }

  closeModal() {
    this.showReviewModal.set(false);
    this.selectedBooking.set(null);
  }

  setRating(criterion: string, value: number) {
    this.criteriaRatings.update(current => ({
      ...current,
      [criterion]: value
    }));
  }

  submitReviewForm() {
    const booking = this.selectedBooking();
    if (!booking) return;

    const payload = {
      itemId: booking.itemId, 
      category: booking.type,     
      rating: this.criteriaRatings(),
      comment: this.reviewComment()
    };

   this.userService.addReview(payload).subscribe({
      next: (res) => {
        alert('Thank you for sharing your experience!');
        this.closeModal();
      },
      error: (err) => {
        console.error('Submission failed', err);
        alert(err.error?.message || 'Failed to post review. Please try again.');
      }
    });
  }

updateBookingStatusInState(id: string, newStatus: string) {
  this.allBookings.update(currentBookings => 
    currentBookings.map(booking => 
      booking.bookingId === id ? { ...booking, status: newStatus } : booking
    )
  );
}

cancelBooking(id: string, type: string) {
  if (type === 'Hotel') {
    this.hotelService.cancelBooking(id).subscribe({
      next: res => {
        if (res.success) {
          alert('Cancelled booking successfully');
          this.updateBookingStatusInState(id, 'Cancelled'); 
        }
      }
    });
  } else if (type === 'Package') {
    this.packageService.cancelPackageBooking(id).subscribe({
      next: res => {
        if (res.success) {
          alert('Cancelled booking successfully');
          this.updateBookingStatusInState(id, 'Cancelled');
        }
      }
    });
  }
}

}
