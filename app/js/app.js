const Web3 = require('web3');
const $ = require('jquery');
const assert = require('assert');
const { BN, toWei, fromAscii, fromWei } = Web3.utils;

require('file-loader?name=../index.html!../index.html');

const truffleContract = require('truffle-contract');
const bountydAppv1Json = require('../../build/contracts/bountydAppv1.json');
var port = process.env.PORT || 8545;

async function loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
}

loadWeb3();

const BountydAppv1 = truffleContract(bountydAppv1Json);
BountydAppv1.setProvider(web3.currentProvider);
let bountydAppv1;

async function updateData(bountydAppv1) {
    let userType = ["User", "Owner", "Resolver"];
    let months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let currentUserType = userType[0];
    let disputeQueue = '<table class="table"><thead class="thead-dark"><tr><th scope="col">Dispute Index</th><th scope="col">Bounty ID</th><th scope="col">Solution ID</th><th scope="col">Signed</th><th scope="col">Voted</th></tr></thead><tbody>';

    let totalResolvers = await bountydAppv1.totalNoOfResolvers();
    console.log('Total Resolvers: '+totalResolvers);
    let noOfResolvers = await bountydAppv1.noOfResolvers();
    console.log('No. Of Valid Resolvers: '+noOfResolvers);

    if(currentUser == await bountydAppv1.getOwner()){
        currentUserType = userType[1];
    }
    else{
        for(let i=0;i<totalResolvers;i++){
            if(currentUser == await bountydAppv1.resolvers(i)){
                currentUserType = userType[2];

                // Dispute List
                let disputeQueueLength = await bountydAppv1.disputeQueueLength();
                for(let j=0;j < disputeQueueLength; j++){
                    let solutionID = await bountydAppv1.disputeQueue(j);
                    let solution = await bountydAppv1.solutions(solutionID)
                    let resolverVote = await bountydAppv1.disputeQueueVotes(j, i);
                    if (resolverVote == 0){
                        resolverVote = "Against"
                    }
                    else{
                        resolverVote = "In Favor"
                    }
                    let resolverSigned = await bountydAppv1.disputeQueueSigner(j, i);
                    if (resolverSigned == 0){
                        resolverSigned = "Completed"
                    }
                    else{
                        resolverSigned = "To Do"
                    }
                    disputeQueue += '<tr><th scope="row">'+j+'</td><td>'+solution.bountyID+'</td><td>'+solutionID+'</td><td>'+resolverSigned+'</td><td>'+resolverVote+'</td></tr>';
                }
            }
        }
    }

    // Bounty List
    let bountyQueueLength = await bountydAppv1.addressToBountyListLength({from: currentUser});
    let bountyQueue = '<table class="table"><thead class="thead-dark"><tr><th scope="col">Bounty ID</th><th scope="col">Description</th><th scope="col">Deadline</th><th scope="col">Solution List</th><th scope="col">Accepted Solution</th><th scope="col">Amount</th><th scope="col">Status</th></tr></thead><tbody>';
    for(let i=0;i < bountyQueueLength; i++){
        let bountyID = await bountydAppv1.addressToBountyList(currentUser, i);
        let bounties = await bountydAppv1.bounties(bountyID);

        // Getting the Deadline
        var convdataTime = '';
        if(bounties.deadline == 0){
            convdataTime = 'No Deadline';
        }
        else{
            var date = new Date(bounties.deadline*1000);
            var year = date.getFullYear();
            var month = months_arr[date.getMonth()];
            var day = date.getDate();
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var seconds = "0" + date.getSeconds();
            convdataTime = month+'-'+day+'-'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);    
        }

        // Getting the added Solutions to Bounty
        let bountyToSolutionQueueLength = await bountydAppv1.bountyToSolutionListLength(bountyID);
        var solutionList = 'None Yet';
        if (bountyToSolutionQueueLength > 0) {
            solutionList = '';
            for(let i = 0; i < bountyToSolutionQueueLength; i++) {
                solutionList += await bountydAppv1.bountyToSolutionList(bountyID, i) + '<br>';
            }
        }

        // Getting the Accepted Solution ID
        var acceptedSolutionID = bounties.acceptedSolutionID;
        if (acceptedSolutionID == 0) {
            acceptedSolutionID = 'Not Yet'
        }

        // Getting the Bounty Status
        var bountyStatus = 'Open';
        if(bounties.status == 1) {
            bountyStatus = 'Disputed';
        }
        else if(bounties.status == 2) {
            bountyStatus = ' Closed';
        }

        // Appending all the details into the Queue
        bountyQueue += '<tr><th scope="row">'+bountyID+
        '</td><td>'+bounties.description+
        '</td><td>'+convdataTime+
        '</td><td>'+solutionList+
        '</td><td>'+acceptedSolutionID+
        '</td><td>'+fromWei(bounties.amount)+
        ' ETH</td><td>'+bountyStatus+'</td></tr>';

    }
    bountyQueue += '</tbody></table>';

    // Solution List
    let solutionQueueLength = await bountydAppv1.addressToSolutionListLength({from: currentUser});
    let solutionQueue = '<table class="table"><thead class="thead-dark"><tr><th scope="col">Solution ID</th><th scope="col">Bounty ID</th><th scope="col">Solution</th><th scope="col">Linked Solution</th><th scope="col">Acceptance Status</th><th scope="col">Disputed</th><th scope="col">Comment</th></tr></thead><tbody>';
    for(let i=0;i < solutionQueueLength; i++){
        let solutionID = await bountydAppv1.addressToSolutionList(currentUser, i);
        let solutions = await bountydAppv1.solutions(solutionID);

        // Getting the Linked Solution
        let linkedSolution = solutions.linkedSolution;
        if (linkedSolution == 0) {
            linkedSolution = 'None';
        }

        // Getting the Acceptance Status
        var acceptanceStatus = 'Pending';
        if(solutions.acceptanceStatus == 1) {
            acceptanceStatus = 'Accepted';
        }
        else if(solutions.acceptanceStatus == 2) {
            acceptanceStatus = 'Rejected';
        }

        // Getting the Disputed Status
        var disputeStatus = 'No';
        if(solutions.disputeStatus == 1) {
            disputeStatus = 'Yes';
        }
        else if(solutions.disputeStatus == 2) {
            disputeStatus = 'Done';
        }

        // Appending all the details into the Queue
        solutionQueue += '<tr><th scope="row">'+solutionID+
        '</td><td>'+solutions.bountyID+
        '</td><td>'+solutions.solution+
        '</td><td>'+linkedSolution+
        '</td><td>'+acceptanceStatus+
        '</td><td>'+disputeStatus+
        '</td><td>'+solutions.comment+'</td></tr>';

    }
    solutionQueue += '</tbody></table>';

    // Complete Bounty List
    let completeBountyQueueLength = await bountydAppv1.bountyID({from: currentUser});
    let completeBountyQueue = '<table class="table"><thead class="thead-dark"><tr><th scope="col">Bounty ID</th><th scope="col">Bounty Creator</th><th scope="col">Description</th><th scope="col">Deadline</th><th scope="col">Solution List</th><th scope="col">Accepted Solution</th><th scope="col">Amount</th><th scope="col">Status</th></tr></thead><tbody>';
    for(let i=1;i <= completeBountyQueueLength; i++){
        let bounties = await bountydAppv1.bounties(i);
        let bountyID = i;

        // Getting the Deadline
        var convdataTime = '';
        if(bounties.deadline == 0){
            convdataTime = 'No Deadline';
        }
        else{
            var date = new Date(bounties.deadline*1000);
            var year = date.getFullYear();
            var month = months_arr[date.getMonth()];
            var day = date.getDate();
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var seconds = "0" + date.getSeconds();
            convdataTime = month+'-'+day+'-'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);    
        }

        // Getting the added Solutions to Bounty
        let bountyToSolutionQueueLength = await bountydAppv1.bountyToSolutionListLength(bountyID);
        var solutionList = 'None Yet';
        if (bountyToSolutionQueueLength > 0) {
            solutionList = '';
            for(let i = 0; i < bountyToSolutionQueueLength; i++) {
                solutionList += await bountydAppv1.bountyToSolutionList(bountyID, i) + '<br>';
            }
        }

        // Getting the Accepted Solution ID
        var acceptedSolutionID = bounties.acceptedSolutionID;
        if (acceptedSolutionID == 0) {
            acceptedSolutionID = 'Not Yet'
        }

        // Getting the Bounty Status
        var bountyStatus = 'Open';
        if(bounties.status == 1) {
            bountyStatus = 'Disputed';
        }
        else if(bounties.status == 2) {
            bountyStatus = ' Closed';
        }

        // Appending all the details into the Queue
        completeBountyQueue += '<tr><th scope="row">'+bountyID+
        '</td><td>'+bounties.bountyCreator+
        '</td><td>'+bounties.description+
        '</td><td>'+convdataTime+
        '</td><td>'+solutionList+
        '</td><td>'+acceptedSolutionID+
        '</td><td>'+fromWei(bounties.amount)+
        ' ETH</td><td>'+bountyStatus+'</td></tr>';

    }
    completeBountyQueue += '</tbody></table>';

    const userBalance = fromWei(await web3.eth.getBalance(currentUser));
    const contractBalance = fromWei(await bountydAppv1.balances(currentUser));

    $('#currentUserAddress').html(currentUser);
    $('#currentUserType').html(currentUserType);
    $('#contractBalance').html(contractBalance.toString(10));
    $('#userBalance').html(userBalance.toString(10));
    $('#disputeQueueStatus').html(disputeQueue);
    $('#bountyQueueStatus').html(bountyQueue);
    $('#solutionQueueStatus').html(solutionQueue);
    $('#completeBountyQueueStatus').html(completeBountyQueue);
}

async function pauseContract() {
    try {
        assert(await bountydAppv1.pauseContract.call(
            {from: currentUser}
        ), 'The transaction will fail anyway, not sending');

        const txObj = await bountydAppv1.pauseContract(
            {from: currentUser}
        ).on(
            'transactionHash',
            txHash => $('#pauseContractStatus').html('Transaction on the way ' + txHash)
        );

        const receipt = txObj.receipt;
        console.log('Got Receipt', receipt);
        if (!receipt.status) {
            console.error('Wrong Status');
            console.error(receipt);
            $('#pauseContractStatus').html('There was an error in the tx execution, status not 1');
        } else if (receipt.logs.length == 0) {
            console.error('Empty logs');
            console.error(receipt);
            $('#pauseContractStatus').html('There was an error in the tx execution, missing expected event');
        } else {
            console.log(receipt.logs[0]);
            $('#pauseContractStatus').html('Transfer executed with Tx Hash: '+receipt.transactionHash);
        }

        updateData(bountydAppv1);

    } catch (err) {
        let message = JSON.stringify(err.message).split('reason')[1].split('\"')[2].slice(0,-1);
        $('#pauseContractStatus').html(message);
        console.error(err);
    }
}

async function resumeContract() {
    try {
        assert(await bountydAppv1.resumeContract.call(
            {from: currentUser}
        ), 'The transaction will fail anyway, not sending');

        const txObj = await bountydAppv1.resumeContract(
            {from: currentUser}
        ).on(
            'transactionHash',
            txHash => $('#resumeContractStatus').html('Transaction on the way ' + txHash)
        );

        const receipt = txObj.receipt;
        console.log('Got Receipt', receipt);
        if (!receipt.status) {
            console.error('Wrong Status');
            console.error(receipt);
            $('#resumeContractStatus').html('There was an error in the tx execution, status not 1');
        } else if (receipt.logs.length == 0) {
            console.error('Empty logs');
            console.error(receipt);
            $('#resumeContractStatus').html('There was an error in the tx execution, missing expected event');
        } else {
            console.log(receipt.logs[0]);
            $('#resumeContractStatus').html('Transfer executed with Tx Hash: '+receipt.transactionHash);
        }

        updateData(bountydAppv1);

    } catch (err) {
        let message = JSON.stringify(err.message).split('reason')[1].split('\"')[2].slice(0,-1);
        $('#resumeContractStatus').html(message);
        console.error(err);
    }
}

async function stopContract() {
    try {
        assert(await bountydAppv1.stopContract.call(
            {from: currentUser}
        ), 'The transaction will fail anyway, not sending');

        const txObj = await bountydAppv1.stopContract(
            {from: currentUser}
        ).on(
            'transactionHash',
            txHash => $('#stopContractStatus').html('Transaction on the way ' + txHash)
        );

        const receipt = txObj.receipt;
        console.log('Got Receipt', receipt);
        if (!receipt.status) {
            console.error('Wrong Status');
            console.error(receipt);
            $('#stopContractStatus').html('There was an error in the tx execution, status not 1');
        } else if (receipt.logs.length == 0) {
            console.error('Empty logs');
            console.error(receipt);
            $('#stopContractStatus').html('There was an error in the tx execution, missing expected event');
        } else {
            console.log(receipt.logs[0]);
            $('#stopContractStatus').html('Transfer executed with Tx Hash: '+receipt.transactionHash);
        }

        updateData(bountydAppv1);

    } catch (err) {
        let message = JSON.stringify(err.message).split('reason')[1].split('\"')[2].slice(0,-1);
        $('#stopContractStatus').html(message);
        console.error(err);
    }
}

async function changeOwner() {
    try {
        const newOwner = $('input[name="newOwnerAddress"]').val();

        const txObj = await bountydAppv1.setOwner(
            newOwner,
            { from: currentUser }
        ).on(
            'transactionHash',
            txHash => $('#changeOwnerStatus').html('Transaction on the way ' + txHash)
        );

        const receipt = txObj.receipt;
        console.log('Got Receipt', receipt);
        if (!receipt.status) {
            console.error('Wrong Status');
            console.error(receipt);
            $('#changeOwnerStatus').html('There was an error in the tx execution, status not 1');
        } else if (receipt.logs.length == 0) {
            console.error('Empty logs');
            console.error(receipt);
            $('#changeOwnerStatus').html('There was an error in the tx execution, missing expected event');
        } else {
            console.log(receipt.logs[0]);
            $('#changeOwnerStatus').html('Transfer executed with Tx Hash: '+receipt.transactionHash);
        }

        updateData(bountydAppv1);

    } catch (err) {
        $('#changeOwnerStatus').html(err.message);
        console.error(err);
    }
}

async function addResolver() {
    try {
        const newResolver = $('input[name="newResolverAddress"]').val();

        const txObj = await bountydAppv1.addResolver(
            newResolver,
            { from: currentUser }
        ).on(
            'transactionHash',
            txHash => $('#addResolverStatus').html('Transaction on the way ' + txHash)
        );

        const receipt = txObj.receipt;
        console.log('Got Receipt', receipt);
        if (!receipt.status) {
            console.error('Wrong Status');
            console.error(receipt);
            $('#addResolverStatus').html('There was an error in the tx execution, status not 1');
        } else if (receipt.logs.length == 0) {
            console.error('Empty logs');
            console.error(receipt);
            $('#addResolverStatus').html('There was an error in the tx execution, missing expected event');
        } else {
            console.log(receipt.logs[0]);
            $('#addResolverStatus').html('Transfer executed with Tx Hash: '+receipt.transactionHash);
        }

        updateData(bountydAppv1);

    } catch (err) {
        $('#addResolverStatus').html(err.message);
        console.error(err);
    }
}

async function updateResolver() {
    try {
        const resolverAddress = $('input[name="updateResolverAddress"]').val();
        const newResolverStatus = $('input[name="newResolverStatus"]').val();
        let newResolverStatusInBN = new BN(newResolverStatus);

        const txObj = await bountydAppv1.updateResolver(
            resolverAddress,
            newResolverStatusInBN,
            { from: currentUser }
        ).on(
            'transactionHash',
            txHash => $('#updateResolverStatus').html('Transaction on the way ' + txHash)
        );

        const receipt = txObj.receipt;
        console.log('Got Receipt', receipt);
        if (!receipt.status) {
            console.error('Wrong Status');
            console.error(receipt);
            $('#updateResolverStatus').html('There was an error in the tx execution, status not 1');
        } else if (receipt.logs.length == 0) {
            console.error('Empty logs');
            console.error(receipt);
            $('#updateResolverStatus').html('There was an error in the tx execution, missing expected event');
        } else {
            console.log(receipt.logs[0]);
            $('#updateResolverStatus').html('Transfer executed with Tx Hash: '+receipt.transactionHash);
        }

        updateData(bountydAppv1);

    } catch (err) {
        $('#updateResolverStatus').html(err.message);
        console.error(err);
    }
}

async function solveDispute() {
    try {
        const disputeIndex = $('input[name="disputeIndex"]').val();
        let disputeIndexInBN = new BN(disputeIndex);
        const newDisputeStatus = $('input[name="newDisputeStatus"]').val();
        let vote = new BN(newDisputeStatus);

        const txObj = await bountydAppv1.solveDispute(
            disputeIndexInBN,
            vote,
            { from: currentUser }
        ).on(
            'transactionHash',
            txHash => $('#updateResolverStatus').html('Transaction on the way ' + txHash)
        );

        const receipt = txObj.receipt;
        console.log('Got Receipt', receipt);
        if (!receipt.status) {
            console.error('Wrong Status');
            console.error(receipt);
            $('#updateResolverStatus').html('There was an error in the tx execution, status not 1');
        } else if (receipt.logs.length == 0) {
            console.error('Empty logs');
            console.error(receipt);
            $('#updateResolverStatus').html('There was an error in the tx execution, missing expected event');
        } else {
            console.log(receipt.logs[0]);
            $('#updateResolverStatus').html('Transfer executed with Tx Hash: '+receipt.transactionHash);
        }

        updateData(bountydAppv1);

    } catch (err) {
        $('#updateResolverStatus').html(err.message);
        console.error(err);
    }
}

async function checkBounty() {
    try {
        const checkBountyID = $('input[name="checkBountyID"]').val();
        let checkBountyIDInBN = new BN(checkBountyID);

        let bounties = await bountydAppv1.bounties(
            checkBountyIDInBN,
            { from: currentUser }
        );

        let checkBounty = 'Description: '+bounties.description;

        $('#checkBountyStatus').html(checkBounty);

    } catch (err) {
        $('#checkBountyStatus').html(err.message);
        console.error(err);
    }
}

async function checkSolution() {
    try {
        const checkSolutionID = $('input[name="checkSolutionID"]').val();
        let checkSolutionIDInBN = new BN(checkSolutionID);

        let solutions = await bountydAppv1.solutions(
            checkSolutionIDInBN,
            { from: currentUser }
        );

        let checkSolution = 'Solution: '+solutions.solution+'<br>Linked Solution: '+solutions.linkedSolution+'<br>Comment (if any): '+solutions.comment;

        $('#checkSolutionStatus').html(checkSolution);

    } catch (err) {
        $('#checkSolutionStatus').html(err.message);
        console.error(err);
    }
}

async function createBounty() {
    try {
        const bountyDescription = $('input[name="bountyDescription"]').val();
        var d = new Date();
        var seconds = new BN(Math.round(d.getTime() / 1000));
        const bountyDeadline = $('input[name="bountyDeadline"]').val();
        let bountyDeadlineInBN;
        console.log('bountyDeadline: '+bountyDeadline);
        if (bountyDeadline == 0) {
            bountyDeadlineInBN = new BN(bountyDeadline);
        } else {
            bountyDeadlineInBN = new BN(bountyDeadline).add(new BN(seconds));
        }
        console.log(bountyDeadlineInBN.toString(10));
        const bountyAmount = toWei($('input[name="bountyAmount"]').val());
        let bountyAmountInBN = new BN(bountyAmount);

        const txObj = await bountydAppv1.createBounty(
            bountyAmountInBN,
            bountyDeadlineInBN,
            bountyDescription,
            { from: currentUser, value: bountyAmountInBN}
        ).on(
            'transactionHash',
            txHash => $('#createBountyStatus').html('Transaction on the way ' + txHash)
        );

        const receipt = txObj.receipt;
        console.log('Got Receipt', receipt);
        if (!receipt.status) {
            console.error('Wrong Status');
            console.error(receipt);
            $('#createBountyStatus').html('There was an error in the tx execution, status not 1');
        } else if (receipt.logs.length == 0) {
            console.error('Empty logs');
            console.error(receipt);
            $('#createBountyStatus').html('There was an error in the tx execution, missing expected event');
        } else {
            console.log(receipt.logs[0]);
            $('#createBountyStatus').html('Transfer executed with Tx Hash: '+receipt.transactionHash);
            $('#bountyIDCreated').html('Bounty ID: '+receipt.logs[1].args.bountyID);
        }

        updateData(bountydAppv1);

    } catch (err) {
        $('#createBountyStatus').html(err.message);
        console.error(err);
    }
}

async function closeBounty() {
    try {
        const closeBountyID = $('input[name="closeBountyID"]').val();
        const closeBountyIDInBN = new BN(closeBountyID);

        const txObj = await bountydAppv1.closeBounty(
            closeBountyIDInBN,
            { from: currentUser }
        ).on(
            'transactionHash',
            txHash => $('#closeBountyStatus').html('Transaction on the way ' + txHash)
        );

        const receipt = txObj.receipt;
        console.log('Got Receipt', receipt);
        if (!receipt.status) {
            console.error('Wrong Status');
            console.error(receipt);
            $('#closeBountyStatus').html('There was an error in the tx execution, status not 1');
        } else if (receipt.logs.length == 0) {
            console.error('Empty logs');
            console.error(receipt);
            $('#closeBountyStatus').html('There was an error in the tx execution, missing expected event');
        } else {
            console.log(receipt.logs[0]);
            $('#closeBountyStatus').html('Transfer executed with Tx Hash: '+receipt.transactionHash);
        }

        updateData(bountydAppv1);

    } catch (err) {
        $('#closeBountyStatus').html(err.message);
        console.error(err);
    }
}

async function acceptSolution() {
    try {
        const acceptSolutionID = $('input[name="acceptSolutionID"]').val();
        const acceptSolutionIDInBN = new BN(acceptSolutionID);

        const txObj = await bountydAppv1.acceptSolution(
            acceptSolutionIDInBN,
            { from: currentUser }
        ).on(
            'transactionHash',
            txHash => $('#acceptSolutionStatus').html('Transaction on the way ' + txHash)
        );

        const receipt = txObj.receipt;
        console.log('Got Receipt', receipt);
        if (!receipt.status) {
            console.error('Wrong Status');
            console.error(receipt);
            $('#acceptSolutionStatus').html('There was an error in the tx execution, status not 1');
        } else if (receipt.logs.length == 0) {
            console.error('Empty logs');
            console.error(receipt);
            $('#acceptSolutionStatus').html('There was an error in the tx execution, missing expected event');
        } else {
            console.log(receipt.logs[0]);
            $('#acceptSolutionStatus').html('Transfer executed with Tx Hash: '+receipt.transactionHash);
        }

        updateData(bountydAppv1);

    } catch (err) {
        $('#acceptSolutionStatus').html(err.message);
        console.error(err);
    }
}

async function rejectSolution() {
    try {
        const rejectSolutionID = $('input[name="rejectSolutionID"]').val();
        const comment = $('input[name="comment"]').val();
        const rejectSolutionIDInBN = new BN(rejectSolutionID);

        const txObj = await bountydAppv1.rejectSolution(
            rejectSolutionIDInBN,
            comment,
            { from: currentUser }
        ).on(
            'transactionHash',
            txHash => $('#rejectSolutionStatus').html('Transaction on the way ' + txHash)
        );

        const receipt = txObj.receipt;
        console.log('Got Receipt', receipt);
        if (!receipt.status) {
            console.error('Wrong Status');
            console.error(receipt);
            $('#rejectSolutionStatus').html('There was an error in the tx execution, status not 1');
        } else if (receipt.logs.length == 0) {
            console.error('Empty logs');
            console.error(receipt);
            $('#rejectSolutionStatus').html('There was an error in the tx execution, missing expected event');
        } else {
            console.log(receipt.logs[0]);
            $('#rejectSolutionStatus').html('Transfer executed with Tx Hash: '+receipt.transactionHash);
        }

        updateData(bountydAppv1);

    } catch (err) {
        $('#rejectSolutionStatus').html(err.message);
        console.error(err);
    }
}

async function addSolution() {
    try {
        const bountyID = $('input[name="bountyID"]').val();
        const bountyIDInBN = new BN(bountyID);
        const solution = $('input[name="solution"]').val();
        const linkedSolution = $('input[name="linkedSolution"]').val();
        const linkedSolutionInBN = new BN(linkedSolution);

        const txObj = await bountydAppv1.addSolution(
            bountyIDInBN,
            linkedSolutionInBN,
            solution,
            { from: currentUser}
        ).on(
            'transactionHash',
            txHash => $('#addSolutionStatus').html('Transaction on the way ' + txHash)
        );

        const receipt = txObj.receipt;
        console.log('Got Receipt', receipt);
        if (!receipt.status) {
            console.error('Wrong Status');
            console.error(receipt);
            $('#addSolutionStatus').html('There was an error in the tx execution, status not 1');
        } else if (receipt.logs.length == 0) {
            console.error('Empty logs');
            console.error(receipt);
            $('#addSolutionStatus').html('There was an error in the tx execution, missing expected event');
        } else {
            console.log(receipt.logs[0]);
            $('#addSolutionStatus').html('Transfer executed with Tx Hash: '+receipt.transactionHash);
            $('#solutionIDCreated').html('Solution ID: '+receipt.logs[0].args.solutionID);
        }

        updateData(bountydAppv1);

    } catch (err) {
        $('#createBountyStatus').html(err.message);
        console.error(err);
    }
}

async function raiseDispute() {
    try {
        const disputeSolutionID = $('input[name="disputeSolutionID"]').val();
        const disputeSolutionIDInBN = new BN(disputeSolutionID);

        const txObj = await bountydAppv1.raiseDispute(
            disputeSolutionIDInBN,
            { from: currentUser }
        ).on(
            'transactionHash',
            txHash => $('#raiseDisputeStatus').html('Transaction on the way ' + txHash)
        );

        const receipt = txObj.receipt;
        console.log('Got Receipt', receipt);
        if (!receipt.status) {
            console.error('Wrong Status');
            console.error(receipt);
            $('#raiseDisputeStatus').html('There was an error in the tx execution, status not 1');
        } else if (receipt.logs.length == 0) {
            console.error('Empty logs');
            console.error(receipt);
            $('#raiseDisputeStatus').html('There was an error in the tx execution, missing expected event');
        } else {
            console.log(receipt.logs[0]);
            $('#raiseDisputeStatus').html('Transfer executed with Tx Hash: '+receipt.transactionHash);
        }

        updateData(bountydAppv1);

    } catch (err) {
        $('#raiseDisputeStatus').html(err.message);
        console.error(err);
    }
}

async function withdraw() {
    try {
        const amount = toWei($('input[name="amount"]').val());

        const txObj = await bountydAppv1.withdraw(
            amount,
            { from: currentUser }
        ).on(
            'transactionHash',
            txHash => $('#withdrawStatus').html('Transaction on the way ' + txHash)
        );

        const receipt = txObj.receipt;
        console.log('Got Receipt', receipt);
        if (!receipt.status) {
            console.error('Wrong Status');
            console.error(receipt);
            $('#withdrawStatus').html('There was an error in the tx execution, status not 1');
        } else if (receipt.logs.length == 0) {
            console.error('Empty logs');
            console.error(receipt);
            $('#withdrawStatus').html('There was an error in the tx execution, missing expected event');
        } else {
            console.log(receipt.logs[0]);
            $('#withdrawStatus').html('Transfer executed with Tx Hash: '+receipt.transactionHash);
        }

        updateData(bountydAppv1);

    } catch (err) {
        $('#withdrawStatus').html(err.message);
        console.error(err);
    }
}

window.addEventListener('load', async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        console.log(accounts);
        if (!accounts.length) {
            $('#balance').html('N/A');
            throw new Error('No account with which to transact.');
        }

        currentUser = accounts[0];
        console.log('User: ', currentUser);

        bountydAppv1 = await BountydAppv1.deployed();

        const network = await web3.eth.net.getId();
        console.log('Network ID: ', network.toString(10));

        updateData(bountydAppv1);

        $("#pauseContract").click(pauseContract);
        $("#resumeContract").click(resumeContract);
        $("#stopContract").click(stopContract);
        $("#changeOwner").click(changeOwner);
        $("#addResolver").click(addResolver);
        $("#updateResolver").click(updateResolver);
        $("#solveDispute").click(solveDispute);
        $("#checkBounty").click(checkBounty);
        $("#checkSolution").click(checkSolution);
        $("#createBounty").click(createBounty);
        $("#closeBounty").click(closeBounty);
        $("#acceptSolution").click(acceptSolution);
        $("#rejectSolution").click(rejectSolution);
        $("#addSolution").click(addSolution);
        $("#raiseDispute").click(raiseDispute);
        $("#withdraw").click(withdraw);
    } catch (err) {
        console.error(err);
    }

});
