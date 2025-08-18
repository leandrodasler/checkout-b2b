import type { InstanceOptions, IOContext } from '@vtex/api'
import { JanusClient } from '@vtex/api'

const MAIL_SERVICE_PATH = '/api/mail-service/pvt/sendmail'
const TEMPLATE_RENDER_PATH = '/api/template-render/pvt/templates'

export default class Mail extends JanusClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, {
      ...options,
      headers: {
        VtexIdClientAutCookie: context.authToken,
      },
    })
  }

  public async sendMail(mailData: MailData): Promise<string> {
    return this.http.post(MAIL_SERVICE_PATH, mailData, {
      metric: 'mail-post-send',
    })
  }

  public publishTemplate(template: MailTemplate) {
    return this.http.post(TEMPLATE_RENDER_PATH, template, {
      metric: 'mail-post-template',
    })
  }
}
