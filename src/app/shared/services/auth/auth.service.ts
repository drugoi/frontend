import { Subject, Observable, of } from "rxjs";
import { Injectable } from "@angular/core";
import { OidcUserManager } from "./oidc-user-manager.service";
import { ApplicationUser } from "@models/application-user";
import { AuthorizationService } from "@services/authorization.service";
import { map } from "rxjs/operators";
import { ApplicationUserExtended } from "@models/extended";
import { AuthSessionService } from "./auth.session.service";
import { IdToken, User } from "@auth0/auth0-angular";

export interface IAuthService {
  getCurrentUser(): Observable<ApplicationUserExtended | null>;

  login(): Promise<void>;

  completeAuthentication(): Observable<IdToken | null>;

  getAuthorizationHeaderValue(): string | null;

  isAuthenticated(): boolean;

  signout(): void;
}

@Injectable({
  providedIn: "root",
})
export class AuthService implements IAuthService {
  private authorizationInfo: IdToken | null | undefined = null;
  private applicationUser: ApplicationUserExtended | null = null;

  public readonly loggedIn$: Subject<ApplicationUserExtended> = new Subject();
  public readonly loggedOutInvoked$: Subject<void> = new Subject();
  public readonly loggedOut$: Subject<void> = new Subject();

  constructor(
    private readonly session: AuthSessionService,
    private readonly oidcManager: OidcUserManager,
    private readonly authorizationService: AuthorizationService
  ) {}

  getCurrentUser(): Observable<ApplicationUserExtended | null> {
    this.tryLoadUserFromSession();

    if (this.authorizationInfo == null) {
      return of(null);
    }

    if (this.applicationUser != null) {
      return of(this.applicationUser);
    }

    return this.authorizationService.getMe().pipe(
      map((appUser) => {
        this.saveCurrentUser(appUser);
        return this.applicationUser;
      })
    );
  }

  login(): Promise<void> {
    if (this.isAuthenticated()) {
      this.reloadInternalProperties();
      return Promise.resolve();
    }

    return this.oidcManager.login();
  }

  reload(): void {
    if (this.isAuthenticated()) {
      this.reloadInternalProperties();
    }
  }

  completeAuthentication(): Observable<IdToken | null> {
    return this.oidcManager.completeAuthentication().pipe(
      map((x) => {
        this.authorizationInfo = x;
        this.reloadInternalProperties();
        return x ?? null;
      })
    );
  }

  private reloadInternalProperties(): void {
    this.session.auth = this.authorizationInfo ?? null;

    this.authorizationService.getMe().subscribe((appUser) => {
      this.saveCurrentUser(appUser);
    });
  }

  private saveCurrentUser(appUser: ApplicationUser): void {
    this.applicationUser = new ApplicationUserExtended(appUser);
    this.session.applicationUser = appUser;
    this.loggedIn$.next(this.applicationUser);
  }

  getAuthorizationHeaderValue(): string | null {
    if (this.isAuthenticated() && !this.isSessionExpired()) {
      return `Bearer ${this.authorizationInfo!.__raw}`;
    }

    return null;
  }

  isSessionExpired(): boolean {
    return this.session.sessionExpired;
  }

  isAuthenticated(): boolean {
    this.tryLoadUserFromSession();
    return this.authorizationInfo != null;
  }

  signout(): void {
    this.loggedOutInvoked$.next();
    if (this.isAuthenticated()) {
      if (this.isSessionExpired()) {
        this.clearSession();
        return;
      }

      this.oidcManager.signout().then(() => {
        this.clearSession();
      });
    }
  }

  public clearSession(): void {
    this.session.clear();

    this.authorizationInfo = null;
    this.applicationUser = null;

    this.loggedOut$.next();
  }

  private tryLoadUserFromSession(): void {
    if (this.authorizationInfo == null) {
      this.authorizationInfo = this.session.auth;
      const user = this.session.applicationUser;
      this.applicationUser =
        user != null ? new ApplicationUserExtended(user) : null;
    }
  }
}
