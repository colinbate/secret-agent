define([], function () {
  'use strict';

  return {
    agents: [
      {id: 0, name: 'Mr. Gray', card: 'mr-gray', color: '#b8bfb9'},
      {id: 1, name: 'Mr. Blue', card: 'mr-blue', color: '#2569cc'},
      {id: 2, name: 'Mr. Red', card: 'mr-red', color: '#c0001b'},
      {id: 3, name: 'Mr. Purple', card: 'mr-purple', color: '#303c9b'},
      {id: 4, name: 'Mr. Green', card: 'mr-green', color: '#409944'},
      {id: 5, name: 'Mr. Yellow', card: 'mr-yellow', color: '#feed38'},
      {id: 6, name: 'Mr. Orange', card: 'mr-orange', color: '#e96823'}
    ],
    locations: [
      {name: 'Church', points: 0, agents: []},
      {name: 'House 1', points: 1, agents: []},
      {name: 'House 2', points: 2, agents: []},
      {name: 'House 3', points: 3, agents: []},
      {name: 'House 4', points: 4, agents: []},
      {name: 'House 5', points: 5, agents: []},
      {name: 'House 6', points: 6, agents: []},
      {name: 'House 7', points: 7, agents: []},
      {name: 'House 8', points: 8, agents: []},
      {name: 'House 9', points: 9, agents: []},
      {name: 'House 10', points: 10, agents: []},
      {name: 'Ruin', points: -3, agents: []}
    ],
    states: ['initial', 'provide-name', 'awaiting-players', 'playing', 'game-over'],
    dice: ['one', 'two', 'three', 'four', 'five', 'six']
  };
});