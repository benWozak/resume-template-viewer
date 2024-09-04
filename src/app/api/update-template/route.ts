import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { resumeTemplates } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { id, name, description } = await req.json();

    if (!id || (!name && !description)) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const updateData: Partial<typeof resumeTemplates.$inferInsert> = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;

    const result = await db.update(resumeTemplates)
      .set(updateData)
      .where(eq(resumeTemplates.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, updatedTemplate: result[0] });
  } catch (error) {
    console.error('Error updating resume template:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}