import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";

const MIN_PASSWORD_LENGTH = 12;

export class PasswordService {
  async hashPassword(password: string) {
    this.assertStrongPassword(password);
    return bcrypt.hash(password, env.BCRYPT_ROUNDS);
  }

  async verifyPassword(password: string, passwordHash: string) {
    return bcrypt.compare(password, passwordHash);
  }

  assertStrongPassword(password: string) {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (password.length < MIN_PASSWORD_LENGTH || !hasLowercase || !hasUppercase || !hasNumber || !hasSymbol) {
      throw new Error(
        "Admin password must be at least 12 characters and include uppercase, lowercase, number, and symbol characters."
      );
    }
  }
}
