import './App.css';

import { getDefaultProvider, providers, Wallet, Contract, utilsm, utils } from "ethers";

import React, { Component, useState, useEffect } from "react";
import sass from './sass/app.scss';

function App() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [chars, setChars] = useState([]);
  const [name, setName] = useState('');
  const [phrase, setPhrase] = useState('');
  const [activity, setActivity] = useState('...');
  const [walletAddress, setWalletAddress] = useState("");

  const contractAddress = '0x81e4f93013dE5ecC5eC6AD0CBE24E70D1cC570Ba';
  const abi = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_phrases",
          "type": "string"
        }
      ],
      "name": "addCharacter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "addVoteToCharacter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "getCharacter",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "phrases",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "votes",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            }
          ],
          "internalType": "struct Characters.Character",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCharacterNextKey",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCharacters",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "phrases",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "votes",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            }
          ],
          "internalType": "struct Characters.Character[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  async function requestAccount() {
      console.log('Requesting account...');

      // ❌ Check if Meta Mask Extension exists
      if(window.ethereum) {
        console.log('detected');

        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setWalletAddress(accounts[0]);
        } catch (error) {
          console.log('Error connecting...');
        }

      } else {
        alert('Meta Mask not detected');
      }
  }

  // async function connectWallet() {
  //
  // }

  const getCharacters = async () => {

    setActivity('Getting chars');

    const contractProvider = new providers.JsonRpcProvider(`https://ropsten.infura.io/v3/b59953df17ce4e248a1198806fe9c4bd`);

    console.log(contractProvider);

    const contractX = new Contract(contractAddress, abi, contractProvider);

    let chars = await contractX.getCharacters();

    console.log(chars);

    let fillChars = [];
    chars.forEach(function(item) {
      fillChars.push({'name': item.name, 'votes': item.votes.toString(), 'top_phrase': item.phrases});
    });

    setChars(fillChars);
    setActivity('Successfully got chars');
  }

  async function handleCreateSubmit(event) {
      event.preventDefault();

    if(typeof window.ethereum !== 'undefined') {
      await requestAccount();
      setActivity('creating character');
      setShowCreateForm(false);

      const provider = new providers.Web3Provider(window.ethereum);

      const signer = provider.getSigner();

      const contractX = new Contract(contractAddress, abi, signer);

      // console.log(contractX);

      const tx = await contractX.addCharacter(name, phrase);
      await tx.wait();

      //some success logic
      console.log(tx);

      // const chars = await contractX.getCharacters();
      // console.log('chars', chars);

      console.log('successfully created character');
      await getCharacters();
    }
  }

  const getCreateForm = () => {
      return <div className="row my-3">
        <div className="col-6 offset-3">
          <div className="card">
            <form onSubmit={handleCreateSubmit}>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="name" className="form-label mt-4">Name</label>
                  <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-control"
                      id="name"
                      placeholder="Baldy McShitJokes">
                  </input>
                </div>
                <div className="form-group">
                  <label htmlFor="phrase" className="form-label mt-4">Phrase</label>
                  <input
                      type="text"
                      required
                      value={phrase}
                      onChange={(e) => setPhrase(e.target.value)}
                      className="form-control"
                      id="phrase"
                      placeholder="I can never un-see this" >
                  </input>
                </div>
                <br></br>
                <input type="submit" value="Save" />
              </div>
            </form>
          </div>
        </div>
      </div>
  }

  const showCreateFormMethod = () => {
    setShowCreateForm(true);
  }

  return (
    <div className="App">
      <p>Activity: {activity}</p>
      <header>
        <button
          onClick={getCharacters}
          className="btn btn-info"
        >Get Chars</button>
        <button
            onClick={showCreateFormMethod}
            className="btn btn-warning m-3"
        >Create Char</button>
        {showCreateForm && getCreateForm()}
        <table className="table table-hover">
          <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Votes</th>
            <th scope="col">Top Phrase</th>
            <th scope="col">Creator</th>
            <th scope="col">Actions</th>
          </tr>
          </thead>
          <tbody>
          {chars.map(function (item, index) {
            return (
                <tr className="table-active" key={index}>
                  <td>{item.name}</td>
                  <td>{item.votes}</td>
                  <td>{item.top_phrase}</td>
                  <td>{item.creator}</td>
                  <td>
                    <button className="btn btn-sm btn-success mx-1">View</button>
                    <button className="btn btn-sm btn-info mx-1">Edit</button>
                    <button className="btn btn-sm btn-warning mx-1">Vote</button>
                    <button className="btn btn-sm btn-danger mx-1">Delete</button>
                  </td>
                </tr>
            )
          })}
          </tbody>
        </table>
      </header>
    </div>
  );
}

export default App;
