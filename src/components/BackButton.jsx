import { useNavigate } from "react-router-dom";

const BackButton = ({ to, label = "Back" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button onClick={handleBack} style={styles.button}>
      ← {label}
    </button>
  );
};

const styles = {
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "20px",
  },
};

export default BackButton;
