import './App.css';

import { providers, Wallet, Contract, utils } from "ethers";

import React, { Component } from "react";
import sass from './sass/app.scss';
import abi from './abi.json';

class App extends Component {

  state = {
    contractAddress: "0x61F8f66758ABe087b8530c02eC27ffa7C143E44D",
    infuraUrl: "https://ropsten.infura.io/v3/b59953df17ce4e248a1198806fe9c4bd",
    showCreateForm: false,
    showShow: false,
    chars: [],
    selectedChar: {},
    name: "",
    phrases: [""],
    activity: "",
    walletAddress: "",
    loading: false,
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

      this.setState({loading: true})

      await requestAccount();

      const contractProvider = new providers.JsonRpcProvider(this.state.infuraUrl);

      const contractX = new Contract(this.state.contractAddress, abi, contractProvider);

      let chars = await contractX.getCharacters();

      let fillChars = [];
      chars.forEach(function (item) {

        fillChars.push(
            {
              'id': item.id.toNumber(),
              'name': item.name,
              'votes': item.votes.toString(),
              'top_phrase': JSON.parse(item.phrases)[0],
              'creator': utils.getAddress(item.creator),
            }
        );
      });

      this.setState({chars: fillChars, loading: false});
    }

    const createCharacter = async (event) => {
      event.preventDefault();
      this.setState({loading: true})

      if (typeof window.ethereum !== 'undefined') {
        await requestAccount();

        this.setState({
          showCreateForm: false,
          show: false,
        });

        const provider = new providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner();

        const contractX = new Contract(this.state.contractAddress, abi, signer);

        console.log('ef', this.state.phrases);
        console.log(typeof this.state.phrases);

        let encodedPhrases = JSON.stringify(this.state.phrases);

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
        const contractX = new Contract(this.state.contractAddress, abi, signer);

        const tx = await contractX.addVoteToCharacter(item.id);
        await tx.wait();
        await getCharacters();
      }
    }

    const viewCharacter = async (item) => {

      this.setState({loading: true});

      const contractProvider = new providers.JsonRpcProvider(this.state.infuraUrl);

      const contractX = new Contract(this.state.contractAddress, abi, contractProvider);

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

      this.setState({
        showShow: true,
        showCreateForm: false,
      });

      this.setState({loading: false});
    }

    const getShow = () => {
      let phrases = JSON.parse(this.state.selectedChar.phrases);

      return <div className="row my-3">
        <div className="col-6 offset-3">
          <div className="card shadow">
            <form onSubmit={createCharacter}>
              <div className="card-body">
                <i onClick={() => this.setState({showShow: false})} className="fa fa-close position-absolute end-0 me-3 cursor-pointer"></i>
                <h1>{this.state.selectedChar.name}</h1>
                <p>Votes: {this.state.selectedChar.votes}</p>
                <p>Phrases:</p>
                <ul>
                  {phrases.map(function (item, index) {
                    return (
                        <li key={index}>{item}</li>
                    )
                  })
                  }
                </ul>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    const addPhraseField = (e) => {
      e.preventDefault();
      let currentPhrases = this.state.phrases;
      currentPhrases.push("");
      this.setState({phrases: currentPhrases});
    }

    const removePhraseField = (index) => {
      let currentPhrases = this.state.phrases;
      currentPhrases.splice(index, 1);
      this.setState({phrases: currentPhrases});
    }

    const setPhrase = (index, value) => {
      let currentPhrases = this.state.phrases;
      currentPhrases[index] = value;
      this.setState({phrases: currentPhrases});
    }

    const getCreateForm = () => {
      return <div className="row my-3">
        <div className="col-6 offset-3">
          <div className="card shadow">
            <form onSubmit={createCharacter}>
              <div className="card-body">
                <i onClick={() => this.setState({showCreateForm: false})} className="fa fa-close position-absolute end-0 me-3 cursor-pointer"></i>
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
                            className="w-75 m-1 p-1"
                        >
                        </input>
                        <span onClick={() => removePhraseField(index)} className="btn btn-danger fa fa-trash"></span>
                      </div>
                    )
                  })}
                  <button onClick={addPhraseField} className="fa fa-plus float-end m-2"></button>
                </div>
                <br></br>
                <input className="btn btn-success" type="submit" value="Save"/>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    return (
        <div className="App">
          <div className="my-3">
            {this.state.loading && <i className="fa fa-spinner"></i>}
          </div>
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


