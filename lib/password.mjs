import { compare, hash } from "bcryptjs";

const BCRYPT_COST = 10;
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;

export const isBcryptHash = (storedPassword) => (
  typeof storedPassword === "string"
  && BCRYPT_HASH_PATTERN.test(storedPassword)
);

export const hashPassword = async (password) => hash(password, BCRYPT_COST);

export const verifyPassword = async (password, storedPassword) => {
  if (!storedPassword || typeof storedPassword !== "string") {
    return { matches: false, needsMigration: false };
  }

  if (isBcryptHash(storedPassword)) {
    const matches = await compare(password, storedPassword);
    return { matches, needsMigration: false };
  }

  const matches = password === storedPassword;
  return { matches, needsMigration: matches };
};
