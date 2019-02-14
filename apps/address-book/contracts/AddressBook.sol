/*
* SPDX-License-Identitifer: GPL-3.0-or-later
*/
pragma solidity 0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";


/**
* @title AddressBook Contract
* @author Autark
* @dev This contract defines an address book (registry) that allows the
* association of a human-readable string to a type, and ethereum address.
*/
contract AddressBook is AragonApp {

    // ACL Roles
    bytes32 public constant ADD_ENTRY_ROLE = keccak256("ADD_ENTRY_ROLE");
    bytes32 public constant REMOVE_ENTRY_ROLE = keccak256("REMOVE_ENTRY_ROLE");

    // Error msgs for reverts
    string private constant ERROR_DUP_ADDRESS = "ADDRESS_ALREADY_ADDED";
    string private constant ERROR_UNKNOWN_ADDRESS = "ADDRESS_NOT_ADDED";

    // Order optimized for storage
    struct Entry {
        bytes32 name;
        bytes32 entryType;
        uint index;
    }

    // The entries registry and the addresses array (for iterations)
    mapping(address => Entry) private entries;
    address[] private entryIndex;

    event EntryAdded(address indexed entryAddress, bytes32 name, bytes32 entryType, uint index);
    event EntryUpdated(address indexed entryAddress, bytes32 updatedName, bytes32 updatedEntryType, uint updatedIndex);    
    event EntryRemoved(address indexed entryAddress, uint index);

    /**
    * @dev Custom constructor for AragonApp
    * @notice Initialize the AddressBook app
    */
    function initialize() external onlyInit {
        initialized();
    }

    /**
    * @dev Query the registry to find if an address is already added
    * @notice Check if entity with the address `_entryAddress` exists in the registry.
    * @param _entryAddress The address of the entry to check
    * @return Boolean result of the query
    */
    function isEntryAdded(address _entryAddress) public view returns(bool) {
        if (entryIndex.length == 0) {
            return false;
        }
        return (entryIndex[entries[_entryAddress].index] == _entryAddress);
    }

    /**
    * @dev Add an entity to the registry
    * @notice Add entity `_entryAddress` to the registry.
    * @param _entryAddress The address of the entry to add to the registry
    * @param _entryName The name of the entry to add to the registry
    * @param _entryType The type of the entry to add to the registry
    * @return uint index position of the added entry in the registry
    */
    function addEntry(
        address _entryAddress,
        bytes32 _entryName,
        bytes32 _entryType
    ) public auth(ADD_ENTRY_ROLE) returns (uint)
    {
        require(!isEntryAdded(_entryAddress), ERROR_DUP_ADDRESS);
        // TODO: check name added here
        entries[_entryAddress].name = _entryName;
        entries[_entryAddress].entryType = _entryType;
        entries[_entryAddress].index = entryIndex.push(_entryAddress) - 1;
        emit EntryAdded(
            _entryAddress,
            _entryName,
            _entryType,
            entries[_entryAddress].index
        );
        return entryIndex.length - 1;
    }

    /**
    * @dev Removes an entry from the registry and swaps the gap with another
    * @notice Remove entity with address `_entryAddress` from the registry.
    * @param _entryAddress The ID of the entry to remove
    * @return index uint previous occupied position of the removed entry in the registry
    */
    function removeEntry(
        address _entryAddress
    ) public auth(REMOVE_ENTRY_ROLE) returns (uint index)
    {
        require(isEntryAdded(_entryAddress), ERROR_UNKNOWN_ADDRESS);
        uint rowToDelete = entries[_entryAddress].index;
        address entryToMove = entryIndex[entryIndex.length - 1];
        entryIndex[rowToDelete] = entryToMove;
        entries[entryToMove].index = rowToDelete;
        entryIndex.length--;
        emit EntryRemoved(_entryAddress, rowToDelete);
        emit EntryUpdated(entryToMove, entries[entryToMove].name, entries[entryToMove].entryType, rowToDelete);
        return rowToDelete;
    }

    /**
    * @dev Get an entry from the registry.
    * @notice Get the entry with address `_entryAddress` from the registry
    * @param _entryAddress The address of the entry to get
    * @return bytes32 Name assigned to the entry
    * @return bytes32 Type assigned to the entry
    * @return uint index of the entry in the registry
    */
    function getEntry(
        address _entryAddress
    ) public view returns (bytes32, bytes32, uint)
    {
        require(isEntryAdded(_entryAddress), ERROR_UNKNOWN_ADDRESS);
        return(
            entries[_entryAddress].name,
            entries[_entryAddress].entryType,
            entries[_entryAddress].index
        );
    }
}
// TODO: getEntryAtIndex, getEntryCount, updateName, updateType
// TODO: isInitialized to all methods
// TODO: Extract modifiers: addressExists, nameNotUsed, addressNotUsed?