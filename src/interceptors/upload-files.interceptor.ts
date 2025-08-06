import { NestInterceptor, Type } from '@nestjs/common';
import { diskStorage } from 'multer';
import { path } from 'app-root-path';
import { existsSync, mkdirSync } from 'fs-extra';
import { FilesInterceptor } from '@nestjs/platform-express';

interface UploadFilesInterceptorOptions {
  fieldName: string;
  maxCount?: number;
  mainFolderName?: string;
}

export function UploadFilesInterceptor({ fieldName, maxCount = 100, mainFolderName }: UploadFilesInterceptorOptions): Type<NestInterceptor> {
  const staticPath = `${path}/public/uploads`;

  const destination = mainFolderName ? `${staticPath}/${mainFolderName}` : staticPath;

  // Ensure directory exists
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
  }

  const storage = diskStorage({
    destination,
    filename: (req, file, cb) => {
      const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const cleanName = file.originalname.replace(/\s+/g, '_');
      cb(null, `${uniquePrefix}-${cleanName}`);
    },
  });

  return FilesInterceptor(fieldName, maxCount, { storage });
}
