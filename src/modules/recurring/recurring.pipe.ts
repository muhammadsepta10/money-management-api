import * as Joi from 'joi';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';

const createRecurringSchema = Joi.object({
  categoryId: Joi.string().uuid().required(),
  type: Joi.string().valid('income', 'expense').required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default('IDR'),
  frequency: Joi.string()
    .valid('daily', 'weekly', 'monthly', 'yearly')
    .required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
  note: Joi.string().max(255).allow('', null).optional(),
});

const updateRecurringSchema = Joi.object({
  categoryId: Joi.string().uuid().optional(),
  type: Joi.string().valid('income', 'expense').optional(),
  amount: Joi.number().positive().optional(),
  currency: Joi.string().optional(),
  frequency: Joi.string()
    .valid('daily', 'weekly', 'monthly', 'yearly')
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  note: Joi.string().max(255).allow('', null).optional(),
}).min(1);

export class CreateRecurringPipe extends JoiValidationPipe {
  constructor() {
    super(createRecurringSchema);
  }
}

export class UpdateRecurringPipe extends JoiValidationPipe {
  constructor() {
    super(updateRecurringSchema);
  }
}
