
import { useState, useEffect } from "react";
import { useAuthState } from "../../context/AuthContext";
import { db } from "../../firebase";
import { collection, addDoc, deleteDoc, doc, query, where, getDocs } from "firebase/firestore";
import "./KitchenInventory.css";

export default function KitchenInventory() {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("pieces");
  const { user } = useAuthState();

  useEffect(() => {
    if (user) {
      loadIngredients();
    }
  }, [user]);

  const loadIngredients = async () => {
    try {
      const q = query(collection(db, "ingredients"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const loadedIngredients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIngredients(loadedIngredients);
    } catch (error) {
      console.error("Error loading ingredients:", error);
    }
  };

  const addIngredient = async () => {
    if (!newIngredient.trim()) return;

    try {
      const ingredientData = {
        name: newIngredient,
        quantity,
        unit,
        userId: user.uid,
        createdAt: new Date()
      };

      await addDoc(collection(db, "ingredients"), ingredientData);
      await loadIngredients();
      setNewIngredient("");
      setQuantity("");
    } catch (error) {
      console.error("Error adding ingredient:", error);
    }
  };

  const removeIngredient = async (id) => {
    try {
      const element = document.querySelector(`[data-id="${id}"]`);
      element.classList.add('vanish');
      await new Promise(resolve => setTimeout(resolve, 300));
      await deleteDoc(doc(db, "ingredients", id));
      await loadIngredients();
    } catch (error) {
      console.error("Error removing ingredient:", error);
    }
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
          <div key={ing.id} className="ingredient-item" data-id={ing.id}>
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
