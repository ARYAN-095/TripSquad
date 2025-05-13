import { Router, Response } from "express";
import { AuthRequest, authGuard } from "../middleware/authGuard";
import Itinerary, {
  IItinerary,
  Collaborator,
  ItineraryItem,
  Expense,
} from "../models/Itinerary";
import User from "../models/User";
import { Types } from "mongoose";

const router = Router();

/**
 * Helpers
 */
const isOwner = (it: IItinerary, userId: string) =>
  it.owner.toString() === userId;
const isCollaborator = (it: IItinerary, userId: string) =>
  it.collaborators.some(
    (c) => c.user.toString() === userId && c.status === "accepted"
  );

/**
 * ————— Itinerary CRUD —————
 */

// Create a new itinerary
router.post("/", authGuard, async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  const it = new Itinerary({
    name,
    description,
    owner: req.user!._id,
    collaborators: [
      { user: req.user!._id, role: "editor", status: "accepted" },
    ],
  });
  await it.save();
  res.status(201).json(it);
});

// List itineraries (owned or collaboration)
router.get("/", authGuard, async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const its = await Itinerary.find({
    $or: [
      { owner: userId },
      { "collaborators.user": userId, "collaborators.status": "accepted" },
    ],
  });
  res.json(its);
});

// Get one itinerary
router.get("/:id", authGuard, async (req: AuthRequest, res: Response) => {
  const it = await Itinerary.findById(req.params.id);
  if (!it) return res.status(404).json({ message: "Not found." });

  const uid = req.user!._id.toString();
  if (!isOwner(it, uid) && !isCollaborator(it, uid))
    return res.status(403).json({ message: "Forbidden." });

  res.json(it);
});

// Update itinerary metadata (name/description)
router.put("/:id", authGuard, async (req: AuthRequest, res: Response) => {
  const it = await Itinerary.findById(req.params.id);
  if (!it) return res.status(404).json({ message: "Not found." });
  if (!isOwner(it, req.user!._id.toString()))
    return res.status(403).json({ message: "Only owner can update." });

  const { name, description, mapOverview } = req.body;
  if (name !== undefined) it.name = name;
  if (description !== undefined) it.description = description;
  if (mapOverview !== undefined) it.mapOverview = mapOverview;

  await it.save();
  res.json(it);
});

// Delete itinerary
router.delete("/:id", authGuard, async (req: AuthRequest, res: Response) => {
  const it = await Itinerary.findById(req.params.id);
  if (!it) return res.status(404).json({ message: "Not found." });
  if (!isOwner(it, req.user!._id.toString()))
    return res.status(403).json({ message: "Only owner can delete." });

  await Itinerary.deleteOne({ _id: it._id });
  res.status(204).end();
});

/**
 * ————— Items & Voting —————
 */

// Add a new item
router.post(
  "/:id/items",
  authGuard,
  async (req: AuthRequest, res: Response) => {
    const it = await Itinerary.findById(req.params.id);
    if (!it) return res.status(404).json({ message: "Not found." });
    const uid = req.user!._id.toString();
    if (!isOwner(it, uid) && !isCollaborator(it, uid))
      return res.status(403).json({ message: "Forbidden." });

    it.items.push({ ...req.body, createdBy: req.user!._id, votes: [] });
    await it.save();
    res.status(201).json(it);
  }
);

// Delete an item
router.delete(
  "/:id/items/:itemId",
  authGuard,
  async (req: AuthRequest, res: Response) => {
    const it = await Itinerary.findById(req.params.id);
    if (!it) return res.status(404).json({ message: "Not found." });
    const item = it.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found." });

    const uid = req.user!._id.toString();
    // only owner or item creator can delete
    if (!isOwner(it, uid) && item.createdBy.toString() !== uid) {
      return res.status(403).json({ message: "Forbidden." });
    }

    it.items.pull(item._id);
    await it.save();
    res.status(204).end();
  }
);

// Toggle vote on an item
router.post(
  "/:id/items/:itemId/vote",
  authGuard,
  async (req: AuthRequest, res: Response) => {
    const it = await Itinerary.findById(req.params.id);
    if (!it) return res.status(404).json({ message: "Not found." });
    const item = it.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found." });

    const uid = req.user!._id;
    const idx = item.votes.findIndex(
      (v: Types.ObjectId) => v.toString() === uid.toString()
    );
    if (idx >= 0) item.votes.splice(idx, 1);
    else item.votes.push(uid);

    await it.save();
    res.json(item);
  }
);

/**
 * ————— Expenses —————
 */

// Add an expense
router.post(
  "/:id/expenses",
  authGuard,
  async (req: AuthRequest, res: Response) => {
    const it = await Itinerary.findById(req.params.id);
    if (!it) return res.status(404).json({ message: "Not found." });

    const uid = req.user!._id.toString();
    if (!isOwner(it, uid) && !isCollaborator(it, uid))
      return res.status(403).json({ message: "Forbidden." });

    it.expenses.push({ ...req.body, paidBy: req.user!._id });
    await it.save();
    res.status(201).json(it.expenses);
  }
);

// Update an expense
router.patch(
  "/:id/expenses/:expenseId",
  authGuard,
  async (req: AuthRequest, res: Response) => {
    const it = await Itinerary.findById(req.params.id);
    if (!it) return res.status(404).json({ message: "Not found." });
    const exp = it.expenses.id(req.params.expenseId);
    if (!exp) return res.status(404).json({ message: "Expense not found." });

    const uid = req.user!._id.toString();
    // only payer or owner can edit
    if (!isOwner(it, uid) && exp.paidBy.toString() !== uid)
      return res.status(403).json({ message: "Forbidden." });

    Object.assign(exp, req.body);
    await it.save();
    res.json(exp);
  }
);

// Delete an expense
router.delete(
  "/:id/expenses/:expenseId",
  authGuard,
  async (req: AuthRequest, res: Response) => {
    const it = await Itinerary.findById(req.params.id);
    if (!it) return res.status(404).json({ message: "Not found." });
    const exp = it.expenses.id(req.params.expenseId);
    if (!exp) return res.status(404).json({ message: "Expense not found." });

    const uid = req.user!._id.toString();
    if (!isOwner(it, uid) && exp.paidBy.toString() !== uid)
      return res.status(403).json({ message: "Forbidden." });

    it.expenses.pull(exp._id);
    await it.save();
    res.status(204).end();
  }
);

/**
 * ————— Collaborators —————
 */

// Invite a collaborator
router.post(
  "/:id/collaborators",
  authGuard,
  async (req: AuthRequest, res: Response) => {
    const it = await Itinerary.findById(req.params.id);
    if (!it) return res.status(404).json({ message: "Not found." });
    if (!isOwner(it, req.user!._id.toString()))
      return res.status(403).json({ message: "Only owner can invite." });

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found." });

    it.collaborators.push({
      user: user._id,
      role: req.body.role || "editor",
      status: "pending",
    });
    await it.save();
    res.status(201).json(it.collaborators);
  }
);

// Update collaborator (accept invitation or change role)
router.patch(
  "/:id/collaborators/:collabId",
  authGuard,
  async (req: AuthRequest, res: Response) => {
    const it = await Itinerary.findById(req.params.id);
    if (!it) return res.status(404).json({ message: "Not found." });

    const collab = it.collaborators.id(req.params.collabId);
    if (!collab) return res.status(404).json({ message: "Not found." });

    const uid = req.user!._id.toString();
    // If accepting, the invited user accepts:
    if (uid === collab.user.toString() && req.body.status === "accepted") {
      collab.status = "accepted";
    }
    // Owner changing role or revoking:
    else if (isOwner(it, uid) && req.body.role) {
      collab.role = req.body.role;
    } else {
      return res.status(403).json({ message: "Forbidden." });
    }

    await it.save();
    res.json(collab);
  }
);

// Remove collaborator
router.delete(
  "/:id/collaborators/:collabId",
  authGuard,
  async (req: AuthRequest, res: Response) => {
    const it = await Itinerary.findById(req.params.id);
    if (!it) return res.status(404).json({ message: "Not found." });

    const collab = it.collaborators.id(req.params.collabId);
    if (!collab) return res.status(404).json({ message: "Not found." });

    const uid = req.user!._id.toString();
    if (!isOwner(it, uid) && collab.user.toString() !== uid) {
      return res.status(403).json({ message: "Forbidden." });
    }

    it.collaborators.pull(collab._id);
    await it.save();
    res.status(204).end();
  }
);

export default router;
