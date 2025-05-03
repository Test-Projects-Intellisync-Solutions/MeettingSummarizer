/// <reference types="multer" />

import type { Request } from 'express';
import type { FileFilterCallback, File } from 'multer';

declare global {
  namespace Express {
    interface MulterFile extends File {}
  }
}

export type { Request, FileFilterCallback, File };
