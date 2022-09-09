import './App.css';
import React, { Component, useState, useEffect } from "react";
import sass from './sass/app.scss';

function App() {

  const [showForm, setShowForm] = useState(false);

  const [chars, setChars] = useState([
    {'name': 'Breeze Johnson', 'votes': 5, 'top_phrase': 'Good Greaves!'},
    {'name': 'Cheese Davis', 'votes': 3, 'top_phrase': 'Get outa town!'},
  ]);

  const getForm = () => {
      return <div className="row my-3">
        <div className="col-6 offset-3">
          <div className="card">
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="name" className="form-label mt-4">Name</label>
                <input type="text" className="form-control" id="name" placeholder="Baldy McShitJokes"></input>
              </div>
              <div className="form-group">
                <label htmlFor="name" className="form-label mt-4">Phrase</label>
                <input type="text" className="form-control" id="name" placeholder="I can never un-see this"></input>
              </div>
              <br></br>
              <button className="btn btn-success" onClick={submitForm}>Save</button>
            </div>
          </div>
        </div>
      </div>
  }

  const showFormMethod = () => {
    setShowForm(true);
  }

  const submitForm = () => {
    alert('form submitted');
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
                  <td>
                    <button className="btn btn-sm btn-success mx-1">View</button>
                    <button className="btn btn-sm btn-info mx-1">Edit</button>
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
