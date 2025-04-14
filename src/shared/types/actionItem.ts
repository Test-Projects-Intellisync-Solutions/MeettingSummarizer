export interface ActionItem {
  id: string;
  description: string;
  owner?: string;
  dueDate?: string;
  status?: 'open' | 'in progress' | 'done';
  sourceText?: string;
}
