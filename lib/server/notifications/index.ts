import pino from 'pino';

const logger = pino({ name: 'notifications' });

export async function sendPushNotification(targetUserId: string, payload: { title: string; body: string }) {
  logger.info({ targetUserId, payload }, 'sendPushNotification stub');
}

export async function sendEmailNotification(to: string, subject: string, body: string) {
  if (!to) {
    logger.info({ subject }, 'Email skipped: missing recipient');
    return;
  }
  if (process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: 'MentorMatch SA <notify@mentormatchsa.org>', to, subject, html: body }),
    });
    if (!response.ok) {
      logger.error({ status: response.status }, 'Failed to send email via Resend');
    }
  } else {
    logger.info({ to, subject }, 'Email notification stub');
  }
}
