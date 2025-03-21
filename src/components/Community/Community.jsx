import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

import "./Community.css";
import RecipeCard from "../RecipeCard/RecipeCard";

export default function Community() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      const recipeList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipes(recipeList);
    };

    fetchRecipes();
  }, []);

  return (
    <div className="community-container-wrapper">
      <div className="saved-recipes-banner">
        <div className="banner-overlay"></div>
        <div className="saved-recipes-header">
          <h1>Community Recipes</h1>
          <p>Your personal collection of culinary inspirations</p>
        </div>
      </div>
      <div className="community-container">


        <div className="community-recipe-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </div>
  );
}
