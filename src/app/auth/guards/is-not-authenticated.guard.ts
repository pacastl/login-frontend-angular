import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { AuthStatus } from '../interfaces';

// Obejtivo es que el guard cumple 1 sola función, comprobar si está autenticado
export const isNotAuthenticatedGuard: CanActivateFn = (route, state) => {

  // Cada vez que usamos el guard, vemos la última ruta
  // const url=state.url;
  // localStorage.setItem('url',url);

  const authService=inject(AuthService);
  const router = inject(Router);

  if(authService.authStatus() === AuthStatus.authenticated){
    router.navigateByUrl('/dashboard');
    return false;
  }

  // En este momento, no tenemos el conocmiento necesario para cambiar la url porque solo lo hacemos cuando sabemos 100% que no está autenticado
  // if(authService.authStatus() === AuthStatus.checking){
  //   return false;
  // }

  // Para implementar esta funcionalidad, lo que debes hacer es guardar la URL en el localStorage en el isAuthenticatedGuard. Luego, cuando el usuario inicie sesión, recupera este ítem del localStorage. Si contiene una URL, redirige al usuario a esa ruta específica y si no contiene nada, redirígelo a la página de inicio de la aplicación
   // const url=state.url;
  // localStorage.setItem('url',url);

  router.navigateByUrl('/auth/login');

  return true;
};
