import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "./auth";
import { hashPassword, generate2FASecret, verify2FAToken } from "./auth";
import { storage } from "./storage";
import * as gemini from "./gemini";
import { listCalendarEvents } from "./googleCalendar";
import { seedDemoData } from "./seed";
import { createPendingAuth, consumePendingAuth } from "./temp2FA";
import "./types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "syncora-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Auth middleware
  const requireAuth = (req: any, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Email/password auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name: email.split("@")[0],
      });

      req.login(user, async (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        await seedDemoData(user.id);
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      // Check if 2FA is required
      if (user.twoFactorEnabled) {
        // Create a pending auth nonce and return it to client
        // Client must call /api/auth/2fa/complete with this nonce + OTP token
        const nonce = createPendingAuth(user.id, user.email);
        return res.status(200).json({ 
          requires2FA: true,
          nonce,
        });
      }

      // No 2FA required - establish session immediately
      req.login(user, async (loginErr: any) => {
        if (loginErr) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
      });
    })(req, res, next);
  });

  // Complete 2FA login flow
  app.post("/api/auth/2fa/complete", async (req, res) => {
    try {
      const { nonce, token } = req.body;

      if (!nonce || !token) {
        return res.status(400).json({ message: "Nonce and token required" });
      }

      // Consume the pending auth (removes it from store)
      const pendingAuth = consumePendingAuth(nonce);
      if (!pendingAuth) {
        return res.status(401).json({ message: "Invalid or expired nonce" });
      }

      // Get the user
      const user = await storage.getUser(pendingAuth.userId);
      if (!user || !user.twoFactorSecret) {
        return res.status(401).json({ message: "2FA not configured" });
      }

      // Verify the OTP token
      const isValid = verify2FAToken(user.twoFactorSecret, token);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid 2FA token" });
      }

      // Token is valid - establish session
      req.login(user, (loginErr: any) => {
        if (loginErr) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  // Google OAuth routes
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth" }),
    async (req: any, res) => {
      await seedDemoData(req.user.id);
      res.redirect("/dashboard");
    }
  );

  // 2FA routes
  app.post("/api/auth/2fa/enable", requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      const { secret, qrCode } = await generate2FASecret(user.email);

      await storage.updateUser(user.id, {
        twoFactorSecret: secret,
      });

      res.json({ secret, qrCode });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/2fa/verify", requireAuth, async (req: any, res) => {
    try {
      const { token } = req.body;
      const user = req.user;

      if (!user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA not initialized" });
      }

      const isValid = verify2FAToken(user.twoFactorSecret, token);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid token" });
      }

      await storage.updateUser(user.id, {
        twoFactorEnabled: true,
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/2fa/disable", requireAuth, async (req: any, res) => {
    try {
      await storage.updateUser(req.user.id, {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User routes
  app.get("/api/user", requireAuth, async (req: any, res) => {
    const user = req.user;
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  });

  // Email routes
  app.get("/api/emails", requireAuth, async (req: any, res) => {
    try {
      const emails = await storage.getEmails(req.user.id);
      res.json(emails);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/emails/:id/summarize", requireAuth, async (req: any, res) => {
    try {
      const email = await storage.getEmail(req.params.id);
      if (!email || email.userId !== req.user.id) {
        return res.status(404).json({ message: "Email not found" });
      }

      const content = email.body || email.snippet || "";
      const summary = await gemini.summarizeEmail(content);
      const extractedMeeting = await gemini.extractMeetingDetails(content);

      await storage.updateEmail(email.id, {
        summary,
        extractedMeeting,
      });

      res.json({ summary, extractedMeeting });
    } catch (error: any) {
      console.error("Summarization error:", error);
      res.status(500).json({ message: "Failed to summarize email" });
    }
  });

  // Calendar routes
  app.get("/api/calendar/events", requireAuth, async (req: any, res) => {
    try {
      try {
        const googleEvents = await listCalendarEvents(20);

        for (const gEvent of googleEvents) {
          if (gEvent.id && gEvent.start && gEvent.summary) {
            const startTime = gEvent.start.dateTime || gEvent.start.date;
            const endTime = gEvent.end?.dateTime || gEvent.end?.date;

            if (startTime && endTime) {
              await storage.createCalendarEvent({
                userId: req.user.id,
                googleEventId: gEvent.id,
                title: gEvent.summary,
                description: gEvent.description || null,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                location: gEvent.location || null,
                meetingLink: gEvent.hangoutLink || null,
                attendees: gEvent.attendees?.map((a: any) => a.email) || null,
              });
            }
          }
        }
      } catch (calError) {
        console.log("Google Calendar fetch skipped:", calError);
      }

      const events = await storage.getCalendarEvents(req.user.id);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Task routes
  app.get("/api/tasks", requireAuth, async (req: any, res) => {
    try {
      const tasks = await storage.getTasks(req.user.id);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/tasks", requireAuth, async (req: any, res) => {
    try {
      const { title, description, priority, dueDate } = req.body;
      const task = await storage.createTask({
        userId: req.user.id,
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
      });
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/tasks/:id", requireAuth, async (req: any, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task || task.userId !== req.user.id) {
        return res.status(404).json({ message: "Task not found" });
      }

      const updated = await storage.updateTask(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, async (req: any, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task || task.userId !== req.user.id) {
        return res.status(404).json({ message: "Task not found" });
      }

      await storage.deleteTask(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req: any, res) => {
    try {
      const notifications = await storage.getNotifications(req.user.id);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req: any, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Chat route
  app.post("/api/ai/chat", requireAuth, async (req: any, res) => {
    try {
      const { message } = req.body;

      const emails = await storage.getEmails(req.user.id);
      const events = await storage.getCalendarEvents(req.user.id);
      const tasks = await storage.getTasks(req.user.id);

      const context = {
        emailCount: emails.length,
        highPriorityEmails: emails.filter((e) => e.priority === "high").length,
        upcomingMeetings: events.filter((e) => new Date(e.startTime) > new Date()).length,
        pendingTasks: tasks.filter((t) => !t.isCompleted).length,
      };

      const response = await gemini.chatWithAI(message, context);
      res.json({ response });
    } catch (error: any) {
      console.error("AI chat error:", error);
      res.status(500).json({ message: "AI chat failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
