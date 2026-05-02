import crypto from 'crypto';
import prisma from './prisma';

type HashRequestInput = {
    key: string;
    txnid: string;
    amount: string;
    productinfo: string;
    firstname: string;
    email: string;
    udf1?: string | null;
    udf2?: string | null;
    udf3?: string | null;
    udf4?: string | null;
    udf5?: string | null;
};

type HashResponseInput = {
    key: string;
    txnid: string;
    amount: string;
    productinfo: string;
    firstname: string;
    email: string;
    status: string;
    udf1?: string | null;
    udf2?: string | null;
    udf3?: string | null;
    udf4?: string | null;
    udf5?: string | null;
    additionalCharges?: string | null;
};

function sha512(value: string) {
    return crypto.createHash('sha512').update(value).digest('hex');
}

function getEncryptionKey() {
    const source =
        process.env.PAYU_SETTINGS_ENCRYPTION_KEY ||
        process.env.JWT_SECRET ||
        'bouut-payu-settings-development-key';

    return crypto.createHash('sha256').update(source).digest();
}

export function encryptSecret(value?: string | null) {
    if (!value) {
        return null;
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptSecret(value?: string | null) {
    if (!value) {
        return null;
    }

    const [ivHex, authTagHex, encryptedHex] = value.split(':');

    if (!ivHex || !authTagHex || !encryptedHex) {
        return value;
    }

    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        getEncryptionKey(),
        Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedHex, 'hex')),
        decipher.final(),
    ]);

    return decrypted.toString('utf8');
}

export function maskSecret(value?: string | null) {
    if (!value) {
        return '';
    }

    if (value.length <= 8) {
        return '********';
    }

    return `${value.slice(0, 6)}******${value.slice(-4)}`;
}

function roundCurrency(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatPayuAmount(value: number) {
    return roundCurrency(value).toFixed(2);
}

export async function getOrCreatePayuSettings() {
    const existing = await prisma.payuSettings.findFirst({
        orderBy: { createdAt: 'asc' },
    });

    if (existing) {
        return existing;
    }

    return prisma.payuSettings.create({ data: {} });
}

export function buildPaymentSettingsResponse(settings: Awaited<ReturnType<typeof getOrCreatePayuSettings>>) {
    return {
        id: settings.id,
        mode: settings.mode,
        isEnabled: settings.isEnabled,
        merchantId: settings.merchantId || '',
        merchantKey: settings.merchantKey || '',
        hasSalt1: !!settings.salt1Encrypted,
        hasSalt2: !!settings.salt2Encrypted,
        salt1Mask: settings.salt1Encrypted ? maskSecret(decryptSecret(settings.salt1Encrypted)) : '',
        salt2Mask: settings.salt2Encrypted ? maskSecret(decryptSecret(settings.salt2Encrypted)) : '',
        currency: settings.currency.toUpperCase(),
        productName: settings.productName,
        originalAmount: settings.originalAmount,
        discountedAmount: settings.discountedAmount,
        taxPercent: settings.taxPercent,
        proDurationDays: settings.proDurationDays,
        updatedAt: settings.updatedAt,
    };
}

export function buildSubscriptionSummary(settings: Awaited<ReturnType<typeof getOrCreatePayuSettings>>) {
    const subtotal = roundCurrency(settings.discountedAmount);
    const tax = roundCurrency((subtotal * settings.taxPercent) / 100);
    const total = roundCurrency(subtotal + tax);

    return {
        productName: settings.productName,
        originalAmount: roundCurrency(settings.originalAmount),
        discountedAmount: subtotal,
        taxPercent: settings.taxPercent,
        taxAmount: tax,
        totalAmount: total,
        currency: settings.currency.toUpperCase(),
        proDurationDays: settings.proDurationDays,
    };
}

export function getPayuPaymentUrl(mode: string) {
    return mode === 'live' ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment';
}

export function getPayuHostedCheckoutCreateUrl(mode: string) {
    return mode === 'live' ? 'https://api.payu.in/v2/payments' : 'https://apitest.payu.in/v2/payments';
}

export function getPayuPostserviceUrl(mode: string) {
    return mode === 'live'
        ? 'https://info.payu.in/merchant/postservice.php?form=2'
        : 'https://test.payu.in/merchant/postservice.php?form=2';
}

export function getPayuVerifyUrl(mode: string) {
    return mode === 'live'
        ? 'https://info.payu.in/v3/transaction'
        : 'https://apitest.payu.in/v3/transaction';
}

function normalizeOptional(value?: string | null) {
    return value?.trim() || '';
}

export function generatePayuRequestHash(input: HashRequestInput, salt: string) {
    const hashString = [
        input.key,
        input.txnid,
        input.amount,
        input.productinfo,
        input.firstname,
        input.email,
        normalizeOptional(input.udf1),
        normalizeOptional(input.udf2),
        normalizeOptional(input.udf3),
        normalizeOptional(input.udf4),
        normalizeOptional(input.udf5),
        '',
        '',
        '',
        salt,
    ].join('|');

    return sha512(hashString);
}

export function generatePayuResponseHash(input: HashResponseInput, salt: string) {
    const additionalCharges = normalizeOptional(input.additionalCharges);
    const hashString = [
        ...(additionalCharges ? [additionalCharges] : []),
        salt,
        input.status,
        '',
        '',
        '',
        '',
        '',
        normalizeOptional(input.udf5),
        normalizeOptional(input.udf4),
        normalizeOptional(input.udf3),
        normalizeOptional(input.udf2),
        normalizeOptional(input.udf1),
        input.email,
        input.firstname,
        input.productinfo,
        input.amount,
        input.txnid,
        input.key,
    ].join('|');

    return sha512(hashString);
}

export function generateVerifyPaymentHash(key: string, txnid: string, salt: string) {
    return sha512([key, 'verify_payment', txnid, salt].join('|'));
}

export function generatePayuApiHash(key: string, command: string, var1: string, salt: string) {
    return sha512([key, command, var1, salt].join('|'));
}

export function createPayuTxnId(paymentId: string) {
    const safeId = paymentId.replace(/[^a-zA-Z0-9]/g, '').slice(-12);
    const random = crypto.randomBytes(4).toString('hex');
    return `BOUUT${safeId}${random}`.slice(0, 40);
}

export function getFrontendBaseUrl() {
    const candidates = [
        process.env.FRONTEND_URL,
        process.env.FRONTEND_URLS?.split(',')[0],
        'http://localhost:3000',
    ];

    return candidates.find(Boolean)?.trim() || 'http://localhost:3000';
}

export function getApiBaseUrl() {
    return process.env.BACKEND_PUBLIC_URL?.trim() || `http://localhost:${process.env.PORT || 4000}`;
}

export async function getPayuConfigOrThrow() {
    const settings = await getOrCreatePayuSettings();
    const salt1 = decryptSecret(settings.salt1Encrypted);

    if (!settings.isEnabled || !settings.merchantKey || !salt1) {
        const error = new Error('PayU payment settings are incomplete. Ask an admin to configure PayU first.') as Error & { status?: number };
        error.status = 400;
        throw error;
    }

    return {
        settings,
        salt1,
        salt2: decryptSecret(settings.salt2Encrypted),
    };
}

function buildPayuV2Authorization(body: string, date: string, merchantKey: string, secret: string) {
    const signature = sha512(`${body}|${date}|${secret}`);
    return `hmac username="${merchantKey}", algorithm="sha512", headers="date", signature="${signature}"`;
}

export async function createPayuHostedCheckoutSession(
    mode: string,
    merchantKey: string,
    secret: string,
    payload: Record<string, unknown>,
) {
    const body = JSON.stringify(payload);
    const date = new Date().toUTCString();

    const response = await fetch(getPayuHostedCheckoutCreateUrl(mode), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            date,
            authorization: buildPayuV2Authorization(body, date, merchantKey, secret),
        },
        body,
    });

    const text = await response.text();
    let parsed: Record<string, unknown> | null = null;

    try {
        parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
        parsed = null;
    }

    return {
        ok: response.ok,
        raw: text,
        parsed,
        checkoutUrl:
            parsed &&
            typeof parsed === 'object' &&
            'result' in parsed &&
            parsed.result &&
            typeof parsed.result === 'object' &&
            'checkoutUrl' in parsed.result &&
            typeof parsed.result.checkoutUrl === 'string'
                ? parsed.result.checkoutUrl
                : null,
    };
}

export async function verifyPayuPaymentStatus(mode: string, key: string, secret: string, txnid: string) {
    const body = JSON.stringify({
        txnId: [txnid],
    });
    const date = new Date().toUTCString();

    const response = await fetch(getPayuVerifyUrl(mode), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            'Info-Command': 'verify_payment',
            date,
            authorization: buildPayuV2Authorization(body, date, key, secret),
        },
        body,
    });

    const text = await response.text();
    let parsed: Record<string, unknown> | null = null;

    try {
        parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
        parsed = null;
    }

    return {
        ok: response.ok,
        raw: text,
        parsed,
    };
}

export async function refundPayuPayment(
    mode: string,
    key: string,
    salt: string,
    mihpayid: string,
    tokenId: string,
    amount: string,
    callbackUrl?: string,
) {
    const body = new FormData();
    body.append('key', key);
    body.append('command', 'cancel_refund_transaction');
    body.append('var1', mihpayid);
    body.append('var2', tokenId);
    body.append('var3', amount);
    if (callbackUrl) {
        body.append('var5', callbackUrl);
    }
    body.append('hash', generatePayuApiHash(key, 'cancel_refund_transaction', mihpayid, salt));

    const response = await fetch(getPayuPostserviceUrl(mode), {
        method: 'POST',
        headers: {
            accept: 'application/json',
        },
        body,
    });

    const text = await response.text();
    let parsed: Record<string, unknown> | null = null;

    try {
        parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
        parsed = null;
    }

    return {
        ok: response.ok,
        raw: text,
        parsed,
    };
}

export async function checkPayuRefundStatus(mode: string, key: string, salt: string, requestId: string) {
    const body = new FormData();
    body.append('key', key);
    body.append('command', 'check_action_status');
    body.append('var1', requestId);
    body.append('hash', generatePayuApiHash(key, 'check_action_status', requestId, salt));

    const response = await fetch(getPayuPostserviceUrl(mode), {
        method: 'POST',
        headers: {
            accept: 'application/json',
        },
        body,
    });

    const text = await response.text();
    let parsed: Record<string, unknown> | null = null;

    try {
        parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
        parsed = null;
    }

    return {
        ok: response.ok,
        raw: text,
        parsed,
    };
}
