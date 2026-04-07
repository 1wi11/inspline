const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

export const response = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: JSON.stringify(body),
});

export const errorResponse = (code: number, error: string) =>
  response(code, { error });

export const ok = (data: unknown) => response(200, data);
