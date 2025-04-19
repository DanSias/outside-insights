// app/models/team.server.ts
import { prisma } from "~/db.server";

export function getTeamsForUser(userId: string) {
  return prisma.team.findMany({
    where: {
      members: {
        some: {
          userId,
          NOT: { role: "PENDING" },
        },
      },
    },
    include: {
      members: {
        select: {
          userId: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getAllTeamsWithMembers(currentUserId: string) {
  return prisma.team.findMany({
    where: {
      OR: [
        { isPersonal: false },
        {
          isPersonal: true,
          members: {
            some: {
              userId: currentUserId,
              role: "OWNER", // only show your own personal team
            },
          },
        },
      ],
    },
    include: {
      members: {
        select: {
          userId: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export function getTeamById(id: string) {
  return prisma.team.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });
}

export function getTeamBySlug(slug: string) {
  return prisma.team.findUnique({
    where: { slug },
    include: {
      members: {
        select: {
          userId: true,
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

export async function createTeam({
  name,
  slug,
  description,
  logoUrl,
  isPersonal,
  userId,
}: {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  isPersonal?: boolean;
  userId: string;
}) {
  // Ensure slug is unique
  const existing = await prisma.team.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("Slug already in use");
  }

  return prisma.team.create({
    data: {
      name,
      slug,
      description,
      logoUrl,
      isPersonal,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });
}

export function updateTeam(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    logoUrl?: string;
    isPersonal?: boolean;
  },
) {
  return prisma.team.update({
    where: { id },
    data,
  });
}

export function deleteTeam(id: string) {
  return prisma.team.delete({ where: { id } });
}

export async function assertUserIsOnTeam(userId: string, teamId: string) {
  const member = await prisma.teamMember.findFirst({
    where: { userId, teamId },
  });
  if (!member) {
    throw new Response("Unauthorized", { status: 403 });
  }
  return member;
}
