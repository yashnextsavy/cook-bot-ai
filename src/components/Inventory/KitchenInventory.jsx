import { useState, useEffect } from "react";
import { useAuthState } from "../../context/AuthContext";
import { db } from "../../firebase";
import { collection, addDoc, deleteDoc, doc, query, where, getDocs } from "firebase/firestore";
import "./KitchenInventory.css";
import Loader from "../Loader/Loader";

export default function KitchenInventory() {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("pieces");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuthState();

  useEffect(() => {
    if (user) {
      loadIngredients();
    }
  }, [user]);

  const loadIngredients = async () => {
    setIsLoading(true);
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
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const addIngredient = async () => {
    if (!newIngredient.trim()) return;
    setIsAdding(true);

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

    setIsAdding(false);
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

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="saved-recipes-container">
      <div className="inventory-banner">
        <div className="banner-overlay"></div>
        <div className="inventory-header">
          <h1>Kitchen Inventory </h1>
          <p>Keep track of your ingredients and never run out of essentials</p>
        </div>
      </div>


      <div className="inventory-container">
        <div className="add-ingredient-form">
          <input
            type="text"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            placeholder="Add ingredient..."
            className="ingredient-input"
            disabled={isAdding}
          />
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qty"
            className="quantity-input"
            disabled={isAdding}
          />
          <div className="unit-select-wrapper">
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="unit-select"
              disabled={isAdding}
            >
              <optgroup label="Count-Based Units">
                <option value="pieces">Pieces</option>
                <option value="slices">Slices</option>
                <option value="bunch">Bunch</option>
                <option value="stalk">Stalk</option>
                <option value="cloves">Cloves</option>
                <option value="pinch">Pinch</option>
                <option value="dash">Dash</option>
              </optgroup>
              <optgroup label="Weight Units">
                <option value="grams">Grams (g)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="mg">Milligrams (mg)</option>
                <option value="lb">Pounds (lb)</option>
                <option value="oz">Ounces (oz)</option>
              </optgroup>
              <optgroup label="Volume Units">
                <option value="ml">Milliliters (ml)</option>
                <option value="l">Liters (L)</option>
                <option value="tsp">Teaspoons (tsp)</option>
                <option value="tbsp">Tablespoons (tbsp)</option>
                <option value="cups">Cups</option>
                <option value="quart">Quart (qt)</option>
                <option value="gallon">Gallon (gal)</option>
              </optgroup>
            </select>

          </div>
          <button
            onClick={addIngredient}
            className="add-btn"
            disabled={isAdding}
          >
            {isAdding ? "Adding..." : "Add"}
          </button>
        </div>

        <div className="ingredients-list">
          {ingredients.length > 0 ? (
            ingredients.map(ing => (
              <div key={ing.id} className="ingredient-item" data-id={ing.id}>
                <span>{ing.name} - {ing.quantity} {ing.unit}</span>
                <button
                  onClick={() => removeIngredient(ing.id)}
                  className="remove-btn"
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <p className="loading-text">No ingredients added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
