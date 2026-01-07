// 任务节点类型
export interface TaskNode {
  id: string;
  description: string;
  completedAt?: string; // ISO 格式的时间字符串
  isCompleted: boolean;
  note?: string; // 备注
}

// 任务类型
export interface Task {
  id: string;
  name: string;
  nodes: TaskNode[];
}
