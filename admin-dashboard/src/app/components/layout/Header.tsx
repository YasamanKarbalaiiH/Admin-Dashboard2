"use client";

import { Bell, Menu, Search } from "lucide-react";

type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-text-secondary hover:bg-background lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="hidden h-10 w-72 items-center gap-2 rounded-xl bg-background px-3 md:flex">
          <Search size={18} className="text-text-muted" />

          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-text-muted"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-xl p-2.5 text-text-secondary hover:bg-background">
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
        </button>

        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            Y
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-semibold text-text-primary">
              Yasaman Karbalaii
            </p>

            <p className="text-xs text-text-muted">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
