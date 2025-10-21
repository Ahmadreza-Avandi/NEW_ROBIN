import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET /api/feedback/form/[token] - Get a feedback form by token
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    // Get the submission by token
    const submissions = await executeQuery(`
      SELECT s.*, f.id as form_id, f.type, f.title, f.description, f.template
      FROM feedback_form_submissions s
      JOIN feedback_forms f ON s.form_id = f.id
      WHERE s.token = ? AND s.status = 'pending'
    `, [token]);

    if (submissions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'فرم بازخورد یافت نشد یا قبلا تکمیل شده است' },
        { status: 404 }
      );
    }

    const submission = submissions[0];

    // Get the questions for this form
    const questions = await executeQuery(`
      SELECT * FROM feedback_form_questions
      WHERE form_id = ?
      ORDER BY question_order ASC
    `, [submission.form_id]);

    // Parse the options JSON for each question
    for (const question of questions) {
      if (question.options) {
        try {
          question.options = JSON.parse(question.options);
        } catch (e) {
          console.error('Error parsing question options:', e);
        }
      }
    }

    // Construct the form data
    const formData = {
      id: submission.form_id,
      type: submission.type,
      title: submission.title,
      description: submission.description,
      template: submission.template,
      questions: questions
    };

    return NextResponse.json({ success: true, data: formData });
  } catch (error) {
    console.error('Get feedback form by token API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت فرم بازخورد' },
      { status: 500 }
    );
  }
}