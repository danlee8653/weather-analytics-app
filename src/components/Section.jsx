import React from "react";

export default function Section({ title, icon: Icon, right, children }) {
  return (
    <section className="rounded-2xl border shadow-sm p-4 md:p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5" aria-hidden />}
          <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}
