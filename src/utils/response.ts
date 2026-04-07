// utils/response.ts
export const response = (statusCode: number, body: unknown) => ({
  statusCode,
  body: JSON.stringify(body),
});

export const errorResponse = (code: number, error: string) =>
  response(code, { error });

export const ok = (data: unknown) => response(200, data);
