type MailPayload = {
    to: string | string[];
    subject: string;
    text: string;
    html?: string;
};

type SmtpConfig = {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
};

type EmailDeliveryResult = {
    sent: boolean;
    skipped: boolean;
    provider?: string;
    id?: string;
    reason?: string;
};

type NodemailerModule = {
    createTransport: (config: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    }) => {
        sendMail: (payload: {
            from: string;
            to: string;
            subject: string;
            text: string;
            html: string;
        }) => Promise<unknown>;
    };
};

function normalizeRecipient(value: string) {
    return value.trim();
}

function getRecipients(value: string | string[]) {
    const list = Array.isArray(value) ? value : [value];
    return [...new Set(list.map(normalizeRecipient).filter(Boolean))];
}

function getBooleanEnv(value: string | undefined) {
    return value === '1' || value?.toLowerCase() === 'true';
}

export function getAdminReviewEmail() {
    return process.env.ADMIN_REVIEW_EMAIL?.trim() || 'support@bouutmusic.com';
}

function getDefaultFrom() {
    return (
        process.env.MAIL_FROM?.trim() ||
        process.env.RESEND_FROM?.trim() ||
        process.env.SMTP_FROM?.trim() ||
        (process.env.SMTP_USER?.trim() ? `Bouut Music <${process.env.SMTP_USER.trim()}>` : '') ||
        (process.env.GMAIL_USER?.trim() ? `Bouut Music <${process.env.GMAIL_USER.trim()}>` : '') ||
        'Bouut Music <support@bouutmusic.com>'
    );
}

async function sendWithPhpRelay(payload: MailPayload, recipients: string[]): Promise<EmailDeliveryResult | null> {
    const relayUrl = process.env.PHP_MAIL_RELAY_URL?.trim();
    const relaySecret = process.env.PHP_MAIL_RELAY_SECRET?.trim();

    if (!relayUrl || !relaySecret) {
        return null;
    }

    const response = await fetch(relayUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Bouut-Mail-Secret': relaySecret,
        },
        body: JSON.stringify({
            to: recipients,
            subject: payload.subject,
            text: payload.text,
            html: payload.html,
            from: getDefaultFrom(),
        }),
    });

    const responseText = await response.text();
    let parsed: Record<string, unknown> | null = null;

    try {
        parsed = JSON.parse(responseText) as Record<string, unknown>;
    } catch {
        parsed = null;
    }

    if (!response.ok || parsed?.ok !== true) {
        throw new Error(
            parsed && typeof parsed.error === 'string'
                ? parsed.error
                : `PHP mail relay failed with ${response.status}: ${responseText}`,
        );
    }

    return {
        sent: true,
        skipped: false,
        provider: 'php-mail-relay',
        id: typeof parsed?.id === 'string' ? parsed.id : undefined,
    };
}

async function sendWithResend(payload: MailPayload, recipients: string[]): Promise<EmailDeliveryResult | null> {
    const apiKey = process.env.RESEND_API_KEY?.trim();

    if (!apiKey) {
        return null;
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: process.env.RESEND_FROM?.trim() || getDefaultFrom(),
            to: recipients,
            subject: payload.subject,
            text: payload.text,
            html: payload.html || payload.text.replace(/\n/g, '<br />'),
        }),
    });

    const responseText = await response.text();
    let parsed: Record<string, unknown> | null = null;

    try {
        parsed = JSON.parse(responseText) as Record<string, unknown>;
    } catch {
        parsed = null;
    }

    if (!response.ok) {
        throw new Error(
            parsed && typeof parsed.message === 'string'
                ? parsed.message
                : `Resend email failed with ${response.status}: ${responseText}`,
        );
    }

    return {
        sent: true,
        skipped: false,
        provider: 'resend',
        id: typeof parsed?.id === 'string' ? parsed.id : undefined,
    };
}

function getSmtpConfig(): SmtpConfig | null {
    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;
    const smtpUser = process.env.SMTP_USER?.trim() || gmailUser;
    const smtpPass = process.env.SMTP_PASS || gmailPass;

    if (!smtpUser || !smtpPass) {
        return null;
    }

    const usingGmail = !!gmailUser || smtpUser.endsWith('@gmail.com');
    const host = process.env.SMTP_HOST?.trim() || (usingGmail ? 'smtp.gmail.com' : '');

    if (!host) {
        return null;
    }

    const defaultPort = usingGmail ? 465 : 587;
    const port = Number(process.env.SMTP_PORT || defaultPort);
    const secure = process.env.SMTP_SECURE
        ? getBooleanEnv(process.env.SMTP_SECURE)
        : usingGmail;
    const from = getDefaultFrom() || `Bouut Music <${smtpUser}>`;

    return {
        host,
        port: Number.isFinite(port) ? port : defaultPort,
        secure,
        user: smtpUser,
        pass: smtpPass,
        from,
    };
}

function loadNodemailer(): NodemailerModule | null {
    try {
        // Keep SMTP optional so the API can boot when only Resend/no email is configured.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('nodemailer') as NodemailerModule;
    } catch (error) {
        console.warn('[mail:smtp-module-missing]', {
            reason: 'Install nodemailer or configure RESEND_API_KEY to send approval/rejection emails.',
            error: error instanceof Error ? error.message : 'Unable to load nodemailer',
        });
        return null;
    }
}

export async function sendTransactionalEmail(payload: MailPayload) {
    const recipients = getRecipients(payload.to);

    if (!recipients.length) {
        return { sent: false, skipped: true, reason: 'missing_recipient' };
    }

    const phpRelayResult = await sendWithPhpRelay(payload, recipients);
    if (phpRelayResult) {
        return phpRelayResult;
    }

    const resendResult = await sendWithResend(payload, recipients);
    if (resendResult) {
        return resendResult;
    }

    const config = getSmtpConfig();

    if (!config) {
        console.warn('[mail:not-configured]', {
            to: recipients,
            subject: payload.subject,
            reason: 'Set RESEND_API_KEY/RESEND_FROM for HTTPS email API, or SMTP_USER/SMTP_PASS for SMTP.',
        });
        return { sent: false, skipped: true, reason: 'smtp_not_configured' };
    }

    const nodemailer = loadNodemailer();

    if (!nodemailer) {
        return { sent: false, skipped: true, reason: 'smtp_module_missing' };
    }

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass,
        },
    });

    await transporter.sendMail({
        from: config.from,
        to: recipients.join(', '),
        subject: payload.subject,
        text: payload.text,
        html: payload.html || payload.text.replace(/\n/g, '<br />'),
    });

    return { sent: true, skipped: false, provider: 'smtp' };
}
