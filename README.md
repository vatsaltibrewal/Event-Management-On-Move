# Event Management On APTOS

A decentralized event management system built on Aptos Move that enables event organizers to create and manage events with integrated token rewards and NFT collections.

**This Contract was also used in India Blockchain Week 2024 for Event Management.**

## Overview

Evolv is a comprehensive event management platform that implements a unique dual-token system:
- **Event Tokens (Fungible Assets)**: Each event (Aggregator) has its own token for tracking participant engagement and rewards
- **Event NFTs (Non-Fungible Tokens)**: Side events within each main event can issue unique NFTs as rewards for participation and quest completion

## Features

### Core Functionality
- Create and manage main events (Aggregators) with associated ERC20-style tokens
- Launch side events with dedicated NFT collections
- Mint and burn event tokens
- Issue NFT rewards for event participation
- Track event participation and rewards through on-chain events

### Event Structure
- **Main Event (Aggregator)**
  - Unique fungible token for point system
  - Multiple side events
  - Event-specific metadata
  
- **Side Events**
  - Unique NFT collection
  - Uses parent event's token system
  - Custom metadata and reward structure

## Smart Contract Functions

### Event Management
```move
public entry fun create_aggregator(
    evolv_owner: &signer,
    aggregator_name: String,
    aggregator_symbol: String,
    icon_uri: String,
    project_uri: String
)
```
Creates a new main event with its own fungible token.

```move
public entry fun create_side_launch(
    evolv_owner: &signer,
    aggregator_symbol: String,
    side_launch_name: String,
    description: String,
    metadata_uri: String
)
```
Creates a new side event with its NFT collection.

### Token Operations
```move
public entry fun mint_tokens(
    evolv_owner: &signer,
    aggregator_symbol: String,
    to_address: address,
    amount: u64
)
```
Mints event tokens to a participant's address.

```move
public entry fun burn_tokens(
    evolv_owner: &signer,
    aggregator_symbol: String,
    from_address: address,
    amount: u64
)
```
Burns event tokens from a participant's address.

### NFT Management
```move
public entry fun mint_nft(
    evolv_owner: &signer,
    aggregator_symbol: String,
    side_launch_name: String,
    to_address: address
)
```
Mints an NFT reward for a side event participant.

### View Functions
```move
public fun get_aggregator_info(aggregator_symbol: String): Option<AggregatorInfo>
public fun get_side_launch_info(aggregator_symbol: String, side_launch_name: String): Option<SideLaunchInfo>
```
Query event and side event information.

## Event Tracking

The contract emits various events to track system activity:

- `NewAggregatorEvent`: When a new main event is created
- `NewSideLaunchEvent`: When a new side event is launched
- `TokensMintedEvent`: When event tokens are minted
- `TokensBurnedEvent`: When event tokens are burned
- `NftsMintedEvent`: When NFT rewards are issued

## Error Handling

The contract includes comprehensive error handling with specific error codes:

- `ENOT_AUTHORIZED`: Unauthorized operation attempt
- `EAGGREGATOR_NOT_FOUND`: Event not found
- `ESIDE_LAUNCH_NOT_FOUND`: Side event not found
- `EAGGREGATOR_ALREADY_EXISTS`: Duplicate event creation attempt
- `ESIDE_LAUNCH_ALREADY_EXISTS`: Duplicate side event creation attempt

## Architecture

The system follows a hierarchical structure:
1. **Evolv Contract**: Top-level management
2. **Aggregators (Main Events)**: Each with unique fungible tokens
3. **Side Launches**: Associated with aggregators, featuring NFT collections

## Security Considerations

- Owner-only access control for critical operations
- Secure token management with dedicated mint, burn, and transfer references
- Proper validation checks for all operations
- Event emission for transparency and tracking

## Development Setup

1. Clone the repository
2. Set up the Aptos development environment
3. Deploy the contract using the Aptos CLI
4. Initialize the contract with the desired owner address

Made with ❤️ by Vatsal
