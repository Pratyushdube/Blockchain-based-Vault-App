import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "http://localhost:3001"; 

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState({ deposit: false, withdraw: false });
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          // We get Metamask Wallet address here, but we used it in frontend confirmation/signing, 
          // but we don't need it in backend, we need the backend wallet address (as it is the one that will sign the transactions when using APIs)
          
          // Metamask Wallet address (Not used)
          const [addr] = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(addr);
          console.log("Metamask Wallet address:", addr);

          // Backend Wallet address
          const res = await axios.get(`${API_BASE}/backend-address`);
          const backendWalletAddress = res.data.address;
          console.log("Backend Wallet address:", backendWalletAddress);

          // Fetch balance for the backend wallet address
          fetchBalance(backendWalletAddress);

          // Set interval to fetch balance every 5 seconds
          const interval = setInterval(() => fetchBalance(backendWalletAddress), 5000); // 5000 -> 5 seconds
          return () => clearInterval(interval);
        } catch (err) {
          console.error("Failed to connect to Metamask OR Get the backend wallet address:", err);
        }
      } else {
        alert("Please install MetaMask!");
      }
    };
    init();
  }, []);
  
  // Fetch balance for the backend wallet address
  // This is the address that will be used to sign the transactions

  const fetchBalance = async (address) => {
    try {
      const res = await axios.get(`${API_BASE}/balance/${address}`);
      setBalance(res.data.balance);
    } catch (err) {
      setError("Failed to fetch balance");
      console.error(err);
    }
  };

  const deposit = async () => {
    setLoading({ ...loading, deposit: true });
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/deposit`, {
        amountInEth: "0.1",
      });
      alert(`Deposit tx: ${res.data.txHash}`);
    } catch (err) {
      setError("Deposit failed");
      console.error(err);
    } finally {
      setLoading({ ...loading, deposit: false });
    }
  };

  const withdraw = async () => {
    setLoading({ ...loading, withdraw: true });
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/withdraw`, {
        amountInEth: "0.05",
      });
      alert(`Withdraw tx: ${res.data.txHash}`);
    } catch (err) {
      setError("Withdraw failed");
      console.error(err);
    } finally {
      setLoading({ ...loading, withdraw: false });
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Vault DApp</h1>
        {account && (
          <div className="wallet-info">
            <span>Connected Wallet:  </span>
            <span className="wallet-address">
              {account}
              </span>
          </div>
        )}
      </header>

      <main className="app-main">
        <div className="balance-card">
          <h2>Vault Balance</h2>
          <p className="balance-amount">{balance} ETH</p>
        </div>

        <div className="action-buttons">
          <button 
            onClick={deposit}
            disabled={loading.deposit}
            className={loading.deposit ? 'loading' : ''}
          >
            {loading.deposit ? 'Processing...' : 'Deposit 0.1 ETH'}
          </button>
          <button 
            onClick={withdraw}
            disabled={loading.withdraw}
            className={loading.withdraw ? 'loading' : ''}
          >
            {loading.withdraw ? 'Processing...' : 'Withdraw 0.05 ETH'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </main>
    </div>
  );
}

export default App;