'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock3, Home, ReceiptText, XCircle } from 'lucide-react';

function getResultCopy(result: string | null, type: string | null) {
  const normalized = (result || '').toLowerCase();
  const isSubscription = type === 'subscription';

  if (normalized === 'completed' || normalized === 'success') {
    return {
      tone: 'success',
      title: 'Thank you, your payment is complete.',
      body: isSubscription
        ? 'Your membership payment has been received successfully.'
        : 'Your service payment has been received successfully. Your selected plan is now active and visible to admin for review.',
    };
  }

  if (normalized === 'failed' || normalized === 'failure' || normalized === 'error') {
    return {
      tone: 'error',
      title: 'Payment could not be completed.',
      body: normalized === 'error'
        ? 'We received the PayU callback, but could not verify it automatically. Please check your dashboard or contact support if the amount was deducted.'
        : 'PayU returned a failed payment status. Please try again from your dashboard when you are ready.',
    };
  }

  if (normalized === 'cancelled') {
    return {
      tone: 'neutral',
      title: 'Payment was cancelled.',
      body: 'No successful PayU payment was captured for this checkout.',
    };
  }

  return {
    tone: 'neutral',
    title: 'Thank you, we received the PayU response.',
    body: 'We are checking the latest payment status. You can return to Bouut Music now.',
  };
}

function PaymentThankYouContent() {
  const searchParams = useSearchParams();
  const [secondsLeft, setSecondsLeft] = useState(10);
  const result = searchParams.get('result');
  const type = searchParams.get('type');
  const checkoutId = searchParams.get('checkoutId');
  const copy = useMemo(() => getResultCopy(result, type), [result, type]);
  const isSuccess = copy.tone === 'success';
  const isError = copy.tone === 'error';

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft(previous => {
        if (previous <= 1) {
          window.location.assign('/');
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="payment-thank-page">
      <section className="payment-thank-card">
        <div className={`payment-thank-icon ${isSuccess ? 'is-success' : isError ? 'is-error' : ''}`}>
          {isSuccess ? <CheckCircle2 size={42} /> : isError ? <XCircle size={42} /> : <ReceiptText size={42} />}
        </div>

        <span className="payment-thank-kicker">PayU checkout</span>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>

        {checkoutId && (
          <div className="payment-thank-reference">
            <ReceiptText size={16} />
            Checkout reference: {checkoutId}
          </div>
        )}

        <div className="payment-thank-countdown">
          <Clock3 size={17} />
          Redirecting to Bouut Music in {secondsLeft} seconds
        </div>

        <div className="payment-thank-actions">
          <Link href="/" className="payment-thank-primary">
            <Home size={17} />
            Go Home
          </Link>
          <Link href="/dashboard" className="payment-thank-secondary">
            Open Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function PaymentThankYouPage() {
  return (
    <Suspense fallback={null}>
      <PaymentThankYouContent />
    </Suspense>
  );
}
