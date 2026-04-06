import * as Joi from 'joi';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';

const CURRENCIES = ['IDR', 'USD', 'SGD', 'MYR', 'EUR', 'JPY'];

const createHouseholdSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  defaultCurrency: Joi.string()
    .valid(...CURRENCIES)
    .default('IDR'),
});

const updateHouseholdSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  defaultCurrency: Joi.string().valid(...CURRENCIES),
}).min(1);

const joinHouseholdSchema = Joi.object({
  inviteCode: Joi.string().required(),
});

const updateMemberRoleSchema = Joi.object({
  role: Joi.string().valid('admin', 'member').required(),
});

export class CreateHouseholdPipe extends JoiValidationPipe {
  constructor() {
    super(createHouseholdSchema);
  }
}

export class UpdateHouseholdPipe extends JoiValidationPipe {
  constructor() {
    super(updateHouseholdSchema);
  }
}

export class JoinHouseholdPipe extends JoiValidationPipe {
  constructor() {
    super(joinHouseholdSchema);
  }
}

export class UpdateMemberRolePipe extends JoiValidationPipe {
  constructor() {
    super(updateMemberRoleSchema);
  }
}
