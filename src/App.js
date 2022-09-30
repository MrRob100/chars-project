import './App.css';

import { providers, Wallet, Contract, utils } from "ethers";

import { Web3Storage } from 'web3.storage'

import React, { Component } from "react";
import sass from './sass/app.scss';
import abi from './abi.json';

class App extends Component {

  state = {
    src: null,
    web3storageToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEI5MzAxQThDRTE2NGQxRURDYzEzNzcyQTYwMTc0MkJjOTdGOTBCZGIiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjQzMDMwNzg5ODUsIm5hbWUiOiJjaGFycyJ9.SNApZVwso_ks7y24XI_nrmcePVosI6xcOas1S1AG2Vk",
    contractAddress: "0xE7E1FB470285EF198C4B67f4B8BF51148c2d2c9C",
    infuraUrl: "https://ropsten.infura.io/v3/b59953df17ce4e248a1198806fe9c4bd",
    showCreateForm: false,
    showShow: false,
    showEditForm: false,
    chars: [],
    charId: null,
    name: "",
    phrases: [""],
    votes: null,
    creator: "",
    activity: "",
    walletAddress: "",
    loading: false,
  }

  render() {

    const tipCreator = async (creatorAddress) => {
      if (window.ethereum) {

        let provider = new providers.Web3Provider(window.ethereum);

        await requestAccount();

        const params = [{
          from: this.state.walletAddress,
          to: creatorAddress,
          value: utils.parseEther("0.01").toHexString(),
        }];

        const transactionHash = await provider.send('eth_sendTransaction', params)
        console.log('transactionHash is ' + transactionHash);
      }
    }

    const uploadFile = async () => {
      console.log('uploading');
      // Construct with token and endpoint
      const fileInput = document.getElementById("image");

      if (fileInput.files.length === 0) {
        console.log('len0');
        let src = `https://dweb.link/ipfs/test.png`
        this.setState({src: src});
      }

      try {
        const client = new Web3Storage({token: this.state.web3storageToken})

        const rootCid = await client.put(fileInput.files) // Promise<CIDString>

        for(const preFile of fileInput.files) {
          let fileName = preFile.name.replace(" ", "%");
          let src = `https://dweb.link/ipfs/${rootCid}/${fileName}`
          this.setState({src: src});
        }

        const info = await client.status(rootCid) // Promise<Status | undefined>
        const res = await client.get(rootCid) // Promise<Web3Response | null>
        const files = await res.files() // Promise<Web3File[]>
        for (const file of files) {
          let fileNameFromIpfs = file.name.replace(" ",  "%");
          let src = `https://dweb.link/ipfs/${file.cid}/${fileNameFromIpfs}`;
          this.setState({src: src});
        }
      } catch (error) {
        console.error(error);
      }
    }

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

        } catch (error) {
          console.log('Error connecting...');
        }

      } else {
        alert('Meta Mask not detected, only read-only functions available');
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
        if (item.name) {
          fillChars.push(
            {
              'id': item.id.toNumber(),
              'name': item.name,
              'votes': item.votes.toString(),
              'top_phrase': JSON.parse(item.phrases)[0],
              'image': item.image,
              'creator': utils.getAddress(item.creator),
            }
          );
        }
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
        let encodedPhrases = JSON.stringify(this.state.phrases);

        await uploadFile();

        console.log('src: ', this.state.src); //SPACES IN IMAGE NAME CAUSE PROBS

        const tx = await contractX.addCharacter(this.state.name, encodedPhrases, this.state.src);
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
      this.setState({
        loading: true,
        showCreateForm: false,
        showEditForm: false,
      });
      const contractProvider = new providers.JsonRpcProvider(this.state.infuraUrl);
      const contractX = new Contract(this.state.contractAddress, abi, contractProvider);
      let char = await contractX.getCharacter(item.id);

      this.setState({
        name: char.name,
        phrases: JSON.parse(char.phrases),
        src: char.image,
        showShow: true,
        loading: false,
      });
    }

    const editCharacter = async (item) => {
      this.setState(
          {
            loading: true,
            showShow: false,
            showCreateForm: false,
          }
      );
      const contractProvider = new providers.JsonRpcProvider(this.state.infuraUrl);
      const contractX = new Contract(this.state.contractAddress, abi, contractProvider);
      let char = await contractX.getCharacter(item.id);

      this.setState({
        charId: char.id,
        name: char.name,
        phrases: JSON.parse(char.phrases),
        loading:false,
        showEditForm: true,
      });
    }

    const updateCharacter = async (event) => {
      event.preventDefault();
      this.setState({
        loading: true,
        showEditForm: false,
      });

      if (typeof window.ethereum !== 'undefined') {
        await requestAccount();

        const provider = new providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractX = new Contract(this.state.contractAddress, abi, signer);

        const tx = await contractX.updateCharacter(this.state.charId, this.state.name, JSON.stringify(this.state.phrases));
        await tx.wait();
        await getCharacters();
      }
    }

    const deleteCharacter = async (item) => {
      this.setState({loading: true});

      if (typeof window.ethereum !== 'undefined') {
        await requestAccount();

        const provider = new providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractX = new Contract(this.state.contractAddress, abi, signer);

        const tx = await contractX.deleteCharacter(item.id);
        await tx.wait();
        await getCharacters();
      }
    }

    const getShow = () => {
      return <div className="row my-3">
        <div className="col-6 offset-3">
          <div className="card shadow">
            <form onSubmit={createCharacter}>
              <div className="card-body">
                <i onClick={() => this.setState({showShow: false})} className="fa fa-close position-absolute end-0 me-3 cursor-pointer"></i>
                <img className="show-image" src={this.state.src} />
                <h1>{this.state.name}</h1>
                <p>Votes: {this.state.votes}</p>
                <p>Phrases:</p>
                <ul>
                  {this.state.phrases.map(function (item, index) {
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

    const getEditForm = () => {
      return <div className="row my-3">
        <div className="col-6 offset-3">
          <div className="card shadow">
            <form onSubmit={updateCharacter}>
              <div className="card-body">
                <i onClick={() => this.setState({showEditForm: false})} className="fa fa-close position-absolute end-0 me-3 cursor-pointer"></i>
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
                <input className="my-3" type="file" id="image"></input>
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
          <header>
            <button
              onClick={getCharacters}
              className="btn btn-info"
            >Get Chars
            </button>
            <button
                disabled={!window.ethereum}
                onClick={() => this.setState({showCreateForm:true})}
                className="btn btn-warning m-3"
            >Create Char
            </button>
            <div className="my-3">
              {this.state.loading && <i className="fa fa-spinner"></i>}
            </div>
            {this.state.showCreateForm && getCreateForm()}
            {this.state.showShow && getShow()}
            {this.state.showEditForm && getEditForm()}
            <table className="table table-hover">
              <thead>
              <tr>
                <th scope="col">Image</th>
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
                    <td><img className="table-image" src={item.image}/></td>
                    <td>{item.name}</td>
                    <td>{item.votes}</td>
                    <td>{item.top_phrase}</td>
                    <td>{item.creator.toLowerCase() === this.state.walletAddress ? item.creator + ' (you)' : item.creator}</td>
                    <td>
                      <button onClick={() => viewCharacter(item)} className="btn btn-sm btn-success mx-1">View</button>
                      {item.creator.toLowerCase() === this.state.walletAddress && <button disabled={!window.ethereum} onClick={() => editCharacter(item)} className="btn btn-sm btn-info mx-1">Edit</button>}
                      {item.creator.toLowerCase() !== this.state.walletAddress && <button disabled={!window.ethereum} onClick={() => upVoteCharacter(item)} className="btn btn-sm btn-warning mx-1">Vote</button>}
                      {item.creator.toLowerCase() === this.state.walletAddress && <button disabled={!window.ethereum} onClick={() => deleteCharacter(item)} className="btn btn-sm btn-danger mx-1">Delete</button>}
                      {item.creator.toLowerCase() !== this.state.walletAddress && <button disabled={!window.ethereum} onClick={() => tipCreator(item.creator)} className="btn btn-sm btn-info mx-1">Tip 0.01 ETH</button>}
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


