"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import {
  Alert,
  Button,
  CheckboxField,
  FormField,
  SelectField,
} from "@/components/form-field";
import { api, ApiError } from "@/lib/api";
import type { SignupResponse } from "@/lib/auth-types";

type SignupVariant = "personal" | "business_customer" | "business_lsp";

export default function SignupPage() {
  const router = useRouter();
  const [variant, setVariant] = useState<SignupVariant>("business_lsp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [tos, setTos] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [baaAck, setBaaAck] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload =
      variant === "personal"
        ? {
            account_type: "personal" as const,
            email,
            password,
            consent: { tos, privacy },
          }
        : {
            account_type: "business" as const,
            business_type:
              variant === "business_lsp"
                ? ("lsp" as const)
                : ("customer" as const),
            email,
            password,
            name: orgName,
            timezone,
            consent: {
              tos,
              privacy,
              ...(variant === "business_lsp" ? { baa_ack: baaAck } : {}),
            },
          };

    try {
      const result = await api<SignupResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (result.email_verification_required) {
        router.push(
          `/signup/success?email=${encodeURIComponent(email)}`,
        );
        return;
      }

      router.push("/login");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const isBusiness = variant !== "personal";

  return (
    <AuthShell
      title="Create account"
      subtitle="Join Leo Connexio"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-400 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}

        <SelectField
          label="Account type"
          name="variant"
          value={variant}
          onChange={(v) => setVariant(v as SignupVariant)}
          options={[
            { value: "personal", label: "Personal — interpreter" },
            { value: "business_customer", label: "Business — customer org" },
            { value: "business_lsp", label: "Business — language service provider" },
          ]}
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="At least 8 characters."
        />

        {isBusiness ? (
          <>
            <FormField
              label="Organization name"
              name="name"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
            <FormField
              label="Timezone"
              name="timezone"
              required
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              hint="IANA timezone, e.g. America/New_York"
            />
          </>
        ) : null}

        <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
          <CheckboxField
            label="I agree to the Terms of Service"
            checked={tos}
            onChange={setTos}
          />
          <CheckboxField
            label="I agree to the Privacy Policy"
            checked={privacy}
            onChange={setPrivacy}
          />
          {variant === "business_lsp" ? (
            <CheckboxField
              label="I acknowledge the Business Associate Agreement"
              checked={baaAck}
              onChange={setBaaAck}
            />
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={
            loading ||
            !tos ||
            !privacy ||
            (variant === "business_lsp" && !baaAck) ||
            (isBusiness && !orgName.trim())
          }
        >
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
