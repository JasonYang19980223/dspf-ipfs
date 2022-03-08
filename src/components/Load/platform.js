import Web3 from './web3.js';
import Platform from '../../abis/DSPF.json';

const platform =new Web3.eth.Contract(
    Platform.abi,
    '0x84bdD26aC43598A9C29d349e747F46C352fd19aa'
);

export default platform;