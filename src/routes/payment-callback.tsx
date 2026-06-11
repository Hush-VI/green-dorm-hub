import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useVerifyPayment } from "@/lib/queries";

export const Route = createFileRoute("/payment-callback")({
  head: () => ({ meta: [{ title: "Payment — SME Hostels" }] }),
  component: PaymentCallback,
});

function PaymentCallback() {
  const navigate = useNavigate();
  const verifyMut = useVerifyPayment();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Paystack appends ?reference=xxx&trxref=xxx to the callback URL
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") ?? params.get("trxref");

    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found.");
      return;
    }

    verifyMut.mutate(reference, {
      onSuccess: (result) => {
        if (result.alreadyRecorded) {
          setStatus("success");
          setMessage("Payment already recorded. Redirecting…");
        } else {
          setStatus("success");
          setMessage(`GHS ${result.amountGhs?.toFixed(2)} confirmed. SMS sent to your phone. Redirecting…`);
        }
        setTimeout(() => navigate({ to: "/student-home" }), 3000);
      },
      onError: (e) => {
        setStatus("failed");
        setMessage(e.message);
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm squircle bg-white p-8 text-center shadow-glass">
        {status === "verifying" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <div className="mt-4 text-lg font-semibold">Verifying payment…</div>
            <div className="mt-1 text-sm text-muted-foreground">Please wait, do not close this page.</div>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <div className="mt-4 text-lg font-semibold text-primary">Payment confirmed!</div>
            <div className="mt-1 text-sm text-muted-foreground">{message}</div>
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <div className="mt-4 text-lg font-semibold text-destructive">Payment failed</div>
            <div className="mt-1 text-sm text-muted-foreground">{message}</div>
            <button onClick={() => navigate({ to: "/portal" })} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
              Go to portal
            </button>
          </>
        )}
      </div>
    </div>
  );
}
