import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class PackageService {

  private http = inject(HttpClient);

  // Setup Base URLs pointing to port 8000
  private readonly API_URL_User: string = "http://localhost:8000/user";
  private readonly API_URL_Traveller: string = "http://localhost:8000/traveller";
  private readonly API_URL_Package: string = "http://localhost:8000/package"; 

  packages = new BehaviorSubject<any[]>([]); 
  getAllPackage$ = new BehaviorSubject<any[]>([]);
  isLoading = signal<boolean>(false);
  hasErrors: boolean = false;
  bookedPackageDetails$ = new BehaviorSubject<any | null>(null);



  //user

  searchPackage(dest:string,start_date:string):Observable<{statusCode:number,msg:string,data:any[],success:boolean}>{
    this.isLoading.set(true);
    const params = new HttpParams().set('destination',dest)
                                    .set('start_date',start_date)
    return this.http.get<{statusCode:number,msg:string,data:any[],success:boolean}>(`${this.API_URL_User}/searchPackage`,{params}).pipe(
      tap(res=>{
        if(res.success){
          this.packages.next(res.data);
        }
        this.isLoading.set(false);
      }),
      catchError(err => {
        this.hasErrors = true;
        this.isLoading.set(false);
        return throwError(() => err);
      }));
  }



//package

addPackage(packageData: any): Observable<{ statusCode: number, msg: string, data: any, success: boolean }> {
  this.isLoading.set(true);
  debugger;

  return this.http.post<{ statusCode: number, msg: string, data: any, success: boolean }>(
    `${this.API_URL_Package}/`, 
    packageData
  ).pipe(
    tap(res => {
      debugger;
      if (res.success) {
        this.isLoading.set(false);
      }
    }),
    catchError(err => {
      debugger;
      this.hasErrors = true;
      this.isLoading.set(false);
      return throwError(() => err);
    })
  );
}


getAllPackages(): Observable<{ statusCode: number, msg: string, data: any[], success: boolean }> {
  this.isLoading.set(true);
  debugger;
  return this.http.get<{ statusCode: number, msg: string, data: any[], success: boolean }>(`${this.API_URL_Package}/`).pipe(
    tap(res => {
      debugger;
      if (res.success) {
        this.getAllPackage$.next(res.data);
      }
      this.isLoading.set(false);
    }),
    catchError(err => {
      debugger;
      this.hasErrors = true;
      this.isLoading.set(false);
      return throwError(() => err);
    })
  );
}


// updatePackage(id: string, updatedData: any): Observable<{ statusCode: number, msg: string, data: any[], success: boolean }> {
//   this.isLoading.set(true);

//   return this.http.patch<{ statusCode: number, msg: string, data: any, success: boolean }>(
//     `${this.API_URL_Package}/update/${id}`, 
//     updatedData
//   ).pipe(
//     tap(res => {
//       if (res.success) {
//         this.packages.update(prev => 
//           prev.map(pkg => pkg._id === id ? res.data : pkg)
//         );
//       }
//       this.isLoading.set(false);
//     }),
//     catchError(err => {
//       this.hasErrors = true;
//       this.isLoading.set(false);
//       return throwError(() => err);
//     })
//   );
// }



// deletePackage(id: string): Observable<{ statusCode: number, msg: string, data: any, success: boolean }> {
//   this.isLoading.set(true);

//   return this.http.delete<{ statusCode: number, msg: string, data: any, success: boolean }>(
//     `${this.API_URL_Package}/delete/${id}`
//   ).pipe(
//     tap(res => {
//       if (res.success) {
//         this.packages.update(prev => prev.filter(pkg => pkg._id !== id));
//       }
//       this.isLoading.set(false);
//     }),
//     catchError(err => {
//       this.hasErrors = true;
//       this.isLoading.set(false);
//       return throwError(() => err);
//     })
//   );
// }



//traveller
bookPackage( packageId: string, travellers: any[]): Observable<{ statusCode: number, msg: string, data: any, success: boolean }> {
  this.isLoading.set(true);
  debugger;
  const payload = {
    package_id: packageId,
    travellers: travellers
  };
  return this.http.post<{ statusCode: number, msg: string, data: any, success: boolean }>(
    `${this.API_URL_Traveller}/book`, 
    payload
  ).pipe(
    tap(res => {
      debugger;
      if (res.success) {
        this.bookedPackageDetails$.next(res.data.booking);
      }
      this.isLoading.set(false);
    }),
    catchError(err => {
      debugger;
      this.hasErrors = true;
      this.isLoading.set(false);
      return throwError(() => err);
    })
  );
}


cancelPackageBooking(bookingId: string): Observable<{ statusCode: number, msg: string, data: any, success: boolean }> {
  this.isLoading.set(true);

  const payload = { bookingId };

  return this.http.put<{ statusCode: number, msg: string, data: any, success: boolean }>(
    `${this.API_URL_Traveller}/cancel`, 
    payload
  ).pipe(
    tap(res => {
      if (res.success) {
        this.searchPackage('', '').subscribe(); 
      }
      this.isLoading.set(false);
    }),
    catchError(err => {
      this.hasErrors = true;
      this.isLoading.set(false);
      return throwError(() => err);
    })
  );
}
  
}
