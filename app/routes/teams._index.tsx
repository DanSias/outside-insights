import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useState } from "react";

import Layout from "~/components/Layout";
import TeamCard from "~/components/TeamCard";
import TeamModal from "~/components/TeamModal";
import { getTeamsForUser, getAllTeamsWithMembers } from "~/models/team.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const [yourTeams, allTeams] = await Promise.all([
    getTeamsForUser(userId),
    getAllTeamsWithMembers(userId), // pass userId here
  ]);

  return json({ yourTeams, allTeams, userId });
};

export default function TeamsPage() {
  const { yourTeams, allTeams, userId } = useLoaderData<typeof loader>();
  const [viewAll, setViewAll] = useState(false);
  const teamsToShow = viewAll ? allTeams : yourTeams;

  // 🔧 Modal state
  const [isNewModalOpen, setNewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [teamBeingEdited, setTeamBeingEdited] = useState<
    (typeof teamsToShow)[0] | null
  >(null);

  // 🖊️ Open edit modal with team data
  function handleEditTeam(team: (typeof teamsToShow)[0]) {
    setTeamBeingEdited(team);
    setEditModalOpen(true);
  }

  const fetcher = useFetcher();

  function handleDeleteTeam(team: (typeof teamsToShow)[0]) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${team.name}"?`,
    );
    if (!confirmed) return;

    fetcher.submit(null, {
      method: "POST",
      action: `/teams/${team.slug}/delete`,
    });
  }

  return (
    <Layout pageTitle="Teams">
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {viewAll ? "All Teams" : "Your Teams"}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewAll((prev) => !prev)}
              className="text-sm font-medium text-amber-600 hover:underline"
            >
              {viewAll ? "View Your Teams" : "View All Teams"}
            </button>
            <button
              onClick={() => setNewModalOpen(true)}
              className="inline-block rounded bg-amber-500 px-4 py-2 font-semibold text-white hover:bg-amber-600"
            >
              + New Team
            </button>
          </div>
        </div>

        {teamsToShow.length === 0 ? (
          <p className="text-gray-600">
            You&apos;re not a member of any teams yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {teamsToShow.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                userId={userId}
                onEdit={handleEditTeam}
                onDelete={handleDeleteTeam}
              />
            ))}
          </ul>
        )}

        {/* ➕ Create team modal */}
        <TeamModal
          isOpen={isNewModalOpen}
          onClose={() => setNewModalOpen(false)}
          isEditing={false}
          actionUrl="/teams/new"
          initialValues={{
            name: "",
            slug: "",
            description: "",
            logoUrl: "",
            isPersonal: false,
          }}
        />

        {/* 🖊️ Edit team modal */}
        {teamBeingEdited && (
          <TeamModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setTeamBeingEdited(null);
            }}
            isEditing={true}
            actionUrl={`/teams/${teamBeingEdited.slug}/edit`}
            initialValues={{
              name: teamBeingEdited.name,
              slug: teamBeingEdited.slug,
              description: teamBeingEdited.description ?? "",
              logoUrl: teamBeingEdited.logoUrl ?? "",
              isPersonal: teamBeingEdited.isPersonal,
            }}
          />
        )}
      </div>
    </Layout>
  );
}
