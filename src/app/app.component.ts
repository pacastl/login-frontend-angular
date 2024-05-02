import { Component, computed, effect, inject } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { AuthStatus } from './auth/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'authApp';

  private authService=inject(AuthService);
  private router = inject(Router);

  public finishedAuthcheck=computed<boolean>( () => {
    if(this.authService.authStatus() === AuthStatus.checking){
      // Todavía no se ha terminado
      return false;
    }

    // Si ya terminamos
    return true;
  });

  // Cuando alguna señal cambie se dispara
  public authStatusChangedEffect = effect(() => {

    switch(this.authService.authStatus()){
      case AuthStatus.checking:
        // Estoy esperando que acabe la autentación, entonces no hago nada
        return;

      case AuthStatus.authenticated:
        this.router.navigateByUrl('/dashboard');
        return;
      case AuthStatus.notAuthenticated:
        this.router.navigateByUrl('/auth/login');
        return;

    }
    console.log('authStatus',this.authService.authStatus());

  })
}
