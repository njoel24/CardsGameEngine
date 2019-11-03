import _ from 'lodash';
import { MatchService } from "../services/match.service";
import { AuctionService } from "../services/auction.service";
import { CommonService } from "../services/common.service";
const matchMiddleware = store => next => action => {
	const state = store.getState();
	const commonService = new CommonService(store);
	const matchService = new MatchService(store);
	const auctionService = new AuctionService(store);
	switch(action.type){
		case 'INIT_MATCH':
			action.cardsPlayed = commonService.resetCardsPlayed();
		break;
		case 'START_MATCH':
			action.shuffleCards = commonService.shuffleCards();
			action.cardsPlayed = commonService.resetCardsPlayed();
			action.inTurn = ((state.matchStarter + 1) % 5);
		break;
		case 'PLAY':
			const card = matchService.playCardOnTheTable(action.value);
			action.cardPlayed = card;
			action.inTurn = commonService.getNextInTurn();
			action.turnFinished = matchService.isTurnFinished();
		break;
		case 'CHANGE_TURN':
			action.inTurn = commonService.getNextInTurn();
			action.turnFinished = matchService.isTurnFinished();
		break;
		case 'END_TURN':  
			const winnerTurn = matchService.getWinnerTurn();
			action.winnerTurn = winnerTurn;
			action.inTurn = commonService.getNextInTurn(winnerTurn);
			action.cardsPlayed = commonService.resetCardsPlayed();
			action.turnFinished = false;
			action.turns = commonService.getNextTurn();
			action.finishedMatch = matchService.isMatchFinished();
		break;
		case 'SET_WINNER':
			action.winner = matchService.setWinnerMatch();
			action.cardsPlayed = commonService.resetCardsPlayed();
		break;
		case 'CHANGE_TURN_AUCTION':
			action.inTurn = commonService.getNextInTurn();
			action.winnerAuction = auctionService.getWinnerAuction();
		break;
		case 'PLAY_AUCTION':
			action.inAuction = auctionService.isUserInAuction();
			action.auctionForUser = auctionService.setAuctionForUser(action.value);
			action.inTurn = commonService.getNextInTurn();
			action.winnerAuction = auctionService.getWinnerAuction();
		break;
		case 'RAISE_AUCTION':
			action.inAuction = auctionService.isUserInAuction();
			let raisedAuction = auctionService.getBiggestAuction(state.players) + 5;
			if(raisedAuction > 120 ){
				raisedAuction = 120;
			}
			action.auctionForUser = auctionService.setAuctionForUser(raisedAuction);
			action.inTurn = commonService.getNextInTurn();
			action.winnerAuction = auctionService.getWinnerAuction();
		break;
		case 'CHOOSE_PARTNER':
			const choosenCard = auctionService.choosePartner(action.partner);
			action.partner = choosenCard.id;
			action.inTurn = state.matchStarter;
			action.area = 'match';
			action.seed = choosenCard.seed;
			action.partnerPlayer = auctionService.getAllied(choosenCard.id);
		break;
		case 'EXIT_AUCTION':
			action.inAuction = false;
			action.inTurn = commonService.getNextInTurn();
			action.winnerAuction = auctionService.getWinnerAuction();
		break;
	}

next(action);
};


export default matchMiddleware;