"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronRight, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AccountStatus, Person, Sparkline } from "@/components/dashboard/kit";
import { UserStatusMenu } from "@/components/dashboard/admin/user-status-menu";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface AffiliateRow {
  id: string;
  userId: string;
  memberId: number;
  name: string;
  email: string;
  status: string;
  clicks: number;
  conversions: number;
  /** Conversions per click, in percent. */
  rate: number;
  /** Their share, all time. */
  earned: number;
  paid: number;
  balance: number;
  /** Gross per day over the last two weeks, oldest first. */
  spark: number[];
}

type SortKey = "name" | "clicks" | "conversions" | "rate" | "earned" | "balance";

const COLUMNS: { key: SortKey; label: string; className?: string }[] = [
  { key: "clicks", label: "Clics", className: "hidden md:table-cell" },
  { key: "conversions", label: "Conv." },
  { key: "rate", label: "Taux", className: "hidden lg:table-cell" },
  { key: "earned", label: "Sa part", className: "hidden sm:table-cell" },
  { key: "balance", label: "Solde" },
];

interface SortState {
  key: SortKey;
  desc: boolean;
}

/** A column header that sorts. Declared at module level so it keeps its
 *  identity between renders instead of being rebuilt with the table. */
function SortHead({
  column,
  sort,
  onToggle,
  className,
  children,
  align = "right",
}: {
  column: SortKey;
  sort: SortState;
  onToggle: (key: SortKey) => void;
  className?: string;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const active = sort.key === column;
  const Icon = sort.desc ? ArrowDown : ArrowUp;
  return (
    <TableHead className={cn(align === "right" && "text-right", className)}>
      <button
        type="button"
        onClick={() => onToggle(column)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
          active && "text-foreground",
        )}
      >
        {children}
        <Icon className={cn("h-3 w-3", active ? "opacity-100" : "opacity-0")} />
      </button>
    </TableHead>
  );
}

/**
 * Every affiliate on one screen, searchable and sortable in place.
 *
 * Sorted by what is owed by default: the list is opened most often to answer
 * "who do I pay", and the answer should be at the top without a click. The
 * figures in the money columns are each affiliate's own share — the gross the
 * network bills lives on the revenue screen, not here.
 */
export function AffiliatesTable({ rows }: { rows: AffiliateRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>({
    key: "balance",
    desc: true,
  });

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? rows.filter(
          (row) =>
            row.name.toLowerCase().includes(needle) ||
            row.email.toLowerCase().includes(needle) ||
            String(row.memberId).includes(needle),
        )
      : rows;

    return [...filtered].sort((a, b) => {
      const direction = sort.desc ? -1 : 1;
      if (sort.key === "name")
        return a.name.localeCompare(b.name, "fr") * direction;
      return (a[sort.key] - b[sort.key]) * direction;
    });
  }, [rows, query, sort]);

  const totals = visible.reduce(
    (sum, row) => ({
      clicks: sum.clicks + row.clicks,
      conversions: sum.conversions + row.conversions,
      earned: sum.earned + row.earned,
      balance: sum.balance + row.balance,
    }),
    { clicks: 0, conversions: 0, earned: 0, balance: 0 },
  );

  function toggle(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, desc: !current.desc }
        : { key, desc: key !== "name" },
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4">
        <label className="relative block w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Chercher un nom, un email, un numéro"
            className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-9 text-sm placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          {visible.length === rows.length
            ? `${formatNumber(rows.length)} affilié${rows.length > 1 ? "s" : ""}`
            : `${formatNumber(visible.length)} sur ${formatNumber(rows.length)}`}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="px-5 pb-10 pt-6 text-center text-sm text-muted-foreground">
          Aucun affilié ne correspond à « {query} ».
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead
                column="name"
                sort={sort}
                onToggle={toggle}
                align="left"
                className="pl-5"
              >
                Affilié
              </SortHead>
              <TableHead className="hidden xl:table-cell">Statut</TableHead>
              <TableHead className="hidden w-[120px] xl:table-cell">
                14 derniers jours
              </TableHead>
              {COLUMNS.map((column) => (
                <SortHead
                  key={column.key}
                  column={column.key}
                  sort={sort}
                  onToggle={toggle}
                  className={column.className}
                >
                  {column.label}
                </SortHead>
              ))}
              <TableHead className="pr-3" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((row) => (
              <TableRow key={row.id} className="group">
                <TableCell className="pl-5">
                  <Link href={`/admin/affiliates/${row.id}`} className="block">
                    <Person
                      name={row.name}
                      detail={`#${row.memberId} · ${row.email}`}
                    />
                  </Link>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <AccountStatus status={row.status} />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <Sparkline
                    data={row.spark}
                    tone={row.spark.some((value) => value > 0) ? "primary" : "muted"}
                    className="h-7 w-[104px]"
                    height={28}
                  />
                </TableCell>
                <TableCell className="num hidden text-right text-muted-foreground md:table-cell">
                  {formatNumber(row.clicks)}
                </TableCell>
                <TableCell className="num text-right">
                  {formatNumber(row.conversions)}
                </TableCell>
                <TableCell className="num hidden text-right text-muted-foreground lg:table-cell">
                  {row.clicks > 0 ? formatPercent(row.rate) : "—"}
                </TableCell>
                <TableCell className="num hidden text-right sm:table-cell">
                  {formatCurrency(row.earned)}
                </TableCell>
                <TableCell
                  className={cn(
                    "num text-right font-semibold",
                    row.balance <= 0.005 && "font-normal text-muted-foreground",
                  )}
                >
                  {formatCurrency(row.balance)}
                </TableCell>
                <TableCell className="pr-3">
                  <div className="flex items-center justify-end gap-0.5">
                    <UserStatusMenu
                      userId={row.userId}
                      currentStatus={row.status}
                      userLabel={row.name}
                    />
                    <Link
                      href={`/admin/affiliates/${row.id}`}
                      aria-label={`Ouvrir la fiche de ${row.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableCell className="pl-5 font-semibold">Total</TableCell>
              <TableCell className="hidden xl:table-cell" />
              <TableCell className="hidden xl:table-cell" />
              <TableCell className="num hidden text-right font-semibold md:table-cell">
                {formatNumber(totals.clicks)}
              </TableCell>
              <TableCell className="num text-right font-semibold">
                {formatNumber(totals.conversions)}
              </TableCell>
              <TableCell className="hidden lg:table-cell" />
              <TableCell className="num hidden text-right font-semibold sm:table-cell">
                {formatCurrency(totals.earned)}
              </TableCell>
              <TableCell className="num text-right font-semibold">
                {formatCurrency(totals.balance)}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      )}
    </div>
  );
}
