import './App.css';

import { providers, Wallet, Contract, utils } from "ethers";

import React, { Component } from "react";

class App extends Component {

  state = {
    contractAddress: "0x81e4f93013dE5ecC5eC6AD0CBE24E70D1cC570Ba",
    infuraUrl: "https://ropsten.infura.io/v3/b59953df17ce4e248a1198806fe9c4bd",
    abi: [
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
    ],
    showCreateForm: false,
    showShow: false,
    chars: [],
    selectedChar: {},
    name: "",
    phrases: [
      "by all means",
      "my no means"
    ],
    activity: "",
    walletAddress: "",
  }

  render() {

    const requestAccount = async () => {
      console.log('Requesting account...');

      // ❌ Check if Meta Mask Extension exists
      if (window.ethereum) {
        console.log('detected');

        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });

          this.setState({walletAddress: accounts[0]});

          // this.setState(walletAddress, accounts[0]);
        } catch (error) {
          console.log('Error connecting...');
        }

      } else {
        alert('Meta Mask not detected');
      }
    }

    const getCharacters = async () => {


      await requestAccount();

      const contractProvider = new providers.JsonRpcProvider(this.state.infuraUrl);

      // console.log(contractProvider);

      const contractX = new Contract(this.state.contractAddress, this.state.abi, contractProvider);

      let chars = await contractX.getCharacters();

      let fillChars = [];
      chars.forEach(function (item) {
        fillChars.push(
            {
              'id': item.id.toNumber(),
              'name': item.name,
              'votes': item.votes.toString(),
              'top_phrase': item.phrases,
              'creator': utils.getAddress(item.creator),
            }
        );
      });

      this.setState({chars: fillChars});
    }

    const createCharacters = async (event) => {
      event.preventDefault();

      if (typeof window.ethereum !== 'undefined') {
        await requestAccount();

        this.setState({
          showCreateForm: false,
          show: false,
        });

        const provider = new providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner();

        const contractX = new Contract(this.state.contractAddress, this.state.abi, signer);

        let encodedPhrases = JSON.parse(this.state.phrases);

        const tx = await contractX.addCharacter(this.state.name, encodedPhrases);
        await tx.wait();

        await getCharacters();
      }
    }

    const upVoteCharacter = async (item) => {
      if (typeof window.ethereum !== 'undefined') {
        await requestAccount();

        const provider = new providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractX = new Contract(this.state.contractAddress, this.state.abi, signer);

        const tx = await contractX.addVoteToCharacter(item.id);
        await tx.wait();
        await getCharacters();
      }
    }

    const viewCharacter = async (item) => {

      this.setState({
        show: true,
        showCreateForm: false,
      });

      const contractProvider = new providers.JsonRpcProvider(this.state.infuraUrl);

      const contractX = new Contract(this.state.contractAddress, this.state.abi, contractProvider);

      let char = await contractX.getCharacter(item.id);

      this.setState({
        selectedChar: {
          'id': char.id.toNumber(),
          'name': char.name,
          'votes': char.votes.toString(),
          'phrases': char.phrases,
          'creator': utils.getAddress(char.creator),
        }
      });
    }

    const getShow = () => {
      let phrases = JSON.parse(this.state.selectedChar.phrases);

      return <div className="row my-3">
        <div className="col-6 offset-3">
          <div className="card">
            <form onSubmit={createCharacters}>
              <div className="card-body">
                <h1>{this.state.selectedChar.name}</h1>
                <p>Phrases:</p>
                <ul>
                  {phrases.map(function (item, index) {
                    return (
                        <li key={index}>item</li>
                    )
                  })
                  }
                </ul>
                <button onClick={() => this.setState({show: false})} className="btn btn-default">Close</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    const setPhrase = (index, value) => {
      this.state.phrases[index] = value;
    }

    const addPhraseField = (e) => {
      e.preventDefault();
      let currentPhrases = this.state.phrases;
      currentPhrases.push("r");
      this.setState({phrases: currentPhrases});
    }

    const getCreateForm = () => {
      return <div className="row my-3">
        <div className="col-6 offset-3">
          <div className="card">
            <form onSubmit={createCharacters}>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="name" className="form-label mt-4">Name</label>
                  <input
                      type="text"
                      required
                      value={this.state.name}
                      onChange={(e) => this.setState({name: e.target.value})}
                      className="form-control"
                      id="name"
                      placeholder="Baldy McShitJokes">
                  </input>
                </div>
                <div className="form-group">
                  <label htmlFor="phrase" className="form-label mt-4">Phrases</label>
                  {this.state.phrases.map(function (item, index) {
                        return (
                            <div key={index}>
                              <input
                                  type="text"
                                  required
                                  value={item}
                                  onChange={(e) => setPhrase(index, e.target.value)}
                                  className="form-control"
                              >
                              </input>
                            </div>
                        )
                      }
                  )
                  }
                  <button onClick={addPhraseField} className="fa fa-plus">Add</button>
                </div>
                <br></br>
                <input type="submit" value="Save"/>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    return (
        <div className="App">
          <p>Activity: {this.state.activity}</p>
          <header>
            <button
                onClick={getCharacters}
                className="btn btn-info"
            >Get Chars
            </button>
            <button
                onClick={() => this.setState({showCreateForm:true})}
                className="btn btn-warning m-3"
            >Create Char
            </button>
            {/*{showCreateForm && getRendered()}*/}
            {this.state.showCreateForm && getCreateForm()}
            {this.state.showShow && getShow()}
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
              {this.state.chars.map(function (item, index) {
                return (
                    <tr className={item.creator.toLowerCase() === this.state.walletAddress ? 'bg-info table-active' : 'table-active'}
                        key={index}>
                      <td>{item.name}</td>
                      <td>{item.votes}</td>
                      <td>{item.top_phrase}</td>
                      <td>{item.creator.toLowerCase() === this.state.walletAddress ? item.creator + ' (you)' : item.creator}</td>
                      <td>
                        <button onClick={() => viewCharacter(item)} className="btn btn-sm btn-success mx-1">View
                        </button>
                        <button className="btn btn-sm btn-info mx-1">Edit</button>
                        <button onClick={() => upVoteCharacter(item)} className="btn btn-sm btn-warning mx-1">Vote
                        </button>
                        <button className="btn btn-sm btn-danger mx-1">Delete</button>
                      </td>
                    </tr>
                )
              }.bind(this))}
              </tbody>
            </table>
          </header>
        </div>
    );
  }
}

export default App;


