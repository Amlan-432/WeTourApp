import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Authservice } from '../services/AuthService/authservice';
import { LoadingDash } from '../Dashboards/loading-dash/loading-dash';

@Component({
  selector: 'app-login',
  imports: [CommonModule,RouterModule,ReactiveFormsModule,LoadingDash],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {


  isLoading = signal(false);
  loginForm!: FormGroup;
  generatedCaptcha: string = '';
  showPassword = false;

  constructor(private fb: FormBuilder) {}

  authService=inject(Authservice);
  router=inject(Router);

  ngOnInit(): void {
    this.generateNewCaptcha();
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      captcha: ['', [Validators.required, this.validateCaptcha.bind(this)]]
    });
  }

  generateNewCaptcha() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.generatedCaptcha = result;

    if (this.loginForm) {
      this.loginForm.get('captcha')?.reset();
    }
  }

  validateCaptcha(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value !== this.generatedCaptcha) {
      return { captchaMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      debugger;
      this.isLoading.set(true);
      setTimeout(()=>{
        this.authService.loginUser(this.loginForm.value.email,this.loginForm.value.password).subscribe({
          next:res=>{
            if(res.success){
              debugger;
                this.router.navigateByUrl('').then(()=>{this.isLoading.set(false)});
              }
          },
          error:err=>{
              this.isLoading.set(false);
              alert("Invalid password");
          }
        })
      },3000);
    }
  }

}
