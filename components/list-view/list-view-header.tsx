import { ShareButton } from "@/components/ui/share-button";

interface ListViewHeaderProps {
  title: string;
  hash: string;
  role: "owner" | "collaborator";
}

export function ListViewHeader({ title, hash, role }: ListViewHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <a
          href="/dashboard"
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Back to dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </a>
        <h1 className="text-2xl font-bold">{title}</h1>
        {role === "collaborator" && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            shared
          </span>
        )}
        <div className="ml-auto">
          <ShareButton hash={hash} />
        </div>
      </div>
    </header>
  );
}
