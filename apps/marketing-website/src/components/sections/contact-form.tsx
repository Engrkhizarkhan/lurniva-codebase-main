"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button, Icon, Input, Select, Textarea } from "@lurniva/ui";

const roleOptions = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
  { value: "institute", label: "Institute or school" },
  { value: "org", label: "Organization" },
];

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roleOptions[0]!.value);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, message }),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="grid gap-3 rounded-xl border border-border-subtle bg-surface-card p-7 shadow-sm">
        <span className="flex items-center gap-2.5 font-display text-lg font-bold text-forest-700">
          <Icon name="check" size={20} />
          Message sent
        </span>
        <p className="m-0 text-[15px] leading-relaxed text-text-muted">
          Thanks — someone from the Lurniva team will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-xl border border-border-subtle bg-surface-card p-7 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Input
          label="Name"
          placeholder="Ayesha Khan"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@school.edu"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <Select
        label="I'm reaching out as"
        options={roleOptions}
        value={role}
        onChange={(event) => setRole(event.target.value)}
      />
      <Textarea
        label="Message"
        placeholder="What would you like to do with Lurniva?"
        rows={4}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        required
      />
      {status === "error" ? (
        <p className="m-0 text-sm text-error">
          Something went wrong — please try again, or email{" "}
          <a href="mailto:info@lurniva.com">info@lurniva.com</a> directly.
        </p>
      ) : null}
      <Button
        type="submit"
        variant="secondary"
        fullWidth
        iconAfter={<Icon name="arrow-right" size={18} />}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
