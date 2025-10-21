export interface TaskStage {
    id: string;
    name: string;
    description?: string;
    order: number;
}

export interface CreateTaskInput {
    title: string;
    description: string;
    assigned_to: string[];
    priority: 'low' | 'medium' | 'high';
    due_date: string;
    stages: TaskStage[];
    status: 'pending' | 'completed' | 'cancelled';
}
