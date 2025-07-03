'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';

const contactFormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  subject: z.string(),
  message: z.string(),
});

type ContactFormInputs = z.infer<typeof contactFormSchema>;

export async function sendEmail(data: ContactFormInputs): Promise<{ success: boolean; error?: string }> {
  // Server-side validation
  const parsedData = contactFormSchema.safeParse(data);

  if (!parsedData.success) {
    return { success: false, error: 'Invalid form data.' };
  }

  const { name, email, subject, message } = parsedData.data;
  const adminEmail = 'saytee.software@gmail.com';

  // Check if credentials are set in environment variables
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log("Gmail credentials not found in .env, simulating email success.");
    console.log("To send real emails, add GMAIL_USER and GMAIL_APP_PASSWORD to your .env file.");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Check for a specific test case to simulate an error
    if (email.includes('fail@')) {
      console.error('Simulated email failure.');
      return { success: false, error: 'Failed to send message due to a simulation error.' };
    }
    return { success: true };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use the built-in Gmail service
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Use a Gmail App Password
    },
  });

  const mailOptions = {
    from: `"${name}" <${process.env.GMAIL_USER}>`, // The 'from' must be the authenticated user
    to: adminEmail,
    replyTo: email, // The user's actual email address
    subject: `New Contact Form Submission: ${subject}`,
    text: message,
    html: `
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    // In production, you would not expose the raw error to the client.
    return { success: false, error: 'Failed to send message. Please try again later.' };
  }
}
