export type ApiSuccess<T> = {
  data: T;
};

export type ApiError = {
  error: {
    message: string;
    code?: string;
  };
};
