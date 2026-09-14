"""
What a report can put in front of an admin.

A report is written by any signed-in user and read by an admin twice: as an HTML email
and as a card in the dashboard. Three claims keep it text:

1. `target_url` is an http(s) URL or the report is refused -- it becomes a link, and
   `javascript:` survives HTML escaping intact.
2. An attached image is a file the reporter uploaded through the form: the reports
   bucket, their own folder, one path segment. Anything else would be an <img> on a
   host of the reporter's choosing, or someone else's upload.
3. The email escapes every value the reporter wrote, and prints the link only when it
   is http(s), whatever the stored row says.

No database and no mail service: the model is validated directly, and Resend is faked
so the rendered HTML can be read back.
"""

import asyncio
import sys
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from pydantic import ValidationError

from app.api.v1.reports import is_own_report_image
from app.config import settings
from app.models.report import ReportCreate
from app.services import email as email_service


def make_report(**overrides):
    fields = {"report_type": "bug_report", "target_type": "website", **overrides}
    return ReportCreate(**fields)


class TargetUrlTest(unittest.TestCase):
    def test_http_urls_pass(self):
        for url in ("https://ibeanthere.app/en/profile/someone", "http://localhost:3000/ko/cafes/1"):
            self.assertEqual(make_report(target_url=url).target_url, url)

    def test_no_url_passes(self):
        self.assertIsNone(make_report().target_url)

    def test_script_and_relative_urls_are_refused(self):
        for url in ("javascript:alert(1)", " JavaScript:alert(1)", "data:text/html,<b>x</b>",
                    "/profile/someone", "//evil.example/x", "https://"):
            with self.subTest(url=url), self.assertRaises(ValidationError):
                make_report(target_url=url)


class ReportImageTest(unittest.TestCase):
    user = "11111111-1111-1111-1111-111111111111"

    def own(self, name, user=None):
        base = settings.supabase_url.rstrip("/")
        return f"{base}/storage/v1/object/public/reports/{user or self.user}/{name}"

    def test_own_upload_passes(self):
        self.assertTrue(is_own_report_image(self.own("report_1700000000000_abc123def.png"), self.user))

    def test_other_users_upload_is_refused(self):
        other = "22222222-2222-2222-2222-222222222222"
        self.assertFalse(is_own_report_image(self.own("report_1.png", user=other), self.user))

    def test_other_host_is_refused(self):
        self.assertFalse(is_own_report_image("https://tracker.example/pixel.png", self.user))

    def test_paths_out_of_the_folder_are_refused(self):
        for name in ("", "../other/x.png", "..", "a/b.png", "%2e%2e%2fother%2fx.png", "a\\b.png"):
            with self.subTest(name=name):
                self.assertFalse(is_own_report_image(self.own(name), self.user))


class ReportEmailTest(unittest.TestCase):
    def render(self, **overrides):
        fields = {
            "report_id": "r1",
            "report_type": "bug_report",
            "target_type": "website",
            "description": "fine",
            "reporter_username": "someone",
            "target_url": None,
            **overrides,
        }
        fake = mock.Mock()
        with mock.patch.object(settings, "resend_api_key", "test-key"), \
                mock.patch.object(email_service, "_get_resend", return_value=fake):
            self.assertTrue(asyncio.run(email_service.send_new_report_notification(**fields)))
        return fake.Emails.send.call_args.args[0]["html"]

    def test_reporter_text_is_escaped(self):
        html = self.render(
            description="<script>alert(1)</script>",
            reporter_username='<img src=x onerror="alert(1)">',
        )
        self.assertNotIn("<script>", html)
        self.assertNotIn("<img src=x", html)
        self.assertIn("&lt;script&gt;alert(1)&lt;/script&gt;", html)

    def test_script_url_is_not_linked(self):
        html = self.render(target_url="javascript:alert(1)")
        self.assertNotIn("javascript:", html)
        self.assertNotIn("Target URL", html)

    def test_http_url_is_linked_and_cannot_break_out_of_href(self):
        html = self.render(target_url='https://ibeanthere.app/x"onmouseover="alert(1)')
        self.assertIn('href="https://ibeanthere.app/x&quot;onmouseover=&quot;alert(1)"', html)


if __name__ == "__main__":
    unittest.main()
