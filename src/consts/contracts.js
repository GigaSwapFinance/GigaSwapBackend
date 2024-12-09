import { dealsControllerAbi, directAbi, erc20Abi, erc20SaleAbi, erc20Locker, erc721Abi } from '../assets/abis/index.js'
import CONTRACT_ADDRESSES from '../assets/contract-addresses/index.js'

export const CONTRACTS = {
  erc20: {
    abi: erc20Abi,
  },

  erc721: {
    abi: erc721Abi,
  },

  direct: {
    abi: directAbi,
  },

  dealsController: {
    abi: dealsControllerAbi,
  },

  erc20Sale: {
    abi: erc20SaleAbi,
  },

  erc20Locker: {
    abi: erc20Locker,
  },
}

export function getContractsByChainId(chainId) {
  return {
    erc20: {
      abi: erc20Abi,
    },

    direct: {
      abi: directAbi,
      address: CONTRACT_ADDRESSES[chainId].DealsFactory,
    },

    dealsController: {
      abi: dealsControllerAbi,
      address: CONTRACT_ADDRESSES[chainId].GigaSwap,
    },

    erc20Sale: {
      abi: erc20SaleAbi,
      address: CONTRACT_ADDRESSES[chainId].Erc20Sale,
    },

    erc20Locker: {
      abi: erc20Locker,
      address: CONTRACT_ADDRESSES[chainId].Erc20Locker,
    },
  }
}