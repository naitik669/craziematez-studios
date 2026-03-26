<motion.div
  key={m.member_id}
  onClick={() =>
    openMember(m, {
      tasks,
      delivery,
      isAbsent,
      absentUntil: data.absences.find(
        a => a.member_id === m.member_id
      )?.absent_until,
    })
  }
  style={{ cursor: "pointer" }}
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: Math.min(i * 0.04, 0.5) }}
  whileHover={{
    y: -4,
    scale: 1.015,
  }}
  className="group bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300"
>

  {/* 🔥 top gradient glow strip */}
  <div
    className="h-[2px] w-full opacity-60 group-hover:opacity-100 transition-opacity"
    style={{
      background: `linear-gradient(90deg, transparent, ${rc}, transparent)`
    }}
  />

  <div className="p-4">
    <div className="flex items-start justify-between mb-4">

      {/* 🔥 avatar with glow */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-black transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${rc}, ${rc}aa, ${rc})`,
          boxShadow: `0 6px 18px ${rc}40`,
        }}
      >
        {initials(m.studio_name || m.display_name)}
      </div>

      <ChevronRight
        size={14}
        className="text-neutral-700 mt-1 transition-transform group-hover:translate-x-1"
      />
    </div>

    <p className="font-semibold text-white text-sm">
      {m.studio_name || m.display_name}
    </p>

    <p className="text-[11px] text-neutral-600">
      @{m.display_name}
    </p>
  </div>

  {/* 🔥 hover glow overlay */}
  <div
    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"
    style={{
      background: `radial-gradient(circle at 50% 0%, ${rc}20, transparent 60%)`
    }}
  />
</motion.div>
