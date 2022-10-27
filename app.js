const Web3 = require('web3')
const fs = require('fs')
const readline = require("readline")

const rpcURL = 'https://arb1.arbitrum.io/rpc' // Your RPC URL goes here
const web3 = new Web3(rpcURL)
const aeth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

let tokens = []
let accounts = []

const mainApi = 'https://api.1inch.io/v4.0/42161/swap?fromTokenAddress=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&toTokenAddress=0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9&amount=10000000000000000&fromAddress=0x&slippage=1'

async function getInfo(){
  const rl = readline.createInterface({ 
    input:fs.createReadStream('daoTokens.txt'), 
  })
  for await (let line of rl) {
    let tokenInfo = line.split(' ')
    tokens.push({'address': tokenInfo[0], 'amount': tokenInfo[1], 'decimals': tokenInfo[2]})
  }

  const acc = readline.createInterface({ 
    input:fs.createReadStream('accs.txt'), 
  })
  for await (let line of acc) {
    accounts.push(web3.eth.accounts.privateKeyToAccount(line))
  }

  return tokens, accounts
}

async function sleep(seconds){
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

async function getPrice(token){
  const data = await (await fetch(`https://api.1inch.io/v4.0/42161/quote?fromTokenAddress=${token.address}&toTokenAddress=${aeth}&amount=${token.amount * (10 ** token.decimals)}`)).json()
  const ethPrice = Math.round(data.toTokenAmount * 1.05)
  if(ethPrice){
    return ethPrice
  }
}

async function getSwapData(price, token, account){
  const data = await(await fetch(`https://api.1inch.io/v4.0/42161/swap?fromTokenAddress=${aeth}&toTokenAddress=${token.address}&amount=${price}&fromAddress=${account.address}&slippage=1`)).json()
  if(data.tx){
    return data.tx
  }
}

async function getCallData(){
  for (let account of accounts){
    for(let token of tokens){
      const ethAmount = await getPrice(token)
      const tx = await getSwapData(ethAmount, token, account)
      if(tx){
        const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey)
        web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        .once('transactionHash', (hash) => {
          console.log(hash)
        })
        await sleep(2)
      }
    }
  }
}

async function main(){
  await getInfo()
  await getCallData()
}

main()







