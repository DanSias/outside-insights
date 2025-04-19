import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.teamMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.team.deleteMany();
  await prisma.note.deleteMany();
  await prisma.userSetting.deleteMany();
  // await prisma.session.deleteMany();
  await prisma.prompt.deleteMany();
  await prisma.projectSettings.deleteMany();
  await prisma.account.deleteMany();
  await prisma.password.deleteMany();
  await prisma.user.deleteMany();

  // 🔐 Create users with hashed passwords
  const createUser = async (email: string, name: string, password: string) => {
    const hash = await bcrypt.hash(password, 10);
    return prisma.user.create({
      data: {
        email,
        name,
        password: {
          create: { hash },
        },
      },
    });
  };

  const alice = await createUser("alice@example.com", "Alice", "password1");
  const bob = await createUser("bob@example.com", "Bob", "password2");
  const charlie = await createUser(
    "charlie@example.com",
    "Charlie",
    "password3",
  );
  const dana = await createUser("dana@example.com", "Dana", "password4");

  // 🧠 Create teams
  const team1 = await prisma.team.create({
    data: {
      name: "Fighting Mongooses",
      slug: "fighting-mongooses",
      description: "Elite dev team led by Alice",
      isPersonal: false,
    },
  });

  const team2 = await prisma.team.create({
    data: {
      name: "Beta Builders",
      slug: "beta-builders",
      description: "Open-source collaborative team",
      isPersonal: false,
    },
  });

  const personalTeam = await prisma.team.create({
    data: {
      name: "Alice's Sandbox",
      slug: "alice-sandbox",
      isPersonal: true,
    },
  });

  // 👥 Add team members with roles
  await prisma.teamMember.createMany({
    data: [
      { userId: alice.id, teamId: team1.id, role: Role.OWNER },
      { userId: bob.id, teamId: team1.id, role: Role.MEMBER },
      { userId: charlie.id, teamId: team1.id, role: Role.PENDING },

      { userId: bob.id, teamId: team2.id, role: Role.OWNER },
      { userId: dana.id, teamId: team2.id, role: Role.ADMIN },
      { userId: alice.id, teamId: team2.id, role: Role.PENDING },

      { userId: alice.id, teamId: personalTeam.id, role: Role.OWNER },
    ],
  });

  // 🧪 Create sample projects
  await prisma.project.create({
    data: {
      name: "AI Assistant MVP",
      description: "Initial version of the assistant",
      teamId: team1.id,
      creatorId: alice.id,
    },
  });

  await prisma.project.create({
    data: {
      name: "Prompt Pack Library",
      description: "Reusable prompt templates",
      teamId: team2.id,
      creatorId: bob.id,
    },
  });

  console.log("✅ Database seeded successfully.");
}

seed()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
