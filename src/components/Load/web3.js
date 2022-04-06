import Web3 from 'web3';


let web3;

async function loadWeb3(){
    if (window.ethereum) {
      web3 = new Web3(window.ethereum)
      await window.ethereum.request({ method: 'eth_requestAccounts' })
    }
    else if (window.web3) {
      web3 = new Web3(window.ethereum)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
    window.ethereum.on('accountsChanged', function (accounts) {
      window.location.replace('/')
    });
}
(async () => {
  await loadWeb3()
})()


export default web3;