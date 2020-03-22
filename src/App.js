import React, { Component } from 'react';

import lottery from './lottery';
import Notiflix from 'notiflix';
import web3 from './web3';


class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    wallet: ''
  };

  async componentDidMount() {
   // Check if Web3 has been injected by the browser (MetaMask).
  // (since 'web3' is global, we need to use 'window')
  if (window.web3 && window.web3.currentProvider.isMetaMask) {
    window.web3.eth.getAccounts((error, accounts) => {
      // Do whatever you need to.
      this.setState({wallet: accounts[0]});

    });
  } else {
    console.log('MetaMask account not detected');
  }
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    this.setState({ manager, players, balance });
}



  onSubmit = async event => {
    event.preventDefault();

    Notiflix.Block.Hourglass('.content', 'Processing...');

    await lottery.methods.enter().send({
      from: this.wallet,
      value: web3.utils.toWei(this.state.value, 'ether')
    });

    Notiflix.Block.Remove('.content', 20000);
    Notiflix.Notify.Success('You have been entered!');
  };
  onClick = async () => {
    Notiflix.Notify.Info('Waiting on transaction success...');

    await lottery.methods.pickWinner().send({
      from: this.wallet
    });

    Notiflix.Notify.Success('A winner has been picked!');
  };
  render() {
    return (
      <div className="content">
        <h2>Lottery Contract</h2>
        <p>This contract is managed by {this.state.manager}</p>
        <p>There are currently {this.state.players.length} people entered</p>
        <p>
          competing to win {web3.utils.fromWei(this.state.balance, 'ether')}{' '}
          ether!
        </p>
        <hr />
        <h4>Want to try your luck?</h4>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="amount">Amount of ether to enter</label>
          <input
            value={this.state.value}
            onChange={event => this.setState({ value: event.target.value })}
          />
          <button>Enter</button>
        </form>
        <hr />

        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>

        <hr />
      </div>
    );
  }
}

export default App;
