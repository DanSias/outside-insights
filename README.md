# Outside Insights

**Outside Insights** is a full-stack, team-based collaboration platform built with Remix, Prisma, and Tailwind CSS. It supports multi-user teams, role-based permissions, and streamlined UI patterns for managing users, access, and soon—project-level AI workflows.

## 🔧 Tech Stack

- **Frontend:** Remix (App Router), React, Tailwind CSS
- **Backend:** Prisma ORM, PostgreSQL
- **Auth:** Session-based (with future OAuth support planned)
- **UI Libraries:** Headless UI, Heroicons
- **Tooling:** Zod, react-hot-toast, TypeScript

---

## ✅ Current Features

### 🧑‍🤝‍🧑 Teams & Members

- Create, edit, and delete teams (via modal-based forms)
- Clean URLs via slug (e.g. `/teams/fighting-mongooses`)
- Mark teams as **personal** for solo workspaces
- Invite users to a team by email
- Request to join any non-personal team
- View and manage pending join requests
- Promote/demote between `ADMIN` and `MEMBER`
- Transfer ownership (owner → another member)
- Remove users or allow users to leave voluntarily
- Role-based permission logic (`OWNER`, `ADMIN`, `MEMBER`, `PENDING`)

### 🔒 Secure Routing

- Members can only access teams they belong to
- Role-based UI controls and server-side protection
- Toast notifications for major actions

---

## 🧱 Project Roadmap

Next up is support for **projects** within each team, including:

- Create & manage projects under a team
- Assign project visibility to team members
- Associate prompts, conversations, and AI tooling with a project
- Structured project settings (e.g., tone, tech stack, model defaults)
- Integration with prompt templates and conversation sessions

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/outside-insights.git
cd outside-insights
npm install
cp .env.example .env # Add your DATABASE_URL
npx prisma generate
npx prisma migrate dev
npm run dev
```
