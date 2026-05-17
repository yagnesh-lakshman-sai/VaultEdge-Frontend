import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getAllAccounts, createAccount } from "../../api/accountApi";
import { getRecentTransactions } from "../../api/transactionApi";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import {
  TRANSACTION_TYPES,
  ACCOUNT_STATUS,
  ACCOUNT_TYPES,
} from "../../utils/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DashboardPage = () => {
  const { user } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [accountType, setAccountType] = useState("SAVINGS");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const accountsResponse = await getAllAccounts();
      const accountsData = accountsResponse.data.data || [];
      setAccounts(accountsData);

      if (accountsData.length > 0) {
        const firstAccount = accountsData[0];
        setSelectedAccount(firstAccount);
        const txResponse = await getRecentTransactions(
          firstAccount.accountNumber,
        );
        setTransactions(txResponse.data.data || []);
      }
    } catch (err) {
      setError("Failed to load dashboard data.");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = async (account) => {
    setSelectedAccount(account);
    try {
      const txResponse = await getRecentTransactions(account.accountNumber);
      setTransactions(txResponse.data.data || []);
    } catch (err) {
      console.error("Transaction load error:", err);
    }
  };

  const handleCreateAccount = async () => {
    setCreating(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      const response = await createAccount({ type: accountType });

      setCreateSuccess(`${accountType} account created successfully!`);

      setTimeout(() => {
        setShowCreateForm(false);
        setCreateSuccess("");
        setAccountType("SAVINGS");
      }, 1500);

      loadDashboardData();
    } catch (err) {
      setCreateError(
        err.response?.data?.message || "Failed to create account.",
      );
      console.error("Create account error:", err);
    } finally {
      setCreating(false);
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

  const getTransactionColor = (type) => {
    return isCredit(type) ? "#16a34a" : "#dc2626";
  };

  const getTransactionSign = (type) => {
    return isCredit(type) ? "+" : "-";
  };

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centered}>
        <p style={styles.errorText}>{error}</p>
        <button onClick={loadDashboardData} style={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.welcomeSection}>
        <h1 style={styles.welcomeText}>Welcome back, {user?.fullName}! 👋</h1>
        <p style={styles.welcomeSubtext}>Here is your financial summary</p>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>My Accounts</h2>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setCreateError("");
              setCreateSuccess("");
            }}
            style={styles.addAccountButton}
          >
            {showCreateForm ? "Cancel" : "+ Add Account"}
          </button>
        </div>

        {showCreateForm && (
          <div style={styles.createFormCard}>
            <h3 style={styles.createFormTitle}>Create New Account</h3>

            {createSuccess && (
              <div style={styles.createSuccess}>✅ {createSuccess}</div>
            )}

            {createError && (
              <div style={styles.createError}>❌ {createError}</div>
            )}

            <p style={styles.createLabel}>Select Account Type</p>
            <div style={styles.typeGrid}>
              <div
                onClick={() => setAccountType("SAVINGS")}
                style={{
                  ...styles.typeCard,
                  border:
                    accountType === "SAVINGS"
                      ? "2px solid #1e40af"
                      : "2px solid #e5e7eb",
                  backgroundColor:
                    accountType === "SAVINGS" ? "#eff6ff" : "#ffffff",
                }}
              >
                <span style={styles.typeIcon}>💰</span>
                <p style={styles.typeName}>Savings</p>
                <p style={styles.typeDesc}>Earn interest on deposits</p>
              </div>

              <div
                onClick={() => setAccountType("CURRENT")}
                style={{
                  ...styles.typeCard,
                  border:
                    accountType === "CURRENT"
                      ? "2px solid #1e40af"
                      : "2px solid #e5e7eb",
                  backgroundColor:
                    accountType === "CURRENT" ? "#eff6ff" : "#ffffff",
                }}
              >
                <span style={styles.typeIcon}>🏢</span>
                <p style={styles.typeName}>Current</p>
                <p style={styles.typeDesc}>For business transactions</p>
              </div>

              <div
                onClick={() => setAccountType("FIXED_DEPOSIT")}
                style={{
                  ...styles.typeCard,
                  border:
                    accountType === "FIXED_DEPOSIT"
                      ? "2px solid #1e40af"
                      : "2px solid #e5e7eb",
                  backgroundColor:
                    accountType === "FIXED_DEPOSIT" ? "#eff6ff" : "#ffffff",
                }}
              >
                <span style={styles.typeIcon}>🔒</span>
                <p style={styles.typeName}>Fixed Deposit</p>
                <p style={styles.typeDesc}>Higher returns, fixed term</p>
              </div>
            </div>

            <p style={styles.selectedType}>
              Selected:{" "}
              <strong style={{ color: "#1e40af" }}>
                {accountType.replace("_", " ")}
              </strong>
            </p>

            <button
              onClick={handleCreateAccount}
              style={{
                ...styles.createButton,
                opacity: creating ? 0.7 : 1,
                cursor: creating ? "not-allowed" : "pointer",
              }}
              disabled={creating}
            >
              {creating
                ? "Creating Account..."
                : `Create ${accountType.replace("_", " ")} Account`}
            </button>
          </div>
        )}

        {accounts.length === 0 ? (
          <div style={styles.emptyCard}>
            <span style={styles.emptyIcon}>🏦</span>
            <p style={styles.emptyTitle}>No accounts yet</p>
            <p style={styles.emptySubtitle}>
              Click "+ Add Account" to create your first account
            </p>
          </div>
        ) : (
          <div style={styles.accountsGrid}>
            {accounts.map((account) => (
              <div
                key={account.accountNumber}
                onClick={() => handleAccountSelect(account)}
                style={{
                  ...styles.accountCard,
                  border:
                    selectedAccount?.accountNumber === account.accountNumber
                      ? "2px solid #93c5fd"
                      : "2px solid transparent",
                  transform:
                    selectedAccount?.accountNumber === account.accountNumber
                      ? "translateY(-2px)"
                      : "none",
                }}
              >
                <div style={styles.accountBadge}>
                  {account.accountType || account.type}
                </div>

                <p style={styles.accountNumber}>
                  •••• •••• {account.accountNumber?.slice(-4)}
                </p>

                <p style={styles.balance}>
                  {formatCurrency(account.balance || 0)}
                </p>

                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor:
                      account.status === ACCOUNT_STATUS.ACTIVE
                        ? "rgba(34,197,94,0.2)"
                        : "rgba(239,68,68,0.2)",
                    color:
                      account.status === ACCOUNT_STATUS.ACTIVE
                        ? "#86efac"
                        : "#fca5a5",
                  }}
                >
                  {account.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          Recent Transactions
          {selectedAccount && (
            <span style={styles.accountLabel}>
              {" "}
              — •••• {selectedAccount.accountNumber?.slice(-4)}
            </span>
          )}
        </h2>

        {transactions.length === 0 ? (
          <div style={styles.emptyCard}>
            <span style={styles.emptyIcon}>📋</span>
            <p style={styles.emptyTitle}>No transactions yet</p>
            <p style={styles.emptySubtitle}>
              Your recent transactions will appear here
            </p>
          </div>
        ) : (
          <div style={styles.transactionsList}>
            {transactions.map((tx) => (
              <div key={tx.id} style={styles.transactionItem}>
                <div
                  style={{
                    ...styles.txIcon,
                    backgroundColor: isCredit(tx.type) ? "#dcfce7" : "#fee2e2",
                  }}
                >
                  {isCredit(tx.type) ? "↓" : "↑"}
                </div>

                <div style={styles.txLeft}>
                  <p style={styles.txType}>{tx.type?.replace(/_/g, " ")}</p>
                  <p style={styles.txDate}>
                    {formatDateTime(tx.createdAt || tx.transactionDate)}
                  </p>
                  {tx.description && (
                    <p style={styles.txDesc}>{tx.description}</p>
                  )}
                </div>

                <div style={styles.txRight}>
                  <p
                    style={{
                      ...styles.txAmount,
                      color: getTransactionColor(tx.type),
                    }}
                  >
                    {getTransactionSign(tx.type)}
                    {formatCurrency(tx.amount)}
                  </p>
                  <p style={styles.txBalance}>
                    Bal: {formatCurrency(tx.balanceAfter || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {transactions.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Spending Overview</h2>

          <div style={styles.chartsGrid}>
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Recent Transaction Amounts</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={transactions.slice(0, 7).map((tx) => ({
                    name: tx.type
                      ?.replace("TRANSFER_", "")
                      ?.replace("_", " ")
                      ?.slice(0, 8),
                    amount: tx.amount,
                    type: tx.type,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#1e40af" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Credit vs Debit</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Credits",
                        value: transactions
                          .filter((tx) => isCredit(tx.type))
                          .reduce((s, tx) => s + tx.amount, 0),
                      },
                      {
                        name: "Debits",
                        value: transactions
                          .filter((tx) => !isCredit(tx.type))
                          .reduce((s, tx) => s + tx.amount, 0),
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    <Cell fill="#16a34a" />
                    <Cell fill="#dc2626" />
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    padding: "24px",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: "16px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #1e40af",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: "16px",
    color: "#6b7280",
  },
  errorText: {
    fontSize: "16px",
    color: "#dc2626",
  },
  retryButton: {
    padding: "8px 24px",
    backgroundColor: "#1e40af",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  welcomeSection: {
    marginBottom: "32px",
  },
  welcomeText: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 4px 0",
  },
  welcomeSubtext: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
  },
  section: {
    marginBottom: "32px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    margin: "0",
  },
  accountLabel: {
    fontSize: "14px",
    fontWeight: "400",
    color: "#6b7280",
  },
  addAccountButton: {
    padding: "8px 16px",
    backgroundColor: "#1e40af",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  createFormCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  createFormTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 16px 0",
  },
  createSuccess: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "16px",
  },
  createError: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "16px",
  },
  createLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "12px",
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "16px",
  },
  typeCard: {
    borderRadius: "10px",
    padding: "16px",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.15s",
  },
  typeIcon: {
    fontSize: "28px",
    display: "block",
    marginBottom: "8px",
  },
  typeName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 4px 0",
  },
  typeDesc: {
    fontSize: "11px",
    color: "#6b7280",
    margin: "0",
  },
  selectedType: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "16px",
  },
  createButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#1e40af",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
  },
  accountsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px",
  },
  accountCard: {
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    borderRadius: "16px",
    padding: "24px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(30,64,175,0.3)",
    transition: "all 0.2s",
  },
  accountBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: "4px 10px",
    borderRadius: "4px",
    display: "inline-block",
    marginBottom: "16px",
  },
  accountNumber: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.8)",
    margin: "0 0 8px 0",
    fontFamily: "monospace",
    letterSpacing: "2px",
  },
  balance: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 0 16px 0",
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 10px",
    borderRadius: "4px",
  },
  emptyCard: {
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    border: "1px dashed #d1d5db",
  },
  emptyIcon: {
    fontSize: "40px",
    display: "block",
    marginBottom: "12px",
  },
  emptyTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#374151",
    margin: "0 0 6px 0",
  },
  emptySubtitle: {
    fontSize: "13px",
    color: "#9ca3af",
    margin: "0",
  },
  transactionsList: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },
  transactionItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px 20px",
    borderBottom: "1px solid #f3f4f6",
  },
  txIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    flexShrink: 0,
  },
  txLeft: {
    flex: 1,
  },
  txType: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 2px 0",
  },
  txDate: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: "0",
  },
  txDesc: {
    fontSize: "12px",
    color: "#6b7280",
    margin: "4px 0 0 0",
  },
  txRight: {
    textAlign: "right",
  },
  txAmount: {
    fontSize: "16px",
    fontWeight: "700",
    margin: "0 0 2px 0",
  },
  txBalance: {
    fontSize: "11px",
    color: "#9ca3af",
    margin: "0",
  },
  chartsGrid: {
    display: "grid",

    gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "1fr 1fr",

    gap: "20px",
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
  },
  chartTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    margin: "0 0 16px 0",
  },
};

export default DashboardPage;
