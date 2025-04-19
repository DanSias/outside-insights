import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import type { Role } from "@prisma/client";
import { Link, useFetcher } from "@remix-run/react";

interface TeamWithMembers {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  isPersonal: boolean;
  createdAt: string;
  members: {
    userId: string;
    role: Role;
  }[];
}

interface Props {
  team: TeamWithMembers;
  userId: string;
  onEdit: (team: TeamWithMembers) => void;
  onDelete: (team: TeamWithMembers) => void;
}

export default function TeamCard({ team, userId, onEdit, onDelete }: Props) {
  const fetcher = useFetcher();

  const userRole = team.members.find((m) => m.userId === userId)?.role ?? null;
  const isPending = userRole === "PENDING";
  const isManager = userRole === "OWNER" || userRole === "ADMIN";

  return (
    <li className="flex items-start justify-between gap-4 rounded border border-gray-300 bg-white px-4 py-3 shadow hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <Link to={`/teams/${team.slug}`} className="flex-1">
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {team.name}
          </div>
          {team.isPersonal && (
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-100">
              Personal
            </span>
          )}
          {isPending && (
            <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
              Pending
            </span>
          )}
        </div>

        {team.description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {team.description}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Slug:{" "}
          <code className="text-gray-500 dark:text-gray-400">{team.slug}</code>{" "}
          • Created on {new Date(team.createdAt).toLocaleDateString()}
        </p>
      </Link>

      {isManager && (
        <div className="relative flex flex-col items-end gap-2 whitespace-nowrap">
          <button
            type="button"
            onClick={() => onEdit(team)}
            className="group relative rounded p-1 text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
            aria-label="Edit team"
          >
            <PencilSquareIcon className="h-5 w-5" />
            <span className="absolute left-[-4rem] top-1/2 z-10 hidden -translate-y-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-md group-hover:block">
              Edit
            </span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(team)}
            className="group relative rounded p-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            aria-label="Delete team"
          >
            <TrashIcon className="h-5 w-5" />
            <span className="absolute left-[-4rem] top-1/2 z-10 hidden -translate-y-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-md group-hover:block">
              Delete
            </span>
          </button>
        </div>
      )}

      {!userRole && (
        <fetcher.Form method="post" action={`/teams/${team.slug}/members`}>
          <input type="hidden" name="_action" value="requestJoin" />
          <button
            type="submit"
            className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600"
          >
            Join Team
          </button>
        </fetcher.Form>
      )}
    </li>
  );
}
