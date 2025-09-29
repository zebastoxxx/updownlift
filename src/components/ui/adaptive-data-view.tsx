import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface AdaptiveDataViewProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchKey?: string;
  searchPlaceholder?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onBulkDelete?: (items: T[]) => void;
  enableMultiSelect?: boolean;
  mobileCardComponent: (item: T) => ReactNode;
  emptyMessage?: string;
  loading?: boolean;
}

export function AdaptiveDataView<T>({
  data,
  columns,
  searchKey,
  searchPlaceholder,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
  enableMultiSelect = false,
  mobileCardComponent,
  emptyMessage = "No se encontraron elementos",
  loading = false
}: AdaptiveDataViewProps<T>) {
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (!isMobile) {
    // Desktop: Show DataTable
    return (
      <DataTable
        columns={columns}
        data={data}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        onBulkDelete={onBulkDelete}
        enableMultiSelect={enableMultiSelect}
      />
    );
  }

  // Mobile: Show card grid
  return (
    <div className="space-y-3">
      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-3">
          {data.map((item, index) => (
            <div key={index}>
              {mobileCardComponent(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}