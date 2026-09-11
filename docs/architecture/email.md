# Email

Who sends what, from which address, and where the parts that do not live in this repo
are kept. Set up 2026-09-11 (`ed6d4f6`, `cf74226`, `b6eaf58`).

## Addresses

| Address | Role | Where mail to it goes |
|---|---|---|
| `no-reply@ibeanthere.app` | Sender of every automated mail: Supabase auth mail and backend notifications | Nowhere. No routing rule |
| `support@ibeanthere.app` | The one address users see: contact page, footer, terms, privacy policy, Reply-To on mail a user might answer | Cloudflare Email Routing → the team inbox |
| Team inbox (Gmail) | Where support mail and admin notifications land | Never shown to a user |

The team inbox is only in backend config (`ADMIN_EMAIL`, the recipient of admin
notifications). It was printed on five public surfaces until `b6eaf58`, so it is in the
git history and search caches and will keep attracting spam; that cannot be undone.

Replies from the team inbox go out as `support@` through Gmail's "Send mail as", using
Resend's SMTP (`smtp.resend.com:465`, user `resend`, a sending-only Resend key). A reply
sent from the inbox's own address would show it to the user.

Cloudflare's catch-all should be **Drop**. With it forwarding, mail to `no-reply@` would
reach the inbox too.

## Who sends

| Mail | Sent by | Configured in |
|---|---|---|
| Password reset, sign-up confirmation | Supabase Auth, over custom SMTP (Resend) | Supabase dashboard → Authentication → Emails |
| New report (to the admin) | Backend, Resend API (`app/services/email.py`) | `RESEND_API_KEY`, `ADMIN_EMAIL` |
| Report status update (to the reporter) | Backend, same — written but not called anywhere yet | same, with `reply_to: support@` |

Without `RESEND_API_KEY` the backend skips notifications silently (`settings.email_enabled`),
so a missing key on the host looks like "no reports came in", not like an error.

Before custom SMTP the dashboard used Supabase's built-in mailer, which only delivers to
the project team's own addresses at a few mails an hour. That was why reset mail never
arrived; the reset form showed "sent" anyway, which is its own fix (see below).

Use a separate Resend key per sender (Supabase, Gmail, backend), each limited to sending
on `ibeanthere.app`, so one can be revoked without cutting the others off.

DNS (Cloudflare): Resend DKIM (`resend._domainkey`) and SPF (`send.`) verified; DMARC
`p=none` with no `rua`, so no reports are collected yet. Raising it to `quarantine` should
wait for a few weeks of reports.

## Auth templates live in the dashboard

Supabase stores the auth templates; nothing in this repo is read by it. The copy below is
the source of truth for review and history — edit here, then paste into Authentication →
Emails → Templates → Reset password.

**Language is chosen by the page the request came from.** The reset form sends
`redirectTo: {origin}/{locale}/reset-password`, and the template reads it as
`{{ .RedirectTo }}`. Supabase's template language has no substring test, so the branch
compares against the exact allowed URLs — the same list as Authentication → URL
Configuration → Redirect URLs. Anything not listed falls back to English.

Adding a language (French): add `https://ibeanthere.app/fr/reset-password` and
`http://localhost:3000/fr/reset-password` to the Redirect URLs, and one more
`{{ else if eq .RedirectTo … }}` block here.

**The expiry in the copy is typed by hand.** No template variable carries it. "1 hour"
matches Authentication → Sign In / Providers → Email → Email OTP Expiration = `3600`;
change one and change the other.

The sign-up confirmation cannot branch yet: sign-up does not pass `emailRedirectTo`, so
`.RedirectTo` is the Site URL. Confirm email is also off, and turning it on needs a
"check your email" state in the sign-up form first (security audit SEC-15).

Voice follows `design-language.md` §2: lowercase `ibeanthere`, no icons or emoji, one
button, and nothing the mail cannot promise for every address.

### Reset password

Subject — whether Supabase renders template syntax in the subject was not confirmed; if
the raw `{{ if` shows up, use a plain bilingual subject instead:

```
{{ if eq .RedirectTo "https://ibeanthere.app/ko/reset-password" "http://localhost:3000/ko/reset-password" }}ibeanthere 비밀번호 재설정{{ else }}Reset your ibeanthere password{{ end }}
```

Body:

```html
<div style="background:#f5efe6;padding:40px 16px;">
  <div style="max-width:480px;margin:0 auto;padding:32px 28px;background:#fffdf9;border:1px solid #e8e0d6;border-radius:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;font-size:15px;line-height:1.65;color:#2b211c;">
    <p style="margin:0 0 32px;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;">ibeanthere</p>
{{ if eq .RedirectTo "https://ibeanthere.app/ko/reset-password" "http://localhost:3000/ko/reset-password" }}
    <p style="margin:0 0 16px;">안녕하세요,</p>
    <p style="margin:0 0 24px;">{{ .Email }} 계정의 비밀번호 재설정 요청이 왔습니다. 직접 요청하셨다면 아래에서 새 비밀번호를 정해 주세요.</p>
    <p style="margin:0 0 24px;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#3b2a20;color:#fffaf3;text-decoration:none;font-weight:600;padding:11px 24px;border-radius:9999px;">새 비밀번호 정하기</a></p>
    <p style="margin:0 0 28px;color:#6b5b50;">링크는 1시간 동안 한 번만 유효합니다. 요청한 적이 없다면 이 메일은 무시하셔도 됩니다. 링크를 누르기 전에는 아무것도 바뀌지 않습니다.</p>
{{ else }}
    <p style="margin:0 0 16px;">Hi,</p>
    <p style="margin:0 0 24px;">Someone asked to reset the password for {{ .Email }}. If that was you, choose a new one here:</p>
    <p style="margin:0 0 24px;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#3b2a20;color:#fffaf3;text-decoration:none;font-weight:600;padding:11px 24px;border-radius:9999px;">Choose a new password</a></p>
    <p style="margin:0 0 28px;color:#6b5b50;">The link works once and expires in an hour. If it wasn't you, just ignore this. Nothing changes until the link is used.</p>
{{ end }}
    <p style="margin:0;padding-top:16px;border-top:1px solid #efe7dd;font-size:13px;color:#8a7a6f;">— ibeanthere · <a href="mailto:support@ibeanthere.app" style="color:#8a7a6f;">support@ibeanthere.app</a></p>
  </div>
</div>
```

Colours are literal because mail clients do not read CSS variables; the button measures
above 7:1. Outlook desktop drops the rounded corners and keeps everything else.

## The reset form's errors

In production the forgot-password form shows the same "if this address has an account"
screen for every error except the per-IP request limit, because Supabase only returns
errors for registered addresses and printing them would reveal who has an account
(security audit SEC-15). In development it prints the real error. So when a reset mail
does not arrive: send from `localhost`, or read the Supabase auth log — the production
form will not say.

The link has to be opened in the browser that asked for it: the flow is PKCE, and the
code verifier is in that browser's cookies.
