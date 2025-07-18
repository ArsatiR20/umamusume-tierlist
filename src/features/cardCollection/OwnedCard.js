import React from 'react';
import './OwnedCard.css';
import { cards } from '../../data';

class OwnedCard extends React.Component {
    constructor(props) {
        super(props);
        this.handleDeleteCard = this.handleDeleteCard.bind(this);
    }
    
    handleDeleteCard(cardId) {
        // Create a copy of the owned cards
        const updatedOwnedCards = { ...this.props.ownedCards };
        
        // Remove the card
        delete updatedOwnedCards[cardId];
        
        // Update via parent component
        if (this.props.onOwnedCardsChange) {
            this.props.onOwnedCardsChange(updatedOwnedCards);
        }
    }
    
    // Helper function to get rarity text
    getRarityText(rarity) {
        switch(rarity) {
            case 3: return 'SSR';
            case 2: return 'SR';
            case 1: return 'R';
            default: return 'Unknown';
        }
    }
    
    render() {
        // Get all owned cards
        const ownedCardsList = Object.keys(this.props.ownedCards).map(cardId => {
            const id = parseInt(cardId);
            const uncapLevel = this.props.ownedCards[cardId];
            
            // Find the card in the cards list
            const card = cards.find(c => c.id === id);
            if (!card) return null;
            
            return {
                ...card,
                uncapLevel
            };
        }).filter(card => card !== null);
        
        return (
            <div className="owned-card">
                <h3>Owned Cards</h3>
                
                <div className="owned-card-list">
                    {ownedCardsList.length === 0 ? (
                        <p className="no-cards-message">No owned cards yet.</p>
                    ) : (
                        <table className="owned-cards-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Rarity</th>
                                    <th>Uncap</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ownedCardsList.map(card => {
                                    // Display name (English if available, otherwise Japanese)
                                    const displayName = card.char_name_en || card.char_name || 'Unknown';
                                    
                                    return (
                                        <tr key={card.id}>
                                            <td>
                                                <img 
                                                    src={`${process.env.PUBLIC_URL}/cardImages/support_card_s_${card.id}.png`}
                                                    alt={displayName}
                                                    className="card-thumbnail"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = process.env.PUBLIC_URL + "/cardImages/support_card_s_10001.png";
                                                    }}
                                                />
                                            </td>
                                            <td>{displayName}</td>
                                            <td>{this.getRarityText(card.rarity)}</td>
                                            <td>Uncap {card.uncapLevel}</td>
                                            <td>
                                                <button 
                                                    onClick={() => this.handleDeleteCard(card.id)}
                                                    className="delete-button"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
                
                <div className="owned-card-summary">
                    <p>Total Owned Cards: <strong>{ownedCardsList.length}</strong></p>
                    <p>
                        SSR: {ownedCardsList.filter(card => card.rarity === 3).length}
                        &nbsp;|&nbsp;
                        SR: {ownedCardsList.filter(card => card.rarity === 2).length}
                        &nbsp;|&nbsp;
                        R: {ownedCardsList.filter(card => card.rarity === 1).length}
                    </p>
                </div>
            </div>
        );
    }
}

export default OwnedCard;
