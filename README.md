# DAO Voting Program

This repository contains a Solana-based DAO Voting program written in Rust using the Anchor framework. The program allows users to create proposals and vote on them. Users are rewarded for their votes with reward points.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Program Architecture](#program-architecture)
- [Tests](#tests)
- [License](#license)

## Features

- **Create Proposal:** Users can create new proposals with a unique ID, title, and description.
- **Vote on Proposals:** Users can vote on proposals and earn reward points for their participation.
- **View Results:** Users can view the results of the voting process for each proposal.

## Installation

To get started, clone this repository and install the necessary dependencies.

```bash
git clone https://github.com/yourusername/dao-voting.git
cd dao-voting
```
# Ensure you have the following installed:

Rust
Solana CLI
Anchor
Usage

# Building the Program
To build the program, run:

```bash
anchor build
```
# Deploying the Program
To deploy the program to the Solana devnet, run:
```bash
anchor deploy
```
# Running Tests
 To run the provided test cases, use:
```bash
anchor test
``` 

# Program Architecture

Modules and Functions
# create_proposal
Creates a new proposal with a unique ID, title, and description.

```rust
pub fn create_proposal(
    ctx: Context<CreateProposal>,
    unique_id: u64,
    title: String,
    description: String,
) -> Result<()>
```
# vote
Allows a user to vote on a proposal. Users can vote yes or no and are rewarded with points for voting.

```rust
Copy code
pub fn vote(ctx: Context<Vote>, vote_yes: bool) -> Result<()>
```
# get_results
Fetches the results of the voting process for a proposal.

```rust
pub fn get_results(ctx: Context<GetResults>) -> Result<Results>
```
# Accounts

# Proposal
Stores the details of a proposal.

```rust

#[account]
pub struct Proposal {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub votes_yes: u64,
    pub votes_no: u64,
}
```
# Voter
Stores the details of a voter's participation and rewards.

```rust

#[account]
pub struct Voter {
    pub has_voted: bool,
    pub reward_points: u64,
    pub owner: Pubkey,
}
```
# Error Codes
```rust

#[error_code]
pub enum ErrorCode {
    #[msg("Has Voted Already!")]
    HasVoted,
}
```
# Tests
The tests for the program are written in JavaScript using the @coral-xyz/anchor library.

# Example Test Case
```javascript

import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import type { DaoVoting } from "../target/types/dao_voting";
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe("Test", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  // Get the path to the JSON file
  const filePath = path.join(os.homedir(), '.config', 'solana', 'id.json');

  const data = fs.readFileSync(filePath, 'utf-8');
  let key = JSON.parse(data);

  const pg = web3.Keypair.fromSecretKey(Uint8Array.from(key));

  const program = anchor.workspace.DaoVoting as anchor.Program<DaoVoting>;
  const connection = new web3.Connection("https://api.devnet.solana.com");

  let uniqueId = Math.floor(Date.now() / 1000);
  const uniqueIdBuffer = Buffer.alloc(8);
  uniqueIdBuffer.writeUInt32LE(uniqueId, 0);

  it("initialize", async () => {
    let title = "New Program Item";
    let description = "This is a test proposal.";

    const [propsalPda, proposalBump] = await web3.PublicKey.findProgramAddress(
      [
        Buffer.from("proposals"),
        pg.publicKey.toBuffer(),
        uniqueIdBuffer,
      ],
      program.programId
    );

    const txHash = await program.methods
      .createProposal(new anchor.BN(uniqueId), title, description)
      .accounts({
        proposal: propsalPda,
        user: pg.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([])
      .rpc();

    console.log(txHash);
  });

  it("Votes", async () => {
    const [propsalPda, proposalBump] = await web3.PublicKey.findProgramAddress(
      [
        Buffer.from("proposals"),
        pg.publicKey.toBuffer(),
        uniqueIdBuffer,
      ],
      program.programId
    );

    const voter = new web3.Keypair();
    const tx = await connection.requestAirdrop(voter.publicKey, 1e9);

    const [voterPDA, voterBump] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("voter"), voter.publicKey.toBuffer()],
      program.programId
    );

    try {
      const txHash = await program.methods
        .vote(true)
        .accounts({
          proposal: propsalPda,
          voter: voterPDA,
          user: voter.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([voter])
        .rpc();
      console.log("Transaction hash:", txHash);
    } catch (error) {
      console.error("Error casting vote:", error);
    }
  });
});
```


