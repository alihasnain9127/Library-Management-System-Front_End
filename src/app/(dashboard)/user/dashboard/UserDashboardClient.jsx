"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCirculationRecords } from "@/redux/slices/circulationSlice";
import { calculateOverdueMetrics } from "@/utils/fineCalculator";
import { format, parseISO } from "date-fns";
import { Loader2, Clock3, BookOpen, Wallet, CheckCircle2 } from "lucide-react";

export default function UserDashboardClient() {
  const dispatch = useDispatch();
  const [hasMounted, setHasMounted] = useState(false);

  // Read from store but don't use values for rendering until mounted
  const userFromStore = useSelector((state) => state.auth.user);
  const recordsFromStore = useSelector((state) => state.circulation.records);
  const loading = useSelector((state) => state.circulation.loading);

  useEffect(() => {
    setTimeout(() => setHasMounted(true), 0);
    dispatch(fetchCirculationRecords("user"));
  }, [dispatch]);

  const user = hasMounted ? userFromStore : null;
  const records = hasMounted ? recordsFromStore : [];

  const activeLoans = records.filter((rec) => rec.status === "Issued");
  const overdueLoans = activeLoans.filter(
    (rec) => calculateOverdueMetrics(rec.dueDate).daysOverdue > 0,
  );
  const totalOutstandingFine = records.reduce((sum, rec) => {
    if (rec.status === "Returned" && !rec.finePaid) return sum + rec.fineAmount;
    if (rec.status === "Issued")
      return sum + calculateOverdueMetrics(rec.dueDate).fineAmount;
    return sum;
  }, 0);

  const nextDueItems = activeLoans
    .map((rec) => ({
      ...rec,
      dueDateObj: parseISO(rec.dueDate),
      daysUntilDue: Math.max(
        0,
        Math.ceil((parseISO(rec.dueDate) - new Date()) / (1000 * 60 * 60 * 24)),
      ),
    }))
    .sort((a, b) => a.dueDateObj - b.dueDateObj)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {hasMounted && user?.name ? (
            <>Welcome back, {user.name.split(" ")[0]}.</>
          ) : (
            <>Welcome back.</>
          )}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Your personal reading and borrowing overview is ready. Keep your
          account in good standing by returning books on time and settling any
          fines.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Active Loans
            </p>
            <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-6 text-4xl font-extrabold text-slate-900 dark:text-slate-50">
            {activeLoans.length}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Books currently in your possession.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Overdue Items
            </p>
            <div className="p-2 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300">
              <Clock3 className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-6 text-4xl font-extrabold text-slate-900 dark:text-slate-50">
            {overdueLoans.length}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Items past their due date.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Outstanding Fine
            </p>
            <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-300">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-6 text-4xl font-extrabold text-slate-900 dark:text-slate-50">
            Rs. {totalOutstandingFine}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Pay promptly to avoid blocked borrowing privileges.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Return Progress
            </p>
            <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-6 text-4xl font-extrabold text-slate-900 dark:text-slate-50">
            {records.length === 0
              ? "—"
              : `${Math.round(((records.length - activeLoans.length) / records.length) * 100)}%`}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Books returned successfully.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Upcoming Returns
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Keep track of your next books to return and stay ahead of due
              dates.
            </p>
          </div>
        </div>

        {loading || !hasMounted ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-slate-400">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-500" />
            Loading your borrowing activity...
          </div>
        ) : nextDueItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center text-slate-500 dark:text-slate-400">
            No books are due soon. Borrow more from the catalog when you are
            ready.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {nextDueItems.map((record) => {
              const metrics = calculateOverdueMetrics(record.dueDate);
              return (
                <div
                  key={record._id}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        {record.bookId?.title || "Unknown title"}
                      </p>
                      <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {record.bookId?.author || "Unknown author"}
                      </h3>
                    </div>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-950 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
                      {record.status}
                    </span>
                  </div>
                  <div className="mt-5 space-y-3 text-sm text-slate-500 dark:text-slate-400">
                    <p>
                      Due:{" "}
                      <span className="font-semibold text-slate-900 dark:text-slate-50">
                        {format(parseISO(record.dueDate), "dd MMM yyyy")}
                      </span>
                    </p>
                    <p>
                      {record.daysUntilDue === 0
                        ? "Due today"
                        : `${record.daysUntilDue} day(s) left`}
                    </p>
                    {metrics.daysOverdue > 0 && (
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        Overdue by {metrics.daysOverdue} day(s)
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
