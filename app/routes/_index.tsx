// app/routes/_index.tsx
import type { LoaderFunction } from "@remix-run/node";
import { data, MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import Layout from "~/components/Layout";
import { useOptionalUser } from "~/utils";

export const loader: LoaderFunction = async () => {
  return data({});
};

export const meta: MetaFunction = () => [
  { title: "Outside Insights | AI-Powered Workflows for Every Team" },
  {
    name: "description",
    content:
      "Discover Outside Insights — a platform for building and sharing AI-enhanced workflows that boost productivity, creativity, and collaboration across your organization.",
  },
];

export default function Index() {
  const user = useOptionalUser();

  return (
    <Layout user={user}>
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="mb-3 text-4xl font-extrabold text-gray-900">
          Outside Insights
        </h1>
        <h2 className="mb-6 text-xl text-gray-600">
          Turn ideas into outcomes with AI-powered support.
        </h2>

        <p className="mb-4 text-gray-700">
          Outside Insights helps you go from concept to execution by combining
          structured AI workflows and developer-friendly tooling. Whether
          you&apos;re leading a team or coding solo, our platform gives you the
          clarity and speed to move forward confidently.
        </p>

        <p className="mb-6 text-gray-700">
          Collaborate across teams, save AI conversations for reference, and
          generate powerful insights tailored to your business or technical
          needs — all in one place.
        </p>

        <ul className="mb-8 list-inside list-disc space-y-1 text-left text-gray-800">
          <li>Create and reuse custom AI workflows</li>
          <li>Save and share project-specific insights</li>
          <li>Collaborate with teammates securely</li>
          <li>Connect with multiple LLMs (OpenAI, Claude, Gemini)</li>
          <li>Developer tools for structured prompt building</li>
        </ul>

        <div className="flex justify-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              reloadDocument
              className="rounded-md bg-indigo-600 px-6 py-2 text-white transition hover:bg-indigo-700"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/join"
                reloadDocument
                className="rounded-md bg-indigo-600 px-6 py-2 text-white transition hover:bg-indigo-700"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                reloadDocument
                className="rounded-md border border-indigo-600 px-6 py-2 text-indigo-600 transition hover:bg-indigo-50"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
