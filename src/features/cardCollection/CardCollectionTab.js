import React from 'react';
import OwnedFilter from './OwnedFilter';
import OwnedCard from './OwnedCard';
import Filters from './Filters';

const CardCollectionTab = ({ 
  filterSettings, 
  onOwnedFilterChange, 
  ownedCards, 
  onOwnedCardsChange, 
  onCardsChanged 
}) => {
  return (
    <div className="collection-container">
      <div className="collection-sections">
        <div className="owned-cards-view">
          <OwnedFilter
            initialSettings={filterSettings}
            onSettingsChanged={onOwnedFilterChange}
          />
          <OwnedCard
            ownedCards={ownedCards}
            onOwnedCardsChange={onOwnedCardsChange}
          />
        </div>
        <div className="filters-view">
          <Filters
            onCardsChanged={onCardsChanged}
            onOwnedCardsChange={onOwnedCardsChange}
            ownedCards={ownedCards}
            filterSettings={filterSettings}
          />
        </div>
      </div>
    </div>
  );
};

export default CardCollectionTab;
