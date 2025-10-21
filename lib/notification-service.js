import nodemailer from 'nodemailer';

const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(emailConfig);

export async function sendTaskAssignmentEmail(email, name, taskData) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'CRM System <noreply@example.com>',
      to: email,
      subject: 'وظیفه جدید به شما محول شد',
      html: `
        <div dir="rtl">
          <h3>سلام ${name}</h3>
          <p>یک وظیفه جدید به شما محول شده است:</p>
          <p><strong>عنوان:</strong> ${taskData.title}</p>
          ${taskData.description ? `<p><strong>توضیحات:</strong> ${taskData.description}</p>` : ''}
          <p><strong>اولویت:</strong> ${taskData.priority}</p>
          ${taskData.due_date ? `<p><strong>مهلت انجام:</strong> ${new Date(taskData.due_date).toLocaleDateString('fa-IR')}</p>` : ''}
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending task assignment email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendTaskCompletionEmail(email, name, taskData) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'CRM System <noreply@example.com>',
      to: email,
      subject: 'وظیفه تکمیل شد',
      html: `
        <div dir="rtl">
          <h3>سلام ${name}</h3>
          <p>وظیفه زیر تکمیل شده است:</p>
          <p><strong>عنوان:</strong> ${taskData.title}</p>
          <p><strong>تکمیل شده توسط:</strong> ${taskData.completed_by_name}</p>
          <p><strong>مسئول اصلی:</strong> ${taskData.assigned_to_name}</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending task completion email:', error);
    return { success: false, error: error.message };
  }
}

const notificationService = {
  sendTaskAssignmentEmail,
  sendTaskCompletionEmail,
};

export default notificationService;
