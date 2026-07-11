import express from "express";
const router = express.Router();
import { protect, admin } from "../middleware/auth.js";
import {
  getallEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventContoller.js";

router.get("/", getallEvents);
router.get("/:id", getEventById);
router.post("/", protect, admin, createEvent);
router.put("/:id", protect, admin, updateEvent);
router.delete("/:id", protect, admin, deleteEvent);

export default router;
