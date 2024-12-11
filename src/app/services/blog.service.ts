import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BlogPost } from '../models/blog.model';
import { environment } from '../environments/environment';

@Injectable({
providedIn: 'root',
})
export class BlogService {
    private readonly apiUrl = environment.apiBaseUrl;

constructor(private readonly http: HttpClient) {}

getAll(): Observable<BlogPost[]> {
return this.http.get<BlogPost[]>(this.apiUrl).pipe(catchError(this.handleError));
}

getById(id: number): Observable<BlogPost> {
return this.http.get<BlogPost>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
}

add(blog: BlogPost): Observable<BlogPost> {
return this.http.post<BlogPost>(this.apiUrl, blog).pipe(catchError(this.handleError));
}

update(blog: BlogPost): Observable<void> {
return this.http.put<void>(`${this.apiUrl}/${blog.id}`, blog).pipe(catchError(this.handleError));
}

delete(id: number): Observable<void> {
return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
}

private handleError(error: HttpErrorResponse): Observable<never> {
let errorMessage = 'An unknown error occurred.';
if (error.error instanceof Error) {
// Client-side or network error
errorMessage = `A client-side error occurred: ${error.error.message}`;
} else {
// Backend error
errorMessage = `A server-side error occurred: ${error.status} ${error.message}`;
}
console.error('Error:', errorMessage, 'Details:', error);
return throwError(() => new Error(errorMessage));
}
}