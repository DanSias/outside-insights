// app/routes/teams.$slug.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

import Layout from "~/components/Layout";
import TeamModal from "~/components/TeamModal";
import { getTeamBySlug } from "~/models/team.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const { slug } = params;

  if (!slug || typeof slug !== "string") {
    throw new Response("Invalid team slug", { status: 404 });
  }

  const team = await getTeamBySlug(slug);
  if (!team) {
    throw new Response("Team not found", { status: 404 });
  }

  const isMember = team.members.some((m) => m.userId === userId);
  if (!isMember) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const isManager = team.members.some(
    (m) => m.userId === userId && (m.role === "OWNER" || m.role === "ADMIN"),
  );

  const pendingMembers = team.members.filter((m) => m.role === "PENDING");
  const isOwner = team.members.some(
    (m) => m.userId === userId && m.role === "OWNER",
  );

  return json({ team, isOwner, isManager, pendingMembers, userId });
};

export default function TeamDetailPage() {
  interface MemberActionResponse {
    success: boolean;
    message?: string;
  }

  const { team, isOwner, isManager, pendingMembers, userId } =
    useLoaderData<typeof loader>();

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const fetcher = useFetcher<MemberActionResponse>();

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.message || "Member updated");
      setInviteEmail("");
    }
  }, [fetcher.data]);

  const userRole = team.members.find((m) => m.userId === userId)?.role;

  return (
    <Layout pageTitle={team.name}>
      <div className="mx-auto max-w-4xl p-6">
        {team.logoUrl && (
          <img
            src={team.logoUrl}
            alt={`${team.name} logo`}
            className="mb-4 h-16 w-auto"
          />
        )}

        <h1 className="mb-2 text-3xl font-bold">{team.name}</h1>

        {team.description && (
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            {team.description}
          </p>
        )}

        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Created on {new Date(team.createdAt).toLocaleDateString()}
        </p>

        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            {isOwner && (
              <button
                onClick={() => setEditModalOpen(true)}
                className="rounded bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
              >
                Edit Team
              </button>
            )}

            {!isOwner && userRole !== "PENDING" && (
              <fetcher.Form
                method="post"
                action={`/teams/${team.slug}/members`}
              >
                <input type="hidden" name="_action" value="leaveTeam" />
                <button
                  type="submit"
                  className="rounded bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
                >
                  Leave Team
                </button>
              </fetcher.Form>
            )}
          </div>

          {isManager && (
            <fetcher.Form
              method="post"
              action={`/teams/${team.slug}/members`}
              className="flex gap-2"
            >
              <input type="hidden" name="_action" value="inviteMember" />
              <input
                type="email"
                name="email"
                placeholder="Invite by email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-64 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
              <button className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600">
                Invite
              </button>
            </fetcher.Form>
          )}
        </div>

        {/* Members List */}
        <div className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">Members</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {team.members.map((member) => {
              const isSelf = member.userId === userId;
              const canManage = isManager && !isSelf && member.role !== "OWNER";
              const canTransfer = isOwner && member.role !== "OWNER";

              return (
                <li
                  key={member.userId}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {member.user.name ?? member.user.email}
                      {isSelf && (
                        <span className="ml-2 text-sm text-gray-400">
                          (you)
                        </span>
                      )}
                    </div>
                    <div className="text-sm capitalize text-gray-500 dark:text-gray-400">
                      {member.role.toLowerCase()}
                    </div>
                  </div>

                  {(canManage || canTransfer) && (
                    <div className="flex gap-2">
                      {canManage && (
                        <>
                          <fetcher.Form
                            method="post"
                            action={`/teams/${team.slug}/members`}
                          >
                            <input
                              type="hidden"
                              name="_action"
                              value="updateRole"
                            />
                            <input
                              type="hidden"
                              name="userId"
                              value={member.userId}
                            />
                            <input
                              type="hidden"
                              name="newRole"
                              value={
                                member.role === "ADMIN" ? "MEMBER" : "ADMIN"
                              }
                            />
                            <button className="btn-xs rounded bg-blue-500 p-1 text-white">
                              {member.role === "ADMIN"
                                ? "Demote to Member"
                                : "Promote to Admin"}
                            </button>
                          </fetcher.Form>
                          <fetcher.Form
                            method="post"
                            action={`/teams/${team.slug}/members`}
                          >
                            <input
                              type="hidden"
                              name="_action"
                              value="removeMember"
                            />
                            <input
                              type="hidden"
                              name="userId"
                              value={member.userId}
                            />
                            <button className="btn-xs rounded bg-red-500 p-1 text-white">
                              Remove
                            </button>
                          </fetcher.Form>
                        </>
                      )}
                      {canTransfer && (
                        <fetcher.Form
                          method="post"
                          action={`/teams/${team.slug}/members`}
                        >
                          <input
                            type="hidden"
                            name="_action"
                            value="transferOwnership"
                          />
                          <input
                            type="hidden"
                            name="userId"
                            value={member.userId}
                          />
                          <button className="btn-xs rounded bg-amber-600 p-1 text-white">
                            Transfer Ownership
                          </button>
                        </fetcher.Form>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Pending Requests */}
        {isManager && pendingMembers.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-lg font-semibold">
              Pending Join Requests
            </h2>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingMembers.map((member) => (
                <li
                  key={member.userId}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {member.user.name || member.user.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.user.email}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <fetcher.Form
                      method="post"
                      action={`/teams/${team.slug}/members`}
                    >
                      <input
                        type="hidden"
                        name="_action"
                        value="approveMember"
                      />
                      <input
                        type="hidden"
                        name="userId"
                        value={member.userId}
                      />
                      <button className="btn-xs rounded bg-green-500 p-1 text-white">
                        Approve
                      </button>
                    </fetcher.Form>
                    <fetcher.Form
                      method="post"
                      action={`/teams/${team.slug}/members`}
                    >
                      <input
                        type="hidden"
                        name="_action"
                        value="rejectMember"
                      />
                      <input
                        type="hidden"
                        name="userId"
                        value={member.userId}
                      />
                      <button className="btn-xs rounded bg-red-500 p-1 text-white">
                        Reject
                      </button>
                    </fetcher.Form>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <TeamModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        isEditing={true}
        actionUrl={`/teams/${team.slug}/edit`}
        initialValues={{
          name: team.name,
          slug: team.slug,
          description: team.description ?? "",
          logoUrl: team.logoUrl ?? "",
          isPersonal: team.isPersonal,
        }}
      />
    </Layout>
  );
}
