import React, { useState } from 'react'
// Redux Hook
import {useMappedState,useDispatch} from 'redux-react-hook';

import Transaction from '../../UIComponents/Transaction'
import SharesContract from '../../SmartContracts/ERC20Shares'
import FactoryContract from '../../SmartContracts/ERC20Factory'

// Semantic UI for React
import Button from 'semantic-ui-react/dist/commonjs/elements/Button'

export default () => {

    const dispatch = useDispatch();
    const {manageShares, manageSeries, sharesStep} = useMappedState(({managementState}) => managementState);
    const {network, currentAccount} = useMappedState(({accountState}) => accountState);

    const [transaction, setTransaction] = useState(null);

    const clickDeployHandler = async (e) => {
        let requestInfo = {from: currentAccount, gas:200000};
        try {
            const gasFees = await axios.get(`https://ethgasstation.info/api/ethgasAPI.json`);
            requestInfo.gasPrice = web3.utils.toWei((gasFees.data.fast*0.1).toString(), 'gwei');
        } catch (err){
            console.log('Could not fetch gas fee for transaction.');
        }
        console.log(network, requestInfo)
        try {
            const hash = await FactoryContract.getContract(network).methods.createERC20(
                manageShares.shares,
                manageShares.name,
                manageShares.symbol,
                manageSeries.contract
            ).send(requestInfo, (error, hash) => {
                setTransaction(hash);
            });
        } catch (err) {
            console.log(err);
        }
    }

    const clickBackHandler = () => {
        dispatch({type:'Set Shares Step', step: 0})
    }

    const nextStepHandler = async (logs) => {
        console.log(logs);
        dispatch({type:'Set Shares Contract', contract: logs.contractAddress})
        dispatch({type:'Set Shares Step', step: 2})
    }

    function Form() {
        if (transaction) {
            return <Transaction hash={transaction} title="Deploying Tokens Contract" callback={nextStepHandler} ></Transaction>;
        }
        return <p>
            <Button className="primary" onClick={clickBackHandler}>Back</Button>
            <Button className="primary" onClick={clickDeployHandler}>Deploy</Button>
        </p>;
    }

    return (
        <div>
            <h4 style={{paddingTop: '30px'}}>A new token named {manageShares.name}, with the symbol {manageShares.symbol} and a total supply of {manageShares.shares} will be deployed.</h4>
            <p>Next, we need to deploy the ERC20 contract managing the membership tokens.</p>
            <Form></Form>
        </div>
    )

}