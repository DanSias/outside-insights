import { Role } from "@prisma/client";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { prisma } from "~/db.server";
import { getTeamBySlug } from "~/models/team.server";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const slug = params.slug;
  const formData = await request.formData();
  const actionType = formData.get("_action");

  if (!slug) throw new Response("Missing slug", { status: 400 });
  const team = await getTeamBySlug(slug);
  if (!team) throw new Response("Team not found", { status: 404 });

  const userMember = team.members.find((m) => m.userId === userId);
  const isOwner = userMember?.role === Role.OWNER;
  const isManager =
    userMember?.role === Role.OWNER || userMember?.role === Role.ADMIN;

  switch (actionType) {
    case "requestJoin": {
      const existing = team.members.find((m) => m.userId === userId);
      if (existing) {
        return json({
          success: false,
          message: "Already a member or pending.",
        });
      }
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId,
          role: Role.PENDING,
        },
      });
      return json({ success: true, message: "Request sent!" });
    }

    case "inviteMember": {
      if (!isManager) {
        return json(
          { success: false, message: "Unauthorized" },
          { status: 403 },
        );
      }

      const email = formData.get("email")?.toString();
      if (!email) {
        return json(
          { success: false, message: "Email is required" },
          { status: 400 },
        );
      }

      const invitedUser = await prisma.user.findUnique({ where: { email } });

      if (!invitedUser) {
        return json(
          { success: false, message: "User not found." },
          { status: 404 },
        );
      }

      const existing = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId: invitedUser.id,
          },
        },
      });

      if (existing) {
        return json(
          { success: false, message: "User is already a team member." },
          { status: 400 },
        );
      }

      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: invitedUser.id,
          role: "MEMBER",
        },
      });

      return json({ success: true, message: `Invited ${email} to the team.` });
    }

    case "removeMember": {
      if (!isManager) {
        return json(
          { success: false, message: "Unauthorized" },
          { status: 403 },
        );
      }

      const userIdToRemove = formData.get("userId")?.toString();
      if (!userIdToRemove) {
        return json(
          { success: false, message: "Missing user ID" },
          { status: 400 },
        );
      }

      // Prevent removing self or the owner
      const member = team.members.find((m) => m.userId === userIdToRemove);
      if (!member || member.role === "OWNER") {
        return json(
          { success: false, message: "Cannot remove this member" },
          { status: 403 },
        );
      }

      await prisma.teamMember.delete({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId: userIdToRemove,
          },
        },
      });

      return json({ success: true, message: "Member removed" });
    }

    case "approveMember": {
      if (!isManager) throw new Response("Unauthorized", { status: 403 });
      const pendingUserId = formData.get("userId")?.toString();
      if (!pendingUserId) throw new Response("Missing userId", { status: 400 });

      await prisma.teamMember.update({
        where: {
          teamId_userId: { teamId: team.id, userId: pendingUserId },
        },
        data: { role: "MEMBER" },
      });

      return json({ success: true });
    }

    case "rejectMember": {
      if (!isManager) throw new Response("Unauthorized", { status: 403 });
      const pendingUserId = formData.get("userId")?.toString();
      if (!pendingUserId) throw new Response("Missing userId", { status: 400 });

      await prisma.teamMember.delete({
        where: {
          teamId_userId: { teamId: team.id, userId: pendingUserId },
        },
      });

      return json({ success: true });
    }

    case "updateRole": {
      if (!isManager) throw new Response("Unauthorized", { status: 403 });

      const userIdToUpdate = formData.get("userId")?.toString();
      const newRole = formData.get("newRole")?.toString();

      if (!userIdToUpdate || !newRole) {
        return json(
          { success: false, message: "Missing fields" },
          { status: 400 },
        );
      }

      if (!["ADMIN", "MEMBER"].includes(newRole)) {
        return json(
          { success: false, message: "Invalid role" },
          { status: 400 },
        );
      }

      await prisma.teamMember.update({
        where: {
          teamId_userId: { teamId: team.id, userId: userIdToUpdate },
        },
        data: {
          role: newRole as Role,
        },
      });

      return json({
        success: true,
        message: `User role updated to ${newRole}`,
      });
    }

    case "transferOwnership": {
      if (!isOwner) {
        return json(
          {
            success: false,
            message: "Only the current owner can transfer ownership.",
          },
          { status: 403 },
        );
      }

      const newOwnerId = formData.get("userId")?.toString();
      if (!newOwnerId) {
        return json(
          { success: false, message: "Missing user ID." },
          { status: 400 },
        );
      }

      const newOwner = team.members.find((m) => m.userId === newOwnerId);
      if (!newOwner || newOwner.role === "OWNER") {
        return json(
          { success: false, message: "Invalid target user." },
          { status: 400 },
        );
      }

      await prisma.$transaction([
        prisma.teamMember.update({
          where: { teamId_userId: { teamId: team.id, userId: userId } },
          data: { role: "ADMIN" },
        }),
        prisma.teamMember.update({
          where: { teamId_userId: { teamId: team.id, userId: newOwnerId } },
          data: { role: "OWNER" },
        }),
      ]);

      return json({ success: true, message: "Ownership transferred." });
    }

    case "leaveTeam": {
      if (!userMember) {
        return json(
          { success: false, message: "You're not a member of this team." },
          { status: 403 },
        );
      }

      const role = team.members.find((m) => m.userId === userId)?.role;
      if (role === "OWNER") {
        return json(
          { success: false, message: "Owners cannot leave their own team." },
          { status: 403 },
        );
      }

      await prisma.teamMember.delete({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId,
          },
        },
      });

      return redirect("/teams");
    }

    default:
      return json(
        { success: false, message: "Invalid action" },
        { status: 400 },
      );
  }
}
