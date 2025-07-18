import React from 'react';
import './RarityFilter.css';

class RarityFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ssr: [...props.initialSettings?.ssr || [true, false, true, false, true]],
            sr: [...props.initialSettings?.sr || [true, false, true, false, true]],
            r: [...props.initialSettings?.r || [false, false, false, false, true]],
        };
        
        this.onSettingChanged = this.onSettingChanged.bind(this);
    }
    
    onSettingChanged(event) {
        const [rarity, level] = event.target.id.split('.');
        const levelInt = parseInt(level);
        
        // Create a new copy of the state to avoid mutation issues
        const newSettings = {
            ssr: [...this.state.ssr],
            sr: [...this.state.sr],
            r: [...this.state.r]
        };
        
        // Update the specific setting
        newSettings[rarity][levelInt] = event.target.checked;
        
        // Log the change for debugging
        //console.log(`RarityFilter: Changed ${rarity} level ${levelInt} to ${event.target.checked}`);
        
        // Update state and notify parent
        this.setState(newSettings, () => {
            if (this.props.onSettingsChanged) {
                // Pass the new settings directly to avoid stale state issues
                this.props.onSettingsChanged(newSettings);
            }
        });
    }
    
    render() {
        const rarities = ["ssr", "sr", "r"];
        let rows = [];
        
        // Create header row
        rows.push(<tr key="header"><th>SSR</th><th>SR</th><th>R</th></tr>);
        
        // Create rows for each uncap level (4 to 0)
        for (let i = 4; i >= 0; i--) {
            let data = [];
            let lit_up = "";
            let dark = "";
            
            // Create diamond symbols for uncap level visualization
            for (let j = 0; j < 4; j++) {
                if (j < i) {
                    lit_up += "◆";
                } else {
                    dark += "◆";
                }
            }
            
            // Create cells for each rarity
            for (let r = 0; r < 3; r++) {
                data.push(
                    <td key={`${rarities[r]}-${i}`}>
                        <span className="lb-yes">{lit_up}</span>
                        <span className="lb-no">{dark}</span>
                        <input 
                            type="checkbox" 
                            checked={this.state[rarities[r]][i]} 
                            id={`${rarities[r]}.${i}`} 
                            onChange={this.onSettingChanged}
                        />
                    </td>
                );
            }
            
            rows.push(<tr key={`row-${i}`}>{data}</tr>);
        }
        
        return (
            <div className="rarity-filter">
                <h3>Rarity & Uncap Filter</h3>
                <div className="rarity-filter-table">
                    <table>
                        <tbody>
                            {rows}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default RarityFilter;
