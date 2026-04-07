export function log(fields: Record<string, unknown>): void {
  const entry = {
    timestamp: new Date().toISOString(),
    ...fields,
  };
  console.log(JSON.stringify(entry));
}
