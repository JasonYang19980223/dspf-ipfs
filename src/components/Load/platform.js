import Web3 from './web3.js';
import Platform from '../../abis/DSPF.json';

const platform =new Web3.eth.Contract(
    Platform.abi,
    '0x4a52bD4df5576B1ff59Ed0730423077117D09DB2'
);

export default platform;