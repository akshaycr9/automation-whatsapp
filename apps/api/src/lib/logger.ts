export const logger = {
  debug: (message: unknown) => {
    if (process.env.NODE_ENV !== "test") console.debug(message);
  },
  info: (message: unknown) => {
    if (process.env.NODE_ENV !== "test") console.info(message);
  },
  error: (message: unknown) => {
    if (process.env.NODE_ENV !== "test") console.error(message);
  }
};
