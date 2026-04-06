import * as Joi from 'joi';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';

const newsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
  search: Joi.string().max(200).allow('', null),
});

export class NewsQueryPipe extends JoiValidationPipe {
  constructor() {
    super(newsQuerySchema);
  }
}
