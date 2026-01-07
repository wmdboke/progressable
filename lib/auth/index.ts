/**
 * 认证模块统一导出
 * 方便在其他项目中导入和使用
 *
 * 注意：此文件仅导出可在客户端使用的模块（schemas 和 utils）
 * 服务端配置（providers.config）请直接导入：
 * import { ... } from '@/lib/auth/config/providers.config'
 */

// ============ Schemas ============
export * from './schemas/auth.schema';

// ============ Utils ============
export * from './utils/validation';
