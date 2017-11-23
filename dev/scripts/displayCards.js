// ----- DISPLAY CARDS IN COLLECTION MANAGER ----- //
import React from 'react';
import ReactDOM from 'react-dom';
import getCards from './cardRequest.js';

const displayCards = function() {
    const response = getCards();
    console.log(response);
}

export default displayCards;