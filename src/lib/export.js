import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function fileStamp() {
  return new Date().toISOString().slice(0, 10);
}

function fmtMoney(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

/**
 * Builds the shared summary shape used by both exporters, so the Excel
 * workbook and the PDF report always agree with each other and with what's
 * on screen in Stats.
 */
function buildSummary({ expenses, byCategory, totalSpent, avgTransaction }) {
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  return {
    generatedOn: todayLabel(),
    totalSpent,
    transactionCount: expenses.length,
    avgTransaction,
    byCategory,
    sortedExpenses,
  };
}

export function exportStatsToExcel({ expenses, byCategory, totalSpent, avgTransaction, monthlyTotals }) {
  const summary = buildSummary({ expenses, byCategory, totalSpent, avgTransaction });

  const workbook = XLSX.utils.book_new();

  // --- Overview sheet -------------------------------------------------
  const overviewRows = [
    ["Notarium — Spending report"],
    [`Generated on ${summary.generatedOn}`],
    [],
    ["Metric", "Value"],
    ["Total tracked", summary.totalSpent],
    ["Transactions", summary.transactionCount],
    ["Average per expense", Number(summary.avgTransaction.toFixed(2))],
    [],
    ["Spending by category"],
    ["Category", "Amount", "Share of total"],
    ...byCategory.map((c) => [
      c.category,
      c.amount,
      summary.totalSpent > 0 ? `${Math.round((c.amount / summary.totalSpent) * 100)}%` : "0%",
    ]),
  ];
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewRows);
  overviewSheet["!cols"] = [{ wch: 24 }, { wch: 16 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(workbook, overviewSheet, "Overview");

  // --- Monthly trend sheet --------------------------------------------
  if (monthlyTotals?.length) {
    const monthRows = [
      ["Month", "Total spent"],
      ...monthlyTotals.map((m) => [m.label, m.total]),
    ];
    const monthSheet = XLSX.utils.aoa_to_sheet(monthRows);
    monthSheet["!cols"] = [{ wch: 12 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(workbook, monthSheet, "Monthly trend");
  }

  // --- Full expense list sheet -----------------------------------------
  const expenseRows = [
    ["Date", "Description", "Category", "Amount"],
    ...summary.sortedExpenses.map((e) => [e.date, e.description, e.category, e.amount]),
  ];
  const expenseSheet = XLSX.utils.aoa_to_sheet(expenseRows);
  expenseSheet["!cols"] = [{ wch: 12 }, { wch: 30 }, { wch: 14 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, expenseSheet, "All expenses");

  XLSX.writeFile(workbook, `notarium-spending-report-${fileStamp()}.xlsx`);
}

export function exportStatsToPDF({ expenses, byCategory, totalSpent, avgTransaction, monthlyTotals, topExpenses }) {
  const summary = buildSummary({ expenses, byCategory, totalSpent, avgTransaction });

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const ink = [24, 24, 27]; // zinc-900, matches the app's dark text
  const muted = [113, 113, 122]; // zinc-500

  // --- Header -----------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...ink);
  doc.text("Notarium", margin, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...muted);
  doc.text("Spending report", margin, 68);
  doc.text(`Generated on ${summary.generatedOn}`, pageWidth - margin, 68, { align: "right" });

  doc.setDrawColor(228, 228, 231); // zinc-200
  doc.line(margin, 82, pageWidth - margin, 82);

  // --- Summary tiles ------------------------------------------------------
  const tiles = [
    { label: "Total tracked", value: fmtMoney(summary.totalSpent) },
    { label: "Transactions", value: String(summary.transactionCount) },
    { label: "Avg. per expense", value: fmtMoney(summary.avgTransaction) },
  ];
  const tileWidth = (pageWidth - margin * 2 - 20) / 3;
  tiles.forEach((tile, i) => {
    const x = margin + i * (tileWidth + 10);
    const y = 100;
    doc.setFillColor(244, 244, 245); // zinc-100
    doc.roundedRect(x, y, tileWidth, 54, 6, 6, "F");
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(tile.label.toUpperCase(), x + 12, y + 20);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ink);
    doc.text(tile.value, x + 12, y + 40);
    doc.setFont("helvetica", "normal");
  });

  let cursorY = 178;

  // --- Category breakdown table -----------------------------------------
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...ink);
  doc.text("Spending by category", margin, cursorY);

  autoTable(doc, {
    startY: cursorY + 10,
    margin: { left: margin, right: margin },
    head: [["Category", "Amount", "Share"]],
    body: byCategory.map((c) => [
      c.category,
      fmtMoney(c.amount),
      summary.totalSpent > 0 ? `${Math.round((c.amount / summary.totalSpent) * 100)}%` : "0%",
    ]),
    theme: "plain",
    styles: { fontSize: 10, textColor: ink, cellPadding: 6 },
    headStyles: { textColor: muted, fontStyle: "bold", fillColor: false },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
    didDrawPage: (data) => {
      cursorY = data.cursor.y;
    },
    didParseCell: (data) => {
      if (data.row.section === "body") {
        data.cell.styles.lineWidth = { top: 0, bottom: 0.5, left: 0, right: 0 };
        data.cell.styles.lineColor = [244, 244, 245];
      }
    },
  });
  cursorY = doc.lastAutoTable.finalY + 26;

  // --- Monthly trend table --------------------------------------------
  if (monthlyTotals?.length) {
    if (cursorY > 650) {
      doc.addPage();
      cursorY = 50;
    }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ink);
    doc.text("Monthly trend", margin, cursorY);

    autoTable(doc, {
      startY: cursorY + 10,
      margin: { left: margin, right: margin },
      head: [monthlyTotals.map((m) => m.label)],
      body: [monthlyTotals.map((m) => fmtMoney(m.total))],
      theme: "plain",
      styles: { fontSize: 10, textColor: ink, cellPadding: 6, halign: "center" },
      headStyles: { textColor: muted, fontStyle: "bold", fillColor: false, halign: "center" },
    });
    cursorY = doc.lastAutoTable.finalY + 26;
  }

  // --- Largest expenses table --------------------------------------------
  if (topExpenses?.length) {
    if (cursorY > 620) {
      doc.addPage();
      cursorY = 50;
    }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ink);
    doc.text("Largest expenses", margin, cursorY);

    autoTable(doc, {
      startY: cursorY + 10,
      margin: { left: margin, right: margin },
      head: [["Date", "Description", "Category", "Amount"]],
      body: topExpenses.map((e) => [
        new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        e.description,
        e.category,
        fmtMoney(e.amount),
      ]),
      theme: "plain",
      styles: { fontSize: 10, textColor: ink, cellPadding: 6 },
      headStyles: { textColor: muted, fontStyle: "bold", fillColor: false },
      columnStyles: { 3: { halign: "right" } },
      didParseCell: (data) => {
        if (data.row.section === "body") {
          data.cell.styles.lineWidth = { top: 0, bottom: 0.5, left: 0, right: 0 };
          data.cell.styles.lineColor = [244, 244, 245];
        }
      },
    });
    cursorY = doc.lastAutoTable.finalY + 26;
  }

  // --- Full expense list ---------------------------------------------
  doc.addPage();
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...ink);
  doc.text("All expenses", margin, 50);

  autoTable(doc, {
    startY: 62,
    margin: { left: margin, right: margin },
    head: [["Date", "Description", "Category", "Amount"]],
    body: summary.sortedExpenses.map((e) => [
      e.date,
      e.description,
      e.category,
      fmtMoney(e.amount),
    ]),
    theme: "plain",
    styles: { fontSize: 9.5, textColor: ink, cellPadding: 5 },
    headStyles: { textColor: muted, fontStyle: "bold", fillColor: false },
    columnStyles: { 3: { halign: "right" } },
    didParseCell: (data) => {
      if (data.row.section === "body") {
        data.cell.styles.lineWidth = { top: 0, bottom: 0.5, left: 0, right: 0 };
        data.cell.styles.lineColor = [244, 244, 245];
      }
    },
  });

  // --- Footer page numbers ------------------------------------------
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text(
      `Notarium · Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 24,
      { align: "center" }
    );
  }

  doc.save(`notarium-spending-report-${fileStamp()}.pdf`);
}
