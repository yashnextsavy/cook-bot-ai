import React from 'react';

export default function RecipeVariations({ recipe, onVariationSelect }) {
  const variations = {
    vegan: { label: '🌱 Vegan', replacements: { meat: 'tofu', milk: 'almond milk', egg: 'flax egg' } },
    glutenFree: { label: '🌾 Gluten-Free', replacements: { flour: 'almond flour', pasta: 'gluten-free pasta' } },
    lowCarb: { label: '🥑 Low-Carb', replacements: { rice: 'cauliflower rice', potato: 'turnip' } }
  };

  const generateVariation = (type) => {
    let modifiedRecipe = recipe;
    Object.entries(variations[type].replacements).forEach(([original, replacement]) => {
      const regex = new RegExp(original, 'gi');
      modifiedRecipe = modifiedRecipe.replace(regex, replacement);
    });
    onVariationSelect(modifiedRecipe);
  };

  return (
    <div className="recipe-variations">
      <h3>Recipe Variations</h3>
      <div className="variation-buttons">
        {Object.entries(variations).map(([key, variation]) => (
          <button
            key={key}
            onClick={() => generateVariation(key)}
            className="variation-btn"
          >
            {variation.label}
          </button>
        ))}
      </div>
    </div>
  );
}