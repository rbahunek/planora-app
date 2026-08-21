import { AUDIT_ACTIONS } from "../src/lib/auth/constants";
import { hashPassword } from "../src/lib/password";
import { prisma } from "../src/lib/prisma";

// ---------------------------------------------------------------------------
// Demo data definitions (deterministic)
// ---------------------------------------------------------------------------

type AccountStatus = "ACTIVE" | "INACTIVE";

const DEMO_USERS: {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: AccountStatus;
}[] = [
  {
    firstName: "Ana",
    lastName: "Kovač",
    email: "ana.kovac@example.com",
    role: "PROJECT_MANAGER",
    status: "ACTIVE",
  },
  {
    firstName: "Marko",
    lastName: "Horvat",
    email: "marko.horvat@example.com",
    role: "PROJECT_MANAGER",
    status: "ACTIVE",
  },
  {
    firstName: "Luka",
    lastName: "Marić",
    email: "luka.maric@example.com",
    role: "DEVELOPER",
    status: "ACTIVE",
  },
  {
    firstName: "Petra",
    lastName: "Novak",
    email: "petra.novak@example.com",
    role: "DEVELOPER",
    status: "ACTIVE",
  },
  {
    firstName: "Ivan",
    lastName: "Babić",
    email: "ivan.babic@example.com",
    role: "DEVELOPER",
    status: "ACTIVE",
  },
  {
    firstName: "Sara",
    lastName: "Jurić",
    email: "sara.juric@example.com",
    role: "DEVELOPER",
    status: "ACTIVE",
  },
  {
    firstName: "Mia",
    lastName: "Radić",
    email: "mia.radic@example.com",
    role: "TESTER",
    status: "ACTIVE",
  },
  {
    firstName: "Filip",
    lastName: "Šarić",
    email: "filip.saric@example.com",
    role: "TESTER",
    status: "ACTIVE",
  },
  {
    firstName: "Nikola",
    lastName: "Perić",
    email: "nikola.peric@example.com",
    role: "DEVELOPER",
    status: "INACTIVE",
  },
];

const LABELS: { name: string; color: string }[] = [
  { name: "Frontend", color: "#3B82F6" },
  { name: "Backend", color: "#8B5CF6" },
  { name: "Baza podataka", color: "#10B981" },
  { name: "Autentikacija", color: "#F59E0B" },
  { name: "UI/UX", color: "#EC4899" },
  { name: "Integracija", color: "#06B6D4" },
  { name: "Sigurnost", color: "#EF4444" },
  { name: "Testiranje", color: "#6366F1" },
  { name: "Dokumentacija", color: "#64748B" },
  { name: "Bug", color: "#DC2626" },
  { name: "Mobilni prikaz", color: "#14B8A6" },
  { name: "Izvještaji", color: "#7C3AED" },
];

const TEAMS: { name: string; description: string; members: string[] }[] = [
  {
    name: "Tim Inspekcija",
    description: "Razvoj aplikacije za inspekcije dječjih igrališta",
    members: [
      "ana.kovac@example.com",
      "luka.maric@example.com",
      "petra.novak@example.com",
      "mia.radic@example.com",
    ],
  },
  {
    name: "Tim Elektro",
    description: "Razvoj B2B web shopa za veleprodaju elektromaterijala",
    members: [
      "marko.horvat@example.com",
      "ivan.babic@example.com",
      "sara.juric@example.com",
      "filip.saric@example.com",
    ],
  },
  {
    name: "Tim Servis",
    description: "Razvoj aplikacije za administraciju servisnih djelatnosti",
    members: [
      "ana.kovac@example.com",
      "luka.maric@example.com",
      "ivan.babic@example.com",
      "filip.saric@example.com",
    ],
  },
  {
    name: "Tim Planora",
    description: "Razvoj aplikacije Planora",
    members: [
      "marko.horvat@example.com",
      "petra.novak@example.com",
      "sara.juric@example.com",
      "mia.radic@example.com",
    ],
  },
  {
    name: "QA tim",
    description: "Zajedničko testiranje svih projekata",
    members: ["mia.radic@example.com", "filip.saric@example.com"],
  },
];

const PROJECTS: {
  name: string;
  description: string;
  startDate: string;
  endDate: string | null;
  teams: string[];
}[] = [
  {
    name: "Projekt1",
    description:
      "Web aplikacija za upravljanje inspekcijama, pregledima i održavanjem dječjih igrališta.",
    startDate: "2026-06-01",
    endDate: null,
    teams: ["Tim Inspekcija", "QA tim"],
  },
  {
    name: "Projekt2",
    description: "B2B web shop za veleprodaju elektromaterijala.",
    startDate: "2026-05-15",
    endDate: null,
    teams: ["Tim Elektro", "QA tim"],
  },
  {
    name: "Projekt3",
    description:
      "Web aplikacija za administraciju servisnih djelatnosti, radne naloge, račune, naplatu, radne sate i utrošeni materijal.",
    startDate: "2026-03-01",
    endDate: "2026-09-30",
    teams: ["Tim Servis", "QA tim"],
  },
  {
    name: "Projekt4",
    description:
      "Planora – web aplikacija za upravljanje projektima, timovima, zadacima i evidencijom rada.",
    startDate: "2026-08-21",
    endDate: null,
    teams: ["Tim Planora", "QA tim"],
  },
];

type TaskDef = {
  name: string;
  status: string;
  priority: string;
  assignee: string;
  labels: string[];
};

const TASKS_BY_PROJECT: Record<string, TaskDef[]> = {
  Projekt1: [
    {
      name: "Izraditi registar dječjih igrališta",
      status: "DONE",
      priority: "HIGH",
      assignee: "luka.maric@example.com",
      labels: ["Backend", "Baza podataka"],
    },
    {
      name: "Implementirati unos inspekcijskog pregleda",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      assignee: "petra.novak@example.com",
      labels: ["Frontend", "Backend"],
    },
    {
      name: "Omogućiti evidenciju uočenih nepravilnosti",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assignee: "luka.maric@example.com",
      labels: ["Backend", "Baza podataka"],
    },
    {
      name: "Dodati fotografije oštećene opreme",
      status: "TODO",
      priority: "MEDIUM",
      assignee: "petra.novak@example.com",
      labels: ["Frontend", "Integracija"],
    },
    {
      name: "Izraditi raspored sljedećih pregleda",
      status: "TODO",
      priority: "HIGH",
      assignee: "luka.maric@example.com",
      labels: ["Backend"],
    },
    {
      name: "Implementirati filtriranje igrališta prema lokaciji",
      status: "IN_REVIEW",
      priority: "MEDIUM",
      assignee: "petra.novak@example.com",
      labels: ["Frontend"],
    },
    {
      name: "Izraditi izvještaj o sigurnosti igrališta",
      status: "TODO",
      priority: "MEDIUM",
      assignee: "luka.maric@example.com",
      labels: ["Izvještaji"],
    },
    {
      name: "Provesti testiranje obrasca za inspekciju",
      status: "TODO",
      priority: "HIGH",
      assignee: "mia.radic@example.com",
      labels: ["Testiranje"],
    },
  ],
  Projekt2: [
    {
      name: "Izraditi katalog proizvoda i kategorija",
      status: "DONE",
      priority: "HIGH",
      assignee: "ivan.babic@example.com",
      labels: ["Backend", "Baza podataka"],
    },
    {
      name: "Implementirati pretraživanje elektromaterijala",
      status: "IN_REVIEW",
      priority: "HIGH",
      assignee: "sara.juric@example.com",
      labels: ["Frontend", "Backend"],
    },
    {
      name: "Dodati prikaz veleprodajnih cijena",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      assignee: "ivan.babic@example.com",
      labels: ["Backend", "Sigurnost"],
    },
    {
      name: "Implementirati korisničke cjenike i rabate",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      assignee: "ivan.babic@example.com",
      labels: ["Backend", "Baza podataka"],
    },
    {
      name: "Izraditi košaricu i slanje narudžbe",
      status: "TODO",
      priority: "HIGH",
      assignee: "sara.juric@example.com",
      labels: ["Frontend"],
    },
    {
      name: "Implementirati provjeru dostupnosti zaliha",
      status: "TODO",
      priority: "HIGH",
      assignee: "ivan.babic@example.com",
      labels: ["Integracija"],
    },
    {
      name: "Prilagoditi web shop mobilnim uređajima",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      assignee: "sara.juric@example.com",
      labels: ["Frontend", "Mobilni prikaz"],
    },
    {
      name: "Testirati izračun rabata i ukupne cijene",
      status: "TODO",
      priority: "CRITICAL",
      assignee: "filip.saric@example.com",
      labels: ["Testiranje"],
    },
  ],
  Projekt3: [
    {
      name: "Izraditi evidenciju klijenata i vozila ili uređaja",
      status: "DONE",
      priority: "HIGH",
      assignee: "luka.maric@example.com",
      labels: ["Backend", "Baza podataka"],
    },
    {
      name: "Implementirati izdavanje radnog naloga",
      status: "DONE",
      priority: "CRITICAL",
      assignee: "ivan.babic@example.com",
      labels: ["Frontend", "Backend"],
    },
    {
      name: "Omogućiti unos izvršenih radova",
      status: "DONE",
      priority: "HIGH",
      assignee: "luka.maric@example.com",
      labels: ["Frontend", "Backend"],
    },
    {
      name: "Evidentirati utrošeni materijal",
      status: "IN_REVIEW",
      priority: "HIGH",
      assignee: "ivan.babic@example.com",
      labels: ["Backend", "Baza podataka"],
    },
    {
      name: "Implementirati obračun radnih sati",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      assignee: "luka.maric@example.com",
      labels: ["Backend"],
    },
    {
      name: "Generirati račun iz radnog naloga",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      assignee: "ivan.babic@example.com",
      labels: ["Backend", "Izvještaji"],
    },
    {
      name: "Evidentirati status plaćanja računa",
      status: "TODO",
      priority: "HIGH",
      assignee: "luka.maric@example.com",
      labels: ["Backend", "Baza podataka"],
    },
    {
      name: "Provesti završno testiranje procesa od naloga do računa",
      status: "TODO",
      priority: "CRITICAL",
      assignee: "filip.saric@example.com",
      labels: ["Testiranje"],
    },
  ],
  Projekt4: [
    {
      name: "Postaviti Next.js projekt i strukturu aplikacije",
      status: "DONE",
      priority: "HIGH",
      assignee: "petra.novak@example.com",
      labels: ["Frontend", "Backend"],
    },
    {
      name: "Kreirati Neon PostgreSQL bazu",
      status: "DONE",
      priority: "HIGH",
      assignee: "sara.juric@example.com",
      labels: ["Baza podataka"],
    },
    {
      name: "Definirati Prisma modele",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      assignee: "petra.novak@example.com",
      labels: ["Baza podataka", "Backend"],
    },
    {
      name: "Implementirati prijavu korisnika",
      status: "TODO",
      priority: "CRITICAL",
      assignee: "sara.juric@example.com",
      labels: ["Autentikacija", "Sigurnost"],
    },
    {
      name: "Implementirati generiranje privremene lozinke",
      status: "TODO",
      priority: "CRITICAL",
      assignee: "petra.novak@example.com",
      labels: ["Autentikacija", "Sigurnost"],
    },
    {
      name: "Izraditi administratorsko upravljanje korisnicima",
      status: "TODO",
      priority: "HIGH",
      assignee: "sara.juric@example.com",
      labels: ["Frontend", "Backend"],
    },
    {
      name: "Izraditi prikaz projekata, timova i zadataka",
      status: "TODO",
      priority: "HIGH",
      assignee: "petra.novak@example.com",
      labels: ["Frontend", "UI/UX"],
    },
    {
      name: "Implementirati evidenciju radnog vremena",
      status: "TODO",
      priority: "MEDIUM",
      assignee: "sara.juric@example.com",
      labels: ["Frontend", "Backend"],
    },
    {
      name: "Izraditi audit log administratorskih akcija",
      status: "TODO",
      priority: "HIGH",
      assignee: "petra.novak@example.com",
      labels: ["Backend", "Sigurnost"],
    },
    {
      name: "Napisati E2E test prijave i promjene lozinke",
      status: "TODO",
      priority: "HIGH",
      assignee: "mia.radic@example.com",
      labels: ["Testiranje"],
    },
  ],
};

const TIME_ENTRIES: {
  user: string;
  project: string;
  task: string;
  date: string;
  start: string;
  end: string;
}[] = [
  {
    user: "luka.maric@example.com",
    project: "Projekt1",
    task: "Izraditi registar dječjih igrališta",
    date: "2026-08-18",
    start: "08:00",
    end: "11:30",
  },
  {
    user: "petra.novak@example.com",
    project: "Projekt1",
    task: "Implementirati unos inspekcijskog pregleda",
    date: "2026-08-19",
    start: "09:00",
    end: "12:00",
  },
  {
    user: "ivan.babic@example.com",
    project: "Projekt2",
    task: "Dodati prikaz veleprodajnih cijena",
    date: "2026-08-19",
    start: "08:30",
    end: "11:00",
  },
  {
    user: "sara.juric@example.com",
    project: "Projekt2",
    task: "Prilagoditi web shop mobilnim uređajima",
    date: "2026-08-20",
    start: "10:00",
    end: "13:15",
  },
  {
    user: "luka.maric@example.com",
    project: "Projekt3",
    task: "Implementirati obračun radnih sati",
    date: "2026-08-20",
    start: "08:00",
    end: "10:30",
  },
  {
    user: "ivan.babic@example.com",
    project: "Projekt3",
    task: "Generirati račun iz radnog naloga",
    date: "2026-08-20",
    start: "11:00",
    end: "14:00",
  },
  {
    user: "petra.novak@example.com",
    project: "Projekt4",
    task: "Definirati Prisma modele",
    date: "2026-08-21",
    start: "08:00",
    end: "11:00",
  },
  {
    user: "sara.juric@example.com",
    project: "Projekt4",
    task: "Kreirati Neon PostgreSQL bazu",
    date: "2026-08-21",
    start: "09:00",
    end: "10:30",
  },
];

const FEEDBACK: { user: string; text: string; rating: number }[] = [
  {
    user: "ana.kovac@example.com",
    text: "Pregled projekata je jasan, ali treba dodati filtriranje prema timu.",
    rating: 4,
  },
  {
    user: "marko.horvat@example.com",
    text: "Bilo bi korisno prikazati zadatke s približavanjem roka na dashboardu.",
    rating: 5,
  },
  {
    user: "mia.radic@example.com",
    text: "Kod testiranja treba jasnije prikazati obavezna polja u obrascu zadatka.",
    rating: 4,
  },
  {
    user: "filip.saric@example.com",
    text: "Predlažem mogućnost filtriranja zadataka prema statusu i prioritetu istodobno.",
    rating: 5,
  },
];

// actor "admin" resolves to the seed administrator.
const AUDIT: { actor: string; target: string | null; action: string }[] = [
  { actor: "admin", target: "ana.kovac@example.com", action: AUDIT_ACTIONS.USER_CREATED },
  { actor: "admin", target: "ana.kovac@example.com", action: AUDIT_ACTIONS.ACCOUNT_ACTIVATED },
  { actor: "admin", target: "nikola.peric@example.com", action: AUDIT_ACTIONS.USER_CREATED },
  { actor: "admin", target: "nikola.peric@example.com", action: AUDIT_ACTIONS.ACCOUNT_BLOCKED },
  { actor: "admin", target: "petra.novak@example.com", action: AUDIT_ACTIONS.ROLE_CHANGED },
  { actor: "ana.kovac@example.com", target: null, action: AUDIT_ACTIONS.LOGIN_SUCCESS },
  { actor: "marko.horvat@example.com", target: null, action: AUDIT_ACTIONS.LOGIN_SUCCESS },
];

// ---------------------------------------------------------------------------
// Seeding logic (idempotent)
// ---------------------------------------------------------------------------

const norm = (email: string) => email.trim().toLowerCase();

/** Deterministic due date: project start + (position * 7 days), clamped to endDate. */
function dueDateFor(startISO: string, endISO: string | null, positionOneBased: number): Date {
  const start = new Date(`${startISO}T00:00:00`);
  const due = new Date(start);
  due.setDate(due.getDate() + positionOneBased * 7);
  if (endISO) {
    const end = new Date(`${endISO}T00:00:00`);
    if (due > end) return end;
  }
  return due;
}

export async function seedDemoData(adminUserId: string): Promise<void> {
  const demoPassword = process.env.SEED_DEMO_PASSWORD;
  if (!demoPassword) {
    throw new Error(
      "SEED_DEMO_PASSWORD is not set. Add it to .env.local to seed active demo users (see .env.example).",
    );
  }
  const demoPasswordHash = await hashPassword(demoPassword);

  const roles = await prisma.role.findMany();
  const roleIdByName = new Map(roles.map((r) => [r.name, r.id]));

  // --- Users (upsert by unique email; never touch security fields on rerun) ---
  const userIdByEmail = new Map<string, string>();
  let usersCreated = 0;
  let usersUpdated = 0;
  for (const u of DEMO_USERS) {
    const email = norm(u.email);
    const roleId = roleIdByName.get(u.role);
    if (!roleId) throw new Error(`Role '${u.role}' not found. Run reference seed first.`);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Update identity/role only. Leave passwordHash / mustChangePassword /
      // accountStatus untouched so a rerun never changes an existing password.
      await prisma.user.update({
        where: { email },
        data: { firstName: u.firstName, lastName: u.lastName, roleId },
      });
      userIdByEmail.set(email, existing.id);
      usersUpdated += 1;
    } else {
      const isActive = u.status === "ACTIVE";
      const created = await prisma.user.create({
        data: {
          firstName: u.firstName,
          lastName: u.lastName,
          email,
          roleId,
          passwordHash: isActive ? demoPasswordHash : null,
          accountStatus: u.status,
          mustChangePassword: true,
          createdById: adminUserId,
        },
      });
      userIdByEmail.set(email, created.id);
      usersCreated += 1;
    }
  }

  // --- Labels (upsert by unique name) ---
  const labelIdByName = new Map<string, string>();
  for (const l of LABELS) {
    const label = await prisma.label.upsert({
      where: { name: l.name },
      update: { color: l.color },
      create: { name: l.name, color: l.color },
    });
    labelIdByName.set(l.name, label.id);
  }

  // --- Teams (no unique on name -> findFirst) + memberships (composite PK) ---
  const teamIdByName = new Map<string, string>();
  for (const t of TEAMS) {
    const found = await prisma.team.findFirst({ where: { name: t.name } });
    const team = found
      ? await prisma.team.update({ where: { id: found.id }, data: { description: t.description } })
      : await prisma.team.create({ data: { name: t.name, description: t.description } });
    teamIdByName.set(t.name, team.id);

    for (const memberEmail of t.members) {
      const userId = userIdByEmail.get(norm(memberEmail));
      if (!userId) continue;
      await prisma.userTeam.upsert({
        where: { userId_teamId: { userId, teamId: team.id } },
        update: {},
        create: { userId, teamId: team.id },
      });
    }
  }

  // --- Projects (no unique on name -> findFirst) + project-team relations ---
  const projectIdByName = new Map<string, string>();
  for (const p of PROJECTS) {
    const data = {
      name: p.name,
      description: p.description,
      startDate: new Date(`${p.startDate}T00:00:00`),
      endDate: p.endDate ? new Date(`${p.endDate}T00:00:00`) : null,
    };
    const found = await prisma.project.findFirst({ where: { name: p.name } });
    const project = found
      ? await prisma.project.update({ where: { id: found.id }, data })
      : await prisma.project.create({ data });
    projectIdByName.set(p.name, project.id);

    for (const teamName of p.teams) {
      const teamId = teamIdByName.get(teamName);
      if (!teamId) continue;
      await prisma.projectTeam.upsert({
        where: { projectId_teamId: { projectId: project.id, teamId } },
        update: {},
        create: { projectId: project.id, teamId },
      });
    }
  }

  // --- Tasks (identity = project + name) + task-label relations ---
  const statuses = await prisma.status.findMany();
  const statusIdByName = new Map(statuses.map((s) => [s.name, s.id]));
  const priorities = await prisma.priority.findMany();
  const priorityIdByName = new Map(priorities.map((p) => [p.name, p.id]));

  let tasksCreated = 0;
  let tasksUpdated = 0;
  for (const p of PROJECTS) {
    const projectId = projectIdByName.get(p.name)!;
    const startDate = new Date(`${p.startDate}T00:00:00`);
    const defs = TASKS_BY_PROJECT[p.name] ?? [];

    for (let i = 0; i < defs.length; i += 1) {
      const def = defs[i];
      const statusId = statusIdByName.get(def.status);
      const priorityId = priorityIdByName.get(def.priority);
      if (!statusId || !priorityId) {
        throw new Error(`Missing status/priority for task '${def.name}'.`);
      }
      const assigneeId = userIdByEmail.get(norm(def.assignee)) ?? null;
      const dueDate = dueDateFor(p.startDate, p.endDate, i + 1);
      const labelIds = def.labels
        .map((name) => labelIdByName.get(name))
        .filter((id): id is string => Boolean(id));

      // Resolve identity by project + name (never name alone).
      const existing = await prisma.task.findFirst({ where: { projectId, name: def.name } });

      await prisma.$transaction(async (tx) => {
        let taskId: string;
        if (existing) {
          await tx.task.update({
            where: { id: existing.id },
            data: { description: def.name, statusId, priorityId, assigneeId, startDate, dueDate },
          });
          taskId = existing.id;
          await tx.taskLabel.deleteMany({ where: { taskId } });
        } else {
          const created = await tx.task.create({
            data: {
              name: def.name,
              description: def.name,
              statusId,
              priorityId,
              projectId,
              createdById: adminUserId,
              assigneeId,
              startDate,
              dueDate,
            },
          });
          taskId = created.id;
        }
        for (const labelId of labelIds) {
          await tx.taskLabel.create({ data: { taskId, labelId } });
        }
      });

      if (existing) tasksUpdated += 1;
      else tasksCreated += 1;
    }
  }

  // --- Time entries (dedupe by user+task+date+start; duration computed here) ---
  let timeEntriesCreated = 0;
  for (const e of TIME_ENTRIES) {
    const userId = userIdByEmail.get(norm(e.user));
    const projectId = projectIdByName.get(e.project);
    if (!userId || !projectId) continue;
    const task = await prisma.task.findFirst({ where: { projectId, name: e.task } });
    if (!task) continue;

    const startTime = new Date(`${e.date}T${e.start}:00`);
    const endTime = new Date(`${e.date}T${e.end}:00`);
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60_000);
    const entryDate = new Date(`${e.date}T00:00:00`);

    const existing = await prisma.timeEntry.findFirst({
      where: { userId, taskId: task.id, entryDate, startTime },
    });
    if (!existing) {
      await prisma.timeEntry.create({
        data: { userId, taskId: task.id, entryDate, startTime, endTime, durationMinutes },
      });
      timeEntriesCreated += 1;
    }
  }

  // --- Feedback (dedupe by user + text) ---
  let feedbackCreated = 0;
  for (const f of FEEDBACK) {
    const userId = userIdByEmail.get(norm(f.user));
    if (!userId) continue;
    const existing = await prisma.feedback.findFirst({ where: { userId, text: f.text } });
    if (!existing) {
      await prisma.feedback.create({ data: { userId, text: f.text, rating: f.rating } });
      feedbackCreated += 1;
    }
  }

  // --- Audit log (representative demo records; dedupe by actor+target+action) ---
  let auditCreated = 0;
  for (const a of AUDIT) {
    const actorUserId = a.actor === "admin" ? adminUserId : userIdByEmail.get(norm(a.actor));
    if (!actorUserId) continue;
    const targetUserId = a.target ? (userIdByEmail.get(norm(a.target)) ?? null) : null;
    const existing = await prisma.auditLog.findFirst({
      where: { actorUserId, targetUserId, action: a.action },
    });
    if (!existing) {
      // No secrets in metadata.
      await prisma.auditLog.create({ data: { actorUserId, targetUserId, action: a.action } });
      auditCreated += 1;
    }
  }

  console.log(
    `Demo seed: users +${usersCreated}/~${usersUpdated}, labels ${LABELS.length}, teams ${TEAMS.length}, ` +
      `projects ${PROJECTS.length}, tasks +${tasksCreated}/~${tasksUpdated}, ` +
      `time entries +${timeEntriesCreated}, feedback +${feedbackCreated}, audit +${auditCreated}.`,
  );
}
