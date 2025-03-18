
import React from 'react';

export default function DietaryAnalysis({ recipe }) {
  const analyzeRecipe = () => {
    const analysis = {
      allergens: [],
      dietaryInfo: []
    };
    
    const allergens = ['nuts', 'peanuts', 'dairy', 'egg', 'soy', 'wheat', 'shellfish'];
    
    allergens.forEach(allergen => {
      if (recipe?.toLowerCase().includes(allergen)) {
        analysis.allergens.push(allergen);
      }
    });

    if (!recipe?.toLowerCase().includes('meat') && !recipe?.toLowerCase().includes('fish')) {
      analysis.dietaryInfo.push('vegetarian-friendly');
    }
    if (!recipe?.toLowerCase().includes('dairy') && !recipe?.toLowerCase().includes('egg')) {
      analysis.dietaryInfo.push('vegan-friendly');
    }

    return analysis;
  };

  const analysis = recipe ? analyzeRecipe() : { allergens: [], dietaryInfo: [] };

  return (
    <div className="dietary-analysis">
      <h3>Dietary Analysis</h3>
      <div className="analysis-content">
        <div className="allergens">
          <h4>Allergen Warnings</h4>
          {analysis.allergens.length > 0 ? (
            <ul>
              {analysis.allergens.map((allergen, index) => (
                <li key={index}>Contains {allergen}</li>
              ))}
            </ul>
          ) : (
            <p>No common allergens detected</p>
          )}
        </div>
        <div className="dietary-info">
          <h4>Dietary Information</h4>
          {analysis.dietaryInfo.length > 0 ? (
            <ul>
              {analysis.dietaryInfo.map((info, index) => (
                <li key={index}>{info}</li>
              ))}
            </ul>
          ) : (
            <p>No specific dietary information available</p>
          )}
        </div>
      </div>
    </div>
  );
}
