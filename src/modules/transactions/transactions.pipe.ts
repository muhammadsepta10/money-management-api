import * as Joi from 'joi';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';

const CURRENCIES = ['IDR', 'USD', 'SGD', 'MYR', 'EUR', 'JPY'];

const createTransactionSchema = Joi.object({
  categoryId: Joi.string().uuid().required(),
  type: Joi.string().valid('income', 'expense').required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string()
    .valid(...CURRENCIES)
    .default('IDR'),
  exchangeRate: Joi.number().positive().default(1.0),
  note: Joi.string().max(500).allow('', null),
  date: Joi.string().isoDate().required(),
  recurringId: Joi.string().uuid().allow(null),
  budgetId: Joi.string().uuid().allow(null),
});

const updateTransactionSchema = Joi.object({
  categoryId: Joi.string().uuid(),
  type: Joi.string().valid('income', 'expense'),
  amount: Joi.number().positive(),
  currency: Joi.string().valid(...CURRENCIES),
  exchangeRate: Joi.number().positive(),
  note: Joi.string().max(500).allow('', null),
  date: Joi.string().isoDate(),
  budgetId: Joi.string().uuid().allow(null),
}).min(1);

const transactionQuerySchema = Joi.object({
  startDate: Joi.string().isoDate(),
  endDate: Joi.string().isoDate(),
  type: Joi.string().valid('income', 'expense'),
  categoryId: Joi.string().uuid(),
  memberId: Joi.string().uuid(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

const transactionSummaryQuerySchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2020).max(2100).required(),
});

const monthlyBalanceQuerySchema = Joi.object({
  startMonth: Joi.number().integer().min(1).max(12),
  startYear: Joi.number().integer().min(2020).max(2100),
  endMonth: Joi.number().integer().min(1).max(12),
  endYear: Joi.number().integer().min(2020).max(2100),
}).custom((value, helpers) => {
  if (value.startMonth && value.startYear && value.endMonth && value.endYear) {
    const start = value.startYear * 12 + value.startMonth;
    const end = value.endYear * 12 + value.endMonth;
    if (end < start) {
      return helpers.error('any.invalid');
    }
    if (end - start + 1 > 12) {
      return helpers.error('any.invalid');
    }
  }
  return value;
});

export class CreateTransactionPipe extends JoiValidationPipe {
  constructor() {
    super(createTransactionSchema);
  }
}

export class UpdateTransactionPipe extends JoiValidationPipe {
  constructor() {
    super(updateTransactionSchema);
  }
}

export class TransactionQueryPipe extends JoiValidationPipe {
  constructor() {
    super(transactionQuerySchema);
  }
}

export class TransactionSummaryQueryPipe extends JoiValidationPipe {
  constructor() {
    super(transactionSummaryQuerySchema);
  }
}

export class MonthlyBalanceQueryPipe extends JoiValidationPipe {
  constructor() {
    super(monthlyBalanceQuerySchema);
  }
}
