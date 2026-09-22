/**
 * Minimal ambient typings for `nodemailer`.
 *
 * The package ships no types and `@types/nodemailer` is not installed. Instead
 * of casting the module to `any` (which is what `noImplicitAny: false` was
 * effectively doing), we declare only the surface this project uses.
 *
 * If richer typing is ever needed, install `@types/nodemailer` and delete this
 * file.
 */
declare module 'nodemailer' {
  export interface SendMailOptions {
    from?: string;
    to?: string | string[];
    subject?: string;
    text?: string;
    html?: string;
    [key: string]: unknown;
  }

  export interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: { user?: string; pass?: string };
    [key: string]: unknown;
  }

  export interface Transporter {
    sendMail(options: SendMailOptions): Promise<unknown>;
  }

  export function createTransport(options: TransportOptions): Transporter;
}
