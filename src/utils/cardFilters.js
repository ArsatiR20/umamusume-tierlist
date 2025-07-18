/**
 * Filter cards based on rarity and active tab
 * @param {Array} allCards - All cards to filter
 * @param {Object} filterSettings - Filter settings object
 * @param {Object} ownedCards - Object containing owned cards data
 * @param {string} activeTab - Current active tab ('filters' or 'collection')
 * @returns {Array} - Filtered cards array
 */
export const filterCards = (allCards, filterSettings, ownedCards, activeTab = 'filters') => {
  // If no filter settings, return all cards
  if (!filterSettings) return allCards;
  
  // For collection tab, if filterOwned is active, only show owned cards
  // with matching uncap level
  if (activeTab === 'collection' && filterSettings.filterOwned) {
    return allCards.filter(card => {
      // Check if card is owned
      const isOwned = ownedCards[card.id] !== undefined;
      
      // If card is not owned, exclude
      if (!isOwned) {
        return false;
      }

      // If showOnlyOwned is active, show all owned cards
      // regardless of rarity filter
      if (filterSettings.showOnlyOwned) {
        return true;
      }
      
      // Check if uncap level matches owned level
      // Ensure both are numbers for consistent comparison
      const cardLimitBreak = parseInt(card.limit_break);
      const ownedLimitBreak = parseInt(ownedCards[card.id]);
      
      if (cardLimitBreak !== ownedLimitBreak) {
        //console.log("Card", card.id, "has limit break", cardLimitBreak, "but owned level is", ownedLimitBreak);
        return false;
      }
      return true;
    });
  }
  
  // For filter settings tab or collection tab without filter owned
  return allCards.filter(card => {
    // Apply rarity filter based on card's limit_break
    let passesRarityFilter;
    if (card.rarity === 1) {
      passesRarityFilter = filterSettings.r[card.limit_break];
    } else if (card.rarity === 2) {
      passesRarityFilter = filterSettings.sr[card.limit_break];
    } else if (card.rarity === 3) {
      passesRarityFilter = filterSettings.ssr[card.limit_break];
    } else {
      return true;
    }
    
    return passesRarityFilter;
  });
};
