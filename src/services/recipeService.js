import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';

// Save a recipe to Firestore
export const saveRecipe = async (userId, recipeContent) => {
  try {
    const recipeData = {
      userId,
      content: recipeContent,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "recipes"), recipeData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving recipe:", error);
    throw error;
  }
};

// Get all saved recipes for a user
export const getSavedRecipes = async (userId) => {
  try {
    const recipesQuery = query(
      collection(db, "recipes"), 
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(recipesQuery);

    const recipes = [];
    querySnapshot.forEach((doc) => {
      recipes.push({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamp to JavaScript Date
        createdAt: doc.data().createdAt?.toMillis() || Date.now()
      });
    });

    // Sort by createdAt in descending order (newest first)
    return recipes.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error getting saved recipes:", error);
    throw error;
  }
};

// Delete a recipe
export const deleteRecipe = async (userId, recipeId) => {
  try {
    // For security, first verify that the recipe belongs to the user
    const recipesQuery = query(
      collection(db, "recipes"),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(recipesQuery);
    let found = false;

    querySnapshot.forEach((document) => {
      if (document.id === recipeId) {
        found = true;
      }
    });

    if (!found) {
      throw new Error("Recipe not found or you don't have permission to delete it");
    }

    // Delete the recipe
    await deleteDoc(doc(db, "recipes", recipeId));
    return true;
  } catch (error) {
    console.error("Error deleting recipe:", error);
    throw error;
  }
};