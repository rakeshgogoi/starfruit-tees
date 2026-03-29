import { useEffect, useRef, useState } from 'react';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export function useRazorpay() {
  const [scriptLoaded, setScriptLoaded] = useState(
    () => typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined'
  );
  const scriptRef = useRef(null);

  useEffect(() => {
    if (scriptLoaded) return;

    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, [scriptLoaded]);

  /**
   * Initiate a Razorpay payment.
   * @param {Object} params
   * @param {number}   params.amount       - Amount in INR (e.g. 799)
   * @param {string}   params.productName  - Label shown in checkout (e.g. "RCB Jersey")
   * @param {string}   [params.receipt]    - Optional receipt ID
   * @param {Function} [params.onSuccess]  - Called with Razorpay payment response on success
   * @param {Function} [params.onError]    - Called with error message on failure
   */
  const pay = async ({ amount, productName, receipt, onSuccess, onError }) => {
    if (!scriptLoaded) {
      onError?.('Payment system not ready. Please try again.');
      return;
    }

    try {
      // Create a server-side order
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, receipt }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Order creation failed');
      }

      const order = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Starfruit Tees',
        description: productName,
        image: '/starfruit-logo.jpg',
        order_id: order.id,
        handler: (response) => {
          onSuccess?.(response);
        },
        prefill: {},
        notes: { product: productName },
        theme: { color: '#E0A600' },
        modal: {
          ondismiss: () => {
            onError?.('Payment cancelled.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        onError?.(response.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      onError?.(err.message || 'Something went wrong. Please try again.');
    }
  };

  return { pay, scriptLoaded };
}
