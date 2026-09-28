import type { ReactNode } from "react";

export type TableColumn = {
  label: string;
  align?: "left" | "right";
};

type TableProps<T> = {
  data: T[];
  columns: TableColumn[];
  getRowKey: (item: T) => string | number;
  renderDesktopCells: (item: T) => ReactNode;
  renderMobileContent: (item: T) => ReactNode;
};

export default function Table<T>({
  data,
  columns,
  getRowKey,
  renderDesktopCells,
  renderMobileContent,
}: TableProps<T>) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-225">
          <thead>
            <tr className="border-b border-border bg-background">
              {columns.map((column) => (
                <th
                  key={column.label}
                  className={`px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted ${
                    column.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr
                key={getRowKey(item)}
                className="border-b border-border last:border-0 hover:bg-background/60"
              >
                {renderDesktopCells(item)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border md:hidden">
        {data.map((item) => (
          <div key={getRowKey(item)} className="space-y-4 p-4">
            {renderMobileContent(item)}
          </div>
        ))}
      </div>
    </>
  );
}
