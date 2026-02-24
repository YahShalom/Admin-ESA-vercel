import Link from 'next/link';
import { CaraiMark } from '@/components/brand/CaraiMark';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-between items-center">
        <CaraiMark />
        <Button asChild variant="ghost">
          <Link href="/login">
            Login
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-500 py-2">
            Carai Agency
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Caribbean AI Agency — where Caribbean spirit meets intelligent design.
          </p>
        </div>
        <div className="mt-8">
            <Button asChild size="lg">
                <Link href="/dashboard">
                    Go to Dashboard
                </Link>
            </Button>
        </div>
      </main>
      <footer className="p-4 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} Admin ESA. All rights reserved.
      </footer>
    </div>
  );
}
