import { NestInterceptor, Type } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { path } from 'app-root-path';

interface IUploadFileInterceptorArguments {
  fieldName: string;
  mainFolderName: string | undefined;
}

export function UploadFileInterceptor({ fieldName, mainFolderName }: IUploadFileInterceptorArguments): Type<NestInterceptor> {
  const staticPath = `${path}/public/uploads`;

  const destination = mainFolderName ? `${staticPath}/${mainFolderName}` : staticPath;

  const storage = diskStorage({
    destination,
    filename: (req, file, callback) => {
      const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const fileName = `${uniquePrefix}-${file.originalname}`;
      callback(null, fileName);
    },
  });

  return FileInterceptor(fieldName, { storage });
}
