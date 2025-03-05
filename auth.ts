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
    const createdUser = await sql<User[]>`INSERT INTO users (name, email, password) VALUES (${name}, ${email}, ${password}) RETURNING name, email`;
    console.log(createdUser, "createdUser")
    return createdUser?.[0];
  } catch (error) {
    console.error("Failed to create user: ", error);
    throw new Error("Failed to create user.");
  }
}
export type FormState =
  | {
      errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
      }
      message?: string
    }
  | undefined;

export const SignupFormSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long." })
      .trim(),
    email: z.string().email({ message: "Please enter a valid email." }).trim(),
    password: z
      .string()
      .min(6, { message: "Be at least 8 characters long" })
      .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
      .regex(/[0-9]/, { message: "Contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Contain at least one special character.",
      })
      .trim(),
    confirmPassword: z
      .string()
      .min(6, { message: "Be at least 8 characters long" })
      .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
      .regex(/[0-9]/, { message: "Contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Contain at least one special character.",
      })
      .trim(),
  })
  .refine((data) => data.password === data?.confirmPassword, {
    message: "Confirm Password doesn't match Password!",
    path: ["confirm"],
  });

export async function signUp(
  formData: FormData
): Promise<FormState | string> {
  let redirectPath = '/signup';
  try {
    const credentials = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };
    const parsedCredentials = SignupFormSchema.safeParse(credentials);
    if (parsedCredentials.success) {
      let { name, email, password } = parsedCredentials.data;
      const user = await getUser(email);
      if (user) {
        return {
          message: 'User already exist with email.',
        }
      } else {
        const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);
        const salt = await bcrypt.genSalt(saltRounds);
        password = await bcrypt.hash(password, salt);
        const createdUser = await createUser({ name, email, password });
        if (!createdUser) {
          return {
            message: 'An error occurred while creating your account.',
          }
        }
        redirectPath = '/login/';
      }
    } else{
      return {
        errors: parsedCredentials.error.flatten().fieldErrors,
      };
    }
  } catch (error) {
    console.error("Failed to sign up: ", error);
    throw new Error("Failed to sign up.");
  } 
  return redirectPath;
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
