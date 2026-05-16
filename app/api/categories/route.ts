import { NextResponse } from 'next/server';
import { getCategories, upsertCategory } from '@/lib/db';
import type { Category } from '@/types';

export const runtime = 'edge';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (err) {
    console.error('[GET /api/categories]', err);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: Category = await req.json();
    await upsertCategory(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/categories]', err);
    return NextResponse.json({ error: 'Failed to upsert category' }, { status: 500 });
  }
}
