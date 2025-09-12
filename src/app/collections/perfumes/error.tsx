"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PerfumesError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Perfumes page error:", error);
  }, [error]);

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
          We encountered an error while loading the perfumes. Please try again.
        </p>

        <div className="space-y-3">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>

          <Button
            variant="outline"
            onClick={() => (window.location.href = "/collections")}
            className="w-full"
          >
            Back to Collections
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
