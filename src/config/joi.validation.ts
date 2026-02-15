import * as Joi from 'joi'

export const JoiValidationSchema = Joi.object({
  MONGODB: Joi.required(),
  PORT: Joi.number().default(3500),
  DEFAULT_LIMIT: Joi.number().default(10)
})