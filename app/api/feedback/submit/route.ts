import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeSingle } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

// POST /api/feedback/submit - Submit a feedback form response
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, responses } = body;

    if (!token || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { success: false, message: 'اطلاعات پاسخ فرم کامل نیست' },
        { status: 400 }
      );
    }

    // Find the submission by token
    const submissions = await executeQuery(`
      SELECT s.*, f.type as form_type, f.title as form_title
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

    // Validate that all required questions have responses
    const requiredQuestionIds = questions
      .filter(q => q.required)
      .map(q => q.id);
    
    const respondedQuestionIds = responses.map(r => r.questionId);
    
    const missingRequiredQuestions = requiredQuestionIds.filter(
      id => !respondedQuestionIds.includes(id)
    );

    if (missingRequiredQuestions.length > 0) {
      return NextResponse.json(
        { success: false, message: 'لطفا به تمام سوالات ضروری پاسخ دهید' },
        { status: 400 }
      );
    }

    // Save the responses
    for (const response of responses) {
      const responseId = uuidv4();
      await executeSingle(`
        INSERT INTO feedback_form_responses (
          id, submission_id, question_id, response, created_at
        ) VALUES (?, ?, ?, ?, NOW())
      `, [responseId, submission.id, response.questionId, response.response]);
    }

    // Update the submission status
    await executeSingle(`
      UPDATE feedback_form_submissions
      SET status = 'completed', submitted_at = NOW()
      WHERE id = ?
    `, [submission.id]);

    // Create a feedback entry in the main feedback table
    // Find the overall satisfaction rating if it exists
    let satisfactionScore = null;
    const satisfactionQuestion = questions.find(q => 
      q.type === 'rating' && q.question.includes('رضایت')
    );
    
    if (satisfactionQuestion) {
      const satisfactionResponse = responses.find(r => 
        r.questionId === satisfactionQuestion.id
      );
      
      if (satisfactionResponse) {
        satisfactionScore = parseInt(satisfactionResponse.response);
      }
    }

    // Find any comment/text responses to use as the feedback comment
    let feedbackComment = '';
    const textResponses = responses.filter(r => {
      const question = questions.find(q => q.id === r.questionId);
      return question && (question.type === 'text' || question.type === 'textarea');
    });

    if (textResponses.length > 0) {
      feedbackComment = textResponses
        .map(r => {
          const question = questions.find(q => q.id === r.questionId);
          return `${question?.question}: ${r.response}`;
        })
        .join('\n\n');
    }

    // Create the feedback entry
    const feedbackId = uuidv4();
    await executeSingle(`
      INSERT INTO feedback (
        id, customer_id, type, title, comment, score,
        product, channel, category, priority, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
      feedbackId,
      submission.customer_id,
      submission.form_type,
      submission.form_title,
      feedbackComment,
      satisfactionScore,
      null, // product
      'email', // channel
      null, // category
      'medium' // priority
    ]);

    return NextResponse.json({
      success: true,
      message: 'پاسخ شما با موفقیت ثبت شد. از همکاری شما متشکریم.'
    });
  } catch (error) {
    console.error('Submit feedback form API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ثبت پاسخ فرم بازخورد' },
      { status: 500 }
    );
  }
}