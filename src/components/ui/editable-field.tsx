import React from 'react';
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Switch } from "./switch";
import { Label } from "./label";

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'badge' | 'boolean';
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface EditableFieldProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
}

export function EditableField({ field, value, onChange }: EditableFieldProps) {
  const handleChange = (newValue: any) => {
    onChange(newValue);
  };

  switch (field.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required}
          />
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)}
            required={field.required}
          />
        </div>
      );

    case 'date':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            type="date"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required}
          />
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Textarea
            id={field.key}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required}
          />
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Select value={value || ''} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Seleccionar ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={field.key}
            checked={value || false}
            onCheckedChange={handleChange}
          />
          <Label htmlFor={field.key}>{field.label}</Label>
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required}
          />
        </div>
      );
  }
}