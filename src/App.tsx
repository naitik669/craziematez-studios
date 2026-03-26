import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/Sidebar";

import Overview from "@/pages/Overview";
import Pipeline from "@/pages/Pipeline";
import Team from "@/pages/Team";
import Revisions from "@/pages/Revisions";
import Files from "@/pages/Files";
import Meetings from "@/pages/Meetings";
import Notes from "@/pages/Notes";
import Styleguide from "@/pages/Styleguide";
import LeftMembers from "@/pages/LeftMembers";

const queryClient = new QueryClient();

export type Tab =
  | "overview"
  | "pipeline"
  | "team"
  | "revisions"
  | "files"
  | "meetings"
  | "notes"
  | "styleguide"
  | "left-members"; // ✅ added missing type

const PAGES: Record<Tab, React.ComponentType> = {
  overview: Overview,
  pipeline: Pipeline,
  team: Team,
  revisions: Revisions,
  files: Files,
  meetings: Meetings,
  notes: Notes,
  styleguide: Styleguide,
  "left-members": LeftMembers,
};

function Inner() {
  const [tab, setTab] = useState<Tab>("overview");
  const Page = PAGES[tab];

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
      <Sidebar active={tab} onNavigate={(t) => setTab(t as Tab)} />

      <main className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="min-h-full"
          >
            <Page />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Inner />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
