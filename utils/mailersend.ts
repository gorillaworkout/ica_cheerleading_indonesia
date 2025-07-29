// ✅ Correct import for mailersend v2.6.0
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend')

// Initialize MailerSend with API token
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_TOKEN!,
})

export class MailerSendService {
  
  /**
   * Send password reset email using MailerSend template
   * Template ID: vywj2lpzp8kg7oqz
   */
  static async sendPasswordResetEmail(
    email: string, 
    name: string,
    resetUrl: string
  ): Promise<boolean> {
    try {
      // console.log('🔐 Sending password reset via MailerSend template:', {
      //   email,
      //   templateId: 'vywj2lpzp8kg7oqz',
      //   resetUrl,
      //   apiKeyExists: !!process.env.MAILERSEND_API_TOKEN
      // })

      if (!process.env.MAILERSEND_API_TOKEN) {
        console.error('❌ MAILERSEND_API_TOKEN not found in environment')
        return false
      }

      const sentFrom = new Sender(
        process.env.MAILERSEND_FROM_EMAIL || 'noreply@ica-indonesia.org',
        'Indonesian Cheer Association'
      )
      
      const recipients = [new Recipient(email, name)]
      
      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setTemplateId('vywj2lpzp8kg7oqz') // ✅ Password reset template
        .setVariables([
          {
            email: email,
            substitutions: [
              { var: 'name', value: name },
              { var: 'reset_url', value: resetUrl },
              { var: 'current_year', value: new Date().getFullYear().toString() }
            ]
          }
        ])

      const result = await mailerSend.email.send(emailParams)
      
      // console.log('✅ Password reset email sent successfully:', result)
      return true

    } catch (error) {
      console.error('❌ Failed to send password reset email:', error)
      return false
    }
  }

  /**
   * Send email verification using MailerSend template
   * Template ID: 351ndgwqpjdgzqx8
   */
  static async sendVerificationEmail(
    email: string,
    name: string, 
    confirmationUrl: string
  ): Promise<boolean> {
    try {
      // console.log('📧 Sending email verification via MailerSend template:', {
      //   email,
      //   templateId: '351ndgwqpjdgzqx8',
      //   confirmationUrl,
      //   apiKeyExists: !!process.env.MAILERSEND_API_TOKEN
      // })

      if (!process.env.MAILERSEND_API_TOKEN) {
        console.error('❌ MAILERSEND_API_TOKEN not found in environment')
        return false
      }

      const sentFrom = new Sender(
        process.env.MAILERSEND_FROM_EMAIL || 'noreply@ica-indonesia.org',
        'Indonesian Cheer Association'
      )
      
      const recipients = [new Recipient(email, name)]
      
      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setTemplateId('351ndgwqpjdgzqx8') // ✅ Email verification template
        .setVariables([
          {
            email: email,
            substitutions: [
              { var: 'name', value: name },
              { var: 'confirmation_url', value: confirmationUrl },
              { var: 'current_year', value: new Date().getFullYear().toString() }
            ]
          }
        ])

      const result = await mailerSend.email.send(emailParams)
      
      // console.log('✅ Email verification sent successfully:', result)
      return true

    } catch (error) {
      // console.error('❌ Failed to send email verification:', error)
      return false
    }
  }

  /**
   * Test MailerSend connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      // console.log('🧪 Testing MailerSend connection...')
      // console.log('API Token exists:', !!process.env.MAILERSEND_API_TOKEN)
      // console.log('From email:', process.env.MAILERSEND_FROM_EMAIL || 'noreply@ica-indonesia.org')
      
      return !!process.env.MAILERSEND_API_TOKEN
    } catch (error) {
      console.error('❌ MailerSend connection test failed:', error)
      return false
    }
  }
}

export default MailerSendService