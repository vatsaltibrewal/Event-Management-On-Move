// src/aptosClient.ts
import { AptosClient } from "aptos";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

// Use Aptos Devnet fullnode URL (update as needed)
const NODE_URL = "https://aptos.testnet.bardock.movementlabs.xyz/v1";
export const aptosClient = new AptosClient(NODE_URL);

// Replace with your deployed contract address
export const CONTRACT_ADDRESS = "0x4380432feb95b2ec174d136853a83dc395ecd4077f9e144fc75bb732c2c51c65";
export const MODULE_NAME = "evolv_erc20";

// ------------------ Transaction Payload Creators ------------------

export function createAggregatorPayload(
  aggregatorName: string,
  aggregatorSymbol: string,
  iconUri: string,
  projectUri: string
): InputTransactionData {
  return {
    data: {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::create_aggregator`,
      functionArguments: [aggregatorName, aggregatorSymbol, iconUri, projectUri],
    },
  };
}

export function createSideLaunchPayload(
  aggregatorSymbol: string,
  sideLaunchName: string,
  description: string,
  metadataUri: string
): InputTransactionData {
  return {
    data: {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::create_side_launch`,
      functionArguments: [aggregatorSymbol, sideLaunchName, description, metadataUri],
    },
  };
}

export function mintTokensPayload(
  aggregatorSymbol: string,
  toAddress: string,
  amount: number
): InputTransactionData {
  return {
    data: {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::mint_tokens`,
      functionArguments: [aggregatorSymbol, toAddress, amount],
    },
  };
}

export function burnTokensPayload(
  aggregatorSymbol: string,
  fromAddress: string,
  amount: number
): InputTransactionData {
  return {
    data: {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::burn_tokens`,
      functionArguments: [aggregatorSymbol, fromAddress, amount],
    },
  };
}

export function mintNftPayload(
  aggregatorSymbol: string,
  sideLaunchName: string,
  toAddress: string
): InputTransactionData {
  return {
    data: {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::mint_nft`,
      functionArguments: [aggregatorSymbol, sideLaunchName, toAddress],
    },
  };
}

// ------------------ View Helper ------------------
// Call the get_side_launch_info view function which requires no arguments and returns a nested array of SideLaunchInfo structs.
export async function getAllSideLaunchInfo(): Promise<any> {
  const res = await aptosClient.view({
    function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_side_launch_info`,
    type_arguments: [],
    arguments: []
  });
  return res[0] || [];
}
