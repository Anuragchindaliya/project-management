import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden p-4">
          {/* Background Blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700" />

          {/* Glassmorphism Card */}
          <div className="relative z-10 max-w-md w-full bg-background/60 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Oops! Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We encountered an unexpected error. Our team has been notified.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-muted/50 rounded-lg p-4 text-left overflow-auto max-h-40 border border-border/50">
                <code className="text-xs font-mono text-destructive">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <div className="pt-4 flex justify-center gap-4">
              <Button onClick={this.handleReload} size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-primary/25 transition-all">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Application
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground pt-4">
               If this persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
