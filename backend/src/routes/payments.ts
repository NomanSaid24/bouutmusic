import { Router, Response } from 'express';
import type { Request } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
    buildSubscriptionSummary,
    createPayuHostedCheckoutSession,
    createPayuTxnId,
    formatPayuAmount,
    generatePayuResponseHash,
    getFrontendBaseUrl,
    getOrCreatePayuSettings,
    getPayuConfigOrThrow,
    verifyPayuPaymentStatus,
} from '../lib/payu';
import { notifyUserAndAdmins } from '../utils/notifications';

const router = Router();

type BillingPayload = {
    email?: string;
    phone?: string;
    address1?: string;
    address2?: string;
    country?: string;
    countryCode?: string;
    state?: string;
    stateCode?: string;
    city?: string;
    postalCode?: string;
    promoCode?: string;
};

type PayuCallbackPayload = {
    key?: string;
    txnid?: string;
    txnId?: string;
    paymentId?: string;
    checkoutId?: string;
    referenceId?: string;
    reference_id?: string;
    amount?: string;
    productinfo?: string;
    firstname?: string;
    email?: string;
    status?: string;
    hash?: string;
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    udf5?: string;
    mihpayid?: string;
    bank_ref_num?: string;
    mode?: string;
    unmappedstatus?: string;
    error_Message?: string;
    additionalCharges?: string;
    additional_charges?: string;
    receiptUrl?: string;
    receipt_url?: string;
};

type PayuCallbackRequest = Request<
    {},
    any,
    PayuCallbackPayload,
    PayuCallbackPayload
>;

type CheckoutSummary = {
    productName: string;
    originalAmount: number;
    discountedAmount: number;
    taxPercent: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    proDurationDays?: number;
};

function normalizeString(value: unknown) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }

    if (typeof value === 'boolean') {
        return String(value);
    }

    if (typeof value !== 'string') {
        return '';
    }

    return value.trim();
}

function normalizeOptionalString(value: unknown) {
    const normalized = normalizeString(value);
    return normalized || null;
}

function roundCurrency(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function splitFullName(fullName: string | null) {
    const value = (fullName || '').trim();

    if (!value) {
        return {
            firstName: 'Bouut',
            lastName: 'User',
        };
    }

    const parts = value.split(/\s+/);
    return {
        firstName: parts[0] || 'Bouut',
        lastName: parts.slice(1).join(' ') || 'User',
    };
}

async function extendUserProAccess(userId: string, durationDays: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { proExpiresAt: true },
    });

    const now = new Date();
    const baseDate = user?.proExpiresAt && user.proExpiresAt > now ? user.proExpiresAt : now;
    const nextExpiry = new Date(baseDate);
    nextExpiry.setDate(nextExpiry.getDate() + durationDays);

    await prisma.user.update({
        where: { id: userId },
        data: {
            isPro: true,
            proExpiresAt: nextExpiry,
        },
    });
}

function buildHostedCheckoutRequest(options: {
    payment: {
        id: string;
        amount: number;
        billingName: string | null;
        billingEmail: string | null;
        billingPhone: string | null;
        billingAddress1: string | null;
        billingAddress2: string | null;
        billingCountry: string | null;
        billingState: string | null;
        billingCity: string | null;
        billingPostalCode: string | null;
        payuTxnId: string | null;
    };
    merchantKey: string;
    productName: string;
    udf2: 'subscription' | 'service';
    udf3?: string;
    cancelUrl: string;
}) {
    const amount = formatPayuAmount(options.payment.amount);
    const { firstName, lastName } = splitFullName(options.payment.billingName);
    const callbackBaseUrl = `${process.env.BACKEND_PUBLIC_URL?.trim() || `http://localhost:${process.env.PORT || 4000}`}/api/payments/payu/callback`;
    const callbackQuery = new URLSearchParams({
        paymentId: options.payment.id,
        txnid: options.payment.payuTxnId || '',
        type: options.udf2,
    });
    const callbackUrl = `${callbackBaseUrl}?${callbackQuery.toString()}`;

    return {
        accountId: options.merchantKey,
        txnId: options.payment.payuTxnId || '',
        referenceId: options.payment.id,
        order: {
            productInfo: options.productName,
            paymentChargeSpecification: {
                price: Number(amount),
            },
            userDefinedFields: {
                udf1: options.payment.id,
                udf2: options.udf2,
                udf3: options.udf3 || '',
                udf4: '',
                udf5: '',
            },
        },
        additionalInfo: {
            txnFlow: 'nonseamless',
        },
        callBackActions: {
            successAction: callbackUrl,
            failureAction: callbackUrl,
            cancelAction: options.cancelUrl,
        },
        billingDetails: {
            firstName,
            lastName,
            phone: options.payment.billingPhone || '',
            email: options.payment.billingEmail || '',
            address: {
                address1: options.payment.billingAddress1 || '',
                address2: options.payment.billingAddress2 || '',
                city: options.payment.billingCity || '',
                state: options.payment.billingState || '',
                country: options.payment.billingCountry || '',
                zipCode: options.payment.billingPostalCode || '',
            },
        },
    };
}

function extractCheckoutUrl(rawResponse: string | null) {
    if (!rawResponse) {
        return '';
    }

    try {
        const parsed = JSON.parse(rawResponse) as { result?: { checkoutUrl?: string } };
        return parsed?.result?.checkoutUrl || '';
    } catch {
        return '';
    }
}

function buildCheckoutResponse(
    payment: {
        id: string;
        status: string;
        currency: string;
        description: string | null;
        billingName: string | null;
        billingEmail: string | null;
        billingPhone: string | null;
        billingAddress1: string | null;
        billingAddress2: string | null;
        billingCountry: string | null;
        billingCountryCode: string | null;
        billingState: string | null;
        billingStateCode: string | null;
        billingCity: string | null;
        billingPostalCode: string | null;
        promoCode: string | null;
        completedAt: Date | null;
        payuTxnId: string | null;
        payuMihpayId: string | null;
        payuBankRefNum: string | null;
        payuPaymentMode: string | null;
        payuStatus: string | null;
        refundStatus?: string;
        refundAmount?: number | null;
        refundedAt?: Date | null;
    },
    summary: CheckoutSummary,
    paymentUrl: string,
) {
    return {
        id: payment.id,
        status: payment.status,
        currency: payment.currency,
        paymentUrl,
        summary,
        productName: payment.description || summary.productName,
        billing: {
            name: payment.billingName,
            email: payment.billingEmail,
            phone: payment.billingPhone,
            address1: payment.billingAddress1,
            address2: payment.billingAddress2,
            country: payment.billingCountry,
            countryCode: payment.billingCountryCode,
            state: payment.billingState,
            stateCode: payment.billingStateCode,
            city: payment.billingCity,
            postalCode: payment.billingPostalCode,
            promoCode: payment.promoCode,
        },
        payu: {
            txnid: payment.payuTxnId,
            mihpayid: payment.payuMihpayId,
            bankRefNum: payment.payuBankRefNum,
            paymentMode: payment.payuPaymentMode,
            status: payment.payuStatus,
        },
        refund: {
            status: payment.refundStatus || 'NONE',
            amount: payment.refundAmount || null,
            refundedAt: payment.refundedAt || null,
        },
        completedAt: payment.completedAt,
    };
}

function getSubscriptionRedirectUrl(paymentId: string, result: string) {
    return `${getFrontendBaseUrl()}/payment/thank-you?checkoutId=${paymentId}&type=subscription&gateway=payu&result=${encodeURIComponent(result)}`;
}

function getServiceRedirectUrl(paymentId: string, result: string) {
    return `${getFrontendBaseUrl()}/payment/thank-you?checkoutId=${paymentId}&type=service&gateway=payu&result=${encodeURIComponent(result)}`;
}

function getPayuCallbackFallbackUrl(result = 'received') {
    return `${getFrontendBaseUrl()}/payment/thank-you?gateway=payu&result=${encodeURIComponent(result)}`;
}

function buildServiceSummary(payment: {
    amount: number;
    amountSubtotal: number | null;
    taxAmount: number | null;
    currency: string;
    description: string | null;
}) {
    const subtotal = roundCurrency(payment.amountSubtotal ?? payment.amount);
    const taxAmount = roundCurrency(payment.taxAmount ?? 0);
    const total = roundCurrency(payment.amount);
    const originalAmount = subtotal + taxAmount;
    const taxPercent = subtotal > 0 && taxAmount > 0 ? roundCurrency((taxAmount / subtotal) * 100) : 0;

    return {
        productName: payment.description || 'Promo Submission',
        originalAmount,
        discountedAmount: subtotal,
        taxPercent,
        taxAmount,
        totalAmount: total,
        currency: payment.currency.toUpperCase(),
    };
}

function parseJsonRecord(value: string | null) {
    if (!value) {
        return null;
    }

    try {
        const parsed = JSON.parse(value) as Record<string, unknown>;
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
}

function getServiceSubmissionProductName(submission: {
    service: { name: string };
    formData: string | null;
}) {
    const formData = parseJsonRecord(submission.formData);

    if (formData?.serviceType === 'growth-engine') {
        const plan = formData.plan;
        const planTitle = plan && typeof plan === 'object' && 'title' in plan && typeof plan.title === 'string'
            ? plan.title
            : '';

        return planTitle ? `Growth Engine ${planTitle} Monthly` : 'Growth Engine Monthly';
    }

    if (formData?.serviceType === 'release-music') {
        const plan = formData.plan;
        const planTitle = plan && typeof plan === 'object' && 'title' in plan && typeof plan.title === 'string'
            ? plan.title
            : '';

        return planTitle || 'Release My Music';
    }

    return submission.service.name;
}

function getPayuVerifyTransactions(parsed: Record<string, unknown> | null) {
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.result)) {
        return [];
    }

    return parsed.result.filter((item): item is Record<string, unknown> =>
        !!item && typeof item === 'object',
    );
}

function findPayuVerifiedTransaction(parsed: Record<string, unknown> | null, txnid: string) {
    return getPayuVerifyTransactions(parsed).find(item =>
        normalizeString(item.txnId || item.txnid || item.txnID) === txnid,
    ) || null;
}

function getPayuVerifiedStatus(rawTransaction: Record<string, unknown> | null) {
    if (!rawTransaction) {
        return '';
    }

    return normalizeString(rawTransaction.status).toLowerCase();
}

function getPayuVerifiedAmount(rawTransaction: Record<string, unknown> | null) {
    if (!rawTransaction) {
        return '';
    }

    const amount = Number(rawTransaction.amount);
    return Number.isFinite(amount) ? formatPayuAmount(amount) : normalizeString(rawTransaction.amount);
}

async function syncServiceSubmissionAfterPayment(payment: {
    id?: string;
    status: string;
    completedAt: Date | null;
    submissionId: string | null;
    userId?: string;
}) {
    if (!payment.submissionId) {
        return;
    }

    if (payment.status === 'COMPLETED') {
        await prisma.submission.update({
            where: { id: payment.submissionId },
            data: {
                status: 'PENDING',
                paymentStatus: 'PAID',
                paymentCompletedAt: payment.completedAt || new Date(),
            },
        });
        return;
    }

    if (payment.status === 'FAILED') {
        await prisma.submission.update({
            where: { id: payment.submissionId },
            data: {
                status: 'PENDING_PAYMENT',
                paymentStatus: 'FAILED',
            },
        });
    }
}

async function applyPaymentCompletionEffects(payment: {
    id: string;
    userId: string;
    type: string;
    amount?: number;
    currency?: string;
    description?: string | null;
    status: string;
    completedAt: Date | null;
    submissionId: string | null;
}) {
    if (payment.type === 'subscription' && payment.status === 'COMPLETED') {
        const settings = await getOrCreatePayuSettings();
        await extendUserProAccess(payment.userId, settings.proDurationDays);
        await notifyUserAndAdmins(
            payment.userId,
            {
                type: 'payment_paid',
                title: 'Pro payment received',
                message: 'Your Bouut Music Pro payment is complete. Your Pro access is now active.',
                link: '/dashboard/subscription',
            },
            {
                type: 'admin_payment_paid',
                title: 'Pro payment received',
                message: `A Pro subscription payment was completed${payment.amount ? ` for ${payment.currency || 'INR'} ${payment.amount}` : ''}.`,
                link: '/admin/payments',
            },
        ).catch(error => console.error('Failed to create subscription notifications:', error));
        return;
    }

    if (payment.type === 'service') {
        await syncServiceSubmissionAfterPayment(payment);
        if (payment.status === 'COMPLETED') {
            await notifyUserAndAdmins(
                payment.userId,
                {
                    type: 'payment_paid',
                    title: 'Plan payment received',
                    message: `${payment.description || 'Your selected plan'} payment is complete and queued for admin review.`,
                    link: '/dashboard/promo-tools',
                },
                {
                    type: 'admin_payment_paid',
                    title: 'Service payment received',
                    message: `${payment.description || 'A service plan'} payment was completed${payment.amount ? ` for ${payment.currency || 'INR'} ${payment.amount}` : ''}.`,
                    link: '/admin/promo-submissions',
                },
            ).catch(error => console.error('Failed to create service payment notifications:', error));
        }
    }
}

async function syncPaymentRecord(paymentId: string) {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
    });

    if (!payment || payment.gateway !== 'payu' || !payment.payuTxnId) {
        return null;
    }

    if (payment.status === 'COMPLETED' || payment.status === 'FAILED' || payment.status === 'REFUNDED') {
        return payment;
    }

    const { settings, salt1 } = await getPayuConfigOrThrow();
    const verifyResult = await verifyPayuPaymentStatus(
        settings.mode,
        settings.merchantKey || '',
        salt1,
        payment.payuTxnId,
    ).catch((error) => ({
        ok: false,
        raw: JSON.stringify({ error: error instanceof Error ? error.message : 'verify_failed' }),
        parsed: null as Record<string, unknown> | null,
    }));

    const rawTransaction = findPayuVerifiedTransaction(verifyResult.parsed, payment.payuTxnId);

    if (!rawTransaction || typeof rawTransaction !== 'object') {
        return prisma.payment.update({
            where: { id: payment.id },
            data: {
                payuVerifiedResponse: verifyResult.raw,
            },
        });
    }

    const payuStatus = getPayuVerifiedStatus(rawTransaction);
    const verifiedAmountMatches = getPayuVerifiedAmount(rawTransaction) === formatPayuAmount(payment.amount);
    const nextStatus =
        payuStatus === 'success' && verifiedAmountMatches
            ? 'COMPLETED'
            : payuStatus === 'failure' || payuStatus === 'failed'
                ? 'FAILED'
                : 'PENDING';

    const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: nextStatus,
            gatewayOrderId: payment.payuTxnId,
            gatewayPaymentId: normalizeOptionalString(rawTransaction.mihpayId || rawTransaction.mihpayid),
            payuMihpayId: normalizeOptionalString(rawTransaction.mihpayId || rawTransaction.mihpayid),
            payuBankRefNum: normalizeOptionalString(rawTransaction.bankReferenceNumber || rawTransaction.bank_ref_num),
            payuPaymentMode: normalizeOptionalString(rawTransaction.mode),
            payuStatus: normalizeOptionalString(rawTransaction.status),
            payuUnmappedStatus: normalizeOptionalString(rawTransaction.unmappedStatus || rawTransaction.unmappedstatus),
            payuVerifiedResponse: verifyResult.raw,
            failureMessage: nextStatus === 'FAILED'
                ? normalizeOptionalString(rawTransaction.errorMessage || rawTransaction.unmappedStatus || rawTransaction.status)
                : (payuStatus === 'success' && !verifiedAmountMatches ? 'PayU verified amount did not match Bouut checkout amount' : null),
            completedAt: nextStatus === 'COMPLETED'
                ? (payment.completedAt || new Date())
                : payment.completedAt,
        },
    });

    if (nextStatus === 'COMPLETED' && payment.status !== 'COMPLETED') {
        await applyPaymentCompletionEffects(updatedPayment);
    } else if (nextStatus === 'FAILED' && payment.status !== 'FAILED' && payment.type === 'service') {
        await syncServiceSubmissionAfterPayment(updatedPayment);
    }

    return updatedPayment;
}

function validateBillingFields(payload: BillingPayload) {
    const normalizedEmail = normalizeString(payload.email);
    const normalizedPhone = normalizeString(payload.phone);
    const normalizedAddress1 = normalizeString(payload.address1);
    const normalizedCountry = normalizeString(payload.country);
    const normalizedCountryCode = normalizeString(payload.countryCode);
    const normalizedState = normalizeString(payload.state);
    const normalizedStateCode = normalizeString(payload.stateCode);
    const normalizedCity = normalizeString(payload.city);
    const normalizedPostalCode = normalizeString(payload.postalCode);

    if (!normalizedEmail || !normalizedPhone || !normalizedAddress1 || !normalizedCountry || !normalizedCountryCode || !normalizedState || !normalizedCity || !normalizedPostalCode) {
        return { error: 'Please complete all required billing fields before continuing.' };
    }

    return {
        normalizedEmail,
        normalizedPhone,
        normalizedAddress1,
        normalizedAddress2: normalizeOptionalString(payload.address2),
        normalizedCountry,
        normalizedCountryCode,
        normalizedState,
        normalizedStateCode: normalizeOptionalString(normalizedStateCode),
        normalizedCity,
        normalizedPostalCode,
        normalizedPromoCode: normalizeOptionalString(payload.promoCode),
    };
}

async function handlePayuCallback(req: PayuCallbackRequest, res: Response) {
    try {
        const payload = {
            ...(req.query || {}),
            ...(req.body || {}),
        } as PayuCallbackPayload;
        const callbackTxnId = normalizeString(payload.txnid || payload.txnId);
        const status = normalizeString(payload.status);
        const responseHash = normalizeString(payload.hash).toLowerCase();
        const possiblePaymentId = normalizeString(
            payload.udf1 ||
            payload.paymentId ||
            payload.checkoutId ||
            payload.referenceId ||
            payload.reference_id,
        );
        const payment = await prisma.payment.findFirst({
            where: possiblePaymentId
                ? {
                    OR: [
                        ...(callbackTxnId ? [{ payuTxnId: callbackTxnId }] : []),
                        { id: possiblePaymentId },
                    ],
                }
                : callbackTxnId
                    ? { payuTxnId: callbackTxnId }
                    : { id: '__missing_payu_payment__' },
        });

        if (!payment) {
            return res.redirect(getPayuCallbackFallbackUrl('not_found'));
        }

        const { settings, salt1 } = await getPayuConfigOrThrow();
        const txnid = callbackTxnId || payment.payuTxnId || '';

        if (!txnid) {
            return res.redirect(getPayuCallbackFallbackUrl('missing'));
        }

        const additionalCharges = normalizeString(payload.additional_charges || payload.additionalCharges);
        const expectedHash = status && responseHash
            ? generatePayuResponseHash({
                key: normalizeString(payload.key) || (settings.merchantKey || ''),
                txnid,
                amount: normalizeString(payload.amount),
                productinfo: normalizeString(payload.productinfo),
                firstname: normalizeString(payload.firstname),
                email: normalizeString(payload.email),
                status,
                udf1: normalizeOptionalString(payload.udf1 || payment.id),
                udf2: normalizeOptionalString(payload.udf2),
                udf3: normalizeOptionalString(payload.udf3),
                udf4: normalizeOptionalString(payload.udf4),
                udf5: normalizeOptionalString(payload.udf5),
                additionalCharges: additionalCharges || null,
            }, salt1).toLowerCase()
            : '';

        const txnMatches = payment.payuTxnId === txnid;
        const callbackAmount = normalizeString(payload.amount);
        const amountMatches = !callbackAmount || formatPayuAmount(payment.amount) === callbackAmount;
        const hashMatches = !!expectedHash && expectedHash === responseHash;
        const statusLower = status.toLowerCase();

        const verifyResult = await verifyPayuPaymentStatus(
            settings.mode,
            settings.merchantKey || '',
            salt1,
            txnid,
        ).catch((error) => ({
            ok: false,
            raw: JSON.stringify({ error: error instanceof Error ? error.message : 'verify_failed' }),
            parsed: null as Record<string, unknown> | null,
        }));
        const rawTransaction = findPayuVerifiedTransaction(verifyResult.parsed, txnid);
        const verifiedStatus = getPayuVerifiedStatus(rawTransaction);
        const verifiedAmount = getPayuVerifiedAmount(rawTransaction);
        const verifiedAmountMatches = !verifiedAmount || verifiedAmount === formatPayuAmount(payment.amount);
        const nextStatus =
            verifiedStatus === 'success' && verifiedAmountMatches
                ? 'COMPLETED'
                : verifiedStatus === 'failure' || verifiedStatus === 'failed'
                    ? 'FAILED'
                    : hashMatches && txnMatches && amountMatches && statusLower === 'success'
                        ? 'COMPLETED'
                        : statusLower === 'failure' || statusLower === 'failed'
                            ? 'FAILED'
                            : 'PENDING';
        const payuMihpayId = normalizeOptionalString(
            payload.mihpayid ||
            rawTransaction?.mihpayId ||
            rawTransaction?.mihpayid,
        );
        const payuBankRefNum = normalizeOptionalString(
            payload.bank_ref_num ||
            rawTransaction?.bankReferenceNumber ||
            rawTransaction?.bank_ref_num,
        );
        const payuPaymentMode = normalizeOptionalString(payload.mode || rawTransaction?.mode);
        const payuStatus = normalizeOptionalString(status || rawTransaction?.status);
        const payuUnmappedStatus = normalizeOptionalString(
            payload.unmappedstatus ||
            rawTransaction?.unmappedStatus ||
            rawTransaction?.unmappedstatus,
        );

        const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: nextStatus,
                gatewayOrderId: txnid,
                gatewayPaymentId: payuMihpayId,
                payuTxnId: txnid,
                payuMihpayId,
                payuBankRefNum,
                payuPaymentMode,
                payuStatus,
                payuUnmappedStatus,
                payuHash: responseHash || payment.payuHash,
                payuResponse: JSON.stringify(payload),
                payuVerifiedResponse: verifyResult.raw,
                gatewayReceiptImageUrl: normalizeOptionalString(payload.receiptUrl || payload.receipt_url),
                failureMessage: nextStatus === 'FAILED'
                    ? normalizeOptionalString(payload.error_Message || payload.unmappedstatus || rawTransaction?.unmappedStatus || status)
                    : ((!hashMatches && status && responseHash) || !txnMatches || !amountMatches || !verifiedAmountMatches
                        ? 'PayU callback/verification validation needs attention'
                        : null),
                completedAt: nextStatus === 'COMPLETED'
                    ? (payment.completedAt || new Date())
                    : payment.completedAt,
            },
        });

        if (updatedPayment.status === 'COMPLETED' && payment.status !== 'COMPLETED') {
            await applyPaymentCompletionEffects(updatedPayment);
        } else if (updatedPayment.status === 'FAILED' && payment.status !== 'FAILED' && updatedPayment.type === 'service') {
            await syncServiceSubmissionAfterPayment(updatedPayment);
        }

        const result = updatedPayment.status.toLowerCase();
        if (updatedPayment.type === 'subscription') {
            return res.redirect(getSubscriptionRedirectUrl(payment.id, result));
        }

        return res.redirect(getServiceRedirectUrl(payment.id, result));
    } catch (error) {
        console.error('PayU callback failed:', error);
        return res.redirect(getPayuCallbackFallbackUrl('error'));
    }
}

// GET /api/payments/subscription/config
router.get('/subscription/config', authenticate, async (_req: AuthRequest, res: Response) => {
    try {
        const settings = await getOrCreatePayuSettings();
        const summary = buildSubscriptionSummary(settings);

        res.json({
            enabled: settings.isEnabled,
            mode: settings.mode,
            currency: settings.currency.toUpperCase(),
            productName: settings.productName,
            gateway: 'payu',
            summary,
        });
    } catch (error) {
        console.error('Subscription config failed:', error);
        res.status(500).json({ error: 'Failed to load subscription config' });
    }
});

// POST /api/payments/subscription/checkout
router.post('/subscription/checkout', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { id: true, name: true, email: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const validated = validateBillingFields(req.body as BillingPayload);
        if ('error' in validated) {
            return res.status(400).json({ error: validated.error });
        }

        const { settings, salt1 } = await getPayuConfigOrThrow();
        const summary = buildSubscriptionSummary(settings);

        const payment = await prisma.payment.create({
            data: {
                userId: user.id,
                amount: summary.totalAmount,
                amountSubtotal: summary.discountedAmount,
                taxAmount: summary.taxAmount,
                currency: summary.currency,
                gateway: 'payu',
                status: 'PENDING',
                type: 'subscription',
                description: `${summary.productName} annual membership`,
                billingName: user.name,
                billingEmail: validated.normalizedEmail,
                billingPhone: validated.normalizedPhone,
                billingAddress1: validated.normalizedAddress1,
                billingAddress2: validated.normalizedAddress2,
                billingCountry: validated.normalizedCountry,
                billingCountryCode: validated.normalizedCountryCode,
                billingState: validated.normalizedState,
                billingStateCode: validated.normalizedStateCode,
                billingCity: validated.normalizedCity,
                billingPostalCode: validated.normalizedPostalCode,
                promoCode: validated.normalizedPromoCode,
            },
        });

        const payuTxnId = createPayuTxnId(payment.id);
        const paymentWithTxn = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                gatewayOrderId: payuTxnId,
                payuTxnId,
            },
        });

        const hostedRequest = buildHostedCheckoutRequest({
            payment: paymentWithTxn,
            merchantKey: settings.merchantKey || '',
            productName: summary.productName,
            udf2: 'subscription',
            cancelUrl: getSubscriptionRedirectUrl(payment.id, 'cancelled'),
        });
        const hostedSession = await createPayuHostedCheckoutSession(
            settings.mode,
            settings.merchantKey || '',
            salt1,
            hostedRequest,
        );

        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                payuRequestPayload: JSON.stringify(hostedRequest),
                payuResponse: hostedSession.raw,
                failureMessage: hostedSession.ok && hostedSession.checkoutUrl ? null : 'Unable to create PayU hosted checkout session',
            },
        });

        if (!hostedSession.ok || !hostedSession.checkoutUrl) {
            return res.status(502).json({
                error: 'PayU could not create a hosted checkout session right now.',
            });
        }

        return res.status(201).json({
            checkoutId: payment.id,
            paymentPageUrl: `/dashboard/subscription/payment?checkoutId=${payment.id}`,
        });
    } catch (error) {
        console.error('Create subscription checkout failed:', error);
        const status =
            typeof error === 'object' &&
            error &&
            'status' in error &&
            typeof (error as { status?: unknown }).status === 'number'
                ? (error as { status: number }).status
                : 500;

        return res.status(status).json({
            error: error instanceof Error ? error.message : 'Unable to start PayU checkout',
        });
    }
});

// GET /api/payments/subscription/checkout/:id
router.get('/subscription/checkout/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const payment = await prisma.payment.findFirst({
            where: {
                id: req.params.id,
                userId: req.user!.id,
                type: 'subscription',
            },
        });

        if (!payment) {
            return res.status(404).json({ error: 'Checkout record not found' });
        }

        const settings = await getOrCreatePayuSettings();
        const summary = buildSubscriptionSummary(settings);
        return res.json(buildCheckoutResponse(payment, summary, extractCheckoutUrl(payment.payuResponse)));
    } catch (error) {
        console.error('Load subscription checkout failed:', error);
        return res.status(500).json({ error: 'Unable to load checkout details' });
    }
});

// POST /api/payments/subscription/checkout/:id/sync
router.post('/subscription/checkout/:id/sync', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const payment = await prisma.payment.findFirst({
            where: {
                id: req.params.id,
                userId: req.user!.id,
                type: 'subscription',
            },
        });

        if (!payment) {
            return res.status(404).json({ error: 'Checkout record not found' });
        }

        const syncedPayment = await syncPaymentRecord(payment.id);
        const settings = await getOrCreatePayuSettings();
        const summary = buildSubscriptionSummary(settings);
        const latestPayment = syncedPayment || payment;

        return res.json(buildCheckoutResponse(latestPayment, summary, extractCheckoutUrl(latestPayment.payuResponse)));
    } catch (error) {
        console.error('Sync subscription checkout failed:', error);
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Unable to sync payment status' });
    }
});

// GET /api/payments/services/submissions/:submissionId/config
router.get('/services/submissions/:submissionId/config', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const submission = await prisma.submission.findFirst({
            where: {
                id: req.params.submissionId,
                userId: req.user!.id,
                type: 'service',
            },
            include: {
                service: true,
                payment: true,
            },
        });

        if (!submission || !submission.service) {
            return res.status(404).json({ error: 'Service submission not found' });
        }

        return res.json({
            id: submission.id,
            type: submission.type,
            status: submission.status,
            paymentStatus: submission.paymentStatus,
            paymentRequired: submission.paymentRequired,
            paymentAmount: submission.paymentAmount,
            paymentCurrency: submission.paymentCurrency || 'INR',
            paymentCompletedAt: submission.paymentCompletedAt,
            createdAt: submission.createdAt,
            service: submission.service,
            formData: submission.formData ? JSON.parse(submission.formData) : null,
            paymentId: submission.payment?.id || null,
        });
    } catch (error) {
        console.error('Load service submission checkout config failed:', error);
        return res.status(500).json({ error: 'Unable to load service submission details' });
    }
});

// POST /api/payments/services/submissions/:submissionId/checkout
router.post('/services/submissions/:submissionId/checkout', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { id: true, name: true, email: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const submission = await prisma.submission.findFirst({
            where: {
                id: req.params.submissionId,
                userId: user.id,
                type: 'service',
            },
            include: {
                service: true,
                payment: true,
            },
        });

        if (!submission || !submission.service) {
            return res.status(404).json({ error: 'Service submission not found' });
        }

        if (!submission.paymentRequired || !submission.paymentAmount || submission.paymentAmount <= 0) {
            return res.status(400).json({ error: 'This submission does not require payment.' });
        }

        const validated = validateBillingFields(req.body as BillingPayload);
        if ('error' in validated) {
            return res.status(400).json({ error: validated.error });
        }

        const { settings, salt1 } = await getPayuConfigOrThrow();
        const amount = roundCurrency(submission.paymentAmount);
        const paymentSubtotal = amount;
        const paymentTax = 0;
        const productName = getServiceSubmissionProductName(submission);

        let payment = submission.payment;

        if (payment?.status === 'COMPLETED') {
            return res.status(200).json({
                checkoutId: payment.id,
                paymentPageUrl: `/dashboard/promo-tools/payment?checkoutId=${payment.id}`,
            });
        }

        if (payment) {
            payment = await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    amount,
                    amountSubtotal: paymentSubtotal,
                    taxAmount: paymentTax,
                    currency: (submission.paymentCurrency || 'INR').toUpperCase(),
                    gateway: 'payu',
                    status: 'PENDING',
                    type: 'service',
                    description: productName,
                    billingName: user.name,
                    billingEmail: validated.normalizedEmail,
                    billingPhone: validated.normalizedPhone,
                    billingAddress1: validated.normalizedAddress1,
                    billingAddress2: validated.normalizedAddress2,
                    billingCountry: validated.normalizedCountry,
                    billingCountryCode: validated.normalizedCountryCode,
                    billingState: validated.normalizedState,
                    billingStateCode: validated.normalizedStateCode,
                    billingCity: validated.normalizedCity,
                    billingPostalCode: validated.normalizedPostalCode,
                    promoCode: validated.normalizedPromoCode,
                    failureMessage: null,
                    completedAt: null,
                },
            });
        } else {
            payment = await prisma.payment.create({
                data: {
                    userId: user.id,
                    submissionId: submission.id,
                    amount,
                    amountSubtotal: paymentSubtotal,
                    taxAmount: paymentTax,
                    currency: (submission.paymentCurrency || 'INR').toUpperCase(),
                    gateway: 'payu',
                    status: 'PENDING',
                    type: 'service',
                    description: productName,
                    billingName: user.name,
                    billingEmail: validated.normalizedEmail,
                    billingPhone: validated.normalizedPhone,
                    billingAddress1: validated.normalizedAddress1,
                    billingAddress2: validated.normalizedAddress2,
                    billingCountry: validated.normalizedCountry,
                    billingCountryCode: validated.normalizedCountryCode,
                    billingState: validated.normalizedState,
                    billingStateCode: validated.normalizedStateCode,
                    billingCity: validated.normalizedCity,
                    billingPostalCode: validated.normalizedPostalCode,
                    promoCode: validated.normalizedPromoCode,
                },
            });
        }

        const payuTxnId = payment.payuTxnId || createPayuTxnId(payment.id);
        payment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                gatewayOrderId: payuTxnId,
                payuTxnId,
            },
        });

        const hostedRequest = buildHostedCheckoutRequest({
            payment,
            merchantKey: settings.merchantKey || '',
            productName,
            udf2: 'service',
            udf3: submission.id,
            cancelUrl: getServiceRedirectUrl(payment.id, 'cancelled'),
        });

        const hostedSession = await createPayuHostedCheckoutSession(
            settings.mode,
            settings.merchantKey || '',
            salt1,
            hostedRequest,
        );

        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                payuRequestPayload: JSON.stringify(hostedRequest),
                payuResponse: hostedSession.raw,
                failureMessage: hostedSession.ok && hostedSession.checkoutUrl ? null : 'Unable to create PayU hosted checkout session',
            },
        });

        await prisma.submission.update({
            where: { id: submission.id },
            data: {
                status: 'PENDING_PAYMENT',
                paymentStatus: 'UNPAID',
            },
        });

        if (!hostedSession.ok || !hostedSession.checkoutUrl) {
            return res.status(502).json({
                error: 'PayU could not create a hosted checkout session right now.',
            });
        }

        return res.status(201).json({
            checkoutId: payment.id,
            paymentPageUrl: `/dashboard/promo-tools/payment?checkoutId=${payment.id}`,
        });
    } catch (error) {
        console.error('Create service submission checkout failed:', error);
        const status =
            typeof error === 'object' &&
            error &&
            'status' in error &&
            typeof (error as { status?: unknown }).status === 'number'
                ? (error as { status: number }).status
                : 500;

        return res.status(status).json({
            error: error instanceof Error ? error.message : 'Unable to start PayU checkout',
        });
    }
});

// GET /api/payments/services/checkouts/:id
router.get('/services/checkouts/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const payment = await prisma.payment.findFirst({
            where: {
                id: req.params.id,
                userId: req.user!.id,
                type: 'service',
            },
            include: {
                submission: {
                    include: {
                        service: true,
                    },
                },
            },
        });

        if (!payment || !payment.submission || !payment.submission.service) {
            return res.status(404).json({ error: 'Checkout record not found' });
        }

        const summary = buildServiceSummary(payment);
        return res.json({
            ...buildCheckoutResponse(payment, summary, extractCheckoutUrl(payment.payuResponse)),
            submission: {
                id: payment.submission.id,
                status: payment.submission.status,
                paymentStatus: payment.submission.paymentStatus,
                serviceId: payment.submission.serviceId,
                serviceName: payment.submission.service.name,
            },
        });
    } catch (error) {
        console.error('Load service checkout failed:', error);
        return res.status(500).json({ error: 'Unable to load checkout details' });
    }
});

// POST /api/payments/services/checkouts/:id/sync
router.post('/services/checkouts/:id/sync', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const payment = await prisma.payment.findFirst({
            where: {
                id: req.params.id,
                userId: req.user!.id,
                type: 'service',
            },
        });

        if (!payment) {
            return res.status(404).json({ error: 'Checkout record not found' });
        }

        await syncPaymentRecord(payment.id);

        const latestPayment = await prisma.payment.findUnique({
            where: { id: payment.id },
            include: {
                submission: {
                    include: {
                        service: true,
                    },
                },
            },
        });

        if (!latestPayment || !latestPayment.submission || !latestPayment.submission.service) {
            return res.status(404).json({ error: 'Checkout record not found after sync' });
        }

        const summary = buildServiceSummary(latestPayment);
        return res.json({
            ...buildCheckoutResponse(latestPayment, summary, extractCheckoutUrl(latestPayment.payuResponse)),
            submission: {
                id: latestPayment.submission.id,
                status: latestPayment.submission.status,
                paymentStatus: latestPayment.submission.paymentStatus,
                serviceId: latestPayment.submission.serviceId,
                serviceName: latestPayment.submission.service.name,
            },
        });
    } catch (error) {
        console.error('Sync service checkout failed:', error);
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Unable to sync payment status' });
    }
});

// GET /api/payments/payu/callback
router.get('/payu/callback', async (req: PayuCallbackRequest, res: Response) => {
    return handlePayuCallback(req, res);
});

// POST /api/payments/payu/callback
router.post('/payu/callback', async (req: PayuCallbackRequest, res: Response) => {
    return handlePayuCallback(req, res);
});

export default router;
