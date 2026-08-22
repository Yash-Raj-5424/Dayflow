import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, IdCard, ArrowRight, MailCheck } from "lucide-react";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Input, Select } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/useToast";
import { apiErrorMessage } from "../../lib/apiClient";
import * as authApi from "../../api/auth";
import type { UserRole } from "../../lib/types";

export default function Register() {
  const toast = useToast();
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("employee");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await authApi.register({ employee_id: employeeId, email, password, role });
      setRegisteredEmail(user.email);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (registeredEmail) {
    return (
      <AuthLayout title="Check your inbox" subtitle="One more step before you're in.">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center py-4 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-400/20">
            <MailCheck className="h-7 w-7 text-violet-300" />
          </div>
          <p className="text-sm text-muted">
            We've sent a verification link to
            <br />
            <span className="font-medium text-ink">{registeredEmail}</span>
          </p>
          <p className="mt-3 text-xs text-faint">
            Open the link to verify your account, then sign in below.
          </p>
          <Link to="/login" className="mt-6 w-full">
            <Button variant="secondary" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join your team on Dayflow.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Employee ID"
          name="employee_id"
          placeholder="EMP-014"
          icon={<IdCard className="h-4 w-4" />}
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          icon={<Lock className="h-4 w-4" />}
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
          <option value="employee">Employee</option>
          <option value="admin">Admin / HR Officer</option>
        </Select>
        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Create account
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-violet-300 hover:text-violet-200">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
