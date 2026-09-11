"""
Email service for sending notifications.
Uses Resend API for email delivery.
"""

import logging
from html import escape
from typing import Optional
from ..config import settings
from ..models.report import is_http_url

logger = logging.getLogger(__name__)

# Nobody reads no-reply@. A mail a user might answer carries Reply-To: support@, which
# Cloudflare Email Routing forwards to the team inbox; that inbox's own address is never
# shown to a user.
SENDER = "ibeanthere <no-reply@ibeanthere.app>"
SUPPORT_ADDRESS = "support@ibeanthere.app"

# Lazy import resend to avoid errors if not installed
resend = None


def _get_resend():
    """Lazy load resend package."""
    global resend
    if resend is None:
        try:
            import resend as resend_pkg
            resend = resend_pkg
            if settings.resend_api_key:
                resend.api_key = settings.resend_api_key
        except ImportError:
            logger.warning("Resend package not installed. Email notifications disabled.")
            return None
    return resend


async def send_new_report_notification(
    report_id: str,
    report_type: str,
    target_type: str,
    description: str,
    reporter_username: Optional[str] = None,
    target_url: Optional[str] = None,
) -> bool:
    """
    Send email notification to admin when a new report is submitted.
    
    Args:
        report_id: UUID of the report
        report_type: Type of report (e.g., 'bug_report', 'user_spam')
        target_type: Type of target (user/cafe/review/website)
        description: Report description
        reporter_username: Username of the reporter (optional)
        target_url: URL of the reported content (optional)
        
    Returns:
        True if email sent successfully, False otherwise
    """
    if not settings.email_enabled:
        logger.info(f"Email notifications disabled. Skipping notification for report {report_id}")
        return False
    
    resend_client = _get_resend()
    if not resend_client:
        return False
    
    try:
        # Format report type for display
        report_type_display = report_type.replace('_', ' ').title()
        target_type_display = target_type.capitalize()

        # Every value below is written by the reporter or derived from what they sent,
        # and lands in HTML an admin opens. Escaped, a report can say anything and only
        # ever be text; the link is printed only for an http(s) URL, since `href` is
        # where escaping stops helping -- `javascript:` survives it intact.
        description_html = escape(description[:500]) + ('...' if len(description) > 500 else '')
        reporter_html = escape(reporter_username or 'Unknown')
        target_link_html = (
            f'<p><strong>Target URL:</strong> <a href="{escape(target_url)}">{escape(target_url)}</a></p>'
            if target_url and is_http_url(target_url)
            else ''
        )

        # Build email content
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #8B4513; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
        .content {{ background: #f9f5f0; padding: 20px; border-radius: 0 0 8px 8px; }}
        .badge {{ display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }}
        .badge-pending {{ background: #FEF3C7; color: #92400E; }}
        .badge-type {{ background: #DBEAFE; color: #1E40AF; }}
        .description {{ background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #8B4513; margin: 15px 0; }}
        .button {{ display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 15px; }}
        .footer {{ margin-top: 20px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">☕ New Report Submitted</h1>
        </div>
        <div class="content">
            <p>A new report has been submitted on ibeanthere.</p>
            
            <p>
                <span class="badge badge-type">{escape(target_type_display)}</span>
                <span class="badge badge-pending">{escape(report_type_display)}</span>
            </p>
            
            <div class="description">
                <strong>Description:</strong><br/>
                {description_html}
            </div>
            
            <p><strong>Reporter:</strong> {reporter_html}</p>
            <p><strong>Report ID:</strong> {escape(report_id)}</p>

            {target_link_html}
            
            <a href="https://ibeanthere.app/admin/reports" class="button">View in Dashboard</a>
            
            <div class="footer">
                <p>This is an automated notification from ibeanthere.</p>
            </div>
        </div>
    </div>
</body>
</html>
"""
        
        # Send email
        response = resend_client.Emails.send({
            "from": SENDER,
            "to": [settings.admin_email],
            "subject": f"[Report] New {report_type_display} - {target_type_display}",
            "html": html_content,
        })
        
        logger.info(f"Email notification sent for report {report_id}: {response}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email notification for report {report_id}: {e}")
        return False


async def send_report_status_update(
    reporter_email: str,
    report_id: str,
    new_status: str,
    admin_notes: Optional[str] = None,
) -> bool:
    """
    Send email to reporter when their report status is updated.
    
    Args:
        reporter_email: Email of the reporter
        report_id: UUID of the report
        new_status: New status (in_progress/resolved/rejected)
        admin_notes: Optional notes from admin
        
    Returns:
        True if email sent successfully, False otherwise
    """
    if not settings.email_enabled:
        return False
    
    resend_client = _get_resend()
    if not resend_client:
        return False
    
    try:
        status_display = new_status.replace('_', ' ').title()
        status_emoji = {
            'in_progress': '🔄',
            'resolved': '✅',
            'rejected': '❌',
        }.get(new_status, '📋')
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #8B4513; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
        .content {{ background: #f9f5f0; padding: 20px; border-radius: 0 0 8px 8px; }}
        .status {{ font-size: 24px; margin: 15px 0; }}
        .notes {{ background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #8B4513; margin: 15px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">☕ Report Status Update</h1>
        </div>
        <div class="content">
            <p>Your report has been updated.</p>
            
            <p class="status">{status_emoji} Status: <strong>{escape(status_display)}</strong></p>

            {f'<div class="notes"><strong>Admin Notes:</strong><br/>{escape(admin_notes)}</div>' if admin_notes else ''}
            
            <p>Thank you for helping us improve ibeanthere!</p>
        </div>
    </div>
</body>
</html>
"""
        
        response = resend_client.Emails.send({
            "from": SENDER,
            "to": [reporter_email],
            "reply_to": SUPPORT_ADDRESS,
            "subject": f"Your Report Update - {status_display}",
            "html": html_content,
        })
        
        logger.info(f"Status update email sent for report {report_id}: {response}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send status update email for report {report_id}: {e}")
        return False
