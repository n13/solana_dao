import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Membership } from "../target/types/membership";
import { PublicKey } from "@solana/web3.js";

describe("membership", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Membership as Program<Membership>;
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const payer = provider.wallet.publicKey;

  // Test accounts
  let memberAccount: PublicKey;

  it("Is initialized!", async () => {
    // Add test logic here
    const member = anchor.web3.Keypair.generate();
    
    // Add member
    const tx = await program.methods
      .addMember(member.publicKey)
      .accounts({
        memberAccount: member.publicKey,
        payer: payer,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([member])
      .rpc();
    console.log("Add member transaction:", tx);

    // Fetch the member account to check if it was created
    memberAccount = (
      await program.account.member.all([{ memcmp: { offset: 8, bytes: member.publicKey.toBase58() } }])
    )[0].publicKey;

    const memberAccountData = await program.account.member.fetch(memberAccount);
    console.log("Member account data:", memberAccountData);
    expect(memberAccountData.isMember).to.equal(true);

    // Check membership
    const isMember = await program.methods
      .checkMembership()
      .accounts({
        memberAccount: memberAccount,
      })
      .view();
    console.log("Is member:", isMember);
    expect(isMember).to.be.true;

    // Remove member
    const removeTx = await program.methods
      .removeMember()
      .accounts({
        memberAccount: memberAccount,
      })
      .rpc();
    console.log("Remove member transaction:", removeTx);

    const removedMemberData = await program.account.member.fetch(memberAccount);
    console.log("Removed member account data:", removedMemberData);
    expect(removedMemberData.isMember).to.equal(false);

    // Check membership after removal
    const isNotMember = await program.methods
      .checkMembership()
      .accounts({
        memberAccount: memberAccount,
      })
      .view();
    console.log("Is not member:", isNotMember);
    expect(isNotMember).to.be.false;
  });
});