import { Component } from "react";

// Пази останалата част от сайта, ако един ленив чънк или компонент се счупи.
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info?.componentStack);
    this.props.onError?.(error);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const { fallback } = this.props;
    return typeof fallback === "function" ? fallback(error, () => this.setState({ error: null })) : fallback ?? null;
  }
}

// Съобщение за неуспешно зареждане на част от страницата, с бутон за презареждане.
export function LoadFailed({ message = "Не успяхме да заредим тази част от сайта.", inline = false }) {
  return (
    <div
      role="alert"
      style={{
        textAlign: "center",
        padding: inline ? "12px 16px" : "48px 16px",
        ...(inline
          ? { position: "fixed", bottom: 16, left: 16, right: 16, zIndex: 400, background: "#fff", border: "1px solid #ddd", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }
          : {}),
      }}
    >
      <p style={{ margin: "0 0 8px" }}>{message}</p>
      <button type="button" onClick={() => window.location.reload()} style={{ padding: "6px 14px", cursor: "pointer" }}>
        Презареди
      </button>
    </div>
  );
}
