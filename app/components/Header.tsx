import { Menu } from "@headlessui/react";
import { SunIcon, MoonIcon, PowerIcon } from "@heroicons/react/24/outline";
import { Link, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

import { useOptionalUser } from "~/utils";

import LogoIcon from "./LogoIcon";

export default function Header() {
  const user = useOptionalUser();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const [isDark, setIsDark] = useState(false);
  const fetcher = useFetcher();

  useEffect(() => {
    const darkPreference =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    if (darkPreference === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", newMode === "dark");
    localStorage.setItem("theme", newMode);
    setIsDark(!isDark);
  };

  return (
    <header className="flex w-full items-center justify-between gap-4 bg-white px-4 py-3 shadow-md dark:bg-gray-900 dark:text-white">
      {/* Left: Project name or dynamic page title */}
      <LogoIcon />

      {/* Center: Search bar */}
      <div className="mx-auto max-w-md flex-1">
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring focus:ring-amber-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-amber-400"
        />
      </div>

      {/* Right: Avatar or Login link */}
      <div>
        {user ? (
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 font-semibold text-white hover:bg-amber-500">
              {initials}
            </Menu.Button>

            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-800">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={toggleDarkMode}
                      className={`$${
                        active ? "bg-indigo-100 dark:bg-gray-700" : ""
                      } group flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-900 dark:text-white`}
                    >
                      {isDark ? (
                        <SunIcon className="h-5 w-5" />
                      ) : (
                        <MoonIcon className="h-5 w-5" />
                      )}
                      {isDark ? "Use Light Mode" : "Use Dark Mode"}
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() =>
                        fetcher.submit(null, {
                          method: "POST",
                          action: "/logout",
                        })
                      }
                      className={`$${
                        active ? "bg-indigo-100 dark:bg-gray-700" : ""
                      } group flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-900 dark:text-white`}
                    >
                      <PowerIcon className="h-5 w-5" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        ) : (
          <Link
            to="/login"
            className="inline-block rounded bg-amber-400 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:bg-amber-300 dark:hover:bg-amber-400 dark:focus:ring-amber-200"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
