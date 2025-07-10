import { useEffect, useState } from "react";
import { ethers } from "ethers";
import votingAbi from "./VotingABI.json";
import "./App.css";

const CONTRACT_ADDRESS = "0x1Ee2276B77B02297b8Df241A6F32184F59BdF568";

function App() {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState();
  const [eventTitle, setEventTitle] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventId, setEventId] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateAddress, setCandidateAddress] = useState("");
  const [voteEventId, setVoteEventId] = useState("");
  const [voteCandidateAddress, setVoteCandidateAddress] = useState("");
  const [infoEventId, setInfoEventId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [eventInfo, setEventInfo] = useState();
  const [winner, setWinner] = useState();
  const [status, setStatus] = useState("");

  // Connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      await prov.send("eth_requestAccounts", []);
      const signer = await prov.getSigner();
      setProvider(prov);
      setSigner(signer);
      setAccount(await signer.getAddress());
      setContract(new ethers.Contract(CONTRACT_ADDRESS, votingAbi, signer));
    } else {
      alert("MetaMask not detected");
    }
  };

  // Create voting event
  const createEvent = async (e) => {
    e.preventDefault();
    if (!contract) return;
    setStatus("Creating event...");
    try {
      const tx = await contract.createVotingEvent(
        eventTitle,
        Math.floor(new Date(eventEndDate).getTime() / 1000)
      );
      await tx.wait();
      setStatus("Voting event created!");
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  // Register candidate
  const registerCandidate = async (e) => {
    e.preventDefault();
    if (!contract) return;
    setStatus("Registering candidate...");
    try {
      const tx = await contract.registerCandidate(
        eventId,
        candidateAddress,
        candidateName
      );
      await tx.wait();
      setStatus("Candidate registered!");
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  // Vote
  const vote = async (e) => {
    e.preventDefault();
    if (!contract) return;
    setStatus("Voting...");
    try {
      const tx = await contract.vote(voteEventId, voteCandidateAddress);
      await tx.wait();
      setStatus("Voted!");
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  // Get candidates
  const fetchCandidates = async (e) => {
    e.preventDefault();
    if (!contract) return;
    setStatus("Fetching candidates...");
    try {
      const cands = await contract.getCandidates(infoEventId);
      setCandidates(cands);
      setStatus("");
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  // Get event info
  const fetchEventInfo = async (e) => {
    e.preventDefault();
    if (!contract) return;
    setStatus("Fetching event info...");
    try {
      const info = await contract.getVotingEvent(infoEventId);
      setEventInfo(info);
      setStatus("");
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  // End voting and get winner
  const endVoting = async (e) => {
    e.preventDefault();
    if (!contract) return;
    setStatus("Ending voting and fetching winner...");
    try {
      const tx = await contract.endVoting(infoEventId);
      await tx.wait();
      const info = await contract.getVotingEvent(infoEventId);
      setWinner({ address: info[3], votes: info[4] });
      setStatus("Voting ended. Winner info fetched.");
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div className="container">
      <h1>Voting DApp</h1>
      <button onClick={connectWallet} disabled={!!account} className="wallet-btn">
        {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
      </button>
      <div className="section">
        <h2>Create Voting Event</h2>
        <form onSubmit={createEvent}>
          <input
            type="text"
            placeholder="Event Title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            required
          />
          <input
            type="datetime-local"
            value={eventEndDate}
            onChange={(e) => setEventEndDate(e.target.value)}
            required
          />
          <button type="submit">Create Event</button>
        </form>
      </div>
      <div className="section">
        <h2>Register Candidate</h2>
        <form onSubmit={registerCandidate}>
          <input
            type="number"
            placeholder="Event ID"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Candidate Address"
            value={candidateAddress}
            onChange={(e) => setCandidateAddress(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Candidate Name"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            required
          />
          <button type="submit">Register</button>
        </form>
      </div>
      <div className="section">
        <h2>Vote</h2>
        <form onSubmit={vote}>
          <input
            type="number"
            placeholder="Event ID"
            value={voteEventId}
            onChange={(e) => setVoteEventId(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Candidate Address"
            value={voteCandidateAddress}
            onChange={(e) => setVoteCandidateAddress(e.target.value)}
            required
          />
          <button type="submit">Vote</button>
        </form>
      </div>
      <div className="section">
        <h2>Voting Info & Winner</h2>
        <form onSubmit={fetchCandidates} style={{ display: "inline" }}>
          <input
            type="number"
            placeholder="Event ID"
            value={infoEventId}
            onChange={(e) => setInfoEventId(e.target.value)}
            required
          />
          <button type="submit">Get Candidates</button>
        </form>
        <form onSubmit={fetchEventInfo} style={{ display: "inline", marginLeft: 8 }}>
          <button type="submit">Get Event Info</button>
        </form>
        <form onSubmit={endVoting} style={{ display: "inline", marginLeft: 8 }}>
          <button type="submit">End Voting & Get Winner</button>
        </form>
        <div>
          {candidates.length > 0 && (
            <div>
              <h4>Candidates:</h4>
              <ul>
                {candidates.map((c, i) => (
                  <li key={i}>
                    {c.name} ({c.candidateAddress}) - Votes: {c.voteCount.toString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {eventInfo && (
            <div>
              <h4>Event Info:</h4>
              <p>Title: {eventInfo[0]}</p>
              <p>End Date: {new Date(Number(eventInfo[1]) * 1000).toLocaleString()}</p>
              <p>Ended: {eventInfo[2] ? "Yes" : "No"}</p>
              <p>Winner: {eventInfo[3]}</p>
              <p>Winner Votes: {eventInfo[4]?.toString()}</p>
            </div>
          )}
          {winner && (
            <div>
              <h4>Winner:</h4>
              <p>Address: {winner.address}</p>
              <p>Votes: {winner.votes?.toString()}</p>
            </div>
          )}
        </div>
      </div>
      {status && <div className="status">{status}</div>}
    </div>
  );
}

export default App;
