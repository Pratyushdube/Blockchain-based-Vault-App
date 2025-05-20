import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3001"; // Your Express server

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");

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
      console.error("Failed to fetch balance:", err);
    }
  };




  const deposit = async () => {
    try {
      const res = await axios.post(`${API_BASE}/deposit`, {
        amountInEth: "0.1",
      });
      alert(`Deposit tx: ${res.data.txHash}`);
    } catch (err) {
      alert("Deposit failed");
      console.error(err);
    }
  };

  const withdraw = async () => {
    try {
      const res = await axios.post(`${API_BASE}/withdraw`, {
        amountInEth: "0.05",
      });
      alert(`Withdraw tx: ${res.data.txHash}`);
    } catch (err) {
      alert("Withdraw failed");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Vault DApp (with backend)</h1>
      <p><strong>Wallet:</strong> {account}</p>
      <p><strong>Vault Balance:</strong> {balance} ETH</p>
      <button onClick={deposit}>Deposit 0.1 ETH</button>
      <button onClick={withdraw}>Withdraw 0.05 ETH</button>
    </div>
  );
}

export default App;
