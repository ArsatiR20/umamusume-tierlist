import React from 'react';
import RarityFilter from './RarityFilter';

const FilterSettingsTab = ({ filterSettings, onRarityFilterChange }) => {
  return (
    <div className="filter-section">
      <RarityFilter 
        initialSettings={filterSettings}
        onSettingsChanged={onRarityFilterChange}
      />
    </div>
  );
};

export default FilterSettingsTab;
