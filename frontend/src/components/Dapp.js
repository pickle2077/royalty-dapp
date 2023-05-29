import React from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";
import * as sapphire from "@oasisprotocol/sapphire-paratime";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import LotteryArtifact from "../contracts/Lottery.json";
import contractAddress from "../contracts/contract-address.json";

import detectEthereumProvider from "@metamask/detect-provider";

// This is the default id used by the Hardhat Network
// const HARDHAT_NETWORK_ID = "31337";
const HARDHAT_NETWORK_ID = "23295"; // Sapphire Testnet

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance to keep it updated.
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync,  and how to send a
// transaction.
export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      selectedAddress: null,
      metamaskInstalled: true,
      networkName: null,
      amountToEnter: "0.01",
      players: [],
      winner: null,
    };

    this.state = this.initialState;
  }

  connectWallet = async () => {
    // Request access to the user's accounts
    // this._provider = await detectEthereumProvider();
    this._provider = sapphire.wrap(
      new ethers.providers.Web3Provider(window.ethereum)
    );
    if (!this._provider) {
      console.log("Please install MetaMask!");
      this.setState({ metamaskInstalled: false });
      return;
    }

    const [address] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    this.setState({ selectedAddress: address });

    const networkName = await this._getNetworkName();
    this.setState({ networkName });

    this._initialize(this.state.selectedAddress);

    window.ethereum.on("chainChanged", async () => {
      const networkName = await this._getNetworkName();
      this.setState({ networkName });

      this._initialize(this.state.selectedAddress);
    });

    window.ethereum.on("accountsChanged", ([newAddress]) => {
      // this._stopPollingData();

      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(newAddress);
    });

    this._lottery.on("WinnerPicked", (index, winner, winnings, event) => {
      // This will print the winner's address and the winnings:
      console.log(index);
      console.log(winner);
      console.log(winnings.toString());

      // Also, if you need additional details, like the block number or the transaction hash,
      // you can get them from the event object:
      console.log(event.blockNumber);
      console.log(event.transactionHash);

      // Then you can set the state or do something else with this data
      // this.setState({
      //   winner: winner,
      //   winnings: ethers.utils.formatEther(winnings),
      // });
    });
  };

  _resetState() {
    this.setState(this.initialState);
  }

  _initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._initializeEthers();
    // this._getTokenData();
    // this._startPollingData();
  }

  async _initializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    // const provider = new ethers.providers.Web3Provider(this._provider);
    const signer = this._provider.getSigner();

    // Now we can use ethers provider.getSigner method
    // const signer = provider.getSigner();

    // Then, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    // this._lottery = new ethers.Contract(
    //   contractAddress.Lottery,
    //   LotteryArtifact.abi,
    //   signer
    // );
    this._lottery = new ethers.Contract(
      contractAddress.Lottery,
      LotteryArtifact.abi,
      this._provider
    );

    this._lotteryWrite = new ethers.Contract(
      contractAddress.Lottery,
      LotteryArtifact.abi,
      sapphire.wrap(
        new ethers.providers.Web3Provider(window.ethereum).getSigner()
      )
    );
  }

  _getNetworkName = async () => {
    // const networkId = await ethereumProvider.request({ method: "net_version" });
    const networkId = await window.ethereum.request({ method: "net_version" });
    console.log(networkId);
    let networkName;
    switch (networkId) {
      case "42261":
        networkName = "Emerald Testnet";
        break;
      case "42262":
        networkName = "Emerald Mainnet";
        break;
      case "23295":
        networkName = "Sapphire Testnet";
        break;
      case "23294":
        networkName = "Sapphire Mainnet";
        break;
      default:
        networkName = "Unknown";
    }
    return networkName;
  };

  enterLottery = async () => {
    try {
      const amountInWei = ethers.utils.parseEther(this.state.amountToEnter);
      await this._lotteryWrite.enter({ value: amountInWei });
      this.updateList();
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
    }
  };

  updateList = async () => {
    const players = await this._lottery.getPlayers();
    this.setState({ players });
  };

  pickWinner = async () => {
    try {
      // Send a transaction to pickWinner method on the contract
      await this._lotteryWrite.pickWinner();

      // Once the transaction is confirmed, get the winner
      // const winner = await this._lottery.winner();

      // Update the state with the winner
      // this.setState({ winner });
    } catch (err) {
      console.error("Error picking winner:", err);
    }
  };

  render() {
    return (
      <div>
        <button onClick={this.connectWallet}>Connect Wallet</button>
        {this.state.selectedAddress ? (
          <p>Your address: {this.state.selectedAddress}</p>
        ) : null}
        {this.state.networkName ? this.state.networkName : null}
        {!this.state.metamaskInstalled ? (
          <p>Please install MetaMask to use this Dapp!</p>
        ) : null}
        <p>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={this.state.amountToEnter}
            onChange={(e) => this.setState({ amountToEnter: e.target.value })}
          />
          <button onClick={this.enterLottery}>Enter Lottery</button>
        </p>
        <button onClick={this.updateList}>Refresh Player List</button>
        <div>
          <ul>
            {this.state.players.map((player, index) => (
              <li key={index}>{player}</li>
            ))}
          </ul>
        </div>
        <div>
          <button onClick={this.pickWinner}>Pick Winner</button>
          {this.state.winner && <p>The winner is: {this.state.winner}</p>}
        </div>
      </div>
    );
  }
}
