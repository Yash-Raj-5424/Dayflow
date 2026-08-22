import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


def _send(to_email: str, subject: str, text_body: str, html_body: str) -> None:
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.warning(
            "SMTP is not configured (SMTP_USERNAME/SMTP_PASSWORD missing in .env). "
            "Falling back to console output.\nTo: %s\nSubject: %s\n%s",
            to_email,
            subject,
            text_body,
        )
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME}>"
    message["To"] = to_email
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(message)
    except smtplib.SMTPException:
        logger.exception("Failed to send email to %s", to_email)


def send_verification_email(to_email: str, token: str) -> None:
    docs_link = settings.FRONTEND_URL
    subject = "Verify your Dayflow account"

    text_body = (
        "Welcome to Dayflow!\n\n"
        f"Open the API docs and use POST /auth/verify-email with this token:\n\n"
        f"{token}\n\n"
        f"Docs: {docs_link}\n\n"
        f"This token expires in {settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES} minutes."
    )

    html_body = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Welcome to Dayflow</h2>
      <p>Please verify your email address to activate your account.</p>
      <p>
        <a href="{docs_link}"
           style="display:inline-block;padding:10px 20px;background:#4f46e5;
                  color:#fff;text-decoration:none;border-radius:6px;">
          Open API Docs
        </a>
      </p>
      <p>In the docs, open <code>POST /auth/verify-email</code> and paste this token into the request body:</p>
      <p style="background:#f3f4f6;padding:10px;border-radius:6px;word-break:break-all;">
        <code>{token}</code>
      </p>
      <p style="color:#666;font-size:12px;">
        This token expires in {settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES} minutes.
      </p>
    </div>
    """

    _send(to_email, subject, text_body, html_body)
