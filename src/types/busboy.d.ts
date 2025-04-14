declare module 'busboy' {
  import { IncomingHttpHeaders } from 'http';
  import { Readable } from 'stream';

  interface BusboyOptions {
    headers: IncomingHttpHeaders;
    highWaterMark?: number;
    fileHwm?: number;
    defCharset?: string;
    preservePath?: boolean;
  }

  interface FileInfo {
    filename: string;
    encoding: string;
    mimeType: string;
  }

  class Busboy extends Readable {
    constructor(options: BusboyOptions);

    on(event: 'file', listener: (fieldname: string, file: Readable, info: FileInfo) => void): this;
    on(event: 'field', listener: (fieldname: string, value: string, info: { nameTruncated: boolean, valueTruncated: boolean }) => void): this;
    on(event: 'close', listener: () => void): this;
  }

  export = Busboy;
}
