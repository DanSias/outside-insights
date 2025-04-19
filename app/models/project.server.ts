import { prisma } from "~/db.server";

export function getProjectsByTeam(teamId: string) {
  return prisma.project.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
  });
}

export function getProjectById(id: string) {
  return prisma.project.findUnique({ where: { id } });
}

export function createProject({
  name,
  description,
  teamId,
  creatorId,
}: {
  name: string;
  description?: string;
  teamId: string;
  creatorId: string;
}) {
  return prisma.project.create({
    data: {
      name,
      description,
      teamId,
      creatorId,
    },
  });
}

export function updateProject(
  id: string,
  data: { name?: string; description?: string },
) {
  return prisma.project.update({
    where: { id },
    data,
  });
}

export function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}
