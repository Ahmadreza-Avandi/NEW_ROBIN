import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';

// GET /api/feedback/forms/[id] - Get a specific feedback form
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;

    // Get the form
    const forms = await executeQuery(`
      SELECT * FROM feedback_forms
      WHERE id = ?
    `, [formId]);

    if (forms.length === 0) {
      return NextResponse.json(
        { success: false, message: 'فرم بازخورد یافت نشد' },
        { status: 404 }
      );
    }

    const form = forms[0];

    // Get the questions
    const questions = await executeQuery(`
      SELECT * FROM feedback_form_questions
      WHERE form_id = ?
      ORDER BY question_order ASC
    `, [formId]);

    form.questions = questions;

    return NextResponse.json({ success: true, data: form });
  } catch (error) {
    console.error('Get feedback form API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت فرم بازخورد' },
      { status: 500 }
    );
  }
}

// PUT /api/feedback/forms/[id] - Update a feedback form
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;
    const body = await req.json();
    const { title, description, template, status } = body;

    // Check if form exists
    const forms = await executeQuery(`
      SELECT * FROM feedback_forms
      WHERE id = ?
    `, [formId]);

    if (forms.length === 0) {
      return NextResponse.json(
        { success: false, message: 'فرم بازخورد یافت نشد' },
        { status: 404 }
      );
    }

    // Update the form
    await executeSingle(`
      UPDATE feedback_forms
      SET 
        title = ?,
        description = ?,
        template = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [title, description, template, status, formId]);

    return NextResponse.json({
      success: true,
      message: 'فرم بازخورد با موفقیت بروزرسانی شد'
    });
  } catch (error) {
    console.error('Update feedback form API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بروزرسانی فرم بازخورد' },
      { status: 500 }
    );
  }
}

// DELETE /api/feedback/forms/[id] - Delete a feedback form
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;

    // Check if form exists
    const forms = await executeQuery(`
      SELECT * FROM feedback_forms
      WHERE id = ?
    `, [formId]);

    if (forms.length === 0) {
      return NextResponse.json(
        { success: false, message: 'فرم بازخورد یافت نشد' },
        { status: 404 }
      );
    }

    // Delete the form (cascade will delete questions)
    await executeSingle(`
      DELETE FROM feedback_forms
      WHERE id = ?
    `, [formId]);

    return NextResponse.json({
      success: true,
      message: 'فرم بازخورد با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Delete feedback form API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در حذف فرم بازخورد' },
      { status: 500 }
    );
  }
}