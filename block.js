// block.js
import { rentChainBytecode } from "./bytecode.js";
let web3;
let userAccount;
const contractAddress = "0x4dd9ef7f82be202e9d54e0d004799a12c26f5114";

// Simple ABI for your contract
const abi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_tenant",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_rentAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_deposit",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "dueDate",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getDueAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isActive",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isRentLate",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "landlord",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lastPaidDate",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "payRent",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rentAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "returnSecurityDeposit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "securityDeposit",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "tenant",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "terminateAgreement",
		"outputs": [],
		"stateMutability": "nonpayable",
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
async function createAgreement() {
  console.log("Create clicked");

  try {
    if (!window.ethereum) return alert("Install MetaMask");

    // Connect wallet
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const user = accounts[0];

    console.log("User:", user);

    // Take inputs
    const tenant = prompt("Enter Tenant Address:");
    const rent = prompt("Enter Rent in ETH (e.g. 0.01):");
    const deposit = prompt("Enter Deposit in ETH (e.g. 0.05):");

    if (!tenant || !rent || !deposit) {
      return alert("All fields are required!");
    }

    // Convert ETH → Wei
    const rentWei = web3.utils.toWei(rent, "ether");
    const depositWei = web3.utils.toWei(deposit, "ether");

    console.log("Tenant:", tenant);
    console.log("Rent (Wei):", rentWei);
    console.log("Deposit (Wei):", depositWei);

    // Create contract instance (NO address here!)
    const contract = new web3.eth.Contract(abi);

    const bytecode = rentChainBytecode;

    // Deploy contract
    const gasEstimate = await contract.deploy({
      data: bytecode,
      arguments: [tenant, rentWei, depositWei]
    }).estimateGas({ from: user });

    console.log("Gas Estimate:", gasEstimate);

    const newContract = await contract.deploy({
      data: bytecode,
      arguments: [tenant, rentWei, depositWei]
    }).send({
      from: user,
      gas: gasEstimate + 500000   // 🔥 buffer
    });

    console.log("New Contract:", newContract.options.address);

    alert("✅ New Agreement Created!");
    alert("Contract Address: " + newContract.options.address);

  } catch (err) {
    console.error(err);
    alert("Error: " + (err.message || err));
  }
}
const gasEstimate = await contract.methods.payRent().estimateGas({
  from: userAccount,
  value: due
});

console.log("Gas Estimate:", gasEstimate);