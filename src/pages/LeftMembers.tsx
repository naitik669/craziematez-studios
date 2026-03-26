import { useQuery } from "@tanstack/react-query";

interface LeftMember {
  id: number;
  member_id: number;
  display_name: string;
  studio_name: string | null;
  role_desc: string | null;
  skills: string | null;
  left_at: string;
  reason: string;
}

function initials(name: string) {
  return (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function LeftMembers() {
  const { data, isLoading, error } = useQuery<{ left_members: LeftMember[] }>({
    queryKey: ["left-members"],
    queryFn: () => fetch("/api/left-members").then(r => r.json()),
  });

  if (isLoading) return <div className="p-8 text-neutral-400">Loading...</div>;
  if (error) return <div className="p-8 text-red-400">Failed to load</div>;

  const members = data?.left_members ?? [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Former Members</h1>
      <p className="text-neutral-400 mb-6">{members.length} member{members.length !== 1 ? "s" : ""} have left the studio</p>

      {members.length === 0 ? (
        <div className="text-neutral-500 text-center py-20">No members have left yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(m => (
            <div key={m.id} className="bg-[#141414] border border-neutral-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-300">
                  {initials(m.display_name)}
                </div>
                <div>
                  <div className="font-semibold text-white">{m.display_name}</div>
                  {m.studio_name && <div className="text-xs text-neutral-400">{m.studio_name}</div>}
                </div>
                <span className="ml-auto text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                  Left
                </span>
              </div>
              {m.role_desc && <div className="text-xs text-neutral-400 mb-1">{m.role_desc}</div>}
              {m.skills && <div className="text-xs text-neutral-500 mb-2">Skills: {m.skills}</div>}
              <div className="text-xs text-neutral-600">
                Left: {m.left_at ? new Date(m.left_at).toLocaleDateString() : "Unknown"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
