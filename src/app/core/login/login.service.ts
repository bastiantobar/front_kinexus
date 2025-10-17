import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class LoginService {
  private apiUrl = "/api/auth/login";

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    });

    return this.http
      .post(this.apiUrl, credentials, { headers: headers })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error("An error occurred:", error);
    return throwError(
      () => new Error("Something bad happened; please try again later.")
    );
  }
}
