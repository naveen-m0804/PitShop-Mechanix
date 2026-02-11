import * as React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message?: string;
};

export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("App crashed:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <section className="glass-card w-full max-w-2xl p-6 text-left">
          <h1 className="text-2xl font-display font-bold">App failed to render</h1>
          <p className="text-muted-foreground mt-2">
            Something went wrong while loading the UI. Please refresh. If it keeps happening, share the
            error below.
          </p>
          <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-secondary/40 p-4 text-sm text-foreground border border-border">
            {this.state.message}
          </pre>
        </section>
      </main>
    );
  }
}
