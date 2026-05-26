import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { passValidators } from '../passwordValidator';
import { passwordMatch } from '../passwordMatchValidator';
import { Authservice } from '../../services/AuthService/authservice';
import { User } from '../../../Models/User.model';
import { map, Observable, switchMap, timer } from 'rxjs';
import { Userservice } from '../../services/UserService/userservice';

@Component({
  selector: 'app-register',
  imports: [CommonModule,ReactiveFormsModule,RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  msg!:string;
  registerForm!: FormGroup;
  authService=inject(Authservice);
  userService=inject(Userservice);
  router=inject(Router);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email],[this.checkEmailExists]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required,passValidators]],
      confirmPassword: ['', [Validators.required]],
      role: ['TRAVELLER', [Validators.required]] 
    }, { validators: passwordMatch });
  }


  onRegister() {
    if (this.registerForm.valid) {
      const {name,email,password,role,phone}=this.registerForm.value;

      this.authService.registerUser(new User(email,name,password,role,phone)).subscribe(res=>{
        if(res.success){
          this.msg=res.msg;
          this.router.navigateByUrl('/login');
        }else{
          this.msg=res.msg;
        }
      });  
    }
  }


   checkEmailExists=(control:AbstractControl):Observable< ValidationErrors|null> | Promise< ValidationErrors|null> =>{
     console.log(control.value);
     
     return timer(400).pipe(switchMap(()=>this.userService.isExistsEmail(control.value).pipe(map(e=>e.isExists?{exists:'Email already exists'}:null))));
  }


  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }


getErrorMessage(controlName: string): string {
  const control = this.registerForm.get(controlName);
  
  if (!control || !control.errors || !control.touched) return '';

  if (control.errors['required']) return 'This field is required';
  if (control.errors['email']) return 'Please enter a valid email address';
  if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} characters required`;
  if (control.errors['pattern']) return 'Please enter a valid 10-digit phone number';
  if (control.errors['exists']) return control.errors['exists'];
  

  if (control.errors['passError']) return 'password must be of 6 characters and must contains a uppercase(A-Z), a lowecase(a-z), a numeric digit(0-9) , and a special character(@!#$%&*)';

  if (controlName === 'confirmPassword' && this.registerForm.hasError('passwordMismatch')) {
    return 'Passwords do not match';
  }

  return 'Invalid input';
}

}
