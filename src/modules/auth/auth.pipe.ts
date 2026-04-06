import * as Joi from 'joi';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';

const googleLoginSchema = Joi.object({
  idToken: Joi.string().required().messages({
    'any.required': 'Google ID token is required',
    'string.empty': 'Google ID token cannot be empty',
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
    'string.empty': 'Refresh token cannot be empty',
  }),
});

export class GoogleLoginPipe extends JoiValidationPipe {
  constructor() {
    super(googleLoginSchema);
  }
}

export class RefreshTokenPipe extends JoiValidationPipe {
  constructor() {
    super(refreshTokenSchema);
  }
}
