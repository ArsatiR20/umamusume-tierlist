import React from 'react';
import TabSwitcher from '../common/TabSwitcher';
import FilterSettingsTab from '../filters/FilterSettingsTab';
import CardCollectionTab from './CardCollectionTab';

const CardFiltersSection = ({ 
  activeTab, 
  onTabChange, 
  filterSettings, 
  onRarityFilterChange, 
  onOwnedFilterChange,
  ownedCards,
  onOwnedCardsChange,
  onCardsChanged
}) => {
  return (
    <div className="owned-cards-section">
      <h2>Card Collection & Filters</h2>
      
      {/* Tab Switcher Component */}
      <TabSwitcher 
        tabs={[
          { id: 'filters', label: 'Filter Settings' },
          { id: 'collection', label: 'Card Collection' }
        ]}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      
      {/* Filter Settings Tab Content */}
      {activeTab === 'filters' && (
        <FilterSettingsTab 
          filterSettings={filterSettings}
          onRarityFilterChange={onRarityFilterChange}
        />
      )}
      
      {/* Card Collection Tab Content */}
      {activeTab === 'collection' && (
        <CardCollectionTab 
          filterSettings={filterSettings}
          onOwnedFilterChange={onOwnedFilterChange}
          ownedCards={ownedCards}
          onOwnedCardsChange={onOwnedCardsChange}
          onCardsChanged={onCardsChanged}
        />
      )}
    </div>
  );
};

export default CardFiltersSection;
