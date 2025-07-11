import React from 'react';
import { ProcessingProgress } from './ProcessingProgress';

interface MultiFileProcessingProgressProps {
  processingFiles: Map<string, any>;
}

export const MultiFileProcessingProgress: React.FC<MultiFileProcessingProgressProps> = ({
  processingFiles
}) => {
  return (
    <div className="space-y-4">
      {Array.from(processingFiles.entries()).map(([fileId, fileData]) => (
        <ProcessingProgress
          key={fileId}
          fileName={fileData.fileName}
          steps={fileData.steps}
          currentStep={fileData.currentStep}
          overallProgress={fileData.overallProgress}
        />
      ))}
    </div>
  );
};