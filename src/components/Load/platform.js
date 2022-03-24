import Web3 from './web3.js';
import Platform from '../../abis/DSPF.json';


//導入合約
//params(合約abi,合約地址)
const platform =new Web3.eth.Contract(
    Platform.abi,
    '0xB6D2D0FF8C604a13A6d96d7f0A86820de4226E4B'
);

export default platform;