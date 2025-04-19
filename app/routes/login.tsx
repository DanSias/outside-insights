import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";

import ThemeButton from "~/components/ThemeButton";
import { verifyLogin } from "~/models/user.server";
import {
  createUserSession,
  getUserId,
  getSession,
  sessionStorage,
} from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 },
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    const session = await getSession(request);
    return json(
      {
        errors: { email: "Invalid email or password", password: null },
      },
      {
        status: 400,
        headers: {
          "Set-Cookie": await sessionStorage.destroySession(session),
        },
      },
    );
  }

  return createUserSession({
    redirectTo,
    remember: remember === "on" ? true : false,
    request,
    userId: user.id,
  });
};

export const meta: MetaFunction = () => [{ title: "Login" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="auth-page">
      {/* Left column: product description */}
      <div className="auth-left-panel">
        {" "}
        <div className="max-w-lg">
          <h1 className="mb-4 text-4xl font-bold">
            Welcome to Outside Insights
          </h1>
          <p className="mb-2 text-lg">
            Unlock the power of AI workflows for smarter, faster decisions.
          </p>
          <p className="text-md">
            Save insights, share conversations, and build your ideas all in one
            place.
          </p>
        </div>
      </div>

      {/* Right column: login form */}
      <div className="auth-form-wrapper">
        <div className="mx-auto w-full max-w-md">
          <h2 className="mb-6 text-center text-2xl font-bold">
            Login to your account
          </h2>
          <Form method="post" className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <div className="mt-1">
                <input
                  ref={emailRef}
                  id="email"
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={actionData?.errors?.email ? true : undefined}
                  aria-describedby="email-error"
                  className="auth-form-input"
                />
                {actionData?.errors?.email ? (
                  <div className="pt-1 text-red-500" id="email-error">
                    {actionData.errors.email}
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  ref={passwordRef}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={actionData?.errors?.password ? true : undefined}
                  aria-describedby="password-error"
                  className="auth-form-input"
                />
                {actionData?.errors?.password ? (
                  <div className="pt-1 text-red-500" id="password-error">
                    {actionData.errors.password}
                  </div>
                ) : null}
              </div>
            </div>

            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button type="submit" className="auth-form-button">
              Log in
            </button>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-800"
                />
                <label htmlFor="remember" className="ml-2 block text-sm">
                  Remember me
                </label>
              </div>
              <div className="text-center text-sm text-gray-500 dark:text-gray-300">
                Don’t have an account?{" "}
                <Link
                  className="text-amber-500 hover:underline"
                  to={{ pathname: "/join", search: searchParams.toString() }}
                >
                  Sign up
                </Link>
                <div className="absolute bottom-4 right-4">
                  <ThemeButton />
                </div>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
