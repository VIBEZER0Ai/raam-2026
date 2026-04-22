"use client";

import { useState, useTransition } from "react";
import {
  createCrewMember,
  deactivateCrewMember,
  updateCrewMember,
  type CrewRole,
  type NewCrew,
  type CrewPatch,
} from "@/app/actions/crew";
import type { DbCrewMember } from "@/lib/db/queries";
import { Card, CardBody, CardHead } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: { value: CrewRole; label: string; color: string }[] = [
  { value: "crew_chief", label: "Crew Chief", color: "#fc4c02" },
  { value: "cc_operator", label: "C&C Operator", color: "#f59e0b" },
  { value: "follow_driver", label: "Follow Driver", color: "#34d399" },
  { value: "shuttle_driver", label: "Shuttle Driver", color: "#60a5fa" },
  { value: "rv_crew", label: "RV Crew", color: "#818cf8" },
  { value: "media", label: "Media", color: "#ec4899" },
  { value: "rider", label: "Rider", color: "#fafafa" },
  { value: "observer", label: "Observer / Read-only", color: "#71717a" },
];

export interface CrewEditorProps {
  crew: DbCrewMember[];
}

export function CrewEditor({ crew }: CrewEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-3.5">
      <Card>
        <CardHead
          left={`Roster editor · ${crew.length} members`}
          right={
            <button
              type="button"
              onClick={() => setAdding((a) => !a)}
              className="rounded-lg bg-[color:var(--strava-orange)] px-3 py-1.5 text-[11px] font-extrabold text-white"
            >
              {adding ? "Cancel" : "+ Add crew"}
            </button>
          }
        />
        {adding && <AddForm onDone={() => setAdding(false)} />}
      </Card>

      <div className="flex flex-col gap-2.5">
        {crew.map((m) => (
          <CrewRow
            key={m.id}
            member={m}
            editing={editingId === m.id}
            onEdit={() =>
              setEditingId(editingId === m.id ? null : m.id)
            }
          />
        ))}
      </div>
    </div>
  );
}

function CrewRow({
  member,
  editing,
  onEdit,
}: {
  member: DbCrewMember;
  editing: boolean;
  onEdit: () => void;
}) {
  const roleMeta = ROLE_OPTIONS.find((r) => r.value === member.role);
  return (
    <Card>
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3"
        onClick={onEdit}
      >
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold text-[#0a0a0a]"
          style={{ background: member.color ?? roleMeta?.color ?? "#71717a" }}
        >
          {member.initials ?? initialsFrom(member.full_name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-[color:var(--fg-1)]">
              {member.full_name}
            </span>
            <Pill kind={member.active ? "ON DUTY" : "OFF"}>
              {member.active ? "ACTIVE" : "INACTIVE"}
            </Pill>
          </div>
          <div className="mt-0.5 text-[11px] text-[color:var(--fg-3)]">
            {member.title ?? roleMeta?.label ?? member.role}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-[color:var(--fg-4)]">
            {[member.email, member.phone, member.emergency_contact]
              .filter(Boolean)
              .join(" · ") || "no contact yet"}
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--fg-4)]">
          {editing ? "Close" : "Edit"}
        </span>
      </div>
      {editing && <EditForm member={member} onClose={onEdit} />}
    </Card>
  );
}

function initialsFrom(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

function AddForm({ onDone }: { onDone: () => void }) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<NewCrew>({
    full_name: "",
    role: "follow_driver",
  });
  const [err, setErr] = useState<string | null>(null);
  const submit = () =>
    startTransition(async () => {
      setErr(null);
      const res = await createCrewMember(form);
      if (res.ok) {
        onDone();
      } else setErr(res.error);
    });
  return (
    <CardBody className="flex flex-col gap-2.5 border-t border-[color:var(--border)]">
      <Field label="Name *">
        <input
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="Role *">
        <RoleSelect
          value={form.role}
          onChange={(role) => setForm({ ...form, role })}
        />
      </Field>
      <Field label="Title / blurb">
        <input
          value={form.title ?? ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputCls}
        />
      </Field>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Field label="Email">
          <input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            value={form.phone ?? ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Emergency contact">
        <input
          value={form.emergency_contact ?? ""}
          onChange={(e) =>
            setForm({ ...form, emergency_contact: e.target.value })
          }
          className={inputCls}
        />
      </Field>
      {err && (
        <div className="rounded-lg border border-red-900/50 bg-red-500/10 p-2 text-[12px] text-red-300">
          {err}
        </div>
      )}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={submit}
          disabled={pending || !form.full_name.trim()}
          className={cn(
            "rounded-lg bg-[color:var(--strava-orange)] px-4 py-2 text-[13px] font-bold text-white",
            (pending || !form.full_name.trim()) && "opacity-50",
          )}
        >
          {pending ? "Adding…" : "Add to roster"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-[color:var(--border)] bg-transparent px-4 py-2 text-[13px] font-bold text-[color:var(--fg-3)]"
        >
          Cancel
        </button>
      </div>
    </CardBody>
  );
}

function EditForm({
  member,
  onClose,
}: {
  member: DbCrewMember;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<CrewPatch>({
    id: member.id,
    full_name: member.full_name,
    role: member.role,
    title: member.title,
    initials: member.initials,
    color: member.color,
    phone: member.phone,
    email: member.email,
    emergency_contact: member.emergency_contact,
  });
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = () =>
    startTransition(async () => {
      setErr(null);
      setSaved(false);
      const res = await updateCrewMember(form);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } else setErr(res.error);
    });

  const deactivate = () =>
    startTransition(async () => {
      await deactivateCrewMember(member.id);
      onClose();
    });

  return (
    <CardBody className="flex flex-col gap-2.5 border-t border-[color:var(--border)]">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Field label="Full name">
          <input
            value={form.full_name ?? ""}
            onChange={(e) =>
              setForm({ ...form, full_name: e.target.value })
            }
            className={inputCls}
          />
        </Field>
        <Field label="Initials">
          <input
            value={form.initials ?? ""}
            maxLength={3}
            onChange={(e) =>
              setForm({ ...form, initials: e.target.value.toUpperCase() })
            }
            className={cn(inputCls, "uppercase")}
          />
        </Field>
      </div>
      <Field label="Role">
        <RoleSelect
          value={form.role ?? "follow_driver"}
          onChange={(role) => setForm({ ...form, role })}
        />
      </Field>
      <Field label="Title / blurb">
        <input
          value={form.title ?? ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputCls}
        />
      </Field>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Field label="Email">
          <input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            value={form.phone ?? ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Emergency contact">
        <input
          value={form.emergency_contact ?? ""}
          onChange={(e) =>
            setForm({ ...form, emergency_contact: e.target.value })
          }
          className={inputCls}
        />
      </Field>
      <Field label="Avatar color (hex)">
        <input
          value={form.color ?? ""}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
          placeholder="#34d399"
          className={cn(inputCls, "font-mono")}
        />
      </Field>

      {(member.role === "rider" || member.role === "crew_chief") && (
        <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[color:var(--fg-4)]">
            Whoop
          </div>
          <div className="mt-1 flex items-center gap-2.5">
            <a
              href={`/api/whoop/connect?crew_member_id=${member.id}`}
              className="rounded-lg bg-[#00d6a3] px-3 py-1.5 text-[11px] font-extrabold text-[#0a1c15]"
            >
              Connect Whoop →
            </a>
            <span className="text-[11px] text-[color:var(--fg-4)]">
              pulls recovery + sleep every 30 min
            </span>
          </div>
        </div>
      )}

      {err && (
        <div className="rounded-lg border border-red-900/50 bg-red-500/10 p-2 text-[12px] text-red-300">
          {err}
        </div>
      )}
      {saved && (
        <div className="rounded-lg border border-emerald-900/50 bg-emerald-500/10 p-2 text-[12px] text-emerald-300">
          Saved.
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className={cn(
            "rounded-lg bg-[color:var(--strava-orange)] px-4 py-2 text-[13px] font-bold text-white",
            pending && "opacity-50",
          )}
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[color:var(--border)] bg-transparent px-4 py-2 text-[13px] font-bold text-[color:var(--fg-3)]"
        >
          Close
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={deactivate}
          disabled={pending}
          className="rounded-lg border border-red-900/50 bg-transparent px-3 py-2 text-[11px] font-bold text-red-400 hover:bg-red-500/10"
        >
          Deactivate
        </button>
      </div>
    </CardBody>
  );
}

function RoleSelect({
  value,
  onChange,
}: {
  value: CrewRole;
  onChange: (v: CrewRole) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CrewRole)}
      className={inputCls}
    >
      {ROLE_OPTIONS.map((r) => (
        <option key={r.value} value={r.value}>
          {r.label}
        </option>
      ))}
    </select>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[color:var(--fg-4)]">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-[13px] text-[color:var(--fg)] outline-none focus:border-[color:var(--strava-orange)]";
