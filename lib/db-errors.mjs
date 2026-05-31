export const isDuplicateKeyError = (error) => (
  error?.code === "ER_DUP_ENTRY" || error?.errno === 1062
);
