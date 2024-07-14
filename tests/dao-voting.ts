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
    let description = "This ";


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
    const tx = await connection.requestAirdrop(voter.publicKey, 1e9)

    const [voterPDA, voterBump] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("voter"), voter.publicKey.toBuffer()],
      program.programId
    );
    try {
      // Cast a vote
      const txHash = await program.methods
        .vote(true)
        .accounts({
          proposal: propsalPda,
          voter: voterPDA,
          user: voter.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([voter]) // Ensure the correct signer is provided
        .rpc();
      console.log("Transaction hash:", txHash);
    } catch (error) {
      console.error("Error casting vote:", error);
    }
  });

});
