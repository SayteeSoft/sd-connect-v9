
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useMemo, Suspense, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import type { OnApproveData, CreateOrderData } from "@paypal/paypal-js";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from 'next-themes';

const creditPackages = [
  { id: 'pkg-1', credits: 100, price: 20 },
  { id: 'pkg-2', credits: 500, price: 80 },
  { id: 'pkg-3', credits: 1000, price: 150 },
];

function PayPalPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, addCredits } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const packageId = searchParams.get('packageId');
  const selectedPackage = useMemo(() => creditPackages.find(p => p.id === packageId), [packageId]);

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const createOrder = (data: CreateOrderData, actions: any) => {
    if (!selectedPackage) {
      setError("No package selected. Please go back.");
      return Promise.reject(new Error("No package selected"));
    }
    return actions.order.create({
      purchase_units: [
        {
          description: `SD Connect - ${selectedPackage.credits} Credits`,
          amount: {
            currency_code: 'GBP',
            value: selectedPackage.price.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'SD Connect',
        shipping_preference: 'NO_SHIPPING',
      }
    });
  };

  const onApprove = (data: OnApproveData, actions: any) => {
    setIsProcessing(true);
    setError(null);
    return actions.order.capture().then(async (details: any) => {
      toast({
        title: 'Purchase Successful!',
        description: `You have successfully purchased ${selectedPackage?.credits} credits via PayPal.`,
      });
      
      if (user?.role === 'daddy' && selectedPackage) {
          await addCredits(selectedPackage.credits);
      }
      
      const redirectUrl = searchParams.get('redirect');
      const chatWith = searchParams.get('chatWith');

      if (redirectUrl === '/messages' && chatWith) {
          router.push(`/messages?chatWith=${chatWith}`);
      } else {
          router.push('/matches');
      }
    }).catch((err: any) => {
        console.error("PayPal Capture Error:", err);
        setError("An error occurred while processing your payment. Please try again.");
        setIsProcessing(false);
    });
  };

  const onError = (err: any) => {
    console.error("PayPal Error:", err);
    setError("A PayPal error occurred. Please check your details or try another payment method.");
    setIsProcessing(false);
  };

  if (!selectedPackage) {
      return (
          <>
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-6 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Invalid Package</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">The selected credit package is invalid. Please go back and select a package.</p>
                        <Button onClick={() => router.push('/purchase-credits')} className="mt-4">Back to Packages</Button>
                    </CardContent>
                </Card>
            </main>
          </>
      )
  }
  
  if (!paypalClientId) {
      return (
        <>
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-6 flex items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Configuration Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">PayPal integration is not configured correctly. Please contact support.</p>
                        <Button onClick={() => router.push('/purchase-credits')} className="mt-4">Back to Packages</Button>
                    </CardContent>
                </Card>
            </main>
        </>
      )
  }

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <p className="font-bold text-5xl text-[#00457C] dark:text-white mx-auto"><i>PayPal</i></p>
            <CardTitle className="font-headline text-2xl pt-4">Complete Your Purchase</CardTitle>
            <CardDescription>
              You are purchasing {selectedPackage.credits} credits for £{selectedPackage.price}.00
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
                 <div className="flex flex-col items-center justify-center space-y-4 h-[150px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Processing your payment...</p>
                </div>
            ) : !isMounted || !resolvedTheme ? (
                <div className="flex flex-col items-center justify-center space-y-4 h-[150px]">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading payment options...</p>
                </div>
            ) : (
              <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "GBP", intent: "capture" }}>
                  {error && <p className="text-destructive text-sm mb-4">{error}</p>}
                  <PayPalButtons
                      key={resolvedTheme}
                      style={{ 
                          layout: "vertical", 
                          shape: "rect", 
                          label: "pay", 
                          height: 48,
                          color: resolvedTheme === 'dark' ? 'silver' : 'gold' 
                      }}
                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={onError}
                      disabled={isProcessing}
                  />
              </PayPalScriptProvider>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

const PageLoader = () => (
    <>
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-6 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
    </>
);

export default function PayPalPaymentPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <PayPalPaymentContent />
        </Suspense>
    )
}
