# Supabase Auth email templates (Ventor branding)

Paste these into **Supabase Dashboard → Authentication → Email Templates**.

Supported variables: `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .TokenHash }}`,
`{{ .SiteURL }}`, `{{ .Email }}`, `{{ .Data }}`.

---

## 1. Magic Link

**Subject**
```
Your Ventor sign-in link
```

**Body (HTML)**
```html
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="480" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:16px;color:#fafafa;">
      <tr><td style="padding:28px 28px 0;">
        <div style="display:inline-flex;align-items:center;gap:10px;">
          <span style="display:inline-block;width:4px;height:22px;background:#fc4c02;"></span>
          <span style="font-size:14px;font-weight:800;letter-spacing:0.04em;">VENTOR</span>
          <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.15em;color:#71717a;">Endurance ops</span>
        </div>
      </td></tr>
      <tr><td style="padding:20px 28px 8px;">
        <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.01em;">Sign in to Ventor</h1>
        <p style="margin:8px 0 0;font-size:14px;line-height:1.5;color:#d4d4d8;">
          Tap the button below to sign in. This link expires in 1 hour and can be used once.
        </p>
      </td></tr>
      <tr><td style="padding:20px 28px 12px;">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 22px;background:#fc4c02;color:#ffffff;text-decoration:none;font-weight:800;font-size:14px;border-radius:10px;">
          Sign in →
        </a>
      </td></tr>
      <tr><td style="padding:4px 28px 28px;">
        <p style="margin:16px 0 0;font-size:11px;line-height:1.5;color:#71717a;">
          If the button doesn't work, paste this URL into your browser:<br>
          <span style="word-break:break-all;color:#a1a1aa;">{{ .ConfirmationURL }}</span>
        </p>
        <p style="margin:12px 0 0;font-size:11px;color:#71717a;">
          Didn't request this? Ignore the email — no account changes will be made.
        </p>
      </td></tr>
      <tr><td style="padding:18px 28px;border-top:1px solid #27272a;font-size:11px;color:#71717a;">
        <strong style="color:#a1a1aa;">Ventor</strong> · endurance team operations<br>
        <a href="https://ventor.fit" style="color:#71717a;text-decoration:none;">ventor.fit</a> ·
        <a href="https://ventor.fit/privacy" style="color:#71717a;text-decoration:none;">Privacy</a> ·
        <a href="https://ventor.fit/terms" style="color:#71717a;text-decoration:none;">Terms</a>
      </td></tr>
    </table>
  </td></tr>
</table>
```

---

## 2. Invite User

**Subject**
```
You're invited to Ventor
```

**Body (HTML)** — reuse the Magic Link body, replacing:
- `Sign in to Ventor` → `You're invited to Ventor`
- Sub-copy → `A teammate has invited you to coordinate their race. Tap to accept.`
- Button → `Accept invitation →`

---

## 3. Confirm Signup

**Subject**
```
Confirm your Ventor email
```

**Body (HTML)** — same wrapper, copy changes:
- H1 → `Confirm your email`
- Sub-copy → `One tap to confirm your email and activate your Ventor account.`
- Button → `Confirm email →`

---

## 4. Reset Password

**Subject**
```
Reset your Ventor password
```

**Body (HTML)** — same wrapper, copy changes:
- H1 → `Reset your password`
- Sub-copy → `Tap the button to set a new password. This link expires in 1 hour.`
- Button → `Reset password →`

---

## Sender identity

Supabase Auth → **Settings** → **SMTP Settings** (optional for branded "from"):

```
Sender email:  hello@ventor.fit   (configure in your MX provider)
Sender name:   Ventor
```

Without custom SMTP, Supabase sends via `noreply@mail.app.supabase.io` — still OK
but mail providers may dump in spam. Set up custom SMTP via Resend/Postmark/SendGrid
before production launch.
