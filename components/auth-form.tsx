"use client";
import { useState, useTransition, type FormEvent } from "react";
import { ArrowRight, MailCheck } from "lucide-react";
import { signIn, signUp } from "@/app/actions";
import { nameLimit, passwordLimits } from "@/lib/auth-input";
import type { Language } from "@/lib/data";
import { copy } from "@/lib/i18n";

export default function AuthForm({
  language,
  onSignedIn,
}: {
  language: Language;
  onSignedIn: () => void;
}) {
  const t = copy[language];
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");
  const [confirmSent, setConfirmSent] = useState(false);
  const [busy, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    // Calling the action manually (not via the form action prop) keeps the
    // typed values in place when sign-in fails.
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setError("");
    startTransition(async () => {
      try {
        const result = await (mode === "signIn" ? signIn(data) : signUp(data));
        if (!result.ok) return setError(t.authErrors[result.error]);
        if (result.status === "confirmEmail") return setConfirmSent(true);
        onSignedIn();
      } catch {
        setError(t.authErrors.failed);
      }
    });
  }

  if (confirmSent)
    return (
      <div className="confirmation">
        <span className="request-symbol">
          <MailCheck size={32} />
        </span>
        <h2>{t.signUp}</h2>
        <p role="status">{t.checkEmail}</p>
        <button
          className="secondary full"
          onClick={() => {
            setConfirmSent(false);
            setMode("signIn");
          }}
        >
          {t.signIn}
        </button>
      </div>
    );

  return (
    <form className="post-form auth-form" onSubmit={submit}>
      <span className="eyebrow">MACHMASO</span>
      <h2>{mode === "signIn" ? t.authTitle : t.signUp}</h2>
      <p className="muted form-intro">{t.authIntro}</p>
      {mode === "signUp" && (
        <label>
          {t.displayName}
          <input
            name="name"
            required
            maxLength={nameLimit}
            autoComplete="given-name"
          />
          <span className="field-hint">{t.displayNameHint}</span>
        </label>
      )}
      <label>
        {t.email}
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
        />
      </label>
      <label>
        {t.password}
        <input
          name="password"
          type="password"
          required
          minLength={mode === "signUp" ? passwordLimits.min : undefined}
          maxLength={passwordLimits.max}
          autoComplete={mode === "signIn" ? "current-password" : "new-password"}
        />
        {mode === "signUp" && (
          <span className="field-hint">{t.passwordHint}</span>
        )}
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="primary full auth-submit" disabled={busy}>
        {busy ? t.working : mode === "signIn" ? t.signIn : t.signUp}
        {!busy && <ArrowRight size={18} />}
      </button>
      <p className="auth-switch">
        {mode === "signIn" ? t.noAccount : t.haveAccount}{" "}
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setError("");
            setMode(mode === "signIn" ? "signUp" : "signIn");
          }}
        >
          {mode === "signIn" ? t.signUp : t.signIn}
        </button>
      </p>
    </form>
  );
}
