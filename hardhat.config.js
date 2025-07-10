require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { METAMASK_PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    kairos: {
      url: "https://public-en-kairos.node.kaia.io",
      accounts: METAMASK_PRIVATE_KEY ? [METAMASK_PRIVATE_KEY] : [],
    },
  },
};
