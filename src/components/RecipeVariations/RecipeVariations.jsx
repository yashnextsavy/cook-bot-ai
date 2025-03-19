
import React from 'react';

const RecipeVariations = ({ onVariationClick, servings, onServingsChange }) => {
  const variations = [
    { name: 'Make Spicier 🌶️', prompt: 'make this recipe spicier' },
    { name: 'Make Healthier 🥗', prompt: 'make this recipe healthier' },
    { name: 'Quick Version ⚡', prompt: 'create a quicker version of this recipe' }
  ];

  return (
    <div className="recipe-customize">
      <div className="recipe-variations">
        <h4>Recipe Variations</h4>
        <div className="variation-buttons">
          {variations.map((variation) => (
            <button
              key={variation.name}
              onClick={() => onVariationClick(variation.prompt)}
              className="variation-btn"
            >
              {variation.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="servings-adjuster">
        <h4>Adjust Servings</h4>
        <div className="servings-controls">
          <button 
            onClick={() => onServingsChange(Math.max(1, servings - 1))}
            className="servings-btn"
          >
            -
          </button>
          <span>{servings} servings</span>
          <button 
            onClick={() => onServingsChange(servings + 1)}
            className="servings-btn"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeVariations;
