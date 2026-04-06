import * as Joi from 'joi';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';

const updateUserSchema = Joi.object({
  displayName: Joi.string().min(1).max(100).required(),
});

const updateFcmTokenSchema = Joi.object({
  fcmToken: Joi.string().required(),
});

export class UpdateUserPipe extends JoiValidationPipe {
  constructor() {
    super(updateUserSchema);
  }
}

export class UpdateFcmTokenPipe extends JoiValidationPipe {
  constructor() {
    super(updateFcmTokenSchema);
  }
}
