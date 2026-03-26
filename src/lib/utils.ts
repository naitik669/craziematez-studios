import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  return (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed': return 'text-success bg-success-dim border-success/20';
    case 'approved': return 'text-success bg-success-dim border-success/20';
    case 'in progress': return 'text-primary bg-primary-dim border-primary/20';
    case 'in review': return 'text-info bg-info-dim border-info/20';
    case 'todo': return 'text-muted-foreground bg-muted border-border';
    default: return 'text-muted-foreground bg-muted border-border';
  }
}

export function getUrgencyColor(urgency: string) {
  switch (urgency.toLowerCase()) {
    case 'overdue': return 'text-destructive';
    case 'critical': return 'text-destructive';
    case 'warning': return 'text-primary';
    case 'ok': return 'text-success';
    default: return 'text-muted-foreground';
  }
}
