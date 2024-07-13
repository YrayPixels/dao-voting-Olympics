use anchor_lang::prelude::*;

declare_id!("3XAjSRa2BLWQP5Vmk5h7MbUHZz5u9Vf5y4aYFF4hBQ23");

#[program]
pub mod dao_voting {
    use super::*;
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        proposal.title = title;
        proposal.description = description;
        proposal.votes_yes = 0;
        proposal.votes_no = 0;

        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, vote_yes: bool) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let voter = &mut ctx.accounts.voter;
        let user = &ctx.accounts.user;

        if voter.has_voted == true {
            return Err(ErrorCode::HasVoted.into());
        };

        if vote_yes {
            proposal.votes_yes += 1;
        } else {
            proposal.votes_no += 1;
        }

        voter.has_voted = true;
        voter.reward_points += 10;
        voter.owner = user.to_account_info().key();

        Ok(())
    }

    pub fn get_results(ctx: Context<GetResults>) -> Result<Results> {
        let proposal = &ctx.accounts.proposal;
        Ok(Results {
            votes_yes: proposal.votes_yes,
            votes_no: proposal.votes_no,
        })
    }
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(init, payer = user,  space = 8 + 40 + 8 + 8, seeds = ["proposals".as_ref(),user.key().as_ref()], bump)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    #[account(init_if_needed, payer = user, space = 8 + 1 + 8, seeds=["voter".as_ref(), user.key().as_ref()], bump)]
    pub voter: Account<'info, Voter>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetResults<'info> {
    pub proposal: Account<'info, Proposal>,
}

#[account]
pub struct Proposal {
    pub title: String,
    pub description: String,
    pub votes_yes: u64,
    pub votes_no: u64,
}

#[account]
pub struct Voter {
    pub has_voted: bool,
    pub reward_points: u64,
    pub owner: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct Results {
    pub votes_yes: u64,
    pub votes_no: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Has Voted Already!")]
    HasVoted,
}
