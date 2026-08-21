export type ServiceResult<T = void> =
  ({ ok: true } & (T extends void ? object : { data: T })) | { ok: false; error: string };
