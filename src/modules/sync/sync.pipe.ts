import * as Joi from 'joi';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';

const syncChangeSchema = Joi.object({
  entity: Joi.string().valid('transaction', 'budget', 'recurringRule').required(),
  action: Joi.string().valid('create', 'update', 'delete').required(),
  id: Joi.string().uuid().when('action', {
    is: Joi.valid('update', 'delete'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  localId: Joi.string().when('action', {
    is: 'create',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  data: Joi.object().when('action', {
    is: Joi.valid('create', 'update'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  timestamp: Joi.date().iso().required(),
});

const syncPushSchema = Joi.object({
  householdId: Joi.string().uuid().required(),
  changes: Joi.array().items(syncChangeSchema).min(1).max(500).required(),
});

const syncPullSchema = Joi.object({
  since: Joi.date().iso().required(),
  householdId: Joi.string().uuid().required(),
});

export class SyncPushPipe extends JoiValidationPipe {
  constructor() {
    super(syncPushSchema);
  }
}

export class SyncPullPipe extends JoiValidationPipe {
  constructor() {
    super(syncPullSchema);
  }
}
