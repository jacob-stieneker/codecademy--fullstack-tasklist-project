import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardHelp } from './components/board-help';
import { Icon } from './components/icon';
import { TaskService } from './services/task.service';
import { NoticeService } from './services/notice.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, DatePipe, FormsModule, Icon, BoardHelp],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly helpOpen = signal(false);
  private readonly router = inject(Router);
  readonly store = inject(TaskService);
  readonly notice = inject(NoticeService);
  readonly appearance = inject(ThemeService);
  readonly today = new Date();
  readonly activeTasks = computed(() => this.store.tasks()
    .filter(task => task.status !== 'Shipped')
    .sort((a, b) => (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0)));
  readonly completedTasks = computed(() => this.store.tasks()
    .filter(task => task.status === 'Shipped')
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)));
  async openHelp(): Promise<void> {
    // Show the guide over the board, including when opened from another page.
    if (this.router.url !== '/tasks') await this.router.navigate(['/tasks']);
    if (this.router.url === '/tasks') this.helpOpen.set(true);
  }
}
