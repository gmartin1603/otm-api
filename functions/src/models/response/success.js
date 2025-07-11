import Joi from 'joi';

class Success {
  constructor(obj) {
    this.status = obj.status;
    this.message = obj.message;
    this.data = obj.data;
    this.method = obj.method;
  }

  validate() {
    const schema = Joi.object({
      status: Joi.string().required(),
      message: Joi.string().required(),
      data: Joi.any(),
      method: Joi.string()
    });
    const { error } = schema.validate(this);
    
    if (error) {
      return [false, error.details[0]];
    } else {
      return [true, null];
    }
  }
}

export default Success;