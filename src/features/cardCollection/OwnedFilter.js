import React from 'react';
import './OwnedFilter.css';

class OwnedFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filterOwned: props.initialSettings?.filterOwned || false,
            showOnlyOwned: props.initialSettings?.showOnlyOwned || false,
        };
        
        this.onFilterChange = this.onFilterChange.bind(this);
    }
    
    onFilterChange(event) {
        const settingId = event.target.id;
        const isChecked = event.target.checked;
        
        // Create a new settings object to avoid mutation issues
        const newSettings = {
            ...this.state,
            [settingId]: isChecked
        };
        
        // Log the change for debugging
        //console.log(`OwnedFilter: Changed ${settingId} to ${isChecked}`);
        
        // Update state and notify parent
        this.setState(newSettings, () => {
            if (this.props.onSettingsChanged) {
                // Pass the new settings directly to avoid stale state issues
                this.props.onSettingsChanged(newSettings);
            }
        });
    }
    
    render() {
        return (
            <div className="owned-filter">
                <h3>Owned Cards Filter</h3>
                
                <div className="owned-filter-options">
                    <label className="filter-option">
                        <input 
                            type="checkbox" 
                            id="filterOwned" 
                            checked={this.state.filterOwned}
                            onChange={this.onFilterChange}
                        />
                        Filter by owned cards
                    </label>
                    
                    <label className="filter-option">
                        <input 
                            type="checkbox" 
                            id="showOnlyOwned" 
                            checked={this.state.showOnlyOwned}
                            disabled={!this.state.filterOwned}
                            onChange={this.onFilterChange}
                        />
                        Show all owned cards (any uncap)
                    </label>
                </div>
                
                <div className="owned-filter-info">
                    {this.state.filterOwned ? (
                        this.state.showOnlyOwned ? 
                            <p>Showing only cards you own (any uncap level)</p> : 
                            <p>Showing only cards you own with matching uncap level</p>
                    ) : (
                        <p>Owned card filter is disabled</p>
                    )}
                </div>
            </div>
        );
    }
}

export default OwnedFilter;
