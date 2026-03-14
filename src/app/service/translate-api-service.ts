import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TranslateApiService {

  private cache: { [key: string]: string } = {};

  constructor(private http: HttpClient) {}

  translate(text: string, targetLang: string): Observable<string> {
    if (!text || targetLang === 'en') return of(text);

    const cacheKey = `${targetLang}:${text}`;
    if (this.cache[cacheKey]) return of(this.cache[cacheKey]);

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;

    return this.http.get<any>(url).pipe(
      map(res => {
        const translated = res.responseData.translatedText;
        this.cache[cacheKey] = translated;
        return translated;
      }),
      catchError(() => of(text))
    );
  }
}