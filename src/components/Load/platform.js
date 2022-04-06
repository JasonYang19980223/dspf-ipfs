import Web3 from './web3.js';
import Platform from '../../abis/DSPF.json';


//導入合約
//params(合約abi,合約地址)
const platform =new Web3.eth.Contract(
    Platform.abi,
    '0x6dcA0d3EaD8F2aF0C73517808b3f0681085221b8'
);

export default platform;