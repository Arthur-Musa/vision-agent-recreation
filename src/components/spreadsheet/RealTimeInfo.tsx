export const RealTimeInfo = () => {
  return (
    <div className="mt-4 p-3 border border-border/40 rounded-lg bg-muted/10">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        <p className="text-xs text-muted-foreground">
          Atualização automática ativa
        </p>
      </div>
    </div>
  );
};