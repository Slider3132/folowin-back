import { NestInterceptor, Type } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { path } from 'app-root-path';
import { existsSync, mkdirSync } from 'fs-extra';
import { diskStorage } from 'multer';

interface IUploadFileInterceptorArguments {
  fieldName: string;
  mainFolderName: string | undefined;
  allowedMimeTypes?: string[];
  maxSizeMb?: number;
}

export function UploadFileInterceptor({
  fieldName,
  mainFolderName,
  allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSizeMb = 5,
}: IUploadFileInterceptorArguments): Type<NestInterceptor> {
  const staticPath = `${path}/public/uploads`;
  const destination = mainFolderName
    ? `${staticPath}/${mainFolderName}`
    : staticPath;

  // Ensure directory exists
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
  }

  const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  };

  const storage = diskStorage({
    destination,
    filename: (req, file, callback) => {
      const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const cleanName = file.originalname.replace(/\s+/g, '_');
      callback(null, `${uniquePrefix}-${cleanName}`);
    },
  });

  return FileInterceptor(fieldName, {
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
  });
}
