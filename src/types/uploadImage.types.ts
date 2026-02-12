export interface UploadResult {
  url: string;
  fileId: string;
  [key: string]: any; // for extra properties ImageKit may return
}
