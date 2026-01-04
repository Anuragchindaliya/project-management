import { db } from "./connection";
import {
  users,
  workspaces,
  workspaceMembers,
  projects,
  projectMembers,
  tasks,
  taskComments,
  activityLogs,
} from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // ============================================
    // 1. CREATE DEMO USERS
    // ============================================
    console.log("👤 Creating users...");

    const passwordHash = await bcrypt.hash("Password123!", 10);

    const demoUsers = [
      {
        id: crypto.randomUUID(),
        email: "john.doe@example.com",
        username: "johndoe",
        passwordHash,
        firstName: "John",
        lastName: "Doe",
        isActive: "active" as const,
      },
      {
        id: crypto.randomUUID(),
        email: "jane.smith@example.com",
        username: "janesmith",
        passwordHash,
        firstName: "Jane",
        lastName: "Smith",
        isActive: "active" as const,
      },
      {
        id: crypto.randomUUID(),
        email: "bob.wilson@example.com",
        username: "bobwilson",
        passwordHash,
        firstName: "Bob",
        lastName: "Wilson",
        isActive: "active" as const,
      },
      {
        id: crypto.randomUUID(),
        email: "alice.brown@example.com",
        username: "alicebrown",
        passwordHash,
        firstName: "Alice",
        lastName: "Brown",
        isActive: "active" as const,
      },
    ];

    await db.insert(users).values(demoUsers);
    console.log(`✅ Created ${demoUsers.length} users`);

    // ============================================
    // 2. CREATE WORKSPACES
    // ============================================
    console.log("🏢 Creating workspaces...");

    const workspace1 = {
      id: crypto.randomUUID(),
      name: "Acme Corporation",
      slug: "acme-corp",
      description: "Main workspace for Acme Corporation projects",
      ownerId: demoUsers[0].id,
      isActive: "active" as const,
    };

    const workspace2 = {
      id: crypto.randomUUID(),
      name: "Tech Startup Inc",
      slug: "tech-startup",
      description: "Innovation workspace for our startup",
      ownerId: demoUsers[1].id,
      isActive: "active" as const,
    };

    await db.insert(workspaces).values([workspace1, workspace2]);
    console.log("✅ Created 2 workspaces");

    // ============================================
    // 3. ADD WORKSPACE MEMBERS
    // ============================================
    console.log("👥 Adding workspace members...");

    const workspaceMembers1 = [
      {
        id: crypto.randomUUID(),
        workspaceId: workspace1.id,
        userId: demoUsers[0].id,
        role: "owner" as const,
      },
      {
        id: crypto.randomUUID(),
        workspaceId: workspace1.id,
        userId: demoUsers[1].id,
        role: "admin" as const,
      },
      {
        id: crypto.randomUUID(),
        workspaceId: workspace1.id,
        userId: demoUsers[2].id,
        role: "member" as const,
      },
      {
        id: crypto.randomUUID(),
        workspaceId: workspace1.id,
        userId: demoUsers[3].id,
        role: "viewer" as const,
      },
    ];

    const workspaceMembers2 = [
      {
        id: crypto.randomUUID(),
        workspaceId: workspace2.id,
        userId: demoUsers[1].id,
        role: "owner" as const,
      },
      {
        id: crypto.randomUUID(),
        workspaceId: workspace2.id,
        userId: demoUsers[2].id,
        role: "member" as const,
      },
    ];

    await db
      .insert(workspaceMembers)
      .values([...workspaceMembers1, ...workspaceMembers2]);
    console.log("✅ Added workspace members");

    // ============================================
    // 4. CREATE PROJECTS
    // ============================================
    console.log("📁 Creating projects...");

    const project1 = {
      id: crypto.randomUUID(),
      workspaceId: workspace1.id,
      name: "Website Redesign",
      key: "WEB",
      description: "Complete redesign of company website",
      ownerId: demoUsers[0].id,
      status: "active" as const,
    };

    const project2 = {
      id: crypto.randomUUID(),
      workspaceId: workspace1.id,
      name: "Mobile App Development",
      key: "MOBILE",
      description: "iOS and Android mobile application",
      ownerId: demoUsers[1].id,
      status: "active" as const,
    };

    const project3 = {
      id: crypto.randomUUID(),
      workspaceId: workspace2.id,
      name: "API Backend",
      key: "API",
      description: "RESTful API development",
      ownerId: demoUsers[1].id,
      status: "active" as const,
    };

    await db.insert(projects).values([project1, project2, project3]);
    console.log("✅ Created 3 projects");

    // ============================================
    // 5. ADD PROJECT MEMBERS
    // ============================================
    console.log("👥 Adding project members...");

    const projectMembersData = [
      // Project 1 members
      {
        id: crypto.randomUUID(),
        projectId: project1.id,
        userId: demoUsers[0].id,
        role: "lead" as const,
      },
      {
        id: crypto.randomUUID(),
        projectId: project1.id,
        userId: demoUsers[1].id,
        role: "developer" as const,
      },
      {
        id: crypto.randomUUID(),
        projectId: project1.id,
        userId: demoUsers[2].id,
        role: "developer" as const,
      },
      // Project 2 members
      {
        id: crypto.randomUUID(),
        projectId: project2.id,
        userId: demoUsers[1].id,
        role: "lead" as const,
      },
      {
        id: crypto.randomUUID(),
        projectId: project2.id,
        userId: demoUsers[2].id,
        role: "developer" as const,
      },
      // Project 3 members
      {
        id: crypto.randomUUID(),
        projectId: project3.id,
        userId: demoUsers[1].id,
        role: "lead" as const,
      },
    ];

    await db.insert(projectMembers).values(projectMembersData);
    console.log("✅ Added project members");

    // ============================================
    // 6. CREATE TASKS
    // ============================================
    console.log("📝 Creating tasks...");

    const tasksData = [
      // Project 1 tasks (Website Redesign)
      {
        id: crypto.randomUUID(),
        projectId: project1.id,
        title: "Design homepage mockup",
        description: "Create high-fidelity mockup for new homepage",
        taskNumber: 1,
        status: "done" as const,
        priority: "high" as const,
        assigneeId: demoUsers[1].id,
        reporterId: demoUsers[0].id,
        estimatedHours: 8,
        actualHours: 10,
        completedAt: new Date("2024-01-15"),
      },
      {
        id: crypto.randomUUID(),
        projectId: project1.id,
        title: "Implement responsive navigation",
        description: "Build mobile-responsive navigation component",
        taskNumber: 2,
        status: "in_progress" as const,
        priority: "high" as const,
        assigneeId: demoUsers[2].id,
        reporterId: demoUsers[0].id,
        estimatedHours: 12,
        actualHours: 8,
      },
      {
        id: crypto.randomUUID(),
        projectId: project1.id,
        title: "Set up content management system",
        description: "Configure CMS for blog and news sections",
        taskNumber: 3,
        status: "todo" as const,
        priority: "medium" as const,
        assigneeId: demoUsers[1].id,
        reporterId: demoUsers[0].id,
        estimatedHours: 16,
      },
      {
        id: crypto.randomUUID(),
        projectId: project1.id,
        title: "Optimize images and assets",
        description: "Compress and optimize all website images",
        taskNumber: 4,
        status: "todo" as const,
        priority: "low" as const,
        reporterId: demoUsers[0].id,
        estimatedHours: 4,
      },
      // Project 2 tasks (Mobile App)
      {
        id: crypto.randomUUID(),
        projectId: project2.id,
        title: "Design app icon and splash screen",
        description: "Create app branding assets",
        taskNumber: 1,
        status: "done" as const,
        priority: "high" as const,
        assigneeId: demoUsers[1].id,
        reporterId: demoUsers[1].id,
        estimatedHours: 6,
        actualHours: 5,
        completedAt: new Date("2024-01-10"),
      },
      {
        id: crypto.randomUUID(),
        projectId: project2.id,
        title: "Implement user authentication",
        description: "Add login, signup, and password reset",
        taskNumber: 2,
        status: "in_review" as const,
        priority: "urgent" as const,
        assigneeId: demoUsers[2].id,
        reporterId: demoUsers[1].id,
        estimatedHours: 20,
        actualHours: 22,
      },
      {
        id: crypto.randomUUID(),
        projectId: project2.id,
        title: "Build dashboard screen",
        description: "Create main dashboard with data visualization",
        taskNumber: 3,
        status: "in_progress" as const,
        priority: "high" as const,
        assigneeId: demoUsers[2].id,
        reporterId: demoUsers[1].id,
        estimatedHours: 15,
        actualHours: 10,
      },
      // Project 3 tasks (API Backend)
      {
        id: crypto.randomUUID(),
        projectId: project3.id,
        title: "Set up database schema",
        description: "Design and implement database tables",
        taskNumber: 1,
        status: "done" as const,
        priority: "urgent" as const,
        assigneeId: demoUsers[1].id,
        reporterId: demoUsers[1].id,
        estimatedHours: 10,
        actualHours: 12,
        completedAt: new Date("2024-01-12"),
      },
      {
        id: crypto.randomUUID(),
        projectId: project3.id,
        title: "Implement REST endpoints",
        description: "Create CRUD endpoints for all resources",
        taskNumber: 2,
        status: "in_progress" as const,
        priority: "high" as const,
        assigneeId: demoUsers[1].id,
        reporterId: demoUsers[1].id,
        estimatedHours: 25,
        actualHours: 15,
      },
    ];

    await db.insert(tasks).values(tasksData);
    console.log(`✅ Created ${tasksData.length} tasks`);

    // ============================================
    // 7. CREATE TASK COMMENTS
    // ============================================
    console.log("💬 Creating task comments...");

    const commentsData = [
      {
        id: crypto.randomUUID(),
        taskId: tasksData[0].id,
        userId: demoUsers[0].id,
        content: "Great work on the mockup! Looks fantastic.",
      },
      {
        id: crypto.randomUUID(),
        taskId: tasksData[1].id,
        userId: demoUsers[0].id,
        content: "Make sure to test on various screen sizes.",
      },
      {
        id: crypto.randomUUID(),
        taskId: tasksData[1].id,
        userId: demoUsers[2].id,
        content: "Working on it now. Will have it ready by EOD.",
      },
      {
        id: crypto.randomUUID(),
        taskId: tasksData[5].id,
        userId: demoUsers[1].id,
        content: "Please review the authentication flow and provide feedback.",
      },
    ];

    await db.insert(taskComments).values(commentsData);
    console.log(`✅ Created ${commentsData.length} comments`);

    // ============================================
    // 8. CREATE ACTIVITY LOGS
    // ============================================
    console.log("📊 Creating activity logs...");

    const activityLogsData = [
      {
        id: crypto.randomUUID(),
        workspaceId: workspace1.id,
        projectId: project1.id,
        taskId: tasksData[0].id,
        userId: demoUsers[0].id,
        action: "task_created",
        entityType: "task" as const,
        metadata: JSON.stringify({ title: tasksData[0].title }),
      },
      {
        id: crypto.randomUUID(),
        workspaceId: workspace1.id,
        projectId: project1.id,
        taskId: tasksData[0].id,
        userId: demoUsers[1].id,
        action: "task_status_changed",
        entityType: "task" as const,
        metadata: JSON.stringify({ from: "todo", to: "done" }),
      },
      {
        id: crypto.randomUUID(),
        workspaceId: workspace1.id,
        projectId: project2.id,
        taskId: tasksData[5].id,
        userId: demoUsers[2].id,
        action: "task_status_changed",
        entityType: "task" as const,
        metadata: JSON.stringify({ from: "in_progress", to: "in_review" }),
      },
    ];

    await db.insert(activityLogs).values(activityLogsData);
    console.log(`✅ Created ${activityLogsData.length} activity logs`);

    // ============================================
    // SEED SUMMARY
    // ============================================
    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`   - Users: ${demoUsers.length}`);
    console.log(`   - Workspaces: 2`);
    console.log(`   - Projects: 3`);
    console.log(`   - Tasks: ${tasksData.length}`);
    console.log(`   - Comments: ${commentsData.length}`);
    console.log(`   - Activity Logs: ${activityLogsData.length}`);
    console.log("\n🔐 Login credentials for all users:");
    console.log("   Email: [any user email above]");
    console.log("   Password: Password123!");
    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run seed
seed();
