import { z } from 'zod';

// 기본 파일 정보 스키마
export const FileInfoSchema = z.object({
  transactionId: z.string(),
  url: z.string().url(),
  size: z.number().positive(),
  contentType: z.string(),
  tags: z.record(z.string()).optional(),
  timestamp: z.number(),
  owner: z.string(),
});

// 파일 업로드 요청 스키마
export const UploadRequestSchema = z.object({
  filePath: z.string(),
  tags: z.record(z.string()).optional(),
  contentType: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  isPublic: z.boolean().default(true),
});

// 파일 다운로드 요청 스키마
export const DownloadRequestSchema = z.object({
  transactionId: z.string(),
  outputPath: z.string().optional(),
});

// 파일 검색 요청 스키마
export const SearchRequestSchema = z.object({
  query: z.string().optional(),
  tags: z.record(z.string()).optional(),
  category: z.string().optional(),
  owner: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// 배치 업로드 요청 스키마
export const BatchUploadRequestSchema = z.object({
  files: z.array(z.object({
    filePath: z.string(),
    tags: z.record(z.string()).optional(),
    contentType: z.string().optional(),
    description: z.string().optional(),
    isPublic: z.boolean().default(true),
  })),
  category: z.string().optional(),
  isPublic: z.boolean().default(true),
});

// 파일 버전 관리 스키마
export const VersionRequestSchema = z.object({
  originalTransactionId: z.string(),
  filePath: z.string(),
  version: z.string(),
  description: z.string().optional(),
  tags: z.record(z.string()).optional(),
});

// 파일 공유 설정 스키마
export const ShareRequestSchema = z.object({
  transactionId: z.string(),
  isPublic: z.boolean(),
  allowedUsers: z.array(z.string()).optional(),
  expiresAt: z.number().optional(),
});

// 모니터링 통계 스키마
export const StatsRequestSchema = z.object({
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  owner: z.string().optional(),
});

// 응답 타입들
export type FileInfo = z.infer<typeof FileInfoSchema>;
export type UploadRequest = z.infer<typeof UploadRequestSchema>;
export type DownloadRequest = z.infer<typeof DownloadRequestSchema>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type BatchUploadRequest = z.infer<typeof BatchUploadRequestSchema>;
export type VersionRequest = z.infer<typeof VersionRequestSchema>;
export type ShareRequest = z.infer<typeof ShareRequestSchema>;
export type StatsRequest = z.infer<typeof StatsRequestSchema>;

// 업로드 응답
export interface UploadResponse {
  transactionId: string;
  url: string;
  size: number;
  contentType: string;
  tags?: Record<string, string>;
  timestamp: number;
}

// 다운로드 응답
export interface DownloadResponse {
  filePath?: string;
  content?: Buffer;
  size: number;
  contentType: string;
  transactionId: string;
}

// 검색 응답
export interface SearchResponse {
  files: FileInfo[];
  total: number;
  hasMore: boolean;
}

// 배치 업로드 응답
export interface BatchUploadResponse {
  results: Array<{
    filePath: string;
    transactionId: string;
    url: string;
    success: boolean;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// 버전 관리 응답
export interface VersionResponse {
  originalTransactionId: string;
  newTransactionId: string;
  version: string;
  url: string;
  timestamp: number;
}

// 공유 설정 응답
export interface ShareResponse {
  transactionId: string;
  isPublic: boolean;
  allowedUsers?: string[];
  expiresAt?: number;
  shareUrl?: string;
}

// 통계 응답
export interface StatsResponse {
  totalFiles: number;
  totalSize: number;
  uploads: number;
  downloads: number;
  categories: Record<string, number>;
  recentActivity: Array<{
    transactionId: string;
    action: 'upload' | 'download' | 'share';
    timestamp: number;
  }>;
}

// 에러 타입들
export class IrysError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'IrysError';
  }
}

export class NetworkError extends IrysError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends IrysError {
  constructor(message: string) {
    super(message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class FileNotFoundError extends IrysError {
  constructor(message: string) {
    super(message, 'FILE_NOT_FOUND');
    this.name = 'FileNotFoundError';
  }
}

export class ValidationError extends IrysError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

// 🚀 공용 오픈소스 MCP 추가 타입들

// 파일 삭제 요청 스키마
export const DeleteRequestSchema = z.object({
  transactionId: z.string(),
  permanent: z.boolean().default(false),
});

// 배치 다운로드 요청 스키마
export const BatchDownloadRequestSchema = z.object({
  transactionIds: z.array(z.string()),
  outputDirectory: z.string().optional(),
  includeMetadata: z.boolean().default(true),
});

// 버전 롤백 요청 스키마
export const RollbackRequestSchema = z.object({
  transactionId: z.string(),
  targetVersion: z.string(),
  createBackup: z.boolean().default(true),
});

// 공유 해제 요청 스키마
export const RevokeShareRequestSchema = z.object({
  transactionId: z.string(),
  userAddress: z.string().optional(), // 특정 사용자만 해제
  revokeAll: z.boolean().default(false),
});

// 멀티체인 토큰 전환 스키마
export const SwitchTokenRequestSchema = z.object({
  tokenType: z.enum(['ethereum', 'solana', 'aptos', 'arweave']),
  privateKey: z.string().optional(), // 새로운 키가 필요한 경우
});

// 디렉토리 업로드 요청 스키마
export const DirectoryUploadRequestSchema = z.object({
  directoryPath: z.string(),
  tags: z.record(z.string()).optional(),
  preserveStructure: z.boolean().default(true),
  excludePatterns: z.array(z.string()).optional(),
  includeHidden: z.boolean().default(false),
});

// 카테고리 관리 스키마
export const CategoryRequestSchema = z.object({
  action: z.enum(['create', 'update', 'delete', 'list', 'get']),
  categoryName: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  parentCategory: z.string().optional(),
});

// 태그 관리 스키마
export const TagRequestSchema = z.object({
  action: z.enum(['create', 'update', 'delete', 'list', 'search']),
  tagName: z.string().optional(),
  tagValue: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
});

// 성능 모니터링 스키마
export const PerformanceRequestSchema = z.object({
  operation: z.enum(['upload', 'download', 'search', 'batch']),
  fileSize: z.number().optional(),
  concurrent: z.number().optional(),
  duration: z.number().optional(),
});

// 플러그인 관리 스키마
export const PluginRequestSchema = z.object({
  action: z.enum(['install', 'uninstall', 'enable', 'disable', 'list', 'info']),
  pluginName: z.string().optional(),
  pluginUrl: z.string().optional(),
  version: z.string().optional(),
});

// 고급 통계 스키마
export const AdvancedStatsRequestSchema = z.object({
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  owner: z.string().optional(),
  category: z.string().optional(),
  includeDeleted: z.boolean().default(false),
  groupBy: z.enum(['day', 'week', 'month', 'category', 'owner']).optional(),
});

// 파일 복구 요청 스키마
export const RestoreRequestSchema = z.object({
  transactionId: z.string(),
  restoreToPath: z.string().optional(),
  overwrite: z.boolean().default(false),
});

// 응답 타입들
export type DeleteRequest = z.infer<typeof DeleteRequestSchema>;
export type BatchDownloadRequest = z.infer<typeof BatchDownloadRequestSchema>;
export type RollbackRequest = z.infer<typeof RollbackRequestSchema>;
export type RevokeShareRequest = z.infer<typeof RevokeShareRequestSchema>;
export type SwitchTokenRequest = z.infer<typeof SwitchTokenRequestSchema>;
export type DirectoryUploadRequest = z.infer<typeof DirectoryUploadRequestSchema>;
export type CategoryRequest = z.infer<typeof CategoryRequestSchema>;
export type TagRequest = z.infer<typeof TagRequestSchema>;
export type PerformanceRequest = z.infer<typeof PerformanceRequestSchema>;
export type PluginRequest = z.infer<typeof PluginRequestSchema>;
export type AdvancedStatsRequest = z.infer<typeof AdvancedStatsRequestSchema>;
export type RestoreRequest = z.infer<typeof RestoreRequestSchema>;

// 삭제 응답
export interface DeleteResponse {
  transactionId: string;
  deleted: boolean;
  permanent: boolean;
  message: string;
  timestamp: number;
}

// 배치 다운로드 응답
export interface BatchDownloadResponse {
  results: Array<{
    transactionId: string;
    filePath?: string;
    content?: Buffer;
    success: boolean;
    error?: string;
    metadata?: FileInfo;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    totalSize: number;
  };
}

// 버전 롤백 응답
export interface RollbackResponse {
  originalTransactionId: string;
  newTransactionId: string;
  targetVersion: string;
  backupTransactionId?: string;
  url: string;
  timestamp: number;
}

// 공유 해제 응답
export interface RevokeShareResponse {
  transactionId: string;
  revokedUsers: string[];
  revokedAll: boolean;
  message: string;
  timestamp: number;
}

// 토큰 전환 응답
export interface SwitchTokenResponse {
  previousTokenType: string;
  newTokenType: string;
  success: boolean;
  balance: string;
  currency: string;
  message: string;
}

// 디렉토리 업로드 응답
export interface DirectoryUploadResponse {
  directoryPath: string;
  files: Array<{
    relativePath: string;
    transactionId: string;
    url: string;
    size: number;
    success: boolean;
    error?: string;
  }>;
  summary: {
    totalFiles: number;
    totalSize: number;
    successful: number;
    failed: number;
    preservedStructure: boolean;
  };
}

// 카테고리 응답
export interface CategoryResponse {
  categories: Array<{
    name: string;
    description?: string;
    color?: string;
    parentCategory?: string;
    fileCount: number;
    totalSize: number;
  }>;
  action: string;
  success: boolean;
  message?: string;
}

// 태그 응답
export interface TagResponse {
  tags: Array<{
    name: string;
    value?: string;
    description?: string;
    category?: string;
    usageCount: number;
  }>;
  action: string;
  success: boolean;
  message?: string;
}

// 성능 모니터링 응답
export interface PerformanceResponse {
  operation: string;
  metrics: {
    duration: number;
    throughput: number; // bytes per second
    latency: number;
    successRate: number;
    errorRate: number;
  };
  recommendations: string[];
  timestamp: number;
}

// 플러그인 응답
export interface PluginResponse {
  plugins: Array<{
    name: string;
    version: string;
    enabled: boolean;
    description?: string;
    author?: string;
    dependencies?: string[];
  }>;
  action: string;
  success: boolean;
  message?: string;
}

// 고급 통계 응답
export interface AdvancedStatsResponse extends StatsResponse {
  timeSeries: Array<{
    period: string;
    uploads: number;
    downloads: number;
    totalSize: number;
    uniqueUsers: number;
  }>;
  topCategories: Array<{
    name: string;
    fileCount: number;
    totalSize: number;
    percentage: number;
  }>;
  topOwners: Array<{
    address: string;
    fileCount: number;
    totalSize: number;
    percentage: number;
  }>;
  storageEfficiency: {
    compressionRatio: number;
    deduplicationRatio: number;
    costPerGB: number;
  };
}

// 파일 복구 응답
export interface RestoreResponse {
  transactionId: string;
  restored: boolean;
  restoreToPath?: string;
  message: string;
  timestamp: number;
} 