import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import type { User } from "@/app/lib/definitions";
import bcrypt from "bcrypt";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

async function createUser({name, email, password}: { name: string, email:string, password: string}): Promise<User | undefined> {
  try {
    const createdUser = await sql<User[]>`INSERT INTO users (name, email, password) VALUES (${name}, ${email}, ${password})`;
    return createdUser[0];
  } catch (error) {
    console.error("Failed to create user: ", error);
    throw new Error("Failed to create user.");
  }
}

export async function signUp(
  formData: FormData
): Promise<User | undefined | string> {
  try {
    const credentials = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };
    console.log(credentials, "credentials");
    const parsedCredentials = z
      .object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
        confirmPassword: z.string().min(6),
      })
      .refine(
        (data) => data.password === data?.confirmPassword,
        {
          message: "Confirm Password doesn't match Password!",
          path: ["confirm"],
        }
      )
      .safeParse(credentials);
    if (parsedCredentials.success) {
      let { name, email, password } = parsedCredentials.data;
      const user = await getUser(email);
      if (user) {
        return new Promise((resolve) => {
          resolve("user already registered");
        });
      } else {
        const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);
        const salt = await bcrypt.genSalt(saltRounds);
        password = await bcrypt.hash(password, salt);
        return await createUser({ name, email, password });
      }
    }
    else{
      return new Promise((resolve) => {
        resolve("Invalid credentials");
      });
    }
  } catch (error) {
    console.error("Failed to sign up: ", error);
    throw new Error("Failed to sign up.");
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
});
