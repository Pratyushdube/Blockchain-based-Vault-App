import logo from './logo.svg';
import './App.css';

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import vaultAbi from "./abi/Vault.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; //  <== Replace this with deployed contract address

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const _signer = await _provider.getSigner();
        const _contract = new ethers.Contract(CONTRACT_ADDRESS, vaultAbi, _signer);
        const _address = await _signer.getAddress();

        setProvider(_provider);
        setSigner(_signer);
        setContract(_contract);
        setAccount(_address);
        // Get balance is removed from here and moved to a separate function called fetchBalance
        
        const fetchBalance = async () => {
          const bal = await _contract.getBalance(_address);
          setBalance(ethers.formatEther(bal));
        };

         await fetchBalance(); // initial fetch

        // Set up polling every 5 seconds
        const interval = setInterval(fetchBalance, 5000);

        // Cleanup on component unmount
        return () => clearInterval(interval);

      } else {
        alert("Install MetaMask");
      }
    };
    init();
  }, []);


  const deposit = async () => {
    const tx = await contract.deposit({ value: ethers.parseEther("0.1") });
    await tx.wait();
    alert("Deposited 0.1 ETH!");
  };

  const withdraw = async () => {
    const tx = await contract.withdraw(ethers.parseEther("0.05"));
    await tx.wait();
    
    alert("Withdrew 0.05 ETH!");
  };

  return (
    <div style={{ padding: 20 }}>
      <img src={logo} className="App-logo" alt="logo" />
      <h1>Vault DApp</h1>
      <p><strong>Connected:</strong> {account}</p>
      <p><strong>Vault Balance:</strong> {balance} ETH</p>
      <button onClick={deposit}>Deposit 0.1 ETH</button>
      <button onClick={withdraw}>Withdraw 0.05 ETH</button>


    </div>
  );
}

export default App;

// How to run the app:
// 1. Make sure you have Node.js and npm installed.
