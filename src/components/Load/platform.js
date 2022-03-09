import Web3 from './web3.js';
import Platform from '../../abis/DSPF.json';

const platform =new Web3.eth.Contract(
    Platform.abi,
    '0x231906B9FA6D7D9D57A00bF1AF6BA76274BbD4b0'
);

export default platform;