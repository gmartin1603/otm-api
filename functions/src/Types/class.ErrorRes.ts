class ErrorRes {
  error: Error;
  method: string;
  controller: string;

  constructor({error, method, controller}) {
    this.error = error;
    this.method = method;
    this.controller = controller;
  }

  errorStack() {
    if (this.error.stack) {
      let stack = this.error.stack.split("\n");
      stack.forEach((line, index) => {
        stack[index] = line.trim();
      });
      // console.log("stack", stack)
      return stack;
    } else {
      return null;
    }
  }

  responseObj() {
    // console.log("this.error", this.error);
    let resObj = {
      status: "error",
      message: this.error.message? this.error.message : "Error response",
      error: this.errorStack()? this.errorStack() : this.error,
      method: this.controller? `${this.controller} => ${this.method}` : this.method
    }
    // console.log("resObj", resObj);

    return resObj;
  }
}

export default ErrorRes;