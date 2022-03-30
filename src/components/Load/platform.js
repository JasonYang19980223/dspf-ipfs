import Web3 from './web3.js';
import Platform from '../../abis/DSPF.json';


//導入合約
//params(合約abi,合約地址)
const platform =new Web3.eth.Contract(
    Platform.abi,
    '0x5fE4c76C9426BdC22aaaA200C7fc700645ef5fc8'
);

export default platform;