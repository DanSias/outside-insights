// app/routes/teams.$slug.delete.tsx
import { Role } from "@prisma/client";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { prisma } from "~/db.server";
import { getTeamBySlug } from "~/models/team.server";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const slug = params.slug;
  if (!slug) throw new Response("Missing team slug", { status: 400 });

  const team = await getTeamBySlug(slug);
  if (!team) throw new Response("Team not found", { status: 404 });

  const userMember = team.members.find((m) => m.userId === userId);
  if (
    !userMember ||
    (userMember.role !== Role.OWNER && userMember.role !== Role.ADMIN)
  ) {
    throw new Response("Unauthorized", { status: 403 });
  }

  await prisma.team.delete({ where: { id: team.id } });

  return json({ success: true });
}
