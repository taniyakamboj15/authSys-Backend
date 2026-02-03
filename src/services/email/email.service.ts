import nodemailer from 'nodemailer';
import logger from '../../common/utils/logger';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER;

if (!SMTP_USER || !SMTP_PASS) {
  logger.error('SMTP credentials not configured');
  throw new Error('SMTP_USER and SMTP_PASS must be set in environment variables');
}

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// Verify connection configuration
transporter.verify((error: any, success: any) => {
  if (error) {
    logger.error('SMTP connection failed', { error: error.message });
  } else {
    logger.info('SMTP server is ready to send emails');
  }
});

export class EmailService {
  /**
   * Send verification OTP email
   */
  async sendVerificationEmail(to: string, otp: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"Auth System" <${EMAIL_FROM}>`,
        to,
        subject: 'Verify Your Email Address',
        html: this.getVerificationEmailTemplate(otp),
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info('Verification email sent', { to, messageId: info.messageId });
    } catch (error: any) {
      logger.error('Failed to send verification email', {
        to,
        error: error.message,
        stack: error.stack,
      });
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * HTML email template for verification
   */
  private getVerificationEmailTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Verify Your Email</h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Thank you for signing up! Please use the verification code below to complete your registration:
                    </p>
                    
                    <!-- OTP Box -->
                    <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                      <p style="color: #666666; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                      <p style="color: #667eea; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${otp}
                      </p>
                    </div>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                      <strong>Important:</strong> This code will expire in <strong>5 minutes</strong>. If you didn't request this code, please ignore this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} Auth System. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  async sendPasswordResetOTP(to: string, name: string, otp: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"Auth System" <${EMAIL_FROM}>`,
        to,
        subject: 'Reset Your Password',
        html: this.getPasswordResetEmailTemplate(name, otp),
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info('Password reset email sent', { to, messageId: info.messageId });
    } catch (error: any) {
      logger.error('Failed to send password reset email', {
        to,
        error: error.message,
        stack: error.stack,
      });
      throw new Error('Failed to send password reset email');
    }
  }

  private getPasswordResetEmailTemplate(name: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Reset Your Password</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Hi ${name},
                    </p>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      We received a request to reset your password. Use the code below to complete the process:
                    </p>
                    <div style="background-color: #f8f9fa; border: 2px dashed #f5576c; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                      <p style="color: #666666; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">Your Reset Code</p>
                      <p style="color: #f5576c; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${otp}
                      </p>
                    </div>
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                      <strong>Important:</strong> This code will expire in <strong>5 minutes</strong>. If you didn't request this, please ignore this email and your password will remain unchanged.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} Auth System. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
