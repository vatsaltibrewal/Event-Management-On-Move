// src/pages/AdminPage.tsx
import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  createAggregatorPayload,
  createSideLaunchPayload,
  mintTokensPayload,
  burnTokensPayload,
  mintNftPayload,
} from "../aptosClient";

const AdminPage: React.FC = () => {
  const { account, signAndSubmitTransaction } = useWallet();

  // State for Create Aggregator
  const [aggName, setAggName] = useState("");
  const [aggSymbol, setAggSymbol] = useState("");
  const [iconUri, setIconUri] = useState("");
  const [projectUri, setProjectUri] = useState("");
  const [aggMessage, setAggMessage] = useState("");

  // State for Create Side Launch
  const [sideLaunchName, setSideLaunchName] = useState("");
  const [description, setDescription] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const [sideLaunchMessage, setSideLaunchMessage] = useState("");

  // State for Mint Tokens
  const [mintAggSymbol, setMintAggSymbol] = useState("");
  const [mintToAddress, setMintToAddress] = useState("");
  const [mintAmount, setMintAmount] = useState<number>(0);
  const [mintMessage, setMintMessage] = useState("");

  // State for Burn Tokens
  const [burnAggSymbol, setBurnAggSymbol] = useState("");
  const [burnFromAddress, setBurnFromAddress] = useState("");
  const [burnAmount, setBurnAmount] = useState<number>(0);
  const [burnMessage, setBurnMessage] = useState("");

  // State for Mint NFT
  const [nftAggSymbol, setNftAggSymbol] = useState("");
  const [nftSideLaunchName, setNftSideLaunchName] = useState("");
  const [nftToAddress, setNftToAddress] = useState("");
  const [nftMessage, setNftMessage] = useState("");

  const handleCreateAggregator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setAggMessage("Wallet not connected.");
      return;
    }
    try {
      const payload = createAggregatorPayload(aggName, aggSymbol, iconUri, projectUri);
      const txn = await signAndSubmitTransaction(payload);
      console.log("Aggregator created, txn hash:", txn.hash);
      setAggMessage("Aggregator created successfully.");
    } catch (error) {
      console.error("Error creating aggregator", error);
      setAggMessage("Error creating aggregator.");
    }
  };

  const handleCreateSideLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setSideLaunchMessage("Wallet not connected.");
      return;
    }
    try {
      const payload = createSideLaunchPayload(aggSymbol, sideLaunchName, description, metadataUri);
      const txn = await signAndSubmitTransaction(payload);
      console.log("Side launch created, txn hash:", txn.hash);
      setSideLaunchMessage("Side launch created successfully.");
    } catch (error) {
      console.error("Error creating side launch", error);
      setSideLaunchMessage("Error creating side launch.");
    }
  };

  const handleMintTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setMintMessage("Wallet not connected.");
      return;
    }
    try {
      const payload = mintTokensPayload(mintAggSymbol, mintToAddress, mintAmount);
      const txn = await signAndSubmitTransaction(payload);
      console.log("Tokens minted, txn hash:", txn.hash);
      setMintMessage("Tokens minted successfully.");
    } catch (error) {
      console.error("Error minting tokens", error);
      setMintMessage("Error minting tokens.");
    }
  };

  const handleBurnTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setBurnMessage("Wallet not connected.");
      return;
    }
    try {
      const payload = burnTokensPayload(burnAggSymbol, burnFromAddress, burnAmount);
      const txn = await signAndSubmitTransaction(payload);
      console.log("Tokens burned, txn hash:", txn.hash);
      setBurnMessage("Tokens burned successfully.");
    } catch (error) {
      console.error("Error burning tokens", error);
      setBurnMessage("Error burning tokens.");
    }
  };

  const handleMintNft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setNftMessage("Wallet not connected.");
      return;
    }
    try {
      const payload = mintNftPayload(nftAggSymbol, nftSideLaunchName, nftToAddress);
      const txn = await signAndSubmitTransaction(payload);
      console.log("NFT minted, txn hash:", txn.hash);
      setNftMessage("NFT minted successfully.");
    } catch (error) {
      console.error("Error minting NFT", error);
      setNftMessage("Error minting NFT.");
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>

      <section className="card">
        <h3>Create Aggregator</h3>
        <form onSubmit={handleCreateAggregator}>
          <input type="text" placeholder="Aggregator Name" value={aggName} onChange={(e) => setAggName(e.target.value)} />
          <input type="text" placeholder="Aggregator Symbol" value={aggSymbol} onChange={(e) => setAggSymbol(e.target.value)} />
          <input type="text" placeholder="Icon URI" value={iconUri} onChange={(e) => setIconUri(e.target.value)} />
          <input type="text" placeholder="Project URI" value={projectUri} onChange={(e) => setProjectUri(e.target.value)} />
          <button type="submit">Create Aggregator</button>
        </form>
        <p className="message">{aggMessage}</p>
      </section>

      <section className="card">
        <h3>Create Side Launch</h3>
        <form onSubmit={handleCreateSideLaunch}>
          <input type="text" placeholder="Aggregator Symbol" value={aggSymbol} onChange={(e) => setAggSymbol(e.target.value)} />
          <input type="text" placeholder="Side Launch Name" value={sideLaunchName} onChange={(e) => setSideLaunchName(e.target.value)} />
          <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="text" placeholder="Metadata URI" value={metadataUri} onChange={(e) => setMetadataUri(e.target.value)} />
          <button type="submit">Create Side Launch</button>
        </form>
        <p className="message">{sideLaunchMessage}</p>
      </section>

      <section className="card">
        <h3>Mint Tokens</h3>
        <form onSubmit={handleMintTokens}>
          <input type="text" placeholder="Aggregator Symbol" value={mintAggSymbol} onChange={(e) => setMintAggSymbol(e.target.value)} />
          <input type="text" placeholder="Recipient Address" value={mintToAddress} onChange={(e) => setMintToAddress(e.target.value)} />
          <input type="number" placeholder="Amount" value={mintAmount} onChange={(e) => setMintAmount(Number(e.target.value))} />
          <button type="submit">Mint Tokens</button>
        </form>
        <p className="message">{mintMessage}</p>
      </section>

      <section className="card">
        <h3>Burn Tokens</h3>
        <form onSubmit={handleBurnTokens}>
          <input type="text" placeholder="Aggregator Symbol" value={burnAggSymbol} onChange={(e) => setBurnAggSymbol(e.target.value)} />
          <input type="text" placeholder="Sender Address" value={burnFromAddress} onChange={(e) => setBurnFromAddress(e.target.value)} />
          <input type="number" placeholder="Amount" value={burnAmount} onChange={(e) => setBurnAmount(Number(e.target.value))} />
          <button type="submit">Burn Tokens</button>
        </form>
        <p className="message">{burnMessage}</p>
      </section>

      <section className="card">
        <h3>Mint NFT</h3>
        <form onSubmit={handleMintNft}>
          <input type="text" placeholder="Aggregator Symbol" value={nftAggSymbol} onChange={(e) => setNftAggSymbol(e.target.value)} />
          <input type="text" placeholder="Side Launch Name" value={nftSideLaunchName} onChange={(e) => setNftSideLaunchName(e.target.value)} />
          <input type="text" placeholder="Recipient Address" value={nftToAddress} onChange={(e) => setNftToAddress(e.target.value)} />
          <button type="submit">Mint NFT</button>
        </form>
        <p className="message">{nftMessage}</p>
      </section>
    </div>
  );
};

export default AdminPage;
