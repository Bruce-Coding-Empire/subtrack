import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import type { PaymentHistoryEntry } from "@/types";

type Props = {
  paymentHistory: PaymentHistoryEntry[];
};

export function PaymentHistoryList({ paymentHistory }: Props) {
  if (paymentHistory.length === 0) {
    return <p className="py-8 text-center text-sm text-text-muted">No payment history yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-xs font-medium tracking-wide text-text-secondary uppercase">Date</TableHead>
          <TableHead className="text-xs font-medium tracking-wide text-text-secondary uppercase">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paymentHistory.map((entry) => (
          <TableRow key={entry.id} className="hover:bg-surface-secondary">
            <TableCell className="text-sm text-text-primary">{formatDate(entry.paidAt)}</TableCell>
            <TableCell className="text-sm text-text-primary">{formatCurrency(entry.amount, entry.currency)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
