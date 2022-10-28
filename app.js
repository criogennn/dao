const Web3 = require('web3')
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
  const ethPrice = Math.round(data.toTokenAmount * 1.05)
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

async function stakeDao(){

}

async function multiCall(accounts, tx){
  for(let account of accounts){
    let signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey)
    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .once('transactionHash', (hash) => {
      console.log(hash)
    })
  }
}

async function stakeGMX(){
  let tx = {
    to: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
    value: web3.utils.toWei("0", "ether"),
    gas: 463000,
    gasPrice: web3.utils.toWei("0.1", 'gwei'),
    data: '0x095ea7b3000000000000000000000000908c4d94d34924765f1edc22a1dd098397c59dd4ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
  }

  await multiCall(accounts, tx)
  await sleep(2)

  tx.to = '0xA906F338CB21815cBc4Bc87ace9e68c87eF8d8F1'
  tx.gas = 1026000
  tx.data = '0xf3daeacc00000000000000000000000000000000000000000000000000038d7ea4c68000'

  await multiCall(accounts, tx)
  
}

async function stakeMagic(){
  let tx = {
    to: '0x539bdE0d7Dbd336b79148AA742883198BBF60342',
    value: web3.utils.toWei("0", "ether"),
    gas: 235000,
    gasPrice: web3.utils.toWei("0.1", 'gwei'),
    data: '0x095ea7b3000000000000000000000000a0a89db1c899c49f98e6326b764bafcf167fc2ceffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
  }

  await multiCall(accounts, tx)
  await sleep(2)

  tx.to = '0xA0A89db1C899c49F98E6326b764BAFcf167fC2CE'
  tx.gas = 1300000
  tx.data = '0x654cfdff000000000000000000000000000000000000000000000000016345785d8a00000000000000000000000000000000000000000000000000000000000000000001'

  await multiCall(accounts, tx)
}

async function stakeSPX(){
  let tx = {
    to: '0x5575552988A3A80504bBaeB1311674fCFd40aD4B',
    value: web3.utils.toWei("0", "ether"),
    gas: 357000,
    gasPrice: web3.utils.toWei("0.1", 'gwei'),
    data: '0x095ea7b30000000000000000000000002e2071180682ce6c247b1ef93d382d509f5f6a170000000000000000000000000000000000000000204fce5e3e25026110000000'
  }

  await multiCall(accounts, tx)
  await sleep(2)

  tx.to = '0x2e2071180682Ce6C247B1eF93d382D509F5F6A17'
  tx.gas = 889000
  tx.data = '0xebc65dbd000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000006ad952000000000000000000000000000000000000000000000000000000000000000000'

  await multiCall(accounts, tx)
}

async function stakeUMAMI(){
  let tx = {
    to: '0x1622bF67e6e5747b81866fE0b85178a93C7F86e3',
    value: web3.utils.toWei("0", "ether"),
    gas: 235000,
    gasPrice: web3.utils.toWei("0.1", 'gwei'),
    data: '0x095ea7b30000000000000000000000002adabd6e8ce3e82f52d9998a7f64a90d294a92a400000000000000000000000000000000000000000000000000000000000f4240'
  }

  await multiCall(accounts, tx)
  await sleep(2)

  tx.to = '0x2AdAbD6E8Ce3e82f52d9998a7f64a90d294A92A4'
  tx.gas = 309000
  tx.data = '0xa694fc3a00000000000000000000000000000000000000000000000000000000000f4240'

  await multiCall(accounts, tx)
}

async function main(){
  await getInfo()
  // await startSwap()
  // await stakeGMX()
  // await stakeMagic()
  // await stakeSPX()
  await stakeUMAMI()
}

main()