import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Segment} from "../../models/api/segment";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class MessageClientService {
  private apiUrl = (environment as any).apiUrl as string;

  constructor(private http: HttpClient) {}

  getSegments(start: string, end: string): Observable<Segment[]> {
    const options = {
      params: new HttpParams().set('start', start).set('end', end)
    };

    return this.http.get<Segment[]>(`${this.apiUrl}/message/segments`, options);
  }
}
