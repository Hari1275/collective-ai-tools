import type { AITool, MCPServer } from '@/lib/api';

export type AdminAITool = AITool & Required<Pick<AITool, 'addedDate'>>;

export type AdminMCPResource = MCPServer &
  Required<Pick<MCPServer, 'url' | 'addedDate'>>;

export interface AdminListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminListParams {
  page: number;
  search: string;
  sortBy: string;
  order: 'asc' | 'desc';
}
