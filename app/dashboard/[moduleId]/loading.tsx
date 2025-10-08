export default function ModuleLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="text-sm text-muted-foreground">Loading module...</p>
      </div>
    </div>
  );
}
