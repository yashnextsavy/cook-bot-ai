
import React, { useState } from 'react';

export default function ShoppingList({ recipe }) {
  const [items, setItems] = useState([]);
  const [checked, setChecked] = useState({});

  const parseIngredients = (recipeText) => {
    const lines = recipeText.split('\n');
    const ingredients = lines.filter(line => 
      line.includes('•') || line.includes('-') || line.includes('*')
    );
    return ingredients.map(i => i.replace(/[•\-*]/g, '').trim());
  };

  useState(() => {
    if (recipe) {
      setItems(parseIngredients(recipe));
    }
  }, [recipe]);

  const toggleItem = (index) => {
    setChecked(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="shopping-list">
      <h3>Shopping List</h3>
      <div className="ingredients-list">
        {items.map((item, index) => (
          <div key={index} className="ingredient-item" onClick={() => toggleItem(index)}>
            <input
              type="checkbox"
              checked={checked[index] || false}
              onChange={() => toggleItem(index)}
            />
            <span className={checked[index] ? 'checked' : ''}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
