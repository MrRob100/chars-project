import './App.css';

import { getDefaultProvider, providers, Wallet, Contract, utilsm, utils } from "ethers";

import React, { Component, useState, useEffect } from "react";
import sass from './sass/app.scss';

function App() {

  const [showForm, setShowForm] = useState(false);
  const [chars, setChars] = useState([
    {'name': 'wallace', 'phrases': 'carabmola', 'votes': 0, 'creator': 'xyz'},
    {'name': 'brick', 'phrases': 'slow', 'votes': 2, 'creator': 'xyz'},
  ]);
  const [name, setName] = useState('');
  const [phrase, setPhrase] = useState('');

  const contractAddress = '0xb8AB6066d20dba07F547268A45496b1C59BE9c12';
  const abi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "charId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "actionType",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "executor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "created",
          "type": "uint256"
        }
      ],
      "name": "Action",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "phrase",
          "type": "string"
        }
      ],
      "name": "createChar",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "authorOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "charsOf",
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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "delCharOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getChars",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "charId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "phrase",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "author",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "votes",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "created",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "updated",
              "type": "uint256"
            }
          ],
          "internalType": "struct CharsAllState.CharStruct[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // const contractProvider = new providers.JsonRpcProvider(`https://ropsten.infura.io/v3/b59953df17ce4e248a1198806fe9c4bd`)
  // const contract = new Contract(contractAddress, abi, contractProvider);
  //
  // const fetchChars = async () => {
  //   let chars = await contract.getChars();
  //
  //   let fillChars = [];
  //   chars.forEach(function(item) {
  //     fillChars.push({'name': item.name, 'votes': item.votes.toString(), 'top_phrase': item.phrase});
  //   });
  //
  //   setChars(fillChars);
  // }
  //
  // fetchChars();

  function handleSubmit(event) {
    event.preventDefault();
    console.log(event);
  }

  function handleChange() {
    console.log('ch');
  }

  const getForm = () => {
      return <div className="row my-3">
        <div className="col-6 offset-3">
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="name" className="form-label mt-4">Name</label>
                  <input type="text" className="form-control" id="name" placeholder="Baldy McShitJokes"></input>
                </div>
                <div className="form-group">
                  <label htmlFor="phrase" className="form-label mt-4">Phrase</label>
                  <input type="text" className="form-control" id="phrase" placeholder="I can never un-see this" ></input>
                </div>
                <br></br>
                <input type="submit" value="Save" />
              </div>
            </form>
          </div>
        </div>
      </div>
  }

  const showFormMethod = () => {
    setShowForm(true);
  }

  const submitForm = () => {
    // let created = await contract.createChars();
  }

  return (
    <div className="App">
      <header>
        <button
            onClick={showFormMethod}
            className="btn btn-warning m-3"
        >Create Char</button>
        {showForm && getForm()}
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
                  <td>{item.phrases}</td>
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
