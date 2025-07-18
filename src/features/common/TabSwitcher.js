import React from 'react';
import './TabSwitcher.css';

const TabSwitcher = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tabs-navigation">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabSwitcher;
