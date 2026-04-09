import { useState } from 'react';
import { Link } from "react-router-dom"; 
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-xl bg-white/20 dark:bg-slate-900/50 border-b border-white/30 dark:border-slate-800 shadow-lg shadow-black/10 dark:shadow-black/40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <a href="/" className="font-semibold text-xl text-slate-900 dark:text-white drop-shadow-sm">
          {/* <img src="icon16.png" alt="SafeLearn AI" className="w-8 h-8" /> */}
          SafeLearn AI
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 dark:text-slate-300 md:flex">
          <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition">How it works</a>
          <a href="#trust" className="hover:text-slate-900 dark:hover:text-white transition">Trust</a>
          <a href="#testimonials" className="hover:text-slate-900 dark:hover:text-white transition">Testimonials</a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/auth"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition hover:bg-indigo-700"
          >
            Start free
          </Link>

          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <span className="text-lg">☰</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/30 dark:border-slate-800 bg-white/85 dark:bg-slate-900/90 backdrop-blur-xl">
          <div className="flex flex-col gap-2 px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
            <a href="#features" className="block rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">Features</a>
            <a href="#how-it-works" className="block rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">How it works</a>
            <a href="#trust" className="block rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">Trust</a>
            <a href="#testimonials" className="block rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">Testimonials</a>
          </div>
        </div>
      )}
    </header>
  );
}
