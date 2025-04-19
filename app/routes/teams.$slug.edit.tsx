import { Role } from "@prisma/client";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";

import { prisma } from "~/db.server";
import { getTeamBySlug } from "~/models/team.server";
import { requireUserId } from "~/session.server";

const EditTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase and URL-friendly",
    ),
  description: z.string().optional().or(z.literal("")),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isPersonal: z.string().optional(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const slug = params.slug;
  if (!slug) throw new Response("Missing slug", { status: 400 });

  const team = await getTeamBySlug(slug);
  if (!team) throw new Response("Team not found", { status: 404 });

  const userMember = team.members.find((m) => m.userId === userId);
  if (!userMember || userMember.role !== Role.OWNER) {
    throw new Response("Not authorized", { status: 403 });
  }

  const formData = await request.formData();
  const raw = Object.fromEntries(formData);
  console.log("Raw form submission:", raw);
  const result = EditTeamSchema.safeParse(raw);

  if (!result.success) {
    const errors = Object.fromEntries(
      result.error.errors.map((e) => [e.path[0], e.message]),
    );
    return json({ errors }, { status: 400 });
  }

  const { name, slug: newSlug, description, logoUrl, isPersonal } = result.data;

  const existingSlug = await prisma.team.findFirst({
    where: {
      slug: newSlug,
      NOT: { id: team.id },
    },
  });

  if (existingSlug) {
    return json(
      { errors: { slug: "Another team already uses this slug." } },
      { status: 400 },
    );
  }

  await prisma.team.update({
    where: { id: team.id },
    data: {
      name,
      slug: newSlug,
      description: description || null,
      logoUrl: logoUrl || null,
      isPersonal: !!isPersonal,
    },
  });

  return json({ success: true, redirectTo: `/teams/${newSlug}` });
}
