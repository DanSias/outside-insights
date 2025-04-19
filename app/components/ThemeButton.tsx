import { useEffect, useState } from "react";

export default function DarkModeToggleButton() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const initial =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggle = () => {
    const newTheme = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
    setIsDark(!isDark);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="mt-6 rounded bg-amber-400 px-4 py-2 text-sm font-medium text-gray-900 shadow hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:bg-amber-300 dark:hover:bg-amber-400 dark:focus:ring-amber-200"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
