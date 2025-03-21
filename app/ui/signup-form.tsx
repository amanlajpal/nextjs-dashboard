"use client";

import { lusitana } from "@/app/ui/fonts";
import { AtSymbolIcon, ExclamationCircleIcon, KeyIcon, UserIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Button } from "./button";
import { useActionState } from "react";
import { register } from "@/app/lib/actions";
import { useSearchParams } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Signup',
};

export default function SignupForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/login";
  const [state, formAction, isPending] = useActionState(
    register,
    undefined
  );
  return (
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Please signup to continue.
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="name"
            >
              Name
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="name"
                type="text"
                name="name"
                placeholder="Enter your name"
                required
              />
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            {state?.errors?.name && <p className="text-xs font-medium text-gray-900">{state.errors.name}</p>}
          </div>
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            {state?.errors?.email && <p className="text-xs font-medium text-gray-900">{state.errors.email}</p>}
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            {state?.errors?.password && <div>
              <p className="text-xs font-medium text-gray-900 mt-2">Password Must:</p>
              <ul>
                {state.errors.password.map((error)=><li className="text-xs font-medium text-gray-900" key={error}>- {error}</li>)}  
              </ul>  
            </div>}
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Enter Confirm Password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            {state?.errors?.password && <div>
              <p className="text-xs font-medium text-gray-900 mt-2">Password Must:</p>
              <ul>
                {state.errors.password.map((error)=><li className="text-xs font-medium text-gray-900" key={error}>- {error}</li>)}  
              </ul>  
            </div>}
          </div>
        </div>
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        <Button className="mt-4 w-full" aria-disabled={isPending}>
          Singup <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        <div className="mt-4 text-center text-sm font-medium text-gray-900">
          Welcome back! Log in to continue.
          <Link href="/login" className="ml-1 text-blue-500 text-sm font-medium hover:underline">Login</Link>
        </div>
        <div className="flex h-8 items-end space-x-1">
          {state?.message && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{state.message}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
