use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program_error::ProgramError,
    pubkey::Pubkey,
};

declare_id!("AWzkh5qFfLxhMVG2jvX4Yz4xvdGyU69Uru6pQCq9FySh");

#[program]
pub mod membership_contract {
    use super::*;

    // Adds a new member to the DAO
    pub fn add_member(ctx: Context<AddMember>, member: Pubkey) -> Result<()> {
        let member_account = &mut ctx.accounts.member_account;
        member_account.member = member;
        member_account.is_member = true;
        Ok(())
    }

    // Removes a member from the DAO
    pub fn remove_member(ctx: Context<RemoveMember>) -> Result<()> {
        let member_account = &mut ctx.accounts.member_account;
        member_account.is_member = false;
        Ok(())
    }

    // Checks if the given address is a member
    pub fn check_membership(ctx: Context<CheckMembership>) -> Result<bool> {
        Ok(ctx.accounts.member_account.is_member)
    }
}

#[derive(Accounts)]
pub struct AddMember<'info> {
    #[account(init, payer = payer, space = 8 + 32 + 1)]
    pub member_account: Account<'info, Member>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RemoveMember<'info> {
    #[account(mut)]
    pub member_account: Account<'info, Member>,
}

#[derive(Accounts)]
pub struct CheckMembership<'info> {
    pub member_account: Account<'info, Member>,
}

#[account]
pub struct Member {
    pub member: Pubkey,
    pub is_member: bool,
}