// src/components/Home.tsx
import React, { useState } from "react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import "./App.css";

const App: React.FC = () => {
  const { connected, account } = useWallet();
  // Set default active tab to "user"
  const [activeTab, setActiveTab] = useState<"admin" | "user">("user");

  const handleTabChange = (tab: "admin" | "user") => {
    setActiveTab(tab);
  };

  return (
    <div className="container">
      <header>
        <h1>Evolv ERC20 Frontend</h1>
        <WalletSelector />
        {connected && (
          <p className="connected-info">Connected:</p>
        )}
      </header>

      <nav className="tabs">
        <button
          onClick={() => handleTabChange("admin")}
          className={activeTab === "admin" ? "active" : ""}
        >
          Admin Panel
        </button>
        <button
          onClick={() => handleTabChange("user")}
          className={activeTab === "user" ? "active" : ""}
        >
          User Panel
        </button>
      </nav>

      <main className="tab-content">
        {activeTab === "admin" ? <AdminPage /> : <UserPage />}
      </main>
    </div>
  );
};

export default App;
