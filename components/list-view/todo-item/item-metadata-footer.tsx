export function ItemMetadataFooter({ createdAt }: { createdAt: string }) {
  return (
    <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
      <span>Created {new Date(createdAt).toLocaleDateString()}</span>
    </div>
  );
}
