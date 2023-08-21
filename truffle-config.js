require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: process.env.RELAY_URL,
      port: process.env.RELAY_PORT,
      network_id: "*",
      provider: () =>
        new HDWalletProvider(
          [process.env.OWNER_KEY, process.env.BUYER_KEY],
          `${process.env.RELAY_URL}:${process.env.RELAY_PORT}`
        ),
      // minimum required gas is 150_000, we recommend doubling it
      gas: 5_000_000,
    },
  },

  mocha: {
    // 5 minutes
    timeout: 5 * 60000,
  },

  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
