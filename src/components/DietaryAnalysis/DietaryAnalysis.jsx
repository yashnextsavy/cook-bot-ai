
import React from 'react';

const DietaryAnalysis = ({ recipe }) => {
  const analyzeNutrition = (recipe) => {
    // Simple nutrition analysis based on recipe content
    const nutritionMatch = recipe.match(/Nutrition per serving:([^]*?)(?=\n\n|\n#|$)/i);
    return nutritionMatch ? nutritionMatch[1].trim() : null;
  };

  const checkAllergens = (recipe) => {
    const commonAllergens = {
      'nuts': ['nuts', 'almonds', 'peanuts', 'cashews', 'walnuts'],
      'dairy': ['milk', 'cream', 'cheese', 'butter', 'yogurt'],
      'eggs': ['egg', 'eggs'],
      'gluten': ['flour', 'wheat', 'bread', 'pasta'],
      'soy': ['soy', 'tofu', 'soya'],
      'shellfish': ['shrimp', 'crab', 'lobster', 'shellfish'],
      'fish': ['fish', 'salmon', 'tuna']
    };

    const foundAllergens = [];
    for (const [allergen, keywords] of Object.entries(commonAllergens)) {
      if (keywords.some(keyword => recipe.toLowerCase().includes(keyword))) {
        foundAllergens.push(allergen);
      }
    }
    return foundAllergens;
  };

  const checkDietaryCompliance = (recipe) => {
    const diets = {
      'keto': {
        allowed: ['meat', 'fish', 'eggs', 'cheese', 'butter', 'oil'],
        restricted: ['sugar', 'flour', 'bread', 'pasta', 'rice']
      },
      'paleo': {
        allowed: ['meat', 'fish', 'eggs', 'vegetables', 'nuts', 'seeds'],
        restricted: ['dairy', 'grains', 'sugar', 'processed']
      },
      'vegan': {
        restricted: ['meat', 'fish', 'eggs', 'dairy', 'honey']
      },
      'vegetarian': {
        restricted: ['meat', 'fish', 'chicken', 'beef', 'pork', 'lamb', 'seafood']
      }
    };

    const compliance = {};
    const recipeLower = recipe.toLowerCase();

    for (const [diet, rules] of Object.entries(diets)) {
      const restrictedIngredients = rules.restricted?.filter(item => 
        recipeLower.includes(item)
      );
      compliance[diet] = restrictedIngredients.length === 0;
    }

    return compliance;
  };

  if (!recipe) return null;

  const nutrition = analyzeNutrition(recipe);
  const allergens = checkAllergens(recipe);
  const dietaryCompliance = checkDietaryCompliance(recipe);

  return (
    <div className="dietary-analysis">
      <h3>🍽️ Dietary Analysis</h3>
      <div className="analysis-content">
        {nutrition && (
          <div className="nutrition-info">
            <h4>📊 Nutritional Information</h4>
            <p>{nutrition}</p>
          </div>
        )}
        
        <div className="allergens">
          <h4>Allergen Warnings</h4>
          {allergens.length > 0 ? (
            <ul>
              {allergens.map((allergen) => (
                <li key={allergen}>{allergen}</li>
              ))}
            </ul>
          ) : (
            <p>No common allergens detected</p>
          )}
        </div>

        <div className="dietary-info">
          <h4>Diet Compliance</h4>
          <ul>
            {Object.entries(dietaryCompliance).map(([diet, compliant]) => (
              <li key={diet}>
                {diet.charAt(0).toUpperCase() + diet.slice(1)}: {compliant ? '✅' : '❌'}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DietaryAnalysis;
