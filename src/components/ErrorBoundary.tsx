import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  label?: string; // e.g. "Dashboard" — shown in error message
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error(`[ErrorBoundary${this.props.label ? ` — ${this.props.label}` : ""}]`, error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {this.props.label
              ? `${this.props.label} failed to load`
              : "Something went wrong"}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={this.reset}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}