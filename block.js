// block.js

let web3;
let userAccount;
const contractAddress = "0x4bceaf5c362139a5230b9d65cdb752b1e8da0adf";

// Simple ABI for your contract
const abi = [
  {
    "constant": false,
    "inputs": [],
    "name": "payRent",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "terminateAgreement",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "returnSecurityDeposit",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getDueAmount",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "isRentLate",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "isActive",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

let contract;

async function Connect() {
  const status = document.getElementById("status");

  if (typeof window.ethereum === "undefined") {
    status.innerHTML = `<span style="color:red">❌ MetaMask not detected. Please enable the extension.</span>`;
    return;
  }

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });

    web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];

    contract = new web3.eth.Contract(abi, contractAddress);

    status.innerHTML = `
      <span style="color:#10b981">✅ Connected Successfully!</span><br>
      <small>Address: ${userAccount.substring(0, 8)}...${userAccount.substring(36)}</small>
    `;

    alert("MetaMask Connected!\nAddress: " + userAccount);

  } catch (error) {
    console.error(error);
    status.innerHTML = `<span style="color:red">❌ Connection failed: ${error.message}</span>`;
  }
}

// Pay Rent Function
async function payRent() {
  if (!contract || !userAccount) return alert("Connect MetaMask first!");

  try {
    const due = await contract.methods.getDueAmount().call();

    const gasEstimate = await contract.methods.payRent().estimateGas({
      from: userAccount,
      value: due
    });

    const tx = await contract.methods.payRent().send({
      from: userAccount,
      value: due,
      gas: gasEstimate
    });

    alert("✅ Rent Paid Successfully!");
    updateStatus();

  } catch (err) {
    alert("Payment failed: " + err.message);
  }
}

// Other functions (you can call them later)
async function terminateAgreement() {
  if (!contract || !userAccount) return alert("Connect MetaMask first!");
  if (!confirm("Terminate the agreement?")) return;

  try {
    await contract.methods.terminateAgreement().send({ from: userAccount, gas: 200000 });
    alert("✅ Agreement Terminated!");
  } catch (err) {
    alert("Error: " + err.message);
  }
}

async function returnSecurityDeposit() {
  if (!contract || !userAccount) return alert("Connect MetaMask first!");

  try {
    await contract.methods.returnSecurityDeposit().send({ from: userAccount, gas: 500000 });
    alert("✅ Security Deposit Returned to Tenant!");
  } catch (err) {
    alert("Error: " + err.message);
  }
}

const gasEstimate = await contract.methods.payRent().estimateGas({
  from: userAccount,
  value: due
});

console.log("Gas Estimate:", gasEstimate);