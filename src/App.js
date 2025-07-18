import './App.css';
import { cards } from './data';
import { TierList, Weights, SelectedCards } from './features/tierList';
import { Header } from './features/common';
import CardFiltersSection from './features/cardCollection/CardFiltersSection';
import React from 'react';
import { filterCards } from './utils';

const ordinal = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
const type_names = ["Speed", "Stamina", "Power", "Guts", "Wisdom", "", "Friend"];

class App extends React.Component {
    constructor(props) {
        super(props);
        
        // Initialize owned cards from localStorage if available
        let ownedCards = {};
        try {
            const savedOwnedCards = localStorage.getItem('ownedCards');
            if (savedOwnedCards) {
                ownedCards = JSON.parse(savedOwnedCards);
            }
        } catch (error) {
            console.error('Error loading owned cards from localStorage:', error);
        }
        
        // Initialize filter settings
        const initialFilterSettings = {
            ssr:[true,false,true,false,true],
            sr:[true,false,true,false,true],
            r: [false,false,false,false,true],
            filterOwned: true,
            showOnlyOwned: false,
        };
        
        // We'll initialize with all cards and then filter after binding methods
        
        this.state = {
            ownedCards: ownedCards,
            activeTab: 'filters',
            filterSettings: initialFilterSettings,
            weights: {
                type: 0,
                bondPerDay: 3.5,
                trainingDays: 50,
                races: [10,10,5,3],
                unbondedTrainingGain: [
                    [8,0,4,0,0,2,19],
                    [0,7,0,3,0,2,17],
                    [0,4,6,0,0,2,18],
                    [3,0,3,6,0,2,20],
                    [2,0,0,0,6,3,0]
                ],
                bondedTrainingGain: [
                    [10,0,4,0,0,2,21],
                    [0,8,0,3,0,2,18],
                    [0,4,7,0,0,2,19],
                    [4,0,3,9,0,2,24],
                    [3,0,0,0,9,3,0]
                ],
                summerTrainingGain: [
                    [11,0,5,0,0,2,22],
                    [0,9,0,6,0,2,21],
                    [0,4,10,0,0,2,21],
                    [3,0,2,10,0,2,24],
                    [3,0,0,0,9,3,0]
                ],
                umaBonus: [1,1,1,1,1,1],
                stats: [1,1,1.1,1,1,0.5,1.5],
                multi: 1,
                bonusFS: 0,
                bonusSpec: 0,
                motivation: 0.2,
                scenarioLink: [],
                scenarioBonus: 0,
                fanBonus: 0.05,
                prioritize: true,
                onlySummer: false,
            },
            selectedCards: [
                cards.find((c) => c.id === 20023 && c.limit_break === 4),
                cards.find((c) => c.id === 20033 && c.limit_break === 4),
                cards.find((c) => c.id === 20009 && c.limit_break === 4),
                cards.find((c) => c.id === 30134 && c.limit_break === 4),
                cards.find((c) => c.id === 30137 && c.limit_break === 0),
            ],
            availableCards: cards,
            label: "Ranking for the 4th Speed card in this deck:"
        }

        this.onWeightsChanged = this.onWeightsChanged.bind(this);
        this.onCardSelected = this.onCardSelected.bind(this);
        this.onCardRemoved = this.onCardRemoved.bind(this);
        this.onCardsChanged = this.onCardsChanged.bind(this);
        this.onLoadPreset = this.onLoadPreset.bind(this);
        this.onOwnedCardsChange = this.onOwnedCardsChange.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.handleRarityFilterChange = this.handleRarityFilterChange.bind(this);
        this.handleOwnedFilterChange = this.handleOwnedFilterChange.bind(this);
        this.filterCards = this.filterCards.bind(this);
        this.updateAvailableCards = this.updateAvailableCards.bind(this);
    }

    onWeightsChanged(statWeights, generalWeights) {
        let combinedWeights = {...statWeights, ...generalWeights};
        this.setState({weights: combinedWeights});
    }

    onCardSelected(card) {
        if (this.state.selectedCards.length > 5) return;
        let cards = this.state.selectedCards.slice();
        let index = this.state.selectedCards.findIndex((c) => c.id === card.id);

        if (index > -1) {
            cards[index] = card;
        } else {
            cards.push(card);
        }

        this.setState({selectedCards:cards});
    }

    onCardRemoved(card) {
        if (this.state.selectedCards.length === 1) return;
        let cards = this.state.selectedCards.slice();
        let cardIndex = cards.findIndex((c) => c.id === card.id);
        cards.splice(cardIndex, 1);
        this.setState({selectedCards:cards});
    }

    onCardsChanged(filteredCards) {
        // Jika kita berada di tab collection dan filterOwned aktif, kita perlu memfilter lebih lanjut
        // untuk hanya menampilkan kartu dengan uncap level yang sesuai
        if (this.state.activeTab === 'collection' && this.state.filterSettings.filterOwned) {
            // Filter kartu berdasarkan uncap level yang dimiliki
            const ownedFilteredCards = filteredCards.filter(card => {
                // Cek apakah kartu dimiliki
                const isOwned = this.state.ownedCards[card.id] !== undefined;
                if (!isOwned) return false;
                if(this.state.filterSettings.showOnlyOwned)return true;
                
                // Cek apakah uncap level sesuai dengan yang dimiliki
                return card.limit_break === this.state.ownedCards[card.id];
            });
            
            //console.log(`App: After owned filter, showing ${ownedFilteredCards.length} cards out of ${filteredCards.length}`);
            this.setState({ availableCards: ownedFilteredCards });
        } else {
            // Update the available cards with the filtered cards from the Filters component
            this.setState({ availableCards: filteredCards });
        }
    }

    onLoadPreset(presetCards) {
        let selectedCards = [];
        for(let i = 0; i < presetCards.length; i++) {
            selectedCards.push(cards.find((c) => c.id === presetCards[i] && c.limit_break === 4));
        }
        this.setState({selectedCards:selectedCards});
    }
    
    onOwnedCardsChange = (ownedCards) => {
        // Update the state with the new owned cards
        this.setState({ ownedCards }, () => {
            // After state update, update available cards
            this.updateAvailableCards();
        });
        
        // Save to localStorage
        localStorage.setItem('ownedCards', JSON.stringify(ownedCards));
    }
    
    // Filter cards based on rarity and active tab - uses the imported filterCards function
    filterCards(allCards, filterSettings, ownedCards, activeTab = 'filters') {
        return filterCards(allCards, filterSettings, ownedCards, activeTab);
    }
    
    
    // Update available cards based on current filter settings and owned cards
    updateAvailableCards() {
        // Get the filtered cards based on current filter settings, owned cards, and active tab
        const filteredCards = this.filterCards(cards, this.state.filterSettings, this.state.ownedCards, this.state.activeTab);
        
        // Log the update for debugging
        //console.log(`App: Updating tier list with ${filteredCards.length} filtered cards, activeTab: ${this.state.activeTab}`);
        
        // Update the state with the new filtered cards
        this.setState({ availableCards: filteredCards }, () => {
            // Log confirmation after state update
            //console.log('App: Tier list updated successfully');
        });
    }
    
    componentDidMount() {
        // Apply initial filtering after component mounts and set initial availableCards
        const filteredCards = this.filterCards(cards, this.state.filterSettings, this.state.ownedCards, this.state.activeTab);
        this.setState({ availableCards: filteredCards });
    }
    
    // Handle tab change
    handleTabChange(tabId) {
        // Update the active tab
        this.setState({ activeTab: tabId }, () => {
            // Update available cards based on the new active tab
            this.updateAvailableCards();
            
            //console.log('Tab changed to', tabId, 'updating tier list');
        });
    }
    
    handleRarityFilterChange(raritySettings) {
        //console.log('App: Received rarity filter change:', raritySettings);
        
        // Create a completely new filterSettings object to avoid state mutation issues
        const newFilterSettings = {
            ...this.state.filterSettings,
            ssr: [...raritySettings.ssr],
            sr: [...raritySettings.sr],
            r: [...raritySettings.r]
        };
        
        // Update state with the new filter settings
        this.setState({
            filterSettings: newFilterSettings
        }, () => {
            // After state update, update available cards
            //console.log('App: Updating tier list after rarity filter change');
            this.updateAvailableCards();
        });
    }
    
    handleOwnedFilterChange(ownedFilterSettings) {
        this.setState(prevState => ({
            filterSettings: {
                ...prevState.filterSettings,
                ...ownedFilterSettings
            }
        }), () => {
            // After state update, update available cards
            this.updateAvailableCards();
        });
    }

    // All tier list updates are now handled dynamically through state changes
    
    render() {
    // We'll use the availableCards state that's updated by updateAvailableCards()
    // No need to filter cards here as it's already handled by state updates
    
    return (
            <div className="App">
                <Header />
                
                <Weights
                    onChange={this.onWeightsChanged}
                />
                
                <SelectedCards
                    selectedCards={this.state.selectedCards}
                    onClick={this.onCardRemoved}
                    onLoadPreset={this.onLoadPreset}
                    weights={this.state.weights}
                />
                
                <CardFiltersSection 
                    activeTab={this.state.activeTab}
                    onTabChange={this.handleTabChange}
                    filterSettings={this.state.filterSettings}
                    onRarityFilterChange={this.handleRarityFilterChange}
                    onOwnedFilterChange={this.handleOwnedFilterChange}
                    ownedCards={this.state.ownedCards}
                    onOwnedCardsChange={this.onOwnedCardsChange}
                    onCardsChanged={this.onCardsChanged}
                />
                
                <TierList 
                    cards={this.state.availableCards}
                    weights={this.state.weights}
                    selectedCards={this.state.selectedCards}
                    cardSelected={this.onCardSelected}
                />
            </div>
        );
    }
}

export default App;
