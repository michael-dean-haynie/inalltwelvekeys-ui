import {Component, OnDestroy, OnInit} from '@angular/core';
import {ToastService} from "../../services/toast.service";
import {Toast} from "../../models/toast";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy{
  toasts: Toast[] = [];
  private bootstrap: any; // the window.bootstrap object
  private afterViewCheckedTasks: Array<() => void> = [];
  private subscriptions: Subscription[] = []

  constructor(private toastService: ToastService) {
    this.bootstrap = (window as any).bootstrap;
  }

  ngOnInit(): void {
    this.subscriptions.push(this.toastService.toastsSubject.subscribe(toast => {
      this.toasts.push(toast);
      this.afterViewCheckedTasks.push(() => {
        const toastElm = document.getElementById(`toast-${toast.id}`);
        if (toastElm) {
          toastElm.addEventListener('hidden.bs.toast', () => {
            this.toasts = this.toasts.filter(tst => tst.id !== toast.id);
          });
          const bsToast = this.bootstrap.Toast.getOrCreateInstance(toastElm);
          bsToast.show();
        }
      });
    }));
  }

  ngAfterViewChecked(): void {
    while(this.afterViewCheckedTasks.length) {
      const task = this.afterViewCheckedTasks.pop() as () => void;
      task();
    }
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
