import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private contactApi = '/contact.php';

  constructor(private http: HttpClient) {}

  sendContact(formData: FormData): Observable<any> {
    return this.http.post<any>(this.contactApi, formData);
  }
}
