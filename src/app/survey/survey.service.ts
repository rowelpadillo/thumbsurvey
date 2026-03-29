// src/app/survey/survey.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  constructor(private http: HttpClient) {}

  submitSurvey(data: { token: string; rating: number; comment: string }): Observable<any> {
    // TODO: Replace this with your actual API endpoint later
    // return this.http.post('https://your-api.com/submit', data);
    
    // For now, this mimics a successful network request taking 1.5 seconds:
    console.log('Mocking survey submission:', data);
    return of({ success: true }).pipe(delay(1500)); 
  }
}