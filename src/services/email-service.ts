import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from '../config/email-config';

export interface CredentialsEmailData {
  pharmacyName: string;
  ownerName: string;
  email: string;
  tempPassword: string;
  adminName: string;
  adminEmail: string;
}

export class EmailService {
  private isInitialized = false;

  constructor() {
    // Initialize EmailJS with your public key
    if (EMAIL_CONFIG.PUBLIC_KEY && EMAIL_CONFIG.PUBLIC_KEY !== 'your_public_key_here') {
      emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
      this.isInitialized = true;
    } else {
      console.warn('EmailJS not configured. Please update EMAIL_CONFIG in src/config/email-config.ts');
      this.isInitialized = false;
    }
  }

  async sendCredentialsEmail(data: CredentialsEmailData): Promise<boolean> {
    if (!this.isInitialized) {
      console.error('EmailJS not initialized');
      return false;
    }

    try {
      const templateParams = {
        to_email: data.email,
        to_name: data.ownerName,
        pharmacy_name: data.pharmacyName,
        login_email: data.email,
        temp_password: data.tempPassword,
        admin_name: data.adminName,
        admin_email: data.adminEmail,
        login_url: window.location.origin + '/login',
        support_email: 'admin@nabha.gov.in'
      };

      const result = await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ID_CREDENTIALS,
        templateParams
      );

      console.log('Credentials email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Failed to send credentials email:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        text: error.text,
        response: error.response
      });
      return false;
    }
  }

  async sendApprovalNotification(data: CredentialsEmailData): Promise<boolean> {
    if (!this.isInitialized) {
      console.error('EmailJS not initialized');
      return false;
    }

    try {
      const templateParams = {
        to_email: data.email,
        to_name: data.ownerName,
        pharmacy_name: data.pharmacyName,
        admin_name: data.adminName,
        admin_email: data.adminEmail,
        login_url: window.location.origin + '/login',
        support_email: 'admin@nabha.gov.in'
      };

      const result = await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ID_APPROVAL,
        templateParams
      );

      console.log('Approval notification sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Failed to send approval notification:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        text: error.text,
        response: error.response
      });
      return false;
    }
  }

  // Test EmailJS configuration
  async testEmailJS(): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      return { success: false, error: 'EmailJS not initialized' };
    }

    try {
      const testParams = {
        to_email: 'test@example.com',
        to_name: 'Test User',
        pharmacy_name: 'Test Pharmacy',
        login_email: 'test@example.com',
        temp_password: 'TestPassword123!',
        admin_name: 'Test Admin',
        admin_email: 'admin@test.com',
        login_url: 'https://test.com/login',
        support_email: 'support@test.com'
      };

      const result = await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ID_CREDENTIALS,
        testParams
      );

      console.log('EmailJS test successful:', result);
      return { success: true };
    } catch (error) {
      console.error('EmailJS test failed:', error);
      return { 
        success: false, 
        error: `Status: ${error.status}, Message: ${error.message}` 
      };
    }
  }

  // Fallback method using mailto link
  generateCredentialsMailto(data: CredentialsEmailData): string {
    const subject = `Your Pharmacy Account Credentials - ${data.pharmacyName}`;
    const body = `
Dear ${data.ownerName},

Congratulations! Your pharmacy registration for "${data.pharmacyName}" has been approved.

Your login credentials are:
Email: ${data.email}
Temporary Password: ${data.tempPassword}

Please login at: ${window.location.origin}/login

Important Instructions:
1. Use the credentials above to login for the first time
2. You will be prompted to change your password
3. A password reset email has been sent to your email address
4. If you have any issues, contact: ${data.adminEmail}

Best regards,
${data.adminName}
Nabha Civil Hospital Admin
    `.trim();

    return `mailto:${data.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
}

export const emailService = new EmailService();
