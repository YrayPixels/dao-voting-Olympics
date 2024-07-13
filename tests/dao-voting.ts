import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import type { DaoVoting } from "../target/types/dao_voting";

describe("Test", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());
  const pg = new web3.PublicKey('3XAjSRa2BLWQP5Vmk5h7MbUHZz5u9Vf5y4aYFF4hBQ23');

  const program = anchor.workspace.DaoVoting as anchor.Program<DaoVoting>;
  const connection = new web3.Connection("https://api.devnet.solana.com");

  it("initialize", async () => {
    let title = "New Program Item";
    let description = "This is a new program item";

    const [propsalPda, proposalBump] = await web3.PublicKey.findProgramAddress(
      [
        Buffer.from("proposals"),
        pg.toBuffer(),
      ],
      program.programId
    );

    const txHash = await program.methods
      .createProposal(title, description)
      .accounts({
        proposal: propsalPda,
        user: pg,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([])
      .rpc();

    let proposal = program.account.proposal.fetch(propsalPda);

  });

  it("Votes", async () => {
    const [propsalPda, proposalBump] = await web3.PublicKey.findProgramAddress(
      [
        Buffer.from("proposals"),
        pg.toBuffer(),
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
