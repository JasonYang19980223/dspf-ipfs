import Web3 from './web3.js';
import Platform from '../../abis/DSPF.json';


//導入合約
//params(合約abi,合約地址)
const platform =new Web3.eth.Contract(
    Platform.abi,
    '0x6C78047c6C7166d7296D180eA53075E84792281b'
);

export default platform;