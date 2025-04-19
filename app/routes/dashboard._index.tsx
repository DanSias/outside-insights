import type { LoaderFunction } from "@remix-run/node";
import { data } from "@remix-run/node";
import { useMatches } from "@remix-run/react";

import Layout from "~/components/Layout";
import { useOptionalUser } from "~/utils";

export const loader: LoaderFunction = async () => {
  return data({});
};

export default function DashboardIndex() {
  const matches = useMatches();
  console.log("Matches:", matches);
  const user = useOptionalUser();
  console.log("User from useOptionalUser:", user);

  if (!user) {
    return <p className="text-red-500">User not found — please log in.</p>;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-bold">Welcome Back, {user.name}</h1>
        <p className="mb-6 text-gray-700">
          Here&apos;s your personalized dashboard. You can manage your teams and
          projects, access saved AI insights and prompts, and collaborate with
          your teams.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-2 text-xl font-semibold">Your Projects</h2>
            <p className="text-sm text-gray-600">
              Start something new or continue where you left off.
            </p>
            {/* Replace with real project list later */}
            <div className="mt-4">
              <button className="text-indigo-600 hover:underline">
                Create New Project →
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-2 text-xl font-semibold">
              Recent AI Conversations
            </h2>
            <p className="text-sm text-gray-600">
              Review your recent prompt history and insights.
            </p>
            {/* Placeholder for now */}
            <div className="mt-4 italic text-gray-400">
              No conversations yet.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
