export interface Report {
  id: number;
  user_id: number;
  user_name?: string;
  project_id: number | null;
  project_name?: string;
  week_start: string;
  week_end: string;
  status: "draft" | "submitted" | "needs_correction" | "approved";
  tasks_planned_next_week: string | null;
  notes: string | null;
  latest_comment: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
}