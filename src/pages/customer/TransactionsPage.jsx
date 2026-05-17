import { useState, useEffect } from "react";
import { getAllAccounts } from "../../api/accountApi";
import {
  getAllTransactions,
  getTransactionsByRange,
} from "../../api/transactionApi";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { TRANSACTION_TYPES, ACCOUNT_STATUS } from "../../utils/constants";
import BackButton from "../../components/BackButton";

const TransactionsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  const [selectedAccount, setSelectedAccount] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filtered, setFiltered] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [transactions, searchQuery]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await getAllAccounts();
      const data = response.data.data || [];
      setAccounts(data);

      if (data.length > 0) {
        setSelectedAccount(data[0]);
        await loadTransactions(data[0].accountNumber);
      }
    } catch (err) {
      setError("Failed to load accounts.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (accountNumber) => {
    setFetching(true);
    setError("");
    setFiltered(false);
    setSearchQuery("");

    try {
      const response = await getAllTransactions(accountNumber);
      const data = response.data.data || [];
      setTransactions(data);
    } catch (err) {
      setError("Failed to load transactions.");
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleAccountChange = async (e) => {
    const accountNumber = e.target.value;
    const account = accounts.find((acc) => acc.accountNumber === accountNumber);
    setSelectedAccount(account);
    setStartDate("");
    setEndDate("");
    await loadTransactions(accountNumber);
  };

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end date.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date.");
      return;
    }

    setFetching(true);
    setError("");

    try {
      const response = await getTransactionsByRange(
        selectedAccount.id,
        startDate,
        endDate,
      );
      const data = response.data.data || [];
      setTransactions(data);
      setFiltered(true);
      setSearchQuery("");
    } catch (err) {
      setError("Failed to filter transactions.");
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleClearFilter = async () => {
    setStartDate("");
    setEndDate("");
    setFiltered(false);
    setSearchQuery("");
    if (selectedAccount) {
      await loadTransactions(selectedAccount.accountNumber);
    }
  };

  const isCredit = (type) => {
    return [
      TRANSACTION_TYPES.DEPOSIT,
      TRANSACTION_TYPES.TRANSFER_CREDIT,
      TRANSACTION_TYPES.LOAN_DISBURSEMENT,
      TRANSACTION_TYPES.INTEREST_CREDIT,
    ].includes(type);
  };

  const getTypeLabel = (type) => {
    return type?.replace(/_/g, " ") || "UNKNOWN";
  };

  const getTypeBadgeStyle = (type) => {
    const credit = isCredit(type);
    return {
      ...styles.typeBadge,
      backgroundColor: credit ? "#dcfce7" : "#fee2e2",
      color: credit ? "#16a34a" : "#dc2626",
    };
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tx.description?.toLowerCase().includes(query) ||
      tx.type?.toLowerCase().includes(query) ||
      tx.transactionRef?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalCredit = filteredTransactions
    .filter((tx) => isCredit(tx.type))
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const totalDebit = filteredTransactions
    .filter((tx) => !isCredit(tx.type))
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Smart Bank Statement</title>
          <style>
            body    { font-family: Arial, sans-serif; padding: 20px; }
            h1      { color: #1e40af; margin-bottom: 4px; }
            h3      { color: #374151; margin-bottom: 4px; }
            p       { color: #6b7280; margin: 0 0 20px 0; }
            table   { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th      { background: #1e40af; color: white; padding: 10px;
                      text-align: left; font-size: 13px; }
            td      { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
            tr:nth-child(even) { background: #f9fafb; }
            .credit { color: #16a34a; font-weight: bold; }
            .debit  { color: #dc2626; font-weight: bold; }
            .footer { margin-top: 30px; font-size: 12px;
                      color: #9ca3af; text-align: center; }
            .header-section { border-bottom: 2px solid #1e40af;
                              padding-bottom: 16px; margin-bottom: 8px; }
            .summary { display: flex; gap: 24px; margin-bottom: 20px; }
            .sum-box { background: #f9fafb; padding: 12px 20px;
                       border-radius: 8px; border: 1px solid #e5e7eb; }
            .sum-label { font-size: 12px; color: #6b7280; margin: 0; }
            .sum-value { font-size: 16px; font-weight: bold;
                         color: #111827; margin: 0; }
          </style>
        </head>
        <body>
          <div class='header-section'>
            <h1>🏦 Smart Bank</h1>
            <h3>Account Statement</h3>
            <p>
              Account: ••••${selectedAccount?.accountNumber?.slice(-4)}
              &nbsp;|&nbsp;
              Generated: ${new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
              ${
                filtered
                  ? `&nbsp;|&nbsp; Period: ${startDate} to ${endDate}`
                  : " &nbsp;|&nbsp; All Transactions"
              }
            </p>
          </div>

          <div class='summary'>
            <div class='sum-box'>
              <p class='sum-label'>Total Transactions</p>
              <p class='sum-value'>${filteredTransactions.length}</p>
            </div>
            <div class='sum-box'>
              <p class='sum-label'>Total Credits</p>
              <p class='sum-value' style='color:#16a34a'>
                +${formatCurrency(totalCredit)}
              </p>
            </div>
            <div class='sum-box'>
              <p class='sum-label'>Total Debits</p>
              <p class='sum-value' style='color:#dc2626'>
                -${formatCurrency(totalDebit)}
              </p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Balance After</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions
                .map(
                  (tx, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>
                    ${formatDateTime(tx.createdAt || tx.transactionDate)}
                  </td>
                  <td>${tx.type?.replace(/_/g, " ")}</td>
                  <td>${tx.description || tx.transactionRef || "—"}</td>
                  <td class='${isCredit(tx.type) ? "credit" : "debit"}'>
                    ${isCredit(tx.type) ? "+" : "-"}
                    ${formatCurrency(tx.amount)}
                  </td>
                  <td>${formatCurrency(tx.balanceAfter || 0)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class='footer'>
            Smart Bank — Secure Banking System
            &nbsp;|&nbsp;
            This is a system generated statement
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <BackButton to="/dashboard" label="Back to Dashboard" />

      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Transaction History</h1>
          <p style={styles.pageSubtitle}>
            View and filter your transaction records
          </p>
        </div>

        <button
          onClick={handlePrint}
          style={{
            ...styles.printButton,
            opacity: transactions.length === 0 ? 0.5 : 1,
            cursor: transactions.length === 0 ? "not-allowed" : "pointer",
          }}
          disabled={transactions.length === 0}
        >
          🖨️ Print Statement
        </button>
      </div>

      <div style={styles.filterCard}>
        <div style={styles.filterRow}>
          <div style={styles.filterField}>
            <label style={styles.label}>Select Account</label>
            <select
              value={selectedAccount?.accountNumber || ""}
              onChange={handleAccountChange}
              style={styles.select}
              disabled={fetching}
            >
              {accounts.map((acc) => (
                <option key={acc.accountNumber} value={acc.accountNumber}>
                  {acc.accountType || acc.type} — ••••{" "}
                  {acc.accountNumber?.slice(-4)}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterField}>
            <label style={styles.label}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.dateInput}
              disabled={fetching}
            />
          </div>

          <div style={styles.filterField}>
            <label style={styles.label}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.dateInput}
              disabled={fetching}
            />
          </div>

          <div style={styles.filterButtons}>
            <button
              onClick={handleFilter}
              style={styles.filterButton}
              disabled={fetching}
            >
              {fetching ? "Loading..." : "Filter"}
            </button>

            {filtered && (
              <button
                onClick={handleClearFilter}
                style={styles.clearButton}
                disabled={fetching}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div style={styles.searchRow}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search by description, type or reference..."
            style={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={styles.clearSearchBtn}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        {filtered && (
          <p style={styles.filterIndicator}>
            📅 Showing transactions from <strong>{startDate}</strong> to{" "}
            <strong>{endDate}</strong>
          </p>
        )}

        {searchQuery && (
          <p style={styles.filterIndicator}>
            🔍 Showing results for <strong>"{searchQuery}"</strong> —{" "}
            {filteredTransactions.length} found
          </p>
        )}
      </div>

      {filteredTransactions.length > 0 && (
        <div style={styles.summaryGrid}>
          <div
            style={{
              ...styles.summaryCard,
              borderLeft: "4px solid #1e40af",
            }}
          >
            <p style={styles.summaryLabel}>Total Transactions</p>
            <p style={styles.summaryValue}>{filteredTransactions.length}</p>
          </div>

          <div
            style={{
              ...styles.summaryCard,
              borderLeft: "4px solid #16a34a",
            }}
          >
            <p style={styles.summaryLabel}>Total Credits</p>
            <p
              style={{
                ...styles.summaryValue,
                color: "#16a34a",
              }}
            >
              +{formatCurrency(totalCredit)}
            </p>
          </div>

          <div
            style={{
              ...styles.summaryCard,
              borderLeft: "4px solid #dc2626",
            }}
          >
            <p style={styles.summaryLabel}>Total Debits</p>
            <p
              style={{
                ...styles.summaryValue,
                color: "#dc2626",
              }}
            >
              -{formatCurrency(totalDebit)}
            </p>
          </div>
        </div>
      )}

      <div style={styles.tableCard}>
        {fetching ? (
          <div style={styles.centered}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Loading...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📋</span>
            <p style={styles.emptyTitle}>No transactions found</p>
            <p style={styles.emptySubtitle}>
              {searchQuery
                ? `No results for "${searchQuery}"`
                : filtered
                  ? "No transactions in selected date range"
                  : "No transactions for this account yet"}
            </p>
          </div>
        ) : (
          <div>
            <div style={styles.tableHeader}>
              <span style={{ flex: "0 0 40px", color: "#9ca3af" }}>#</span>
              <span style={{ flex: 2 }}>Type</span>
              <span style={{ flex: 2 }}>Date & Time</span>
              <span style={{ flex: 2 }}>Description</span>
              <span style={{ flex: 1, textAlign: "right" }}>Amount</span>
              <span style={{ flex: 1, textAlign: "right" }}>Balance After</span>
            </div>

            {paginatedTransactions.map((tx, index) => (
              <div
                key={tx.id || index}
                style={{
                  ...styles.tableRow,
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                }}
              >
                <span
                  style={{
                    flex: "0 0 40px",
                    fontSize: "12px",
                    color: "#9ca3af",
                  }}
                >
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </span>

                <span style={{ flex: 2 }}>
                  <span style={getTypeBadgeStyle(tx.type)}>
                    {getTypeLabel(tx.type)}
                  </span>
                </span>

                <span
                  style={{
                    ...styles.tableCell,
                    flex: 2,
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  {formatDateTime(tx.createdAt || tx.transactionDate)}
                </span>

                <span
                  style={{
                    ...styles.tableCell,
                    flex: 2,
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  {tx.description || tx.transactionRef || "—"}
                </span>

                <span
                  style={{
                    flex: 1,
                    textAlign: "right",
                    fontWeight: "700",
                    fontSize: "14px",
                    color: isCredit(tx.type) ? "#16a34a" : "#dc2626",
                  }}
                >
                  {isCredit(tx.type) ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </span>

                <span
                  style={{
                    flex: 1,
                    textAlign: "right",
                    fontSize: "13px",
                    color: "#374151",
                  }}
                >
                  {formatCurrency(tx.balanceAfter || 0)}
                </span>
              </div>
            ))}

            {totalPages > 1 && (
              <div style={styles.pagination}>
                <p style={styles.pageInfo}>
                  Showing {(currentPage - 1) * itemsPerPage + 1}–
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredTransactions.length,
                  )}{" "}
                  of {filteredTransactions.length} transactions
                </p>

                <div style={styles.pageButtons}>
                  <button
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={currentPage === 1}
                    style={{
                      ...styles.pageBtn,
                      opacity: currentPage === 1 ? 0.4 : 1,
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1,
                    )
                    .map((page, index, arr) => (
                      <span key={page}>
                        {index > 0 && arr[index - 1] !== page - 1 && (
                          <span style={styles.pageDots}>...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          style={{
                            ...styles.pageBtn,
                            backgroundColor:
                              currentPage === page ? "#1e40af" : "#ffffff",
                            color: currentPage === page ? "#ffffff" : "#374151",
                            fontWeight: currentPage === page ? "700" : "400",
                            cursor: "pointer",
                          }}
                        >
                          {page}
                        </button>
                      </span>
                    ))}

                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      ...styles.pageBtn,
                      opacity: currentPage === totalPages ? 0.4 : 1,
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "200px",
    gap: "12px",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #1e40af",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: "14px",
    color: "#6b7280",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 4px 0",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
  },
  printButton: {
    padding: "10px 20px",
    backgroundColor: "#059669",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
  },
  filterCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px 24px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
  },
  filterRow: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  filterField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: "1",
    minWidth: "160px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },
  select: {
    padding: "9px 12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    outline: "none",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },
  dateInput: {
    padding: "9px 12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    outline: "none",
  },
  filterButtons: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
  },
  filterButton: {
    padding: "9px 20px",
    backgroundColor: "#1e40af",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  clearButton: {
    padding: "9px 20px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  searchRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginTop: "16px",
  },
  searchInput: {
    flex: 1,
    padding: "10px 16px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    outline: "none",
  },
  clearSearchBtn: {
    padding: "10px 16px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  errorText: {
    color: "#ef4444",
    fontSize: "13px",
    marginTop: "8px",
  },
  filterIndicator: {
    fontSize: "13px",
    color: "#1e40af",
    backgroundColor: "#eff6ff",
    padding: "8px 12px",
    borderRadius: "6px",
    marginTop: "12px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
  },
  summaryLabel: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0 0 8px 0",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827",
    margin: "0",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    padding: "12px 20px",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tableRow: {
    display: "flex",
    padding: "14px 20px",
    alignItems: "center",
    borderBottom: "1px solid #f3f4f6",
    transition: "background-color 0.15s",
  },
  tableCell: {
    fontSize: "14px",
    color: "#374151",
  },
  typeBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 8px",
    borderRadius: "4px",
    display: "inline-block",
  },
  emptyState: {
    padding: "48px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  emptyIcon: {
    fontSize: "40px",
  },
  emptyTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#374151",
    margin: "0",
  },
  emptySubtitle: {
    fontSize: "14px",
    color: "#9ca3af",
    margin: "0",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
  },
  pageInfo: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0",
  },
  pageButtons: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  pageBtn: {
    padding: "6px 12px",
    backgroundColor: "#ffffff",
    color: "#374151",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "13px",
  },
  pageDots: {
    padding: "0 4px",
    color: "#9ca3af",
    fontSize: "13px",
  },
};

export default TransactionsPage;
