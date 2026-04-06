import * as Joi from 'joi';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';

const CURRENCIES = ['IDR', 'USD', 'SGD', 'MYR', 'EUR', 'JPY'];

const createBudgetSchema = Joi.object({
  categoryId: Joi.string().uuid().required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2020).max(2100).required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string()
    .valid(...CURRENCIES)
    .default('IDR'),
  note: Joi.string().max(255).allow('', null),
});

const updateBudgetSchema = Joi.object({
  amount: Joi.number().positive(),
  currency: Joi.string().valid(...CURRENCIES),
  note: Joi.string().max(255).allow('', null),
}).min(1);

const copyBudgetSchema = Joi.object({
  fromMonth: Joi.number().integer().min(1).max(12).required(),
  fromYear: Joi.number().integer().min(2020).max(2100).required(),
  toMonth: Joi.number().integer().min(1).max(12).required(),
  toYear: Joi.number().integer().min(2020).max(2100).required(),
});

const budgetQuerySchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2020).max(2100).required(),
});

export class CreateBudgetPipe extends JoiValidationPipe {
  constructor() {
    super(createBudgetSchema);
  }
}

export class UpdateBudgetPipe extends JoiValidationPipe {
  constructor() {
    super(updateBudgetSchema);
  }
}

export class CopyBudgetPipe extends JoiValidationPipe {
  constructor() {
    super(copyBudgetSchema);
  }
}

export class BudgetQueryPipe extends JoiValidationPipe {
  constructor() {
    super(budgetQuerySchema);
  }
}
