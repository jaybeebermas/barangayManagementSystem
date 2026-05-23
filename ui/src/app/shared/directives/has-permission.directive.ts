import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private readonly authService = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);

  private hasView = false;
  private permission = '';

  constructor() {
    effect(() => {
      // This effect runs immediately and whenever currentUser changes
      const user = this.authService.currentUser();
      const isAuthorized = this.permission ? this.authService.hasPermission(this.permission) : false;
      
      if (isAuthorized && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!isAuthorized && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }

  @Input() set hasPermission(permission: string) {
    this.permission = permission;
  }
}
