
import { useState, useEffect } from "react";
import { useAuthState } from "../../context/AuthContext";
import "./KitchenInventory.css";

export default function KitchenInventory() {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("pieces");
  const { user } = useAuthState();

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([
        ...ingredients,
        { name: newIngredient, quantity, unit, id: Date.now() }
      ]);
      setNewIngredient("");
      setQuantity("");
    }
  };

  const removeIngredient = (id) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  return (
    <div className="inventory-container">
      <h2>Kitchen Inventory 🥘</h2>
      <div className="add-ingredient-form">
        <input
          type="text"
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          placeholder="Add ingredient..."
          className="ingredient-input"
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qty"
          className="quantity-input"
        />
        <select 
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="unit-select"
        >
          <option value="pieces">pieces</option>
          <option value="grams">grams</option>
          <option value="cups">cups</option>
          <option value="tbsp">tbsp</option>
        </select>
        <button onClick={addIngredient} className="add-btn">Add</button>
      </div>

      <div className="ingredients-list">
        {ingredients.map(ing => (
          <div key={ing.id} className="ingredient-item">
            <span>{ing.name} - {ing.quantity} {ing.unit}</span>
            <button 
              onClick={() => removeIngredient(ing.id)}
              className="remove-btn"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
