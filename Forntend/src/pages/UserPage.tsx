// src/pages/UserPage.tsx
import React, { useEffect, useState } from "react";
import { getAllSideLaunchInfo } from "../aptosClient";

interface SideLaunchInfoData {
  name: string;
  description: string;
  collection_address: string;
  metadata_uri: string;
  is_active: boolean;
}

const UserPage: React.FC = () => {
  const [sideLaunches, setSideLaunches] = useState<SideLaunchInfoData[]>([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const res = await getAllSideLaunchInfo();
      // res is expected to be an array with one element: the array of SideLaunchInfo objects.
      setSideLaunches(res);
    } catch (err) {
      console.error("Error fetching side launch infos:", err);
      setError("Error fetching side launch infos.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="user-panel">
      <h2>User Panel</h2>
      {error && <p className="error">{error}</p>}
      <div className="cards-container">
        {sideLaunches && sideLaunches.length > 0 ? (
          sideLaunches.map((side, index) => (
            <div key={index} className="nft-card">
              <img src={side.metadata_uri} alt={side.name} className="nft-image" />
              <div className="nft-details">
                <h4>{side.name}</h4>
                <p>{side.description}</p>
                <p>Status: {side.is_active ? "Active" : "Inactive"}</p>
                <button className="claim-button" onClick={() => { /* Claim NFT action */ }}>
                  Claim NFT
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No side launches available.</p>
        )}
      </div>
    </div>
  );
};

export default UserPage;
