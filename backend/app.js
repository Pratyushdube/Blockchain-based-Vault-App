require('dotenv').config();
const express = require('express');
const { ethers, parseEther, formatEther } = require('ethers');
const fs = require('fs');
const vaultAbi = require('./abi/Vault.json').abi;

const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());


const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
console.log("🔐 Backend wallet address:", wallet.address);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, vaultAbi, wallet);

app.get('/', (req, res) => {
  res.send('Vault API is running');
});

app.get('/balance/:address', async (req, res) => {
  try {
    const bal = await contract.getBalance(req.params.address);
    res.json({ balance: formatEther(bal) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/backend-address', (req, res) => {
  res.json({ address: wallet.address });
});



app.post('/deposit', async (req, res) => {
  try {
    const { amountInEth } = req.body;
    const tx = await contract.deposit({ value: parseEther(amountInEth) });
    await tx.wait();
    res.json({ txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/withdraw', async (req, res) => {
  try {
    const { amountInEth } = req.body;
    const tx = await contract.withdraw(parseEther(amountInEth));
    await tx.wait();
    res.json({ txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('Vault API running on http://localhost:3001'));
