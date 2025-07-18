/**
 * Umamusume Character Translation Utility
 * 
 * A simplified tool to manage character name translations
 * - View translation status
 * - Add new translations
 * - Apply translations to cards.js
 */

const fs = require('fs');
const path = require('path');

// Path to the files
const translationDictPath = path.join(__dirname, 'character-translations.json');
const cardsFilePath = path.join(__dirname, 'src', 'cards.js');
const translatedCardsPath = path.join(__dirname, 'src', 'cards-translated.js');

// Function to read the cards.js file content
function readCardsFile() {
  const content = fs.readFileSync(cardsFilePath, 'utf8');
  // Extract the array part from the file
  const match = content.match(/const cards = (\[.*\]);/s);
  if (!match) {
    throw new Error('Could not find cards array in the file');
  }
  return JSON.parse(match[1]);
}

// Function to update the translation dictionary with new translations
function updateTranslationDictionary(newTranslations) {
  // Read the existing dictionary or create a new one if it doesn't exist
  let translations = {};
  try {
    if (fs.existsSync(translationDictPath)) {
      translations = JSON.parse(fs.readFileSync(translationDictPath, 'utf8'));
    }
  } catch (error) {
    ////console.log('Creating new translation dictionary');
  }
  
  // Update with new translations
  Object.keys(newTranslations).forEach(key => {
    translations[key] = newTranslations[key];
  });
  
  // Save the updated dictionary
  fs.writeFileSync(translationDictPath, JSON.stringify(translations, null, 2));
  ////console.log(`Translation dictionary updated with ${Object.keys(newTranslations).length} new translations`);
  
  return translations;
}

// Function to apply translations to cards.js and create cards-translated.js
function applyTranslations(translations) {
  // Read the cards from the original file
  const cards = readCardsFile();
  
  // Apply translations
  const translatedCards = cards.map(card => {
    const japName = card.char_name;
    const engName = translations[japName] || japName; // Use Japanese name as fallback
    
    return {
      ...card,
      char_name_en: engName
    };
  });
  
  // Read the original file content to preserve structure
  const originalContent = fs.readFileSync(cardsFilePath, 'utf8');
  
  // Create the new file content
  const newFileContent = originalContent.replace(
    /const cards = \[.*\];/s,
    `const cards = ${JSON.stringify(translatedCards, null, 2)};`
  ) + '\n\nexport default cards;';
  
  // Save to the translated file
  fs.writeFileSync(translatedCardsPath, newFileContent);
  
  ////console.log('Translation applied and saved to src/cards-translated.js');
  ////console.log(`Added English names for ${Object.keys(translations).filter(k => translations[k]).length} characters`);
}

// Function to show translation status
function showTranslationStatus() {
  // Read the existing dictionary
  let translations = {};
  try {
    if (fs.existsSync(translationDictPath)) {
      translations = JSON.parse(fs.readFileSync(translationDictPath, 'utf8'));
    }
  } catch (error) {
    ////console.log('No translation dictionary found');
    return;
  }
  
  // Get all unique character names from cards.js
  const cards = readCardsFile();
  const uniqueNames = [...new Set(cards.map(card => card.char_name))];
  
  // Count translated names
  const translatedCount = Object.keys(translations).filter(k => translations[k]).length;
  
  ////console.log(`\nTranslation status: ${translatedCount}/${uniqueNames.length} characters translated`);
  
  // Show untranslated names
  const untranslated = uniqueNames.filter(name => !translations[name] || translations[name] === '');
  if (untranslated.length > 0) {
    ////console.log('\nUntranslated character names:');
    untranslated.forEach(name => ////console.log(`- "${name}"`));
  }
}

// Main function to process command line arguments
function main() {
  const args = process.argv.slice(2);
  
  // If no arguments, show help and status
  if (args.length === 0) {
    ////console.log('Umamusume Character Translation Utility');
    ////console.log('--------------------------------------');
    ////console.log('Commands:');
    ////console.log('  status                   - Show translation status');
    ////console.log('  apply                    - Apply translations to cards.js');
    ////console.log('  add [Japanese] [English] - Add new translation');
    ////console.log('\nExamples:');
    ////console.log('  node translation-utility.js status');
    ////console.log('  node translation-utility.js apply');
    ////console.log('  node translation-utility.js add "ウマ娘" "Uma Musume"');
    
    showTranslationStatus();
    return;
  }
  
  // Process commands
  const command = args[0];
  
  if (command === 'status') {
    showTranslationStatus();
  } 
  else if (command === 'apply') {
    try {
      const translations = JSON.parse(fs.readFileSync(translationDictPath, 'utf8'));
      applyTranslations(translations);
    } catch (error) {
      console.error('Error applying translations:', error);
    }
  } 
  else if (command === 'add') {
    if (args.length >= 3 && args.length % 2 === 1) {
      const translations = {};
      for (let i = 1; i < args.length; i += 2) {
        translations[args[i]] = args[i + 1];
      }
      const updatedTranslations = updateTranslationDictionary(translations);
      applyTranslations(updatedTranslations);
    } else {
      ////console.log('Error: Invalid number of arguments for "add" command');
      ////console.log('Usage: node translation-utility.js add [Japanese] [English] ...');
    }
  }
  else {
    ////console.log(`Unknown command: ${command}`);
  }
}

// Run the main function
main();
