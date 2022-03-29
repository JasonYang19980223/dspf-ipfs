import Web3 from './web3.js';
import Platform from '../../abis/DSPF.json';


//導入合約
//params(合約abi,合約地址)
const platform =new Web3.eth.Contract(
    Platform.abi,
    '0x26B762C53FADdBA657d4d6E2eAa12B4B4aA033e3'
);

export default platform;