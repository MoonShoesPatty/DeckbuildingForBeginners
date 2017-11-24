// ----- MAIN APP ----- //
import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';
import axios from 'axios';
import Qs from 'qs';

// Object indicating which sets belong to which format
const setsInFormat = {
	standard: ['Basic', 'Classic', "Journey to Un'Goro", 'Knights of the Frozen Throne', 'Kobolds & Catacombs', 'Mean Streets of Gadgetzan', 'One Night in Karazhan', 'Whispers of the Old Gods'],
	wild: ['Blackrock Mountain', 'Goblins vs Gnomes', 'Hall of Fame', 'Naxxramas', 'The Grand Tournament', 'League of Explorers']
}

// Object to hold all cards organized by class
const classCards = {
	Druid: [],
	Hunter: [],
	Mage: [],
	Paladin: [],
	Priest: [],
	Rogue: [],
	Shaman: [],
	Warlock: [],
	Warrior: [],
	Neutral: []
}

// Object to store hero portraits
const heroPortraits = {
	Druid: {},
	Hunter: {},
	Mage: {},
	Paladin: {},
	Priest: {},
	Rogue: {},
	Shaman: {},
	Warlock: {},
	Warrior: {}
}

// Gets a list of collectible cards from Hearthstone API, then sorts them by class and subsequently cost.
class GetDemCards extends React.Component {
	constructor() {
		super();
		this.state = {
			displayCards: [],
		}
		this.sortByClass = this.sortByClass.bind(this);
		this.sortByCost = this.sortByCost.bind(this);
		this.displayCards = this.displayCards.bind(this);
	}
	componentDidMount() {
		// Poll the API and asks for a full list of collectible cards (Use the HackerYou proxy to cache the data)
		axios({
			method: 'GET',
			url: 'http://proxy.hackeryou.com',
			dataResponse: 'json',
			paramsSerializer: function (params) {
				return Qs.stringify(params, { arrayFormat: 'brackets' })
			},
			params: {
				reqUrl: 'https://omgvamp-hearthstone-v1.p.mashape.com/cards',
				params: {
					collectible: 1,
					locale: 'enUS'
				},
				proxyHeaders: {

					'X-Mashape-Key': 'fxIgSodXnmmshLLhawVYFjm6AKy9p1sgwjSjsnhjrIdUCsVwHY'
				},
				xmlToJSON: false,
				useCache: true
			}
		}).then(({ data }) => {
			this.sortByClass(data);
		})
	}
	componentWillReceiveProps(nextProps) {
		this.displayCards(classCards, nextProps.currentClass);
	}
	// take the cards retrieved from the API and sort them by class
	sortByClass(allCards) {
		// run through each set in the standard format and sort the cards by class
		setsInFormat.standard.forEach((setName) => {
			allCards[setName].forEach((card) => {
				classCards[card.playerClass].push(card);
			})
		})
		// pull the hero portraits out of the set of cards and store them in their own object
		for (let hero in classCards) {
			if (classCards[hero][0].type === 'Hero') {
				heroPortraits[hero] = classCards[hero][0];
				classCards[hero].shift();
			}
		}
		this.sortByCost(classCards);
	}
	// Take cards sorted by class and within the class array sort cards by cost
	sortByCost(classCards) {
		for (let hero in classCards) {
			classCards[hero].sort(function (a, b) {
				return a.cost - b.cost;
			});
		}	
		// Send the sorted array back to App
		this.displayCards(classCards);
	}
	displayCards(allCards, classTo = 'Druid') {
		const currentDisplay = [];
		for (let i = this.props.currentPage * 8; i < (this.props.currentPage * 8) + 8; i++) {
			currentDisplay.push(allCards[classTo][i]);
		}
		this.setState({
			displayCards: currentDisplay
		})
	}
	handleClick(selectedCard) {
		this.props.updateDecklist(selectedCard);
	}
	render() {
		return (
			<ul className="collectionList">
				{this.state.displayCards.map((card) => {
					return (
					<li onClick={() => this.handleClick(card)} key={card.cardId} className="collectionListItem">
						<img src={card.img} alt={card.name} className="collectionCardImg" />
					</li>
					)
				})}
			</ul>
		)
	}
}

class PlayerClassSelect extends React.Component {
	constructor() {
		super();
		this.state = {
			classArray: ['Druid', 'Hunter', 'Mage', 'Paladin', 'Priest', 'Rogue', 'Shaman', 'Warlock', 'Warrior', 'Neutral']
		}
		this.handleClick = this.handleClick.bind(this);
	}
	handleClick(newClass) {
		this.props.updateClass(newClass.hero);
		this.props.resetCard();
	}
	render() {
		return (
			<ul className="classList">
				{this.state.classArray.map((hero) => {
					return <li onClick={() => this.handleClick({hero})} key={hero} className="classListItem">{`${hero}`}</li>
				})}
			</ul>
		)
	}
}

class Decklist extends React.Component {
	constructor() {
		super();
		this.state = {
			userDeck: []
		}
		this.addCard = this.addCard.bind(this);
	}
	addCard(card) {
		// Thanks Fatin!
		//const cardCopy = {...card};
		const deckArray = [...this.state.userDeck, card]
		this.setState({
			userDeck: deckArray
		})
	}
	duplicateCard(card) {

	}
	sortDeckByCost() {

	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.selectedCard.name) {
			this.addCard(nextProps.selectedCard);
		}
	}
	render() {
		return (
			<div>
				<ul className="userDeckList">
					{this.state.userDeck.map((card) => {
						return (
							<li className="userDeckItem" key={card.cardId}>
								<div className="userDeckCardCost">
									{`${card.cost}`}	
								</div>
								{`${card.name}`}
							</li>
						)
					})}
				</ul>
			</div>
		)
	}
}

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			currentPage: 0,
			currentClass: 'Druid',
			currentCard: {}
		}
		this.updateClass = this.updateClass.bind(this);
		this.updateDecklist = this.updateDecklist.bind(this);
		this.resetCurrentCard = this.resetCurrentCard.bind(this);
	}
	// Set a new class to display the cards of
	updateClass(newClass) {
		this.setState({
			currentClass: newClass
		})
	}
	// Add a new card to the decklist
	updateDecklist(newCard) {
		console.log(newCard)
		this.setState({
			currentCard: newCard
		})
	}
	resetCurrentCard() {
		this.setState({
			currentCard: {}
		})
	}
	render() {
		return (
			<div className="appWrapper">
				<div className="cardsSection">
					<PlayerClassSelect currentClass={this.state.currentClass} updateClass={this.updateClass} resetCard={this.resetCurrentCard} />
					<GetDemCards currentPage={this.state.currentPage} currentClass={this.state.currentClass} updateDecklist={this.updateDecklist} />
				</div>
				<div className="deckSection">
					<Decklist selectedCard={this.state.currentCard} />
				</div>
			</div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('app'));