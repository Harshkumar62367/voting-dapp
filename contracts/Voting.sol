// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        address candidateAddress;
        string name;
        uint voteCount;
    }

    struct VotingEvent {
        string title;
        uint endDate;
        bool ended;
        Candidate[] candidates;
        mapping(address => bool) hasVoted;
        address winner;
        uint winnerVoteCount;
    }

    uint public eventCount;
    mapping(uint => VotingEvent) private votingEvents;
    mapping(uint => mapping(address => uint)) private candidateIndex;

    // Events
    event VotingEventCreated(uint indexed eventId, string title, uint endDate);
    event CandidateRegistered(uint indexed eventId, address candidate, string name);
    event Voted(uint indexed eventId, address voter, address candidate);
    event VotingEnded(uint indexed eventId, address winner, uint voteCount);

    // Create a new voting event
    function createVotingEvent(string memory _title, uint _endDate) external returns (uint) {
        require(_endDate > block.timestamp, "End date must be in the future");
        eventCount++;
        VotingEvent storage ve = votingEvents[eventCount];
        ve.title = _title;
        ve.endDate = _endDate;
        emit VotingEventCreated(eventCount, _title, _endDate);
        return eventCount;
    }

    // Register a candidate for a voting event
    function registerCandidate(uint eventId, address candidateAddr, string memory name) external {
        VotingEvent storage ve = votingEvents[eventId];
        require(block.timestamp < ve.endDate, "Voting ended");
        require(candidateAddr != address(0), "Invalid address");
        ve.candidates.push(Candidate(candidateAddr, name, 0));
        candidateIndex[eventId][candidateAddr] = ve.candidates.length - 1;
        emit CandidateRegistered(eventId, candidateAddr, name);
    }

    // Vote for a candidate
    function vote(uint eventId, address candidateAddr) external {
        VotingEvent storage ve = votingEvents[eventId];
        require(block.timestamp < ve.endDate, "Voting ended");
        require(!ve.hasVoted[msg.sender], "Already voted");
        uint idx = candidateIndex[eventId][candidateAddr];
        require(idx < ve.candidates.length, "Candidate not found");
        ve.candidates[idx].voteCount++;
        ve.hasVoted[msg.sender] = true;
        emit Voted(eventId, msg.sender, candidateAddr);
    }

    // End voting and determine winner
    function endVoting(uint eventId) external {
        VotingEvent storage ve = votingEvents[eventId];
        require(block.timestamp >= ve.endDate, "Voting not ended yet");
        require(!ve.ended, "Already ended");
        uint maxVotes = 0;
        address winnerAddr;
        for (uint i = 0; i < ve.candidates.length; i++) {
            if (ve.candidates[i].voteCount > maxVotes) {
                maxVotes = ve.candidates[i].voteCount;
                winnerAddr = ve.candidates[i].candidateAddress;
            }
        }
        ve.ended = true;
        ve.winner = winnerAddr;
        ve.winnerVoteCount = maxVotes;
        emit VotingEnded(eventId, winnerAddr, maxVotes);
    }

    // Get candidates for a voting event
    function getCandidates(uint eventId) external view returns (Candidate[] memory) {
        VotingEvent storage ve = votingEvents[eventId];
        Candidate[] memory list = new Candidate[](ve.candidates.length);
        for (uint i = 0; i < ve.candidates.length; i++) {
            list[i] = ve.candidates[i];
        }
        return list;
    }

    // Get voting event info
    function getVotingEvent(uint eventId) external view returns (
        string memory title,
        uint endDate,
        bool ended,
        address winner,
        uint winnerVoteCount
    ) {
        VotingEvent storage ve = votingEvents[eventId];
        return (ve.title, ve.endDate, ve.ended, ve.winner, ve.winnerVoteCount);
    }

    // Check if user has voted
    function hasVoted(uint eventId, address user) external view returns (bool) {
        return votingEvents[eventId].hasVoted[user];
    }
} 