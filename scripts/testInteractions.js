// Make sure dotenv and ethers are installed
// npm install dotenv ethers


require("dotenv").config();

const { ethers, parseEther, formatEther } = require("ethers");
const fs = require("fs");
// Load compiled ABI
const abi = JSON.parse(fs.readFileSync('./artifacts/contracts/Vault.sol/Vault.json')).abi;

// Setup
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const privateKey = process.env.PRIVATE_KEY;
const signer = new ethers.Wallet(privateKey, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, abi, signer);

async function main() {
    console.log("Hi this is Pratyush, we are going to test the contract now");
    const address = await signer.getAddress();
    console.log("Connected as:", address);

    // 1. Deposit 0.1 ETH
    
    const value = parseEther("0.25");            // This is where we change the code as per Ethers.js v6 from v5
    const depositTx = await contract.deposit({value});
    await depositTx.wait();
    console.log("Deposited 0.1 ETH");

    // 2. Check balance
    const balance = await contract.getBalance(address);
    const value2 = formatEther(balance);        // again here we changed the code as per Ethers.js v6 from v5
    console.log("Vault Balance:", value2, "ETH");

    // 3. Withdraw 0.05 ETH
    const value3 = parseEther("0.05");          // again here we changed the code Ethers.js v6 from v5
    const withdrawTx = await contract.withdraw(value3);
    await withdrawTx.wait();
    console.log("Withdrew 0.05 ETH");

    // 4. Check final balance
    const finalBalance = await contract.getBalance(address);
    console.log("Final Vault Balance:", formatEther(finalBalance), "ETH");
}

main().catch(console.error);
