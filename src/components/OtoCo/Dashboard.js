import React, { useState } from 'react'

// Redux Hook
import {useMappedState,useDispatch} from 'redux-react-hook';
import { useHistory } from "react-router-dom";

// Semantic UI for React
import Button from 'semantic-ui-react/dist/commonjs/elements/Button'
import Container from 'semantic-ui-react/dist/commonjs/elements/Container'

// Smart Contract
import Listing from './Dashboard/Listing';
import ContactForm from './Dashboard/ContactForm';
import MainContract from './SmartContracts/MainContract';
import SeriesContract from './SmartContracts/SeriesContract';
import Web3Integrate from '../../web3-integrate';

export default () => {

    const dispatch = useDispatch();
    const history = useHistory();

    const {network, currentAccount} = useMappedState(({accountState}) => accountState);
    const {jurisdictionsList, showContact} = useMappedState(({dashboardState}) => dashboardState);
    const [loading, setLoading] = useState(true);

    const clickBackHandler = async (e) => {
        dispatch({ type: "Resume Welcome Board" });
        history.push('/');
    }

    React.useEffect(() => {
        // When enter dashboard page
        setTimeout( async () => {
            if (network === ''){
                await Web3Integrate.callModal();
                let accounts =  await web3.eth.getAccounts();
                // console.log(accounts)
                dispatch({ type: "Set Current Account", currentAccount: accounts[0] });
                dispatch({ type: "Set Current Network", network: await web3.eth.net.getNetworkType() })
            }
            if (history.location.pathname === '/dashboard' && network !== '') {
                let ownSeries = [];
                for (let j of jurisdictionsList){
                    
                    let jurisdictionName = '';
                    if (j == 'us_de') jurisdictionName = 'Delaware';
                    if (j == 'us_wy') jurisdictionName = 'Wyoming';

                    let series = await MainContract.getContract(network, j).methods.mySeries().call({from: currentAccount})// , function(error, series){
                    // console.log(series);
                    for (let s of series) {
                        let newSeries = {
                            jurisdiction: jurisdictionName,
                            contract: s,
                            created: '',
                            name: '',
                            owner: '',
                        }
                        // window.testContract = SeriesContract.getContract(s);
                        const events = await SeriesContract.getContract(s).getPastEvents('allEvents',{fromBlock:0,toBlock: 'latest'})
                        const timestamp = await web3.eth.getBlock(events[0].blockNumber);
                        newSeries.created = new Date(timestamp.timestamp * 1000);
                        newSeries.name = await SeriesContract.getContract(s).methods.getName().call({from: currentAccount})
                        newSeries.owner = await SeriesContract.getContract(s).methods.owner().call({from: currentAccount})
                        ownSeries.push(newSeries)
                    }
                }
                dispatch({ type: "Set Own Series Contracts", ownSeriesContracts:ownSeries });
                dispatch({ type: "Set Dashboard Contact Form", show:true });
                setLoading(false)
            } else {
                dispatch({ type: "Clear Manage Series" });
                dispatch({ type: "Set Manage Option", option: 0 });
            }
        }, 0)
    },[network])

    return (
        <Container className="pnl-body">
            <div style={{textAlign: "left", marginBottom: "100px"}}>
                <h1 className="title">Dashboard</h1>
                <p className="subtitle">Manage your on-chain companies</p>
                {!loading && !showContact && <Listing></Listing>}
                {showContact && <ContactForm></ContactForm>}
                <div className="ui active centered inline text loader" style={{ display: (loading) ? "" : "none", zIndex : 0 }}>Loading Companies</div>
                <p></p>
                {!loading && !showContact && <Button id="btn-check-nmae" className="ui right floated button primary" type="submit" onClick={clickBackHandler}>Set up a new company</Button>}
            </div>
        </Container>
    )
}
