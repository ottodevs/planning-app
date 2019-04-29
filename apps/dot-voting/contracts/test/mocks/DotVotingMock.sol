pragma solidity ^0.4.24;

import "../../DotVoting.sol";


contract DotVotingMock is DotVoting {
    // _isValuePct public wrapper
    function isValuePct(uint256 _value, uint256 _total, uint256 _pct) external pure returns (bool) {
        return _isValuePct(_value, _total, _pct);
    }

    /**
    * @notice `getCandidateDescriptionFromAddress` serves as a wrapper using
    *         the plain address instead of a hash of it 
    *         to return the struct data.
    * @param _description The address used when adding the candidate.
    */
    function getCandidateDescriptionFromAddress(address _description) external view returns (address) {
        bytes32 cKey = keccak256(abi.encodePacked(_description));
        return getCandidateDescription(cKey);
    }
}
