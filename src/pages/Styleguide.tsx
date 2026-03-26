import { useDashboard } from "@/hooks/use-dashboard";
import { motion } from "framer-motion";
import { useState } from "react";
import { Palette, Lock, Unlock, Check, Copy } from "lucide-react";

function ColorSwatch({ name, value }: { name: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const isColor = /^#([0-9A-Fa-f]{3,8})$/.test(value) || /^(rgb|hsl)/.test(value);

  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden cursor-pointer group hover:border-white/[0.1] transition-all"
      onClick={copy}
    >
      {isColor ? (
        <div className="h-20 w-full relative" style={{ background: value }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 flex items-center justify-center">
            {copied ? <Check size={20} className="text-white" /> : <Copy size={16} className="text-white" />}
          </div>
        </div>
      ) : (
        <div className="h-20 w-full bg-gradient-to-br from-orange-500/10 to-transparent flex items-center justify-center">
          <span className="text-orange-500 font-mono-jet text-xs truncate px-3 text-center">{value.slice(0, 30)}</span>
        </div>
      )}
      <div className="p-3">
        <p className="text-[11px] font-semibold text-white capitalize">{name.replace(/_/g, " ")}</p>
        <p className="text-[10px] text-neutral-600 font-mono-jet mt-0.5 truncate">{value}</p>
      </div>
    </motion.div>
  );
}

export default function Styleguide() {
  const { data } = useDashboard();

  if (!data) return <div className="p-6 text-neutral-600">Loading...</div>;
  const sg = data.styleguide;
  const isLocked = sg["locked"] === "true";
  const keys = Object.keys(sg).filter(k => k !== "locked");

  const colorKeys = keys.filter(k => {
    const v = sg[k];
    return /^#([0-9A-Fa-f]{3,8})$/.test(v) || /^(rgb|hsl)/.test(v);
  });
  const otherKeys = keys.filter(k => !colorKeys.includes(k));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Style Guide</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{keys.length} rules defined</p>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${
            isLocked
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-orange-500/10 border-orange-500/20 text-orange-400"
          }`}
        >
          {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
          {isLocked ? "Locked" : "In Progress"}
        </div>
      </div>

      {keys.length === 0 ? (
        <div className="text-center py-20 text-neutral-600">
          <Palette size={40} className="mx-auto mb-3 opacity-30" />
          <p>No style guide entries yet</p>
          <p className="text-sm mt-1">Add rules in your Supabase styleguide table</p>
        </div>
      ) : (
        <>
          {colorKeys.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-widest text-neutral-600 font-semibold mb-3">Colors & Visuals</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {colorKeys.map(k => <ColorSwatch key={k} name={k} value={sg[k]} />)}
              </div>
            </div>
          )}
          {otherKeys.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-widest text-neutral-600 font-semibold mb-3">Rules & Guidelines</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {otherKeys.map((k, i) => (
                  <motion.div
                    key={k}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-[#111] border border-white/[0.06] rounded-2xl p-4"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2 capitalize">{k.replace(/_/g, " ")}</p>
                    <p className="text-sm text-neutral-300 font-mono-jet leading-relaxed">{sg[k]}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
