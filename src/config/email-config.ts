// EmailJS Configuration
// To set up EmailJS:
// 1. Go to https://www.emailjs.com/
// 2. Create an account and service
// 3. Create email templates
// 4. Replace the values below with your actual EmailJS credentials

export const EMAIL_CONFIG = {
  // EmailJS Service Configuration
  SERVICE_ID: 'service_ne2mozg', // Replace with your EmailJS service ID
  TEMPLATE_ID_CREDENTIALS: 'template_vo0jgyl', // Template for sending credentials
  TEMPLATE_ID_APPROVAL: 'template_pzbt1i9', // Template for approval notification
  PUBLIC_KEY: '6G96ntbMKmH9pYp5n', // Replace with your EmailJS public key
  
  // Email Templates (for reference)
  CREDENTIALS_TEMPLATE: {
    subject: 'Your Pharmacy Account Credentials - {{pharmacy_name}}',
    body: `
Dear {{owner_name}},

Congratulations! Your pharmacy registration for "{{pharmacy_name}}" has been approved by Nabha Civil Hospital.

Your login credentials are:
📧 Email: {{login_email}}
🔑 Temporary Password: {{temp_password}}

🔗 Login URL: {{login_url}}

Important Instructions:
1. Use the credentials above to login for the first time
2. You will be prompted to change your password immediately
3. A password reset email has also been sent to your email address
4. If you have any issues, contact: {{support_email}}

Best regards,
{{admin_name}}
Nabha Civil Hospital Admin
    `.trim()
  },
  
  APPROVAL_TEMPLATE: {
    subject: 'Pharmacy Registration Approved - {{pharmacy_name}}',
    body: `
Dear {{owner_name}},

Great news! Your pharmacy registration for "{{pharmacy_name}}" has been approved.

You will receive your login credentials in a separate email shortly.

🔗 Login URL: {{login_url}}

If you have any questions, please contact: {{support_email}}

Best regards,
{{admin_name}}
Nabha Civil Hospital Admin
    `.trim()
  }
};

// Instructions for setting up EmailJS templates
export const EMAILJS_SETUP_INSTRUCTIONS = `
EmailJS Setup Instructions:

1. Go to https://www.emailjs.com/ and create an account
2. Create a new service (Gmail, Outlook, etc.)
3. Create two email templates:
   - template_credentials: For sending login credentials
   - template_approval: For approval notifications
4. Use these template variables:
   - {{pharmacy_name}} - Name of the pharmacy
   - {{owner_name}} - Name of the pharmacy owner
   - {{login_email}} - Email address for login
   - {{temp_password}} - Temporary password
   - {{admin_name}} - Admin name
   - {{admin_email}} - Admin email
   - {{login_url}} - Login page URL
   - {{support_email}} - Support email address
5. Copy your Service ID, Template IDs, and Public Key
6. Update the EMAIL_CONFIG object above with your actual values
7. Test the email functionality in the admin dashboard

Note: EmailJS is free for up to 200 emails per month.
`;