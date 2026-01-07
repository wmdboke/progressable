import { Task } from './types';

// 模拟数据配置
export const mockTasks: Task[] = [
  {
    id: '1',
    name: '完成项目需求分析',
    nodes: [
      {
        id: '1-1',
        description: '收集用户需求',
        completedAt: '2025-01-03T10:30:00',
        isCompleted: true,
        note: '已与客户进行了三次需求确认会议',
      },
      {
        id: '1-2',
        description: '编写需求文档，包含详细的功能描述、用户故事和验收标准',
        completedAt: '2025-01-04T15:20:00',
        isCompleted: true,
      },
      {
        id: '1-3',
        description: '评审需求文档',
        isCompleted: false,
      },
    ],
  },
  {
    id: '2',
    name: '开发用户认证模块',
    nodes: [
      {
        id: '2-1',
        description: '设计数据库表结构',
        completedAt: '2025-01-02T09:00:00',
        isCompleted: true,
      },
      {
        id: '2-2',
        description: '实现注册登录API接口，支持JWT令牌验证和刷新机制',
        completedAt: '2025-01-05T16:45:00',
        isCompleted: true,
        note: '使用JWT进行身份验证',
      },
      {
        id: '2-3',
        description: '前端页面开发',
        completedAt: '2025-01-06T11:30:00',
        isCompleted: true,
      },
      {
        id: '2-4',
        description: '安全性测试',
        isCompleted: false,
      },
    ],
  },
  {
    id: '3',
    name: '优化网站性能',
    nodes: [
      {
        id: '3-1',
        description: '性能测试分析，使用Lighthouse和WebPageTest进行全面评估',
        isCompleted: false,
      },
      {
        id: '3-2',
        description: '代码优化',
        isCompleted: false,
      },
      {
        id: '3-3',
        description: '部署CDN',
        isCompleted: false,
        note: '考虑使用Cloudflare',
      },
    ],
  },
  {
    id: '4',
    name: '产品上线准备',
    nodes: [
      {
        id: '4-1',
        description: '准备上线检查清单',
        completedAt: '2025-01-05T14:00:00',
        isCompleted: true,
      },
      {
        id: '4-2',
        description: '配置生产环境服务器，包括Nginx、SSL证书、数据库优化和监控系统部署',
        isCompleted: false,
      },
    ],
  },
];
