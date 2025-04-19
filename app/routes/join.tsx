import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";

import ThemeButton from "~/components/ThemeButton";
import { createUser, getUserByEmail } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  // Check Name Field
  const nameEntry = formData.get("name");
  if (typeof nameEntry !== "string" || nameEntry.trim().length === 0) {
    return json(
      { errors: { email: null, password: null, name: "Name is required" } },
      { status: 400 },
    );
  }
  const name = nameEntry;
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

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

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          email: "A user already exists with this email",
          password: null,
        },
      },
      { status: 400 },
    );
  }

  const user = await createUser(email, password, name);

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user.id,
  });
};

export const meta: MetaFunction = () => [{ title: "Sign Up" }];

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
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
        <div className="max-w-md">
          <h1 className="mb-4 text-4xl font-bold">Join Outside Insights</h1>
          <p className="mb-2 text-lg">
            Create your account and start building with AI-powered workflows.
          </p>
          <p className="text-md text-indigo-100">
            Personalized tools, powerful automation, and seamless collaboration
            await.
          </p>
        </div>
      </div>

      {/* Right column: signup form */}
      <div className="auth-form-wrapper">
        <div className="mx-auto w-full max-w-md">
          <h2 className="mb-6 text-center text-2xl font-bold">
            Create your account
          </h2>
          <Form method="post" className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="auth-form-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <div className="mt-1">
                <input
                  ref={emailRef}
                  id="email"
                  required
                  // autoFocus={true}
                  name="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={actionData?.errors?.email ? true : undefined}
                  aria-describedby="email-error"
                  className="auth-form-input"
                />
                {actionData?.errors?.email ? (
                  <div className="pt-1 text-red-700" id="email-error">
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
                  autoComplete="new-password"
                  aria-invalid={actionData?.errors?.password ? true : undefined}
                  aria-describedby="password-error"
                  className="auth-form-input"
                />
                {actionData?.errors?.password ? (
                  <div className="pt-1 text-red-700" id="password-error">
                    {actionData.errors.password}
                  </div>
                ) : null}
              </div>
            </div>

            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button type="submit" className="auth-form-button">
              Create Account
            </button>
            <div className="flex items-center justify-center">
              <div className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  className="text-indigo-600 hover:underline"
                  to={{ pathname: "/login", search: searchParams.toString() }}
                >
                  Log in
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
