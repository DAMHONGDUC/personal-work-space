import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TableBlock } from "@/lib/docs/doc-model";

/**
 * A table in a guide. The shadcn table already scrolls inside its own container,
 * so a wide table never makes the page scroll sideways.
 */
export function DocTable({
  block,
  accent,
}: {
  block: TableBlock;
  accent: string;
}) {
  return (
    <div className="mt-5 max-w-[80ch] overflow-hidden rounded-xl border border-border-soft">
      <Table className="min-w-[34rem] text-[0.9375rem] sm:text-base">
        <TableHeader>
          <TableRow className="bg-muted-surface">
            {block.columns.map((column) => (
              <TableHead
                key={column}
                className="text-[0.8125rem] font-medium uppercase tracking-wider"
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {block.rows.map((row) => (
            // Keyed by the whole row: a first cell can repeat, as a playlist
            // listed once per range of its lessons does.
            <TableRow key={row.join("\u241f")}>
              {row.map((cell, index) => (
                <TableCell
                  key={index}
                  className={
                    index === 0
                      ? "align-top font-medium"
                      : "align-top leading-6 text-muted whitespace-normal"
                  }
                  // The first column carries the guide's accent, the same way
                  // the section numbers and diagram boxes do.
                  style={index === 0 ? { color: accent } : undefined}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
