import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  progress: number;
  uploading: boolean;
}

export const UploadProgress = ({ progress, uploading }: UploadProgressProps) => {
  if (!uploading) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Enviando arquivos...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};