import Web3 from './web3.js';
import Platform from '../../abis/DSPF.json';


//導入合約
//params(合約abi,合約地址)
const platform =new Web3.eth.Contract(
    Platform.abi,
    '0xf026CB89a4e7e39A387C2bE8cD41b0A2b9919526'
);

export default platform;