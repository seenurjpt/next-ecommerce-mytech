// app/api/dashboard/recent-orders/route.js (Create this file)

import { NextResponse } from 'next/server';
import { readJsonData } from '@/app/lib/dataUtils';

const FILENAME = 'recentOrders.json';

export async function GET() {
  try {
    const data = await readJsonData(FILENAME);
    if (data === null) {
      console.warn(
        `API GET /api/dashboard/recent-orders: ${FILENAME} not found.`
      );
      return NextResponse.json([]);
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      `API GET /api/dashboard/recent-orders Error (${FILENAME}):`,
      error
    );
    return NextResponse.json(
      { message: error.message || `Failed to fetch data from ${FILENAME}.` },
      { status: 500 }
    );
  }
}
