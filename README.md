1. Set up `truffle-config.js` file

2. import modules and smart contract

```
const {
  AccountId,
  Client,
  PrivateKey,
  TokenAssociateTransaction,
  TokenId,
} = require("@hashgraph/sdk");

const Nft = artifacts.require("Nft");
```

3. set up client

```
const client = Client.forTestnet().setOperator(
  process.env.OPERATOR_ID,
  process.env.OPERATOR_KEY
);
const gas = 5_000_000;
```

4. deploy SC

```
contract("Nft", (accounts) => {
  let nftInstance;
  let nftAddress;

  it("Should deploy SC", async () => {
    nftInstance = await Nft.new();
    console.log(nftInstance.address);
    expect(nftInstance.address).to.match(/^0x[a-fA-F0-9]{40}$/);
  });
});
```

5. mint NFT with SC

```
  it("Should mint NFT", async () => {
    const createNft = await nftInstance.createNft(
      "Hashgraph Hub",
      "HUB",
      "Check out our YouTube channel!",
      0,
      [Buffer.from("https://youtube.com/@hashgraphhub")],
      {
        from: accounts[0],
        value: web3.utils.toWei("20", "ether"),
        gas,
      }
    );
    nftAddress = await createNft.logs[0].args.tokenAddress;
    console.log("NFT address: ", nftAddress);
    expect(nftAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
  });
```

6. associate buyer with NFT

```
it("Should associate NFT with buyer", async function () {
    const buyer = accounts[1];

    const url =
      "https://testnet.mirrornode.hedera.com/api/v1/accounts/" + buyer;
    const res = await fetch(url);
    const json = await res.json();

    const hederaId = json.account;

    const tx = await new TokenAssociateTransaction()
      .setAccountId(hederaId)
      .setTokenIds([TokenId.fromSolidityAddress(nftAddress)])
      .freezeWith(client)
      .sign(PrivateKey.fromStringECDSA(process.env.BUYER_KEY));

    const txResponse = await tx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const code = receipt.status._code;
    expect(code).to.equal(22);
  });
```

7. buy NFT

```
it("Should buy NFT", async () => {
    const buyer = accounts[1];
    const tx = await nftInstance.mintAndTransfer(nftAddress, 0, {
      gas,
      value: web3.utils.toWei("1", "ether"),
      from: buyer,
    });

    const event = await tx.logs[0].args;
    expect(event.message).to.be.equal("complete");
  });
```
