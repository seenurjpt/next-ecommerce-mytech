// app/api/dashboard/top-products/route.js (Create this file - note the kebab-case)

import { NextResponse } from 'next/server';
import { readJsonData } from '@/app/lib/dataUtils';

const FILENAME = 'topProduct.json'; // Make sure filename matches exactly

export async function GET() {
  try {
    const data = await readJsonData(FILENAME);
    if (data === null) {
      console.warn(
        `API GET /api/dashboard/top-products: ${FILENAME} not found.`
      );
      return NextResponse.json(
        { message: `${FILENAME} not found.` },
        { status: 404 }
      );
    }
    // console.log(`API GET /api/dashboard/top-products - Fetched data`);
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      `API GET /api/dashboard/top-products Error (${FILENAME}):`,
      error
    );
    return NextResponse.json(
      { message: error.message || `Failed to fetch data from ${FILENAME}.` },
      { status: 500 }
    );
  }
}
