declare type Request = {
  httpVersion: string;
  method: string;
  url: string;
  params: Record<string, any>;
  headers: string;
  query: Record<string, any>;
  body: string;
};


export type SuccessResponse<T> = {
  success: true;
  status: string;
  message: string;
  data: T;
  service: {
    library: string;
    method: string;
  };
  request: Request;
};

export type ErrorResponse = {
  success: false;
  status: string;
  message: string;
  error: string | Record<string, any>;
  method: string;
  service: string;
  request: Request;
};