import React from "react";
import { PropertyType } from "@/types/workflow";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload } from "lucide-react";

interface PropertyFieldProps {
  property: PropertyType;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export const PropertyField: React.FC<PropertyFieldProps> = ({
  property,
  value,
  onChange,
  error
}) => {
  const renderField = () => {
    switch (property.type) {
      case 'text':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={property.description}
            className="min-h-[100px]"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            placeholder={property.description}
        min={typeof property.validation === 'object' && !Array.isArray(property.validation) ? property.validation.min : undefined}
        max={typeof property.validation === 'object' && !Array.isArray(property.validation) ? property.validation.max : undefined}
          />
        );

      case 'single_select':
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${property.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {property.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multi_select':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {(value || []).map((selectedValue: string) => (
                <Badge
                  key={selectedValue}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => {
                    const newValue = (value || []).filter((v: string) => v !== selectedValue);
                    onChange(newValue);
                  }}
                >
                  {selectedValue} ×
                </Badge>
              ))}
            </div>
            <Select
              onValueChange={(newValue) => {
                const currentValues = value || [];
                if (!currentValues.includes(newValue)) {
                  onChange([...currentValues, newValue]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add option..." />
              </SelectTrigger>
              <SelectContent>
                {property.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'url':
        return (
          <Input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com"
          />
        );

      case 'file':
        return (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drop files here or click to upload
            </p>
            <Input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                onChange(files);
              }}
              className="hidden"
              id={`file-${property.id}`}
            />
            <Label
              htmlFor={`file-${property.id}`}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Choose Files
            </Label>
          </div>
        );

      case 'json':
        return (
          <Textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed);
              } catch {
                onChange(e.target.value);
              }
            }}
            placeholder='{"key": "value"}'
            className="min-h-[150px] font-mono text-sm"
          />
        );

      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={property.description}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {property.name}
          {property.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Badge variant="outline" className="text-xs">
          {property.type}
        </Badge>
      </div>
      
      {property.description && (
        <p className="text-xs text-muted-foreground">{property.description}</p>
      )}
      
      {renderField()}
      
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};