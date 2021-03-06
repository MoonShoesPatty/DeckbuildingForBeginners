// ----- MAIN APP ----- //
import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';
import axios from 'axios';
import Qs from 'qs';
import classNames from 'classnames';

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
		this.prevPage = this.prevPage.bind(this);
		this.nextPage = this.nextPage.bind(this);
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
		this.displayCards(classCards, nextProps.currentClass, nextProps.currentPage);
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
	// Update the state displayCards: [] to contain the cards corresponding to the a: selected class and b: location based on the page
	displayCards(allCards, classTo = this.props.currentClass, currentPage = 0) {
		const currentDisplay = [];
		const lastCardIndex = classCards[this.props.currentClass].length;
		// Based on the size of the viewport, deliver different numbers of cards per page
		const windowWidth = window.innerWidth;
		let cardsPerPage = 0;
		if (windowWidth > 940) {
			cardsPerPage = 8;
		} else if (windowWidth > 480) {
			cardsPerPage = 6;
		} else {
			cardsPerPage = 4;
		}
		// pick out the cards to be displayed based on hero class and page number
		for (let i = currentPage * cardsPerPage; i < (currentPage * cardsPerPage) + cardsPerPage && i < lastCardIndex; i++) {
			currentDisplay.push(allCards[classTo][i]);
		}
		this.setState({
			displayCards: currentDisplay
		})
	}
	// User Action: select a card to add to decklist
	handleClick(selectedCard) {
		this.props.updateDecklist(selectedCard);
	}
	// User Action: click on the "previous page" arrow
	prevPage() {
		if(this.props.currentPage > 0) {
			const newPage = this.props.currentPage - 1;
			this.props.updatePage(newPage);
			this.props.resetCard();
		}
	}
	// User Action: click on the "next page" arrow
	nextPage() {
		const lastPageIndex = Math.ceil(classCards[this.props.currentClass].length / 8) - 1
		if (this.props.currentPage < lastPageIndex) {
			const newPage = this.props.currentPage + 1;
			this.props.updatePage(newPage);
			this.props.resetCard();
		}
	}
	render() {
		return (
			<div className="collectionListWrapper">
				<div className="prevPageArrow" onClick={this.prevPage}></div>
				<ul className="collectionList">
				{this.state.displayCards.map((card) => {
					return (
						<li onClick={() => this.handleClick(card)} key={card.cardId} className="collectionListItem">
							<img src={card.img} alt={card.name} className="collectionCardImg" />
						</li>
					)
				})}
				</ul>
				<div className="nextPageArrow" onClick={this.nextPage}></div>
			</div>
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
	// User action: select a class from the list of hero types
	handleClick(newClass) {
		this.props.updateClass(newClass);
		this.props.resetCard();
	}
	render() {
		return (
			<ul className="classList">
				<li onClick={() => this.handleClick(this.props.selectedClass)} key={this.props.selectedClass} className="classListItem">{this.props.selectedClass}</li>
				<li onClick={() => this.handleClick("Neutral")} key="Neutral" className="classListItem">Neutral</li>
			</ul>
		)
	}
}

class HelpSection extends React.Component {
	constructor() {
		super();
		this.state = {
			classArray: ['Druid', 'Hunter', 'Mage', 'Paladin', 'Priest', 'Rogue', 'Shaman', 'Warlock', 'Warrior', 'Neutral']
		}
		this.handleClick = this.handleClick.bind(this);
	}
	render() {
		return 
	}
}

class Decklist extends React.Component {
	constructor() {
		super();
		this.state = {
			userDeck: [],
			userDeckLength: 0
		}
		this.addCard = this.addCard.bind(this);
		this.sortDeckByCost = this.sortDeckByCost.bind(this);
		this.deleteCard = this.deleteCard.bind(this);
	}
	// Put card selected by user in decklist
	addCard(card) {
		card.duplicate = '';
		const deckArray = [...this.state.userDeck, card];
		this.sortDeckByCost(deckArray);
		const deckLength = this.state.userDeckLength + 1;
		this.setState({
			userDeckLength: deckLength
		})
	}
	// Runs when a user selects a card already in the decklist - puts second copy in decklist
	duplicateCard(card) {
		// Only run this if this is the second instance of the card in the deck - 3 copies of a card is illegal!
		if (card.duplicate === '') {
			card.duplicate = ' (x2)';
			const deckLength = this.state.userDeckLength + 1;
			this.setState({
				userDeckLength: deckLength
			})
		}
	}
	// Sort the user's deck by cost and secondarily by card name
	sortDeckByCost(deckArray) {
		deckArray.sort(function (a, b) {
			return a.cost - b.cost;
		});
		this.setState({
			userDeck: deckArray
		})
	}
	// Remove selected card from decklist
	deleteCard(card) {
		const deckArray = this.state.userDeck;
		let numOfCards = this.state.userDeckLength;
		if (card.duplicate === '') {
			numOfCards--;
		} else {
			numOfCards -= 2;
		}
		deckArray.forEach((cardInDeck, index) => {
			if (cardInDeck.cardId === card.cardId) {
				deckArray.splice(index, 1);
			}
		})
		this.setState({
			userDeck: deckArray,
			userDeckLength: numOfCards
		})
	}
	componentWillReceiveProps(nextProps) {
		let cardExists = false;
		// If an empty object was not passed, and the user has room for more cards...
		if (nextProps.selectedCard.name && this.state.userDeckLength < 30) {
			// See whether the selected card already exists in the deck
			this.state.userDeck.forEach((card) => {
				if (nextProps.selectedCard.cardId === card.cardId) {
					cardExists = true;
				}
			})
			// Duplicate or add the selected card accordingly
			if (cardExists) {
				this.duplicateCard(nextProps.selectedCard);
			} else {
				this.addCard(nextProps.selectedCard);
			}
		}
	}
	render() {
		return (
			<div className="deckSection">
				<input type="checkbox" id="decklistSlideOut" />
				<label htmlFor="decklistSlideOut" className="decklistToggleLabel">Decklist</label>
				<div className="userDecklistWrapper">
					<ul className="userDeckList">
						{this.state.userDeck.map((card) => {
							return (
								<li className="userDeckItem" key={card.cardId}>
									<div className="userDeckCardCost">
										{`${card.cost}`}	
									</div>
									<p className="userDeckCardName">
										{card.name}{card.duplicate}
									</p>
									<div className="userDeckCardRemove" onClick={() => this.deleteCard(card)}>
										{'-'}
									</div>
								</li>
							)
						})}
					</ul>
					{/* <div className="deckListBottomGrad"></div> */}
					<div className="cardCountWrapper">
						<p className="cardCount">{this.state.userDeckLength} / 30</p>
					</div>
				</div>
			</div>
		)
	}
}

class HeroSelect extends React.Component {
	constructor() {
		super();
		this.state = {
			classArray: ['Druid', 'Hunter', 'Mage', 'Paladin', 'Priest', 'Rogue', 'Shaman', 'Warlock', 'Warrior'],
			heroSelected: false
		}
		this.handleClick = this.handleClick.bind(this);
	}
	handleClick(newHero) {
		this.props.updateHero(newHero.hero);
		this.setState({
			heroSelected: true
		})
	}
	render() {
		return (
			<div className={classNames({ landingPageWrapper: true, heroSelected: this.state.heroSelected })}>
				<img src="/public/styles/assets/hearthstoneLogo.png" alt="" className="landingPageLogo" />
				<h1 className="heroSelectPrompt">Select your hero, champion:</h1>
				<ul className="heroSelectList">
					{this.state.classArray.map((hero) => {
						return <li onClick={() => this.handleClick({hero})} key={hero} className="heroSelectItem">{`${hero}`}</li>
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
			initialClass: '',
			currentCard: {}
		}
		this.updatePage = this.updatePage.bind(this);
		this.updateHero = this.updateHero.bind(this);
		this.updateClass = this.updateClass.bind(this);
		this.updateDecklist = this.updateDecklist.bind(this);
		this.resetCurrentCard = this.resetCurrentCard.bind(this);
	}
	// Set a new class to display the cards of
	updateClass(newClass) {
		this.setState({
			currentClass: newClass,
			currentPage: 0
		})
	}
	// Add a new card to the decklist
	updateDecklist(newCard) {
		this.setState({
			currentCard: newCard
		})
	}
	// After a card is added to the decklist, reset the state to blank
	resetCurrentCard() {
		this.setState({
			currentCard: {}
		})
	}
	// Change the page based on which arrow was clicked
	updatePage(newPage) {
		this.setState({
			currentPage: newPage
		})
	}
	// Change the current hero class based on user selection on landing page
	updateHero(newClass) {
		this.setState({
			currentClass: newClass,
			initialClass: newClass
		})
	}
	render() {
		return (
			<div className="appWrapper">
				<HeroSelect updateHero={this.updateHero} />
				<div className="cardsSection">
					<PlayerClassSelect currentClass={this.state.currentClass} selectedClass={this.state.initialClass} updateClass={this.updateClass} resetCard={this.resetCurrentCard} />
					<GetDemCards currentPage={this.state.currentPage} currentClass={this.state.currentClass} updateDecklist={this.updateDecklist} updatePage={this.updatePage} resetCard={this.resetCurrentCard}/>
					
				</div>
				<Decklist selectedCard={this.state.currentCard} />
			</div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('app'));