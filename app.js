const Web3 = require('web3') // Чтобы установить библиотеку в консоль: npm i web3
const fs = require('fs')
const readline = require("readline")

const rpcURL = 'https://arb1.arbitrum.io/rpc' // нода для сети
const id = '42161'
const web3 = new Web3(rpcURL)
const aeth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

let tokens = []
let accounts = []

async function getInfo(){
  const rl = readline.createInterface({ 
    input:fs.createReadStream('daoTokens.txt'), //Название файла с токенами
  })
  for await (let line of rl) {
    let tokenInfo = line.split(' ')
    tokens.push({'address': tokenInfo[0], 'amount': tokenInfo[1], 'decimals': tokenInfo[2]})
  }

  const acc = readline.createInterface({ 
    input:fs.createReadStream('accs.txt'), //Название файла с ключами
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
  const data = await (await fetch(`https://api.1inch.io/v4.0/${id}/quote?fromTokenAddress=${token.address}&toTokenAddress=${aeth}&amount=${token.amount * (10 ** token.decimals)}`)).json()
  const ethPrice = Math.round(data.toTokenAmount * 1.10)
  if(ethPrice){
    return ethPrice
  }
}

async function getSwapData(price, token, account){
  const data = await(await fetch(`https://api.1inch.io/v4.0/${id}/swap?fromTokenAddress=${aeth}&toTokenAddress=${token.address}&amount=${price}&fromAddress=${account.address}&slippage=1`)).json()
  if(data.tx){
    return data.tx
  }
}

async function startSwap(){
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
  await startSwap()
}

main()
