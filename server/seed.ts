import { storage } from "./storage";
import * as gemini from "./gemini";

export async function seedDemoData(userId: string) {
  try {
    // Create demo emails with AI-analyzed priorities
    const demoEmailsData = [
      {
        userId,
        messageId: "demo1",
        threadId: "thread1",
        from: "client@example.com",
        subject: "URGENT: Project Deadline Tomorrow",
        snippet: "We need to finalize the project deliverables by EOD tomorrow. Please send the latest updates ASAP.",
        body: "Hi,\n\nWe need to finalize the project deliverables by end of day tomorrow. This is critical for the client presentation. Please send the latest updates as soon as possible.\n\nThanks,\nClient Team",
        receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        userId,
        messageId: "demo2",
        threadId: "thread2",
        from: "team@company.com",
        subject: "Meeting Tomorrow: Product Review",
        snippet: "Join us tomorrow at 2 PM for the quarterly product review. We'll discuss the roadmap and priorities.",
        body: "Hello Team,\n\nLet's schedule a meeting tomorrow at 2:00 PM to review our product progress.\n\nMeeting Details:\n- Date: Tomorrow\n- Time: 2:00 PM - 3:00 PM\n- Location: Conference Room B / Zoom link: https://zoom.us/j/123456\n- Attendees: Product Team, Marketing Team\n\nLooking forward to it!\n\nBest,\nProduct Team",
        receivedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        userId,
        messageId: "demo3",
        threadId: "thread3",
        from: "newsletter@tech.com",
        subject: "Weekly Tech Newsletter",
        snippet: "Check out the latest technology trends and updates from this week.",
        body: "This week in tech: AI advancements, new framework releases, and industry news.",
        receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ];

    // Analyze priority using Gemini AI for each email
    for (const emailData of demoEmailsData) {
      const priority = await gemini.analyzeEmailPriority(emailData.subject, emailData.snippet);
      await storage.createEmail({
        ...emailData,
        priority,
      });
    }

    // Create demo tasks
    const demoTasks = [
      {
        userId,
        title: "Finalize project deliverables",
        description: "Complete all outstanding items for tomorrow's deadline",
        priority: "high",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        userId,
        title: "Prepare product review presentation",
        description: "Create slides for tomorrow's meeting",
        priority: "medium",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        userId,
        title: "Review weekly tech newsletter",
        description: "Catch up on industry trends",
        priority: "low",
        dueDate: null,
      },
    ];

    for (const task of demoTasks) {
      await storage.createTask(task);
    }

    // Create welcome notification
    await storage.createNotification({
      userId,
      type: "info",
      title: "Welcome to Syncora!",
      message: "Your AI command center is ready. Connect your Gmail and start managing your workflow intelligently.",
      metadata: null,
    });

    console.log("Demo data seeded successfully for user:", userId);
  } catch (error) {
    console.error("Error seeding demo data:", error);
  }
}
