import { PrismaClient } from '@prisma/client';
import { encryptSecret } from './lib/payu';

const prisma = new PrismaClient();

function normalizeNumber(value: string | undefined, fallback: number) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function main() {
    const mode = process.env.PAYU_SEED_MODE?.trim() || 'test';
    const isEnabled = (process.env.PAYU_SEED_ENABLED || 'true').trim().toLowerCase() === 'true';
    const merchantId = process.env.PAYU_SEED_MERCHANT_ID?.trim() || '8438541';
    const merchantKey = process.env.PAYU_SEED_MERCHANT_KEY?.trim() || 'UX1TdR';
    const salt1 = process.env.PAYU_SEED_SALT1?.trim() || 'FsvJ2fBMtdVu8OzRxzTvKa97px4olqCr';
    const salt2 = process.env.PAYU_SEED_SALT2?.trim() || 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC/9U7P2HP1Ag/mZo4U0rfOis3b8x7VGmDXFasZ08ihAkKejHptpaQ699iLNqVr+2Gr5I3JeuSR70Ng8G90wi27KNkweky9Rg+lw5DKsz6phlJGz3a+T2xcua7HkPKO3XyUqpZsarxvSqg6vy8AcbkF5hsqJPgpkMwn+vhaR8LCM+NKstvmupTyrolDzCGgm1QE7Rd7PyXt6EEHsMu/bLlxPJqw6Cj1jca11Ms7awwM6HDrxr9bRZRgIUiXlzo4CD2J9J8ojhdGHQXKbULYov6Pvpp9ErQ26kc3yKTikqJR+/uJeGzvxCczt/SgVTXmk8tPWLT9xGq0SggQAgrMzr0vAgMBAAECggEBAJEP2m0rkAWZd1aQLdMCorDNKGCNS8GTW5du4ox0BWvXf2y9kE+IG6IMZnJd64i8wcTaxWN7IXw/KdX6HOBJVbHYXrlJ0vA+H9kO/z6PUk1eGpM0ePG8p5EzKSfbG9JnApx+hYqM5rXb32H11JkrV71jdSfWJEuVBxM3j7L6A+4pZNSI408Z+zrXmIpGxaJETN0rj3Kj2GgDEM1O/BGwUy/i2z5UHoELtJiLLa9Tr771/NETEJdJ7VOLo06HoJiJIvuSXR0p4Q2+5zPmaDjx+4WQ4lgo0gYvP8lYnmnw7aZA9KwyUwuDoGowBbAywjV4+fydArEhT45hwKMBhNHreECgYEA5h883hTTJ+3dRnicvM627HIw+1goccaBBOc9JqGdcyZYjuKGPks/Y5QB8QmnNbNWdPZ76LVB942LAM/iv6Yi44RjjYcu5qiAGNW6vbcLQApfDSNZyTeBt8em4+GC4RhJlFeP9C7zV/1/gGkOafNjoQWGOIbmCgjxcP1C+yZk33kCgYEA1YtozQ49gjpnxm2b7DN2bvJpLNzoWmEiJvE375aDoHruaMeydKvtnXKQiw3qgZh3+BX61cl5+3w+nWcKi0YFnJvDYxmvWdbSKCmkb/olXuKB4FM9UDk/3UC1ns+dFsKZbJ+5vnUVMRfvG2zlLQ6HAsxL2rrzrIFMIwS2WnL5D+cCgYBAPWIpgNi9YcqOnKbskixAb1Q7Jg4MTOTBcKgCe8VPWtoH8TaWdz0X2D5+gjpaZFjzR8epW8gxiiLOtDnRVFiS+OctoBo4q7sus6NwyINseji0mzS6VjNxEVwGa3K00angrlzyRpUJ8CtCtpEehKJAViF08DuRe5Oi/iBPqhUoyQKBgD55E4byBJKlzZhilrwqbhqVNqnWUu+l/RzRcyDXsthvPnJPAelaJyDp1FmqD5IsbeSZYZHL6LDnL1ZTP+Vw7dFcTHQgnok07LStQhs0Xlx8/awIDib7KLDs7nVwna977PC3ZdrPXAzJyL0IRZ/B4UOzSvnJueIczY5tIYAipLS/AoGAWZCckhlfvXASwgK9lAoKfExTGTEFGZXtaxFe1T64aP4PCbkGsnNOFMgjxDmve38mf8BoRSEr61Lx9etBgkAYu1B+3Cx0lZ5qlIpHhvWXeLsqVoyAgYRatB69DQVMTTVChu9x4EpINdsatYUlLbZPgnDRXa/vt0AhWEl7qDkVmRo=';
    const currency = process.env.PAYU_SEED_CURRENCY?.trim().toUpperCase() || 'INR';
    const productName = process.env.PAYU_SEED_PRODUCT_NAME?.trim() || 'Songdew Pro';
    const originalAmount = normalizeNumber(process.env.PAYU_SEED_ORIGINAL_AMOUNT, 4000);
    const discountedAmount = normalizeNumber(process.env.PAYU_SEED_DISCOUNTED_AMOUNT, 2000);
    const taxPercent = normalizeNumber(process.env.PAYU_SEED_TAX_PERCENT, 18);
    const proDurationDays = Math.round(normalizeNumber(process.env.PAYU_SEED_PRO_DURATION_DAYS, 365));

    if (!merchantKey || !salt1) {
        throw new Error('PAYU_SEED_MERCHANT_KEY and PAYU_SEED_SALT1 are required for PayU settings seeding.');
    }

    const existing = await prisma.payuSettings.findFirst({
        orderBy: { createdAt: 'asc' },
    });

    const data = {
        mode,
        isEnabled,
        merchantId,
        merchantKey,
        salt1Encrypted: encryptSecret(salt1),
        salt2Encrypted: salt2 ? encryptSecret(salt2) : existing?.salt2Encrypted || null,
        currency,
        productName,
        originalAmount,
        discountedAmount,
        taxPercent,
        proDurationDays,
    };

    const settings = existing
        ? await prisma.payuSettings.update({
            where: { id: existing.id },
            data,
        })
        : await prisma.payuSettings.create({ data });

    console.log('PayU payment settings seeded successfully.');
    console.log(JSON.stringify({
        id: settings.id,
        mode: settings.mode,
        isEnabled: settings.isEnabled,
        merchantId: settings.merchantId,
        merchantKey: settings.merchantKey,
        currency: settings.currency,
        productName: settings.productName,
        updatedAt: settings.updatedAt,
        hasSalt2: !!settings.salt2Encrypted,
    }, null, 2));
}

main()
    .catch((error) => {
        console.error('PayU settings seed failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
