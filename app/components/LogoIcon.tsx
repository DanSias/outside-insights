import { Link } from "@remix-run/react";
import { motion } from "framer-motion";

export default function LogoIcon({ className }: { className?: string }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <motion.img
        src="/favicon.png"
        alt="Outside Insights Logo"
        width={32}
        height={32}
        className={`rounded-sm ${className ?? ""}`}
        whileHover={{ rotate: [0, 10, -10, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
      />
      <span className="text-xl font-semibold text-gray-800 dark:text-white">
        Outside Insights
      </span>
    </Link>
  );
}
