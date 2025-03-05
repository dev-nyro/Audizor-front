
// File related types
export interface FileType {
  id?: string;
  name: string;
  type: string;
  size: number;
  lastModified: string;
  url?: string;
  transcriptUrl?: string;
  status?: 'completed' | 'processing' | 'error';
  folderId?: string;
  thumbnailUrl?: string;
}

// Folder related types
export interface FolderType {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
  fileCount?: number;
}

// API Response types
export interface FilesResponse {
  files: FileType[];
  error?: string;
}

export interface FoldersResponse {
  folders: FolderType[];
  error?: string;
}

export interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
}

// File upload progress callback
export type ProgressCallback = (progress: number) => void;
export type ErrorCallback = (error: Error) => void;

// Upload result
export interface UploadResult {
  success: boolean;
  file?: FileType;
  error?: Error;
}
