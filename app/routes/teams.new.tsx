// app/routes/teams+/new.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";

import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

const CreateTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase and URL-friendly",
    ),
  description: z.string().optional(),
  logoUrl: z
    .string()
    .url("Logo URL must be a valid URL")
    .optional()
    .or(z.literal("")), // Allow empty string from input
  isPersonal: z.union([z.literal("on"), z.literal("true")]).optional(), // Checkbox values
});

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const raw = Object.fromEntries(formData);

  const parsed = CreateTeamSchema.safeParse(raw);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    return json({ errors }, { status: 400 });
  }

  const { name, slug, description, logoUrl, isPersonal } = parsed.data;

  const existing = await prisma.team.findUnique({ where: { slug } });
  if (existing) {
    return json(
      { errors: { slug: ["A team with this slug already exists."] } },
      { status: 400 },
    );
  }

  await prisma.team.create({
    data: {
      name,
      slug,
      description: description || null,
      logoUrl: logoUrl || null,
      isPersonal: !!isPersonal,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });

  return json({ success: true, redirectTo: "/teams" });
}
