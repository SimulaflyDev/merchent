"use client";

import { useState, useTransition } from "react";

import {
  updateMerchant,
  inviteMember,
  changeMemberRole,
  removeMember,
} from "@/lib/api/merchants";
import { isApiError } from "@/lib/api/errors";
import type { MerchantOut, MerchantMemberOut, MemberRole } from "@/lib/types/merchant";

interface Props {
  initialMerchant: MerchantOut;
  initialMembers: MerchantMemberOut[];
}

export default function SettingsClient({ initialMerchant, initialMembers }: Props) {
  const [merchant, setMerchant] = useState(initialMerchant);
  const [members, setMembers] = useState(initialMembers);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  // --- Profile form state ---
  const [displayName, setDisplayName] = useState(merchant.display_name);
  const [legalName, setLegalName] = useState(merchant.legal_name);
  const [supportEmail, setSupportEmail] = useState(merchant.support_email ?? "");
  const [supportPhone, setSupportPhone] = useState(merchant.support_phone ?? "");

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSaved(false);
    startTransition(async () => {
      try {
        const updated = await updateMerchant(merchant.id, {
          display_name: displayName,
          legal_name: legalName,
          support_email: supportEmail || undefined,
          support_phone: supportPhone || undefined,
        });
        setMerchant(updated);
        setProfileSaved(true);
      } catch (err) {
        setProfileError(isApiError(err) ? err.detail : "Failed to save");
      }
    });
  };

  // --- Invite state ---
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("staff");
  const [inviteError, setInviteError] = useState<string | null>(null);

  const submitInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    startTransition(async () => {
      try {
        const m = await inviteMember(merchant.id, { email: inviteEmail, role: inviteRole });
        setMembers((prev) => [...prev, m]);
        setInviteEmail("");
        setInviteRole("staff");
      } catch (err) {
        setInviteError(
          isApiError(err)
            ? err.status === 404
              ? "No user found with that email. Ask them to sign up first."
              : err.status === 409
                ? "That user is already a member."
                : err.detail
            : "Failed to invite",
        );
      }
    });
  };

  const updateRole = (userId: string, role: MemberRole) => {
    startTransition(async () => {
      try {
        const updated = await changeMemberRole(merchant.id, userId, role);
        setMembers((prev) => prev.map((m) => (m.user_id === userId ? updated : m)));
      } catch (err) {
        alert(isApiError(err) ? err.detail : "Failed to update role");
      }
    });
  };

  const removeRow = (userId: string) => {
    if (!confirm("Remove this member?")) return;
    startTransition(async () => {
      try {
        await removeMember(merchant.id, userId);
        setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      } catch (err) {
        alert(isApiError(err) ? err.detail : "Failed to remove");
      }
    });
  };

  return (
    <div className="p-6 space-y-8 max-w-3xl">
      {/* ── Profile section ── */}
      <section className="bg-white rounded-xl border border-[#E2E4E8] p-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Store profile</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <Field label="Display name" value={displayName} onChange={setDisplayName} required />
          <Field label="Legal name" value={legalName} onChange={setLegalName} required />
          <Field label="Support email" type="email" value={supportEmail} onChange={setSupportEmail} />
          <Field label="Support phone" value={supportPhone} onChange={setSupportPhone} />

          {profileError && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {profileError}
            </div>
          )}
          {profileSaved && (
            <div className="px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
              Saved.
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-[#0E9F88] text-white rounded-lg hover:bg-[#0B7A69] disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>

      {/* ── Team section ── */}
      <section className="bg-white rounded-xl border border-[#E2E4E8] p-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Team</h2>

        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b border-[#F1F3F5]">
            <tr>
              <th className="py-2">Member</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-[#F1F3F5]">
                <td className="py-3">{m.full_name ?? "—"}</td>
                <td>{m.email}</td>
                <td>
                  <select
                    value={m.role}
                    onChange={(e) => updateRole(m.user_id, e.target.value as MemberRole)}
                    disabled={pending}
                    className="border border-gray-200 rounded px-2 py-1"
                  >
                    <option value="owner">owner</option>
                    <option value="admin">admin</option>
                    <option value="staff">staff</option>
                  </select>
                </td>
                <td className="text-right">
                  <button
                    onClick={() => removeRow(m.user_id)}
                    disabled={pending}
                    className="text-red-500 hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <form onSubmit={submitInvite} className="mt-6 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as MemberRole)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="staff">staff</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-[#0E9F88] text-white rounded-lg hover:bg-[#0B7A69] disabled:opacity-50"
          >
            {pending ? "Inviting…" : "Invite"}
          </button>
        </form>
        {inviteError && (
          <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {inviteError}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E9F88]"
      />
    </div>
  );
}
