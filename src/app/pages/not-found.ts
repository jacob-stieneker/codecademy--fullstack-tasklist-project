import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: '<p class="eyebrow">A SMALL DETOUR</p><h1 class="page-title">This page wandered off.</h1><p class="page-subtitle">Your board is right where you left it.</p><a routerLink="/tasks" class="button button-primary">Back to my board</a>',
  styles: '.button { margin-top: 24px; }',
})
export class NotFound {}
