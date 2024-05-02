import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2'
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

  private fb=inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject (Router);

  // Intentar que el formulario se apegue lo máximo a los requerimientos de backend
  // para evitar que el backend trabaje más de la cuenta
  public myForm: FormGroup=this.fb.group({
    email:['fernando@gmail.com',[Validators.required,Validators.email]],
    password:['123456',[Validators.required, Validators.minLength(6)]]
  });

  login(){
    const {email,password}=this.myForm.value;
    this.authService.login(email,password)
    .subscribe({
      // Ha salido todo sale bien
      next: () => this.router.navigateByUrl('/dashboard'),
      // Ha habido un error
      error: (message) => {
        // Usamos https://sweetalert2.github.io/ para mostrar los mensajes de error
        Swal.fire('Error',message,'error')

      }
    })

  }
}
