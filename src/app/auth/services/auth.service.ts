import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { AuthStatus, CheckTokenresponse, LoginResponse, User } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Con readonly nos aseguramos de que no se pueda modificar
  private readonly baseUrl: string = environment.baseUrl;
  // Inyectamos httpclient para hacer peticiones
  private http = inject(HttpClient);

  // el _ es para indifcar que es privado, no es obligatorio ponerlo, es un estándar. Son privados porque no queremos que se pueda cambiar fuera del servicio
  private _currentUser = signal<User | null>(null); //Para saber el usuario actual, puede ser nulo si todavía no se ha creado el usuario
  //Para saber si el usuario está autenticado o no
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);//No es null poque siempre va a tener un valor. Cuando montamos el servicio por 1º vez el estado es checking

  //! Visibles al mundo exterior
  //computed es para hacer la señal de solo lectura y que no se pueda modificar
  // Así nadie fuera e mi servicio va a poder cambiar el estado de mi autenticación
  public currentUser = computed(() => this._currentUser());
  public authStatus = computed(() => this._authStatus());

  constructor() {
    this.checkAuthStatus().subscribe();
   }

  private setAuthentication(user: User, token: string): boolean {
    this._currentUser.set(user);
    this._authStatus.set(AuthStatus.authenticated);
    localStorage.setItem('token', token);
    return true;
  }

  login(email: string, password: string): Observable<boolean> {

    const url = `${this.baseUrl}/auth/login`;
    const body = { email, password };

    return this.http.post<LoginResponse>(url, body)
      .pipe(
        //* Versión con el código repetido (coincide con checkStatus), la nueva tiene en cuenta el principio DRY
        // Tomamos el token y el usuario
        // tap(({ user, token }) => {
        //   this._currentUser.set(user);
        //   this._authStatus.set(AuthStatus.authenticated);
        //   // Guardamos el token
        //   localStorage.setItem('token', token);
        //   console.log({ user, token });
        // }),

        map(({ user, token }) => this.setAuthentication(user,token)),

        catchError(err => throwError(() => err.error.message)
        )
      );

  }

  checkAuthStatus(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/check-token`;
    // Cuando la persona abre la app no hay token (porque no ha iniciado sesión aún o se ha registrado)
    const token = localStorage.getItem('token');

    // Si no hay token devuelve falso porque sabemos que no está autenticado
    // if (!token) return of(false);
    if (!token){
      this.logout();
      return of(false);
    }


    // Añadimos el token al header para verificarlo
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.get<CheckTokenresponse>(url, { headers })
      .pipe(
        //* Versión con el código repetido que comento arriba
        // map(({ token, user }) => {
        //   this._currentUser.set(user);
        //   this._authStatus.set(AuthStatus.authenticated);

        //   return true;
        // }),
        map(({ user, token }) => this.setAuthentication(user,token)),

        // Si hay cuqluier error, devolvemos falso (NO nos interesa cual es el error, solo si hay un error)
        catchError(() => {
          this._authStatus.set(AuthStatus.notAuthenticated); //El status cambia a no autenticado
          return of(false);
        })
      );
  }

  logout(){
    localStorage.removeItem('token');
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.notAuthenticated);
  }
}
