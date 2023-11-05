import { Injectable } from '@angular/core';
import {Toast} from "../models/toast";
import {Subject} from "rxjs";
import { v4 as uuidv4 } from "uuid";

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toastsSubject: Subject<Toast> = new Subject<Toast>();

  constructor() { }

  createToast(toast: Toast) {
    this.toastsSubject.next({
      ...toast,
      id: uuidv4()
    });
  }
}
