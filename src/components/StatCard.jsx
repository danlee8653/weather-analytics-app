import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border shadow-sm p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl border">
          <Icon className="w-5 h-5" aria-hidden />
        </div>
        <div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
          <div className="text-xl font-semibold">{value}</div>
          {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
        </div>
      </div>
    </motion.div>
  );
}
