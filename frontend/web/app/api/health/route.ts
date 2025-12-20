import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Docker/load balancer
 * Returns 200 OK when the service is healthy
 */
export async function GET() {
  return NextResponse.json(
    { status: 'healthy', service: 'olym-pose-web' },
    { status: 200 }
  );
}

