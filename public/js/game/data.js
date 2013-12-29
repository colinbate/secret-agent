define([], function () {
  'use strict';

  return {
    agents: [
      {name: 'Mr. Gray', card: 'mr-gray.png', color: '#b8bfb9'},
      {name: 'Mr. Blue', card: 'mr-blue.png', color: '#2569cc'},
      {name: 'Mr. Red', card: 'mr-red.png', color: '#c0001b'},
      {name: 'Mr. Purple', card: 'mr-purple.png', color: '#303c9b'},
      {name: 'Mr. Green', card: 'mr-green.png', color: '#409944'},
      {name: 'Mr. Yellow', card: 'mr-yellow.png', color: '#feed38'},
      {name: 'Mr. Orange', card: 'mr-orange.png', color: '#e96823'}
    ],
    locations: [
      {name: 'Church', points: 0},
      {name: 'House 1', points: 1},
      {name: 'House 2', points: 2},
      {name: 'House 3', points: 3},
      {name: 'House 4', points: 4},
      {name: 'House 5', points: 5},
      {name: 'House 6', points: 6},
      {name: 'House 7', points: 7},
      {name: 'House 8', points: 8},
      {name: 'House 9', points: 9},
      {name: 'House 10', points: 10},
      {name: 'Ruin', points: -3},
    ],
    states: ['initial', 'provide-name', 'awaiting-players', 'playing', 'game-over']
  };
});