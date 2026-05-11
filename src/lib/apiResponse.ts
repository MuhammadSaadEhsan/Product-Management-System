import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export function successResponse<T>(data: T, message = 'Success', meta?: Record<string, unknown>) {
  return NextResponse.json({ success: true, data, message, meta }, { status: 200 });
}

export function createdResponse<T>(data: T, message = 'Created successfully') {
  return NextResponse.json({ success: true, data, message }, { status: 201 });
}

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return NextResponse.json({ success: false, error: messages }, { status: 422 });
  }
  if (error instanceof ApiError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
  }
  const message = error instanceof Error ? error.message : 'Internal server error';
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
