import { Router } from "express";
import { protect } from "../middleware/auth";
import { getAnalyticsStats } from "../controllers/analyticsController";

const router = Router();

// All routes are protected with JWT authentication
router.use(protect);

// Routes
router.get("/stats", getAnalyticsStats);

export default router;
