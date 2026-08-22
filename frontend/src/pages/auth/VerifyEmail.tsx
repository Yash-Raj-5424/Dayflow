import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Button } from "../../components/ui/Button";
import * as authApi from "../../api/auth";
import { apiErrorMessage } from "../../lib/apiClient";

type State = "verifying" | "success" | "error";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<State>("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMessage("This verification link is missing its token.");
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setState("success"))
      .catch((err) => {
        setState("error");
        setErrorMessage(apiErrorMessage(err));
      });
  }, [token]);

  return (
    <AuthLayout title="Email verification" subtitle="Confirming your account.">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center py-6 text-center"
      >
        {state === "verifying" && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-violet-300" />
            <p className="mt-4 text-sm text-muted">Verifying your email…</p>
          </>
        )}
        {state === "success" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="flex flex-col items-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-sm text-ink">Your email is verified.</p>
            <Link to="/login" className="mt-6 w-full">
              <Button className="w-full">Sign in</Button>
            </Link>
          </motion.div>
        )}
        {state === "error" && (
          <>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15">
              <XCircle className="h-8 w-8 text-rose-400" />
            </div>
            <p className="text-sm text-ink">Verification failed</p>
            <p className="mt-1 text-xs text-faint">{errorMessage}</p>
            <Link to="/login" className="mt-6 w-full">
              <Button variant="secondary" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </>
        )}
      </motion.div>
    </AuthLayout>
  );
}
