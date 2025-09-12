declare module "backblaze-b2" {
  interface B2Config {
    applicationKeyId: string;
    applicationKey: string;
    axios?: any;
    retry?: {
      retries: number;
      retryDelay?: (retryCount: number) => number;
    };
  }

  interface UploadFileOptions {
    uploadUrl: string;
    uploadAuthToken: string;
    fileName: string;
    data: Buffer;
    contentLength?: number;
    mime?: string;
    hash?: string;
    info?: Record<string, string>;
    onUploadProgress?: (event: { loaded: number; total: number }) => void;
  }

  interface B2Response<T = any> {
    data: T;
    status: number;
    statusText: string;
  }

  interface UploadUrlResponse {
    uploadUrl: string;
    authorizationToken: string;
  }

  interface UploadFileResponse {
    fileId: string;
    fileName: string;
    contentLength: number;
    contentType: string;
  }

  interface FileInfo {
    fileId: string;
    fileName: string;
    contentLength: number;
    contentType: string;
    contentSha1: string;
    uploadTimestamp: number;
  }

  class B2 {
    constructor(config: B2Config);

    authorize(): Promise<B2Response>;
    getUploadUrl(options: {
      bucketId: string;
    }): Promise<B2Response<UploadUrlResponse>>;
    uploadFile(
      options: UploadFileOptions
    ): Promise<B2Response<UploadFileResponse>>;
    deleteFileVersion(options: {
      fileId: string;
      fileName: string;
    }): Promise<B2Response>;
    getFileInfo(options: { fileId: string }): Promise<B2Response<FileInfo>>;
    listFileNames(options: {
      bucketId: string;
      startFileName?: string;
      maxFileCount?: number;
      delimiter?: string;
      prefix?: string;
    }): Promise<B2Response<{ files: FileInfo[] }>>;
    downloadFileByName(options: {
      bucketName: string;
      fileName: string;
      responseType?: string;
      onDownloadProgress?: (event: { loaded: number; total: number }) => void;
    }): Promise<B2Response<ArrayBuffer>>;
  }

  export = B2;
}
