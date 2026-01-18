import bcrypt from "bcrypt";

export default async function hashPassword(password: string) {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

export async function comparePasswords(password:string, hashedPassword:string) {
  return await bcrypt.compare(password, hashedPassword);
}