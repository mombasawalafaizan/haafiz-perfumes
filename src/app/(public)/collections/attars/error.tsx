"use client";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AttarsError({ error, reset }: ErrorProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 bg-error-background rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-error" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Something went wrong!
        </h1>

        <p className="text-muted-foreground mb-6">
          We encountered an error while loading the attars. Please try again.
        </p>

        <div className="space-y-3">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>

          <Button variant="outline" className="w-full">
            <Link href="/collections">Back to Collections</Link>
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
