import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Save, X } from "lucide-react";
import { EditableField } from './editable-field';

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: Record<string, any>;
  fields: FieldConfig[];
  onSave?: (updatedData: Record<string, any>) => Promise<void>;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  tabs?: TabConfig[];
  readOnly?: boolean;
}

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'badge' | 'boolean';
  options?: { value: string; label: string }[];
  format?: (value: any) => string;
  editable?: boolean;
  required?: boolean;
  section?: string;
}

interface TabConfig {
  key: string;
  label: string;
  content: React.ReactNode;
}

export function DetailModal({
  open,
  onOpenChange,
  title,
  data,
  fields,
  onSave,
  onEdit,
  onDelete,
  tabs,
  readOnly = false
}: DetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(data);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setEditedData(data);
    setIsEditing(false);
  }, [data, open]);

  const handleSave = async () => {
    if (!onSave) return;
    
    setLoading(true);
    try {
      await onSave(editedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedData(data);
    setIsEditing(false);
  };

  const handleFieldChange = (key: string, value: any) => {
    setEditedData(prev => ({ ...prev, [key]: value }));
  };

  const renderField = (field: FieldConfig) => {
    const value = isEditing ? editedData[field.key] : data[field.key];
    
    if (isEditing && field.editable !== false && !readOnly) {
      return (
        <EditableField
          key={field.key}
          field={field}
          value={value}
          onChange={(newValue) => handleFieldChange(field.key, newValue)}
        />
      );
    }

    // Display mode
    switch (field.type) {
      case 'badge':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {field.label}
            </label>
            <div>
              <Badge variant="outline">
                {field.format ? field.format(value) : value}
              </Badge>
            </div>
          </div>
        );
      
      case 'boolean':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {field.label}
            </label>
            <div>
              <Badge variant={value ? "default" : "secondary"}>
                {value ? "Sí" : "No"}
              </Badge>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {field.label}
            </label>
            <div className="text-sm">
              {field.format ? field.format(value) : value || "-"}
            </div>
          </div>
        );
    }
  };

  const groupedFields = fields.reduce((acc, field) => {
    const section = field.section || 'general';
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, FieldConfig[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <div className="flex items-center gap-2">
              {!readOnly && onSave && (
                <>
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={loading}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {tabs ? (
            <Tabs defaultValue={tabs[0]?.key} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Detalles</TabsTrigger>
                {tabs.map(tab => (
                  <TabsTrigger key={tab.key} value={tab.key}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="details" className="mt-6">
                <div className="space-y-6">
                  {Object.entries(groupedFields).map(([section, sectionFields]) => (
                    <Card key={section}>
                      <CardHeader>
                        <CardTitle className="text-lg capitalize">{section}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sectionFields.map(renderField)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              {tabs.map(tab => (
                <TabsContent key={tab.key} value={tab.key} className="mt-6">
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedFields).map(([section, sectionFields]) => (
                <Card key={section}>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">{section}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sectionFields.map(renderField)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}