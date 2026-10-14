import { Router } from 'express';
import { FlagController } from '../controllers/flag.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createFlagSchema, updateFlagSchema } from '../validations/flag.validation.js';

const router = Router();

router.get('/stream', FlagController.streamFlags);

router.post('/', validate(createFlagSchema), FlagController.create);
router.get('/', FlagController.getAll);
router.get('/:key', FlagController.getByKey);
router.patch('/:key', validate(updateFlagSchema), FlagController.update);
router.delete('/:key', FlagController.remove);

export const flagRouter = router;
