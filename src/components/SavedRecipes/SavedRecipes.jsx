
import { useState, useEffect } from 'react';
import { useAuthState } from '../../context/AuthContext';
import { getSavedRecipes, deleteRecipe } from '../../services/recipeService';
import ReactMarkdown from 'react-markdown';
import './SavedRecipes.css';

export default function SavedRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthState();

  useEffect(() => {
    async function fetchRecipes() {
      if (!user) return;
      
      try {
        setLoading(true);
        const userRecipes = await getSavedRecipes(user.uid);
        setRecipes(userRecipes);
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setError("Failed to load your saved recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [user]);

  const handleDeleteRecipe = async (recipeId) => {
    try {
      await deleteRecipe(user.uid, recipeId);
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    } catch (err) {
      console.error("Error deleting recipe:", err);
      setError("Failed to delete recipe. Please try again.");
    }
  };

  if (loading) {
    return <div className="loading">Loading saved recipes...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="saved-recipes-container">
      <div className="saved-recipes-header">
        <h1>Your Saved Recipes</h1>
      </div>
      
      {recipes.length === 0 ? (
        <div className="no-recipes">
          <p>You haven't saved any recipes yet.</p>
          <p>Generate some delicious recipes and save them to see them here!</p>
        </div>
      ) : (
        <div className="recipes-grid">
          {recipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <div className="recipe-card-content">
                <ReactMarkdown>{recipe.content}</ReactMarkdown>
              </div>
              <div className="recipe-card-actions">
                <span className="recipe-date">
                  Saved on: {new Date(recipe.createdAt).toLocaleDateString()}
                </span>
                <button 
                  className="delete-recipe-btn" 
                  onClick={() => handleDeleteRecipe(recipe.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
