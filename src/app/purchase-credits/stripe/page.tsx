
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useAuth } from '@/hooks/use-auth';

const creditPackages = [
  { id: 'pkg-1', credits: 100, price: 20 },
  { id: 'pkg-2', credits: 500, price: 80 },
  { id: 'pkg-3', credits: 1000, price: 150 },
];

function StripePaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const { user, addCredits } = useAuth();

  const packageId = searchParams.get('packageId');
  const selectedPackage = useMemo(() => creditPackages.find(p => p.id === packageId), [packageId]);

  useEffect(() => {
      if(selectedPackage && user) {
        const timer = setTimeout(async () => {
            if (user?.role === 'daddy') {
                await addCredits(selectedPackage.credits);
            }
            setIsProcessing(false);
            toast({
                title: 'Purchase Successful!',
                description: `You have successfully purchased ${selectedPackage.credits} credits via Stripe.`,
            });
            
            const redirectUrl = searchParams.get('redirect');
            const chatWith = searchParams.get('chatWith');

            if (redirectUrl === '/messages' && chatWith) {
                router.push(`/messages?chatWith=${chatWith}`);
            } else {
                router.push('/matches');
            }
        }, 3000);

        return () => clearTimeout(timer);
      }
  }, [selectedPackage, router, toast, addCredits, searchParams, user]);

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

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
             <svg
                className="mx-auto h-12 w-auto"
                viewBox="0 0 71 31"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23.693 30.297c-4.482 0-8.586-2.24-10.374-6.363l6.453-2.904c.738 1.944 2.817 3.258 5.157 3.258 2.646 0 4.233-1.485 4.233-3.321 0-1.746-1.314-2.817-4.833-4.131-4.38-1.548-7.107-3.6-7.107-8.172 0-4.167 3.321-7.236 8.415-7.236 3.492 0 6.696 1.458 8.442 4.653l-6.192 2.904c-.63-1.548-2.241-2.43-4.26-2.43-1.944 0-3.321 1.116-3.321 2.844 0 1.62 1.251 2.565 4.59 3.843 4.554 1.719 7.368 3.696 7.368 8.298 0 4.716-3.753 7.62-9.525 7.62Z"
                  fill="#f5a3f5"
                ></path>
                <path
                  d="M48.064 1.488h-8.064v28.8h8.064v-11.23h2.646c5.859 0 9.876-4.041 9.876-9.876s-4.017-9.694-9.876-9.694h-2.646Zm2.646 12.87c-1.944 0-3.26-1.4-3.26-3.19s1.316-3.195 3.26-3.195h.414v6.385h-.414Z"
                  fill="#f5a3f5"
                ></path>
                <path
                  d="M70.923 15.651c0-8.235-5.418-14.163-13.437-14.163h-9.963v28.8h8.064V19.38h1.34c2.817 0 3.753.825 4.653 1.83l3.075 3.375v4.95h8.328v-5.61c0-.567-.297-.825-.687-1.215l-4.379-4.524Zm-14.058-6.18c2.145 0 3.519 1.178 3.519 3.09s-1.374 3.09-3.52 3.09h-1.049v-6.18h1.05Z"
                  fill="#f5a3f5"
                ></path>
              </svg>
            <CardTitle className="font-headline text-2xl pt-4">Redirecting to Stripe</CardTitle>
            <CardDescription>
              You are purchasing {selectedPackage.credits} credits for £{selectedPackage.price}.00
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Please wait while we securely redirect you to Stripe to complete your payment.</p>
            </div>
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

export default function StripePaymentPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <StripePaymentContent />
        </Suspense>
    )
}
