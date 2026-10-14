import { Router } from "express";
import { FlagController } from "../controllers/flag.controller";

const router = Router();

router.get('/stream', FlagController.streamFlags);

export const flagRouter = router;
