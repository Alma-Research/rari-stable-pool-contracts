/**
 * COPYRIGHT © 2020 RARI CAPITAL, INC. ALL RIGHTS RESERVED.
 * Anyone is free to integrate the public (i.e., non-administrative) application programming interfaces (APIs) of the official Ethereum smart contract instances deployed by Rari Capital, Inc. in any application (commercial or noncommercial and under any license), provided that the application does not abuse the APIs or act against the interests of Rari Capital, Inc.
 * Anyone is free to study, review, and analyze the source code contained in this package.
 * Reuse (including deployment of smart contracts other than private testing on a private network), modification, redistribution, or sublicensing of any source code contained in this package is not permitted without the explicit permission of David Lucid of Rari Capital, Inc.
 * No one is permitted to use the software for any purpose other than those allowed by this license.
 * This license is liable to change at any time at the sole discretion of David Lucid of Rari Capital, Inc.
 */

pragma solidity 0.5.17;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";

import "../../external/compound/CErc20.sol";

/**
 * @title FusePoolController
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 * @dev This library handles deposits to and withdrawals from Fuse money markets.
 */
library FusePoolController {
    using SafeERC20 for IERC20;

    /**
     * @dev Returns the fund's balance of the specified currency in the specified Fuse pool.
     * @param cErc20Contract The CErc20 contract address of the token.
     */
    function getBalance(address cErc20Contract) external returns (uint256) {
        return CErc20(cErc20Contract).balanceOfUnderlying(address(this));
    }

    /**
     * @dev Approves tokens to Fuse without spending gas on every deposit.
     * @param cErc20Contract The CErc20 contract address of the token.
     * @param erc20Contract The ERC20 contract address of the token.
     * @param amount Amount of the specified token to approve to Fuse.
     */
    function approve(address cErc20Contract, address erc20Contract, uint256 amount) external {
        IERC20 token = IERC20(erc20Contract);
        uint256 allowance = token.allowance(address(this), cErc20Contract);
        if (allowance == amount) return;
        if (amount > 0 && allowance > 0) token.safeApprove(cErc20Contract, 0);
        token.safeApprove(cErc20Contract, amount);
        return;
    }

    /**
     * @dev Deposits funds to the Fuse pool. Assumes that you have already approved >= the amount to Fuse.
     * @param cErc20Contract The CErc20 contract address of the token.
     * @param amount The amount of tokens to be deposited.
     */
    function deposit(address cErc20Contract, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0.");
        CErc20 cErc20 = CErc20(cErc20Contract);
        uint256 mintResult = cErc20.mint(amount);
        require(mintResult == 0, "Error calling mint on Fuse cToken: error code not equal to 0.");
    }

    /**
     * @dev Withdraws funds from the Fuse pool.
     * @param cErc20Contract The CErc20 contract address of the token.
     * @param amount The amount of tokens to be withdrawn.
     */
    function withdraw(address cErc20Contract, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0.");
        CErc20 cErc20 = CErc20(cErc20Contract);
        uint256 redeemResult = cErc20.redeemUnderlying(amount);
        require(redeemResult == 0, "Error calling redeemUnderlying on Fuse cToken: error code not equal to 0.");
    }

    /**
     * @dev Withdraws all funds from the Fuse pool.
     * @param cErc20Contract The CErc20 contract address of the token.
     * @return Boolean indicating success.
     */
    function withdrawAll(address cErc20Contract) external returns (bool) {
        CErc20 cErc20 = CErc20(cErc20Contract);
        uint256 balance = cErc20.balanceOf(address(this));
        if (balance <= 0) return false;
        uint256 redeemResult = cErc20.redeem(balance);
        require(redeemResult == 0, "Error calling redeem on Fuse cToken: error code not equal to 0.");
        return true;
    }

    /**
     * @dev Transfers all funds from the Fuse pool.
     * @param cErc20Contract The CErc20 contract address of the token.
     * @return Boolean indicating success.
     */
    function transferAll(address cErc20Contract, address newContract) external returns (bool) {
        CErc20 cErc20 = CErc20(cErc20Contract);
        uint256 balance = cErc20.balanceOf(address(this));
        if (balance <= 0) return false;
        require(cErc20.transfer(newContract, balance), "Error calling transfer on Fuse cToken.");
        return true;
    }
}
