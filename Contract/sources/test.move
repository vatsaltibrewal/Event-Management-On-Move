module test::evolv_erc20 {
    use std::error;
    use std::option::{Self, Option};
    use std::signer;
    use std::string::{Self, String, utf8};
    use aptos_framework::account;
    use aptos_framework::object::{Self, ConstructorRef, Object};
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use aptos_std::table::{Self, Table};
    use aptos_framework::fungible_asset::{Self, MintRef, TransferRef, BurnRef, Metadata, FungibleAsset};
    use aptos_framework::primary_fungible_store;
    use std::event::{Self, EventHandle};

    // Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const EAGGREGATOR_NOT_FOUND: u64 = 2;
    const ESIDE_LAUNCH_NOT_FOUND: u64 = 3;
    const EAGGREGATOR_ALREADY_EXISTS: u64 = 4;
    const ESIDE_LAUNCH_ALREADY_EXISTS: u64 = 5;

    struct Evolv has key {
        owner: address,
        // Mapping of aggregator symbol to aggregator details
        aggregators: Table<String, AggregatorInfo>,
        // Mapping of aggregator symbol to its side launch information
        side_launches: Table<String, Table<String, SideLaunchInfo>>,
        new_aggregator_events: EventHandle<NewAggregatorEvent>,
        new_side_launch_events: EventHandle<NewSideLaunchEvent>,
        tokens_minted_events: EventHandle<TokensMintedEvent>,
        tokens_burned_events: EventHandle<TokensBurnedEvent>,
        nfts_minted_events: EventHandle<NftsMintedEvent>,
    }

    struct AggregatorInfo has store, copy, drop {
        name: String,
        token_address: address,      // Address of the fungible asset
        is_active: bool,
    }

    struct SideLaunchInfo has store, copy, drop {
        name: String,
        description: String,
        collection_address: address, // Address of the NFT collection
        metadata_uri: String,
        is_active: bool,
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct ManagedFungibleAsset has key {
        mint_ref: MintRef,
        transfer_ref: TransferRef,
        burn_ref: BurnRef,
    }

    /// Event emitted when a new aggregator is created
    struct NewAggregatorEvent has drop, store {
        aggregator_symbol: String,
        aggregator_name: String,
    }

    /// Event emitted when a new side launch is created
    struct NewSideLaunchEvent has drop, store {
        aggregator_symbol: String,
        side_launch_name: String,
    }

    /// Event emitted when tokens are minted for a user
    struct TokensMintedEvent has drop, store {
        aggregator_symbol: String,
        user_address: address,
        amount: u64,
    }

    /// Event emitted when tokens are burned for a user
    struct TokensBurnedEvent has drop, store {
        aggregator_symbol: String,
        user_address: address,
        amount: u64,
    }

    /// Event emitted when an NFT is minted for a side launch
    struct NftsMintedEvent has drop, store {
        aggregator_symbol: String,
        side_launch_name: String,
        user_address: address,
    }

    fun init_module(owner: &signer) {
        let evolv = Evolv {
            owner: signer::address_of(owner),
            aggregators: table::new(),
            side_launches: table::new(),
            new_aggregator_events: account::new_event_handle<NewAggregatorEvent>(owner),
            new_side_launch_events: account::new_event_handle<NewSideLaunchEvent>(owner),
            tokens_minted_events: account::new_event_handle<TokensMintedEvent>(owner),
            tokens_burned_events: account::new_event_handle<TokensBurnedEvent>(owner),
            nfts_minted_events: account::new_event_handle<NftsMintedEvent>(owner),
        };
        move_to(owner, evolv);
    }

    public entry fun create_aggregator(
        evolv_owner: &signer,
        aggregator_name: String,
        aggregator_symbol: String,
        icon_uri: String,
        project_uri: String
    ) acquires Evolv {
        let evolv = borrow_global_mut<Evolv>(@test);
        assert!(evolv.owner == signer::address_of(evolv_owner), ENOT_AUTHORIZED);
        assert!(!table::contains(&evolv.aggregators, aggregator_symbol), EAGGREGATOR_ALREADY_EXISTS);

        let symbol = *string::bytes(&aggregator_symbol);
        let constructor_ref = &object::create_named_object(evolv_owner, symbol);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(),
            aggregator_name,
            aggregator_symbol,
            8,
            icon_uri,
            project_uri,
        );

        // Set up fungible asset management
        let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(constructor_ref);
        let metadata_object_signer = object::generate_signer(constructor_ref);
        
        move_to(
            &metadata_object_signer,
            ManagedFungibleAsset { mint_ref, transfer_ref, burn_ref }
        );

        let token_obj_signer = &object::generate_signer(constructor_ref);
        let token_obj_addr = signer::address_of(token_obj_signer);

        // Store aggregator information
        let aggregator_info = AggregatorInfo {
            name: aggregator_name,
            token_address: token_obj_addr,
            is_active: true,
        };
        table::add(&mut evolv.aggregators, aggregator_symbol, aggregator_info);

        // Create table for side launches of this aggregator
        table::add(&mut evolv.side_launches, aggregator_symbol, table::new());

        // Emit event for new aggregator creation
        event::emit_event(
            &mut borrow_global_mut<Evolv>(@test).new_aggregator_events,
            NewAggregatorEvent {
                aggregator_symbol,
                aggregator_name,
            }
        );
    }

    public entry fun create_side_launch(
        evolv_owner: &signer,
        aggregator_symbol: String,
        side_launch_name: String,
        description: String,
        metadata_uri: String
    ) acquires Evolv {
        let evolv = borrow_global_mut<Evolv>(@test);
        assert!(evolv.owner == signer::address_of(evolv_owner), ENOT_AUTHORIZED);
        assert!(table::contains(&evolv.aggregators, aggregator_symbol), EAGGREGATOR_NOT_FOUND);

        let side_launches_table = table::borrow_mut(&mut evolv.side_launches, aggregator_symbol);
        assert!(!table::contains(side_launches_table, side_launch_name), ESIDE_LAUNCH_ALREADY_EXISTS);

        // Create NFT collection for side launch
        let collection_ref = &collection::create_unlimited_collection(
            evolv_owner,
            aggregator_symbol,
            side_launch_name,
            option::none(),
            metadata_uri,
        );

        let collection_obj_signer = &object::generate_signer(collection_ref);
        let collection_obj_addr = signer::address_of(collection_obj_signer);

        // Store side launch information
        let side_launch_info = SideLaunchInfo {
            name: side_launch_name,
            description,
            collection_address: collection_obj_addr,
            metadata_uri,
            is_active: true,
        };

        table::add(side_launches_table, side_launch_name, side_launch_info);

        // Emit event for new side launch creation
        event::emit_event(
            &mut evolv.new_side_launch_events,
            NewSideLaunchEvent {
                aggregator_symbol,
                side_launch_name,
            }
        );
    }

    public entry fun mint_nft(
        evolv_owner: &signer,
        aggregator_symbol: String,
        side_launch_name: String,
        to_address: address
    ) acquires Evolv {
        let evolv = borrow_global_mut<Evolv>(@test);
        assert!(evolv.owner == signer::address_of(evolv_owner), ENOT_AUTHORIZED);
        assert!(table::contains(&evolv.aggregators, aggregator_symbol), EAGGREGATOR_NOT_FOUND);
        assert!(table::contains(&evolv.side_launches, aggregator_symbol), ESIDE_LAUNCH_NOT_FOUND);

        let side_launches_table = table::borrow(&evolv.side_launches, aggregator_symbol);
        assert!(table::contains(side_launches_table, side_launch_name), ESIDE_LAUNCH_NOT_FOUND);

        let side_launch_info = table::borrow(side_launches_table, side_launch_name);
        let collection_ref = object::address_to_object<aptos_token_objects::collection::Collection>(side_launch_info.collection_address);
        let token_ref = &token::create(
            evolv_owner,
            collection::name(collection_ref),
            side_launch_info.name,
            side_launch_info.description,
            option::none(),
            side_launch_info.metadata_uri,
        );

        // Transfer the NFT to the specified address
        let transfer_ref = object::generate_transfer_ref(token_ref);
        let token_signer = object::generate_signer(token_ref);
        let token_object = object::object_from_constructor_ref<token::Token>(token_ref);

        object::transfer(evolv_owner, token_object, to_address);

        // Emit event for NFT minting
        event::emit_event(
            &mut evolv.nfts_minted_events,
            NftsMintedEvent {
                aggregator_symbol,
                side_launch_name,
                user_address: to_address,
            }
        );
    }

    #[view]
    public fun get_aggregator_info(aggregator_symbol: String): Option<AggregatorInfo> acquires Evolv {
        let evolv = borrow_global<Evolv>(@test);
        if (table::contains(&evolv.aggregators, aggregator_symbol)) {
            let aggregator_info = table::borrow(&evolv.aggregators, aggregator_symbol);
            option::some(*aggregator_info)
        } else {
            option::none()
        }
    }

    #[view]
    public fun get_side_launch_info(
        aggregator_symbol: String,
        side_launch_name: String
    ): Option<SideLaunchInfo> acquires Evolv {
        let evolv = borrow_global<Evolv>(@test);
        if (!table::contains(&evolv.aggregators, aggregator_symbol) || 
            !table::contains(&evolv.side_launches, aggregator_symbol)) {
            return option::none()
        };
        
        let side_launches = table::borrow(&evolv.side_launches, aggregator_symbol);
        if (table::contains(side_launches, side_launch_name)) {
            let side_launch_info = table::borrow(side_launches, side_launch_name);
            option::some(*side_launch_info)
        } else {
            option::none()
        }
    }

    public entry fun mint_tokens(
        evolv_owner: &signer,
        aggregator_symbol: String,
        to_address: address,
        amount: u64
    ) acquires Evolv, ManagedFungibleAsset {
        let evolv = borrow_global<Evolv>(@test);
        assert!(evolv.owner == signer::address_of(evolv_owner), ENOT_AUTHORIZED);
        assert!(table::contains(&evolv.aggregators, aggregator_symbol), EAGGREGATOR_NOT_FOUND);

        let aggregator_info = table::borrow(&evolv.aggregators, aggregator_symbol);
        let asset = object::address_to_object<Metadata>(aggregator_info.token_address);
        let managed_fungible_asset = authorized_borrow_refs(evolv_owner, asset);
        
        let to_wallet = primary_fungible_store::ensure_primary_store_exists(to_address, asset);
        let fa = fungible_asset::mint(&managed_fungible_asset.mint_ref, amount);
        fungible_asset::deposit(to_wallet, fa);

        // Emit event for token minting
        event::emit_event(
            &mut borrow_global_mut<Evolv>(@test).tokens_minted_events,
            TokensMintedEvent {
                aggregator_symbol,
                user_address: to_address,
                amount,
            }
        );
    }

    public entry fun burn_tokens(
        evolv_owner: &signer,
        aggregator_symbol: String,
        from_address: address,
        amount: u64
    ) acquires Evolv, ManagedFungibleAsset {
        let evolv = borrow_global<Evolv>(@test);
        assert!(evolv.owner == signer::address_of(evolv_owner), ENOT_AUTHORIZED);
        assert!(table::contains(&evolv.aggregators, aggregator_symbol), EAGGREGATOR_NOT_FOUND);

        let aggregator_info = table::borrow(&evolv.aggregators, aggregator_symbol);
        let asset = object::address_to_object<Metadata>(aggregator_info.token_address);
        let managed_fungible_asset = authorized_borrow_refs(evolv_owner, asset);
        
        let from_wallet = primary_fungible_store::ensure_primary_store_exists(from_address, asset);
        let fa = fungible_asset::withdraw_with_ref(&managed_fungible_asset.transfer_ref, from_wallet, amount);
        fungible_asset::burn(&managed_fungible_asset.burn_ref, fa);

        // Emit event for token burning
        event::emit_event(
            &mut borrow_global_mut<Evolv>(@test).tokens_burned_events,
            TokensBurnedEvent {
                aggregator_symbol,
                user_address: from_address,
                amount,
            }
        );
    }

    inline fun authorized_borrow_refs(
        owner: &signer,
        asset: Object<Metadata>,
    ): &ManagedFungibleAsset acquires ManagedFungibleAsset {
        assert!(object::is_owner(asset, signer::address_of(owner)), error::permission_denied(ENOT_AUTHORIZED));
        borrow_global<ManagedFungibleAsset>(object::object_address(&asset))
    }
}