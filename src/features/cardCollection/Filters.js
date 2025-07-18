import React, { useState, useEffect } from 'react';
import { cards } from '../../data';
import './Filters.css';

// We'll use the direct image path approach as in SupportCard.js
// No need for a helper function

const Filters = ({ onOwnedCardsChange, onCardsChanged, ownedCards, filterSettings }) => {
  // We'll use the ownedCards prop from the App component
  
  // State for search/filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'rarity', or 'owned'
  // State to track selected uncap levels for cards not yet owned
  const [selectedUncapLevels, setSelectedUncapLevels] = useState({});
  
  // We'll show all cards in a scrollable container
  
  // We don't need this effect anymore since the App component manages the owned cards state
  // and localStorage updates
  
  // Handle adding/updating a card
  const handleCardUpdate = (cardId, uncapLevel) => {
    //console.log(`DEBUG: Updating card ${cardId} to uncap level ${uncapLevel}`);
    const updatedOwnedCards = { ...ownedCards };
    
    // If the special value -1 is used, it means "Not Owned" (remove the card)
    if (uncapLevel === -1) {
      delete updatedOwnedCards[cardId];
      //console.log(`DEBUG: Removed card ${cardId} from owned cards`);
    } else {
      // Otherwise update or add the card with the specified uncap level (0-4)
      // Pastikan uncapLevel selalu disimpan sebagai integer
      updatedOwnedCards[cardId] = parseInt(uncapLevel);
      //console.log(`DEBUG: Set card ${cardId} to uncap level ${parseInt(uncapLevel)} (type: ${typeof parseInt(uncapLevel)}) in owned cards`);
    }
    
    // Update via parent component
    onOwnedCardsChange(updatedOwnedCards);
    
    // Hapus selectedUncapLevels untuk kartu ini karena sudah diupdate
    setSelectedUncapLevels(prev => {
      const updated = { ...prev };
      delete updated[cardId];
      return updated;
    });
    
    // Log the updated owned cards for debugging
    setTimeout(() => {
      //console.log('DEBUG: Current owned cards after update:', ownedCards);
    }, 100);
  };
  
  // Add multiple cards at once with a specific uncap level
  const addMultipleCards = (cardsToAdd, uncapLevel) => {
    const updatedOwnedCards = { ...ownedCards };
    cardsToAdd.forEach(card => {
      updatedOwnedCards[card.id] = uncapLevel;
    });
    onOwnedCardsChange(updatedOwnedCards);
  };
  
  // Function removed as it was unused
  
  // Group cards by character name and ID to avoid duplicates
  const uniqueCharacters = {};
  
  // Process all cards to find unique characters and their best cards
  cards.forEach(card => {
    const charKey = (card.char_name || '') + '_' + (card.id || '');
    
    // Skip if this character doesn't have a name or ID
    if (!charKey || charKey === '_') return;
    
    // If we haven't seen this character+ID combination before, or this card has a higher rarity
    if (!uniqueCharacters[charKey] || card.rarity > uniqueCharacters[charKey].rarity) {
      uniqueCharacters[charKey] = card;
    }
  });
  
  // Convert the unique characters object to an array
  const uniqueCardsList = Object.values(uniqueCharacters);
  
  // Apply rarity filters based on filterSettings
  const applyRarityFilter = React.useCallback((card) => {
    if (!filterSettings) return true;
    
    // Check rarity and get appropriate filter settings
    if (card.rarity === 3) {
      // SSR card
      if (!filterSettings.ssr) return true;
    } else if (card.rarity === 2) {
      // SR card
      if (!filterSettings.sr) return true;
    } else if (card.rarity === 1) {
      // R card
      if (!filterSettings.r) return true;
    } else return true; // If rarity doesn't match, include it

    // Check if the card's uncap level is allowed by the filter
    const cardUncapLevel = ownedCards[card.id] !== undefined ? ownedCards[card.id] : -1;
    
    // If filterOwned is enabled, check if the card is owned
    if (filterSettings.filterOwned) {
      if (cardUncapLevel < 0) return false; // Card is not owned, filter it out
      if(filterSettings.showOnlyOwned)return true
      return true
    }
    
    // If filterOwned is not enabled, just check the rarity filter
    return true;
  }, [filterSettings, ownedCards]);
  
  // Filter cards based on search term, rarity, and filter settings
  const filteredCards = uniqueCardsList.filter(card => {
    // Check if card has char_name and char_name_en properties
    const hasJapaneseName = card.char_name && typeof card.char_name === 'string';
    const hasEnglishName = card.char_name_en && typeof card.char_name_en === 'string';
    
    // Match against names if they exist
    const nameMatch = searchTerm === '' || 
      (hasJapaneseName && card.char_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (hasEnglishName && card.char_name_en.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const rarityMatch = (filterRarity === 'all' || 
      (filterRarity === 'SSR' && card.rarity === 3) ||
      (filterRarity === 'SR' && card.rarity === 2) ||
      (filterRarity === 'R' && card.rarity === 1))
    
    return nameMatch && rarityMatch;
  }).sort((a, b) => {
    // Sort the filtered cards based on the selected sort option
    const isOwnedA = ownedCards[a.id] !== undefined;
    const isOwnedB = ownedCards[b.id] !== undefined;
    
    if (sortBy === 'name') {
      // Sort by English name if available, otherwise Japanese name
      const nameA = a.char_name_en || a.char_name || '';
      const nameB = b.char_name_en || b.char_name || '';
      return nameA.localeCompare(nameB);
    } else if (sortBy === 'rarity') {
      // Sort by rarity (highest first)
      return b.rarity - a.rarity;
    } else if (sortBy === 'owned') {
      // Sort owned cards first
      return isOwnedB - isOwnedA;
    }
    return 0;
  });
  
  // Get rarity text
  const getRarityText = (rarity) => {
    switch(rarity) {
      case 3: return 'SSR';
      case 2: return 'SR';
      case 1: return 'R';
      default: return 'Unknown';
    }
  };
  
  // Update the tier list whenever filters change or owned cards change
  useEffect(() => {
    // Get all cards from the original cards array that pass the current filters
    const allFilteredCards = cards.filter(applyRarityFilter);
    
    // Update the tier list via the parent component
    if (onCardsChanged) {
      //console.log('Filters: Updating tier list with', allFilteredCards.length, 'cards');
      onCardsChanged(allFilteredCards);
    }
  }, [applyRarityFilter, onCardsChanged, ownedCards, filterSettings]);
  
  return (
    <div className="owned-cards-container">
      <h2>Filter Tier List By Owned Cards</h2>
      
      <div className="owned-cards-filters">
        <div className="filter-row">
          <input
            type="text"
            placeholder="Search by character name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select 
            value={filterRarity} 
            onChange={(e) => setFilterRarity(e.target.value)}
            className="rarity-filter"
          >
            <option value="all">All Rarities</option>
            <option value="SSR">SSR</option>
            <option value="SR">SR</option>
            <option value="R">R</option>
          </select>
        </div>
        
        <div className="filter-row">
          <div className="sort-options">
            <span>Sort by: </span>
            <label>
              <input 
                type="radio" 
                name="sortBy" 
                value="name" 
                checked={sortBy === 'name'} 
                onChange={() => setSortBy('name')} 
              />
              Name
            </label>
            <label>
              <input 
                type="radio" 
                name="sortBy" 
                value="rarity" 
                checked={sortBy === 'rarity'} 
                onChange={() => setSortBy('rarity')} 
              />
              Rarity
            </label>
            <label>
              <input 
                type="radio" 
                name="sortBy" 
                value="owned" 
                checked={sortBy === 'owned'} 
                onChange={() => setSortBy('owned')} 
              />
              Owned First
            </label>
          </div>
        </div>
      </div>
      
      <div className="owned-cards-table-container">
        <table className="owned-cards-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Character</th>
              <th>Rarity</th>
              <th>Uncap Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCards.map(card => {
              const isOwned = ownedCards[card.id] !== undefined;
              const uncapLevel = isOwned ? ownedCards[card.id] : 0;
              const displayName = card.char_name_en ? `${card.char_name_en} (${card.char_name})` : card.char_name;
              
              return (
                <tr key={card.id} className={isOwned ? 'owned' : ''}>
                  <td className="card-image-cell">
                    <img 
                      className="card-thumbnail"
                      src={process.env.PUBLIC_URL + "/cardImages/support_card_s_" + card.id + ".png"}
                      alt={displayName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = process.env.PUBLIC_URL + "/cardImages/support_card_s_10001.png";
                      }}
                    />
                  </td>
                  <td>{displayName}</td>
                  <td>{getRarityText(card.rarity)}</td>
                  <td>
                    <select 
                      id={`uncap-select-${card.id}`}
                      value={selectedUncapLevels[card.id] !== undefined ? selectedUncapLevels[card.id] : uncapLevel} 
                      onChange={(e) => {
                        const newLevel = parseInt(e.target.value);
                        setSelectedUncapLevels(prev => ({
                          ...prev,
                          [card.id]: newLevel
                        }));
                      }}
                      className="uncap-select"
                    >
                      <option value="0">Uncap 0</option>
                      <option value="1">Uncap 1</option>
                      <option value="2">Uncap 2</option>
                      <option value="3">Uncap 3</option>
                      <option value="4">Uncap 4</option>
                    </select>
                  </td>
                  <td>
                    {isOwned ? (
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleCardUpdate(card.id, selectedUncapLevels[card.id] !== undefined ? selectedUncapLevels[card.id] : uncapLevel)}
                          className="update-button"
                        >
                          Update
                        </button>
                        <button 
                          onClick={() => handleCardUpdate(card.id, -1)}
                          className="remove-button"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleCardUpdate(card.id, selectedUncapLevels[card.id] || 0)}
                        className="add-button"
                      >
                        Add
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
    </div>
  );
};

export default Filters;
