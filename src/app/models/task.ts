import { Timestamp } from '@angular/fire/firestore';

export const CATEGORIES = ['Work', 'Personal', 'Learning'] as const;
export const STATUSES = ['Planning', 'Tracking', 'Shipped'] as const;
export const PRIORITIES = ['Low', 'Medium', 'High'] as const;
export type Category = typeof CATEGORIES[number];
export type TaskStatus = typeof STATUSES[number];
export type Priority = typeof PRIORITIES[number];

// Category decides the paper color. Existing Firestore color IDs remain compatible.
export const CATEGORY_COLORS = { Work: 'butter', Personal: 'sky', Learning: 'rose' } as const;

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  completed: boolean; // Kept compatible with original records; Shipped is the completed state.
  category: Category;
  color: typeof CATEGORY_COLORS[Category];
  priority: Priority;
  dueDate: string;
  createdAt: Timestamp;
}

// The service supplies ID/time, and derives completed/color from status/category.
export type NewTask = Omit<Task, 'id' | 'createdAt' | 'completed' | 'color'>;
export type TaskChanges = Partial<NewTask>;
