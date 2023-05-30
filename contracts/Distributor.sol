pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IMinimalERC721AQueryable {
    
    // =============================================================
    //                         TOKEN COUNTERS
    // =============================================================

    /**
     * @dev Returns the total number of tokens in existence.
     * Burned tokens will reduce the count.
     * To get the total number of tokens minted, please see {_totalMinted}.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the number of tokens in `owner`'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);

    /**
     * @dev Returns the owner of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function ownerOf(uint256 tokenId) external view returns (address owner);

    function tokensOfOwner(address owner) external view returns (uint256[] memory);


    // =============================================================
    //                        IERC721Metadata
    // =============================================================

    /**
     * @dev Returns the token collection name.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the token collection symbol.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

contract Distributor {
    IMinimalERC721AQueryable public nft;
    uint256 public totalTokens;
    uint256 public undisbursedFunds;
    uint256 public disbursedFunds;

    // Mapping to store rewards for each address
    mapping(address => uint256) public rewards;

    mapping(uint256 => uint256) public rewardsPerToken;

    constructor(address nftAddress) {
        nft = IMinimalERC721AQueryable(nftAddress);
        undisbursedFunds = address(this).balance;
    }

    // Enable this contract to receive money
    receive() external payable {
        undisbursedFunds += msg.value;
    }

    // Updates the totalTokens state variable with the current total supply of NFTs
    function updateTokenCount() public {
        totalTokens = nft.totalSupply();
    }

    function disburseFunds() external {
        // Update totalTokens before calculating rewards
        updateTokenCount();
        require(totalTokens > 0, "No tokens minted yet");

        // Calculate the rewards based on the contract's balance
        uint256 contractBalance = address(this).balance;

        uint256 amountPerToken = (contractBalance-disbursedFunds) / totalTokens;

        // Loop through all tokens and update rewards for their holders
        for (uint256 i = 1; i <= totalTokens; i++) {
            address tokenHolder = nft.ownerOf(i);
            rewards[tokenHolder] += amountPerToken;
        }
        disbursedFunds += amountPerToken*totalTokens;
    }

    function disburseFunds2() external {
        updateTokenCount();
        require(totalTokens > 0, "No tokens minted yet");

        // Calculate the rewards based on the contract's balance
        uint256 contractBalance = address(this).balance;

        uint256 amountPerToken = (contractBalance-disbursedFunds) / totalTokens;
        for (uint16 i = 1; i <= totalTokens; i++) {
            rewardsPerToken[i] += amountPerToken;
        }

        disbursedFunds += amountPerToken*totalTokens;
    }


    // Allows users to claim their rewards

    function claimRewards() external {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards available");
        // Set the sender's rewards to 0 before transferring
        rewards[msg.sender] = 0;
        disbursedFunds -= reward;
        payable(msg.sender).transfer(reward);
        
    }

    function claimRewards2() external {
        uint256 reward = 0;
        uint256[] memory tokensOwned = nft.tokensOfOwner(msg.sender);

        for (uint16 i = 0; i < tokensOwned.length; i++) {
            reward += rewardsPerToken[tokensOwned[i]];
        }

        disbursedFunds -= reward;
        payable(msg.sender).transfer(reward);
    }
}