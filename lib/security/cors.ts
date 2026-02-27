import { NextResponse } from "next/server";

export function applyCors(response: NextResponse): NextResponse {
  const origin = process.env.APP_ORIGIN;
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type,X-CSRF-Token");
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  return response;
}

export function corsPreflight(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return applyCors(response);
}
