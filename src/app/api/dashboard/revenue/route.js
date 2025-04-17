import { NextResponse } from 'next/server';
import { readJsonData } from '@/app/lib/dataUtils';

const FILENAME = 'targetRevenueData.json';

export async function GET() {
  try {
    const data = await readJsonData(FILENAME);
     if (data === null) {
       console.warn(`API GET /api/dashboard/revenue: ${FILENAME} not found.`);
       return NextResponse.json(
         { message: `${FILENAME} not found.` },
         { status: 404 }
       );
     }
    return NextResponse.json(data);
  } catch (error) {
    console.error(`API GET /api/dashboard/revenue Error (${FILENAME}):`, error);
    return NextResponse.json(
      { message: error.message || `Failed to fetch data from ${FILENAME}.` },
      { status: 500 }
    );
  }
}