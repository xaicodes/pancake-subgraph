/* eslint-disable prefer-const */
import { log } from "@graphprotocol/graph-ts/index";
import { BIG_INT_ZERO } from "./utils";
import {
  AddLiquidity,
  RemoveLiquidity,
  RemoveLiquidityOne,
  TokenExchange,
} from "../generated/templates/StableSwapPairV2/StableSwapPairV2";
// import {
//   AddLiquidity as AddLiquidity3,
//   RemoveLiquidity as RemoveLiquidity3,
//   RemoveLiquidityOne as RemoveLiquidityOne3,
//   TokenExchange as TokenExchange3,
// } from "../generated/templates/StableSwap3PairV2/StableSwap3PairV2";
import { Pair } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";
import { sync } from "./services/sync";
import { swap, SwapParams } from "./services/swap";
import { burn } from "./services/burn";
import { mint } from "./services/mint";

export function handleTokenExchange(event: TokenExchange): void {
  log.debug("swap for v2 pool: {} at {}", [event.address.toHexString(), event.transaction.hash.toHexString()]);
  sync(event.address);

  let soldId = event.params.sold_id.toI32();
  let boughtId = event.params.bought_id.toI32();

  let amount0In: BigInt;
  let amount1In: BigInt;
  let amount0Out: BigInt;
  let amount1Out: BigInt;
  if (soldId == 0) {
    amount0In = event.params.tokens_sold;
    amount1In = BIG_INT_ZERO;
  } else {
    amount0In = BIG_INT_ZERO;
    amount1In = event.params.tokens_sold;
  }

  if (boughtId == 0) {
    amount0Out = event.params.tokens_sold;
    amount1Out = BIG_INT_ZERO;
  } else {
    amount0Out = BIG_INT_ZERO;
    amount1Out = event.params.tokens_sold;
  }

  let params = {
    to: event.params.buyer,
    sender: event.transaction.from,
    amount0In,
    amount1In,
    amount0Out,
    amount1Out,
  } as SwapParams;
  swap(event, params);
}

export function handleRemoveLiquidity(event: RemoveLiquidity): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return;
  }
  log.info("Removed liquidity for pair: {} at {}", [event.address.toHexString(), event.transaction.hash.toHexString()]);
  sync(event.address);
  let tokenAmounts: Array<BigInt> = event.params.token_amounts;
  burn(event, tokenAmounts[0], tokenAmounts[1], null);
}

export function handleRemoveLiquidityOne(event: RemoveLiquidityOne): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return;
  }
  // let tokenAmounts = new Array<BigInt>();
  // for (let i = 0; i < pair.coins.length; i++) {
  //   tokenAmounts.push(i == event.params.coin_index.toI32() ? event.params.coin_amount : BIG_INT_ZERO);
  // }
  // log.info("Removed liquidity for pool: {} at {}", [event.address.toHexString(), event.transaction.hash.toHexString()]);
  // sync(event.address);
  // burn(event, tokenAmounts[0], tokenAmounts[1]);
}

export function handleAddLiquidity(event: AddLiquidity): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return;
  }
  log.info("Added liquidity for pool: {} at {}", [event.address.toHexString(), event.transaction.hash.toHexString()]);
  sync(event.address);
  let tokenAmounts: Array<BigInt> = event.params.token_amounts;
  mint(event, tokenAmounts[0], tokenAmounts[1], event.params.provider);
}
