/// <reference types="multer" />

declare global {
  namespace Express {
    interface Multer {
      File: import('multer').File;
    }
  }
}

export {};
