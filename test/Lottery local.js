// // This is an example test file. Hardhat will run every *.js file in `test/`,
// // so feel free to add new ones.

// require("dotenv").config();

// const privateKey = process.env.PRIVATE_KEY;
// const wallet = new ethers.Wallet(privateKey);

// const networkConfig = network.config;

// const provider = new ethers.providers.JsonRpcProvider(networkConfig.url);
// const signer = wallet.connect(provider);
// console.log("Signer is");
// console.log(signer.address);

// // Hardhat tests are normally written with Mocha and Chai.

// // We import Chai to use its asserting functions here.
// const { expect } = require("chai");

// // We use `loadFixture` to share common setups (or fixtures) between tests.
// // Using this simplifies your tests and makes them run faster, by taking
// // advantage or Hardhat Network's snapshot functionality.
// const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// // `describe` is a Mocha function that allows you to organize your tests.
// // Having your tests organized makes debugging them easier. All Mocha
// // functions are available in the global scope.
// //
// // `describe` receives the name of a section of your test suite, and a
// // callback. The callback must define the tests of that section. This callback
// // can't be an async function.
// describe("Token contract", function () {
//   // We define a fixture to reuse the same setup in every test. We use
//   // loadFixture to run this setup once, snapshot that state, and reset Hardhat
//   // Network to that snapshot in every test.
//   async function deployTokenFixture() {
//     // Get the ContractFactory and Signers here.
//     const Lottery = await ethers.getContractFactory("Lottery");
//     const accounts = await ethers.getSigners();
//     console.log("Account balance");
//     console.log(accounts[0].address);
//     console.log(accounts[0].address.getBalance());
//     // To deploy our contract, we just have to call Token.deploy() and await
//     // for it to be deployed(), which happens onces its transaction has been
//     // mined.
//     const lottery = await Lottery.deploy();

//     await lottery.deployed();

//     // Fixtures can return anything you consider useful for your tests
//     return { Lottery, lottery, accounts };
//   }

//   // You can nest describe calls to create subsections.
//   describe("Deployment", function () {
//     // `it` is another Mocha function. This is the one you use to define your
//     // tests. It receives the test name, and a callback function.
//     //
//     // If the callback function is async, Mocha will `await` it.
//     it("Should set the right owner", async function () {
//       // We use loadFixture to setup our environment, and then assert that
//       // things went well
//       const { lottery, accounts } = await loadFixture(deployTokenFixture);

//       // Expect receives a value and wraps it in an assertion object. These
//       // objects have a lot of utility methods to assert values.

//       // This test expects the owner variable stored in the contract to be
//       // equal to our Signer's owner.
//       expect(await lottery.manager()).to.equal(accounts[0].address);
//     });
//   });

//   describe("Lottery Contract", function () {
//     it("allows one account to enter", async () => {
//       const { lottery, accounts } = await loadFixture(deployTokenFixture);
//       await lottery
//         .connect(accounts[0])
//         .enter({ value: ethers.utils.parseEther("0.02") });

//       console.log(accounts[0].address);

//       const players = await lottery.connect(accounts[0]).getPlayers();
//       console.log(players);
//       expect(accounts[0].address).to.equal(players[0]);
//       expect(1).to.equal(players.length);
//     });
//   });

//   it("allows multiple accounts to enter", async () => {
//     const { lottery, accounts } = await loadFixture(deployTokenFixture);
//     await lottery
//       .connect(accounts[0])
//       .enter({ value: ethers.utils.parseEther("0.02") });
//     await lottery
//       .connect(accounts[1])
//       .enter({ value: ethers.utils.parseEther("0.02") });
//     await lottery
//       .connect(accounts[2])
//       .enter({ value: ethers.utils.parseEther("0.02") });

//     const players = await lottery.connect(accounts[0]).getPlayers();

//     expect(accounts[0].address).to.equal(players[0]);
//     expect(accounts[1].address).to.equal(players[1]);
//     expect(accounts[2].address).to.equal(players[2]);
//     expect(3).to.equal(players.length);
//   });

//   it("requires a minimum amount of ether to enter", async () => {
//     const { lottery, accounts } = await loadFixture(deployTokenFixture);
//     try {
//       await lottery
//         .connect(accounts[0])
//         .enter({ value: ethers.utils.parseEther("0") });
//       expect.fail("The transaction should have thrown an error but didn't");
//     } catch (err) {
//       expect(err).to.exist;
//     }
//   });

//   it("only manager can call pickWinner", async () => {
//     const { lottery, accounts } = await loadFixture(deployTokenFixture);
//     try {
//       await lottery.connect(accounts[1]).pickWinner();
//       expect.fail("The transaction should have thrown an error but didn't");
//     } catch (err) {
//       expect(err).to.exist;
//     }
//   });

//   it("sends money to the winner and resets the players array", async () => {
//     const { lottery, accounts } = await loadFixture(deployTokenFixture);
//     await lottery
//       .connect(accounts[0])
//       .enter({ value: ethers.utils.parseEther("2") });

//     const initialBalance = await ethers.provider.getBalance(
//       accounts[0].address
//     );
//     await lottery.connect(accounts[0]).pickWinner();
//     const finalBalance = await ethers.provider.getBalance(accounts[0].address);
//     const difference = ethers.utils.formatEther(
//       finalBalance.sub(initialBalance)
//     );

//     expect(parseFloat(difference)).to.be.gt(1.8);
//   });
// });
