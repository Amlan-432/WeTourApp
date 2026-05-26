import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { authInterceptorsInterceptor } from './interceptors/auth-interceptors-interceptor';
import { Authservice } from './services/AuthService/authservice';
import { switchMap } from 'rxjs';

export function playerFactory() {
  return player;
}

export function initializeApp(authService: Authservice) {
  return () => authService.xsrf().pipe(
    switchMap(() => authService.getProfile())
  );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideLottieOptions({
      player: playerFactory,
    }),
    provideHttpClient(withInterceptors([authInterceptorsInterceptor])),

    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [Authservice],
      multi: true
    }
  ]
};
