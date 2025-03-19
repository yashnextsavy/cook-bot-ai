import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { AuthProvider, useAuthState } from "./context/AuthContext";
import ReactMarkdown from "react-markdown";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Login from "./components/Auth/Login";
import SavedRecipes from "./components/SavedRecipes/SavedRecipes";
import UserProfile from "./components/Profile/UserProfile";
import KitchenInventory from "./components/Inventory/KitchenInventory";
import { saveRecipe } from "./services/recipeService";
import "./App.css";

// Main recipe generator component
function RecipeGenerator() {
  const [prompt, setPrompt] = useState("");
  const [servings, setServings] = useState(4);
  const [recipe, setRecipe] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dietPreference, setDietPreference] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { user } = useAuthState();

  useEffect(() => {
    // Apply theme class to the body
    if (darkMode) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [darkMode]);

  const generateRecipe = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY || ""}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "Recipe Generator",
          },
          body: JSON.stringify({
            model: "google/learnlm-1.5-pro-experimental:free",
            messages: [
              {
                role: "system",
                content:
                  "You are an experienced and knowledgeable chef and cooking assistant. Provide high-quality, detailed recipes with step-by-step instructions, ensuring clarity and ease of preparation for all skill levels. \n\n### Formatting Requirements:\n- **Recipe Title**\n- **Category Tags** (e.g., Breakfast, Lunch, Dinner, Dessert, Snack, etc.)\n- **Ingredients List** (Only use ingredients that are commonly available in India)\n- **Step-by-Step Instructions**\n- **Nutritional Information per Serving** (Calories, Protein, Carbs, Fat)\n- **Recipe Variations** (e.g., alternative ingredients, different preparation methods)\n- **Allergen Warnings** (mention potential allergens like nuts, dairy, gluten, etc.)\n- **Diet Compliance** (e.g., Vegan, Vegetarian, Keto, Gluten-Free, etc.)\n\nUse **markdown formatting** for readability, including headings, bullet points, and bold text where appropriate.",
              },
              {
                role: "user",
                content: `Generate a high-quality recipe for: **${prompt}**.\n\n- **Serving Size:** ${servings || 4} servings\n- **Dietary Preference:** ${dietPreference ? `Strictly ${dietPreference}` : "No specific preference"}\n- **Use only ingredients commonly found in India.**\n- **Ensure easy-to-follow instructions and well-organized formatting.**`,
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "Something went wrong");
      }
      console.log("data, data, data", data);
      const generatedRecipe = data.choices[0].message.content;

      setRecipe(generatedRecipe);
    } catch (err) {
      console.error("Error generating recipe:", err);
      setError(err.message || "Failed to generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!user) {
      setError("Please log in to save recipes");
      return;
    }

    try {
      setSavingRecipe(true);
      await saveRecipe(user.uid, recipe);
      setSaveSuccess(true);
      // Reset success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save the recipe. Please try again.");
      console.error("Save recipe error:", err);
    } finally {
      setSavingRecipe(false);
    }
  };

  const handlePrintRecipe = () => {
    window.print();
  };

  return (
    <main className="recipe-page-wrapper">
      <div className="recipe-container">
        <div className="header-row">
          <h1>AI Recipe Generator</h1>

        </div>
        <p className="intro">
          Enter your ingredients or desired dish to generate a recipe
        </p>

        <div className="filters-container">
          <div className="category-filters">
            <button
              className={`category-btn ${!selectedCategory ? "active" : ""}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
            {["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"].map(
              (category) => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ),
            )}
          </div>
          <div className="diet-filters">
            <button
              className={`category-btn ${!dietPreference ? "active" : ""}`}
              onClick={() => setDietPreference(null)}
            >
              All Diets
            </button>
            {[
              { name: "Vegetarian", icon: "🥕" },
              { name: "Vegan", icon: "🌱" },
              { name: "Non-Veg", icon: "🍖" },
            ].map((diet) => (
              <button
                key={diet.name}
                className={`category-btn ${dietPreference === diet.name ? "active" : ""}`}
                onClick={() => setDietPreference(diet.name)}
              >
                {diet.icon} {diet.name}
              </button>
            ))}
          </div>
        </div>


        <div className="input-container">

          <div className="input-group glass-input">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., 🍝 pasta with mushrooms, 🌮 vegan tacos, 🍳 quick breakfast..."
              className="recipe-input"
              onKeyDown={(e) =>
                e.key === "Enter" && prompt.trim() && generateRecipe()
              }
            />
          </div>
          <div className="serving-adjuster-and-button-wrapper">
            <div className="servings-adjuster">
              <div className="servings-controls">
                <button
                  className="servings-btn"
                  onClick={() => setServings((prev) => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <span>{servings} servings</span>
                <button
                  className="servings-btn"
                  onClick={() => setServings((prev) => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={generateRecipe}
              disabled={loading || !prompt.trim()}
              className="generate-btn"
            >
              {loading ? "👩‍🍳 Cooking..." : "Generate Recipe"}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {saveSuccess && (
          <div className="success-message">✅ Recipe saved successfully!</div>
        )}
      </div>
      <div className="recipe-response-container">
        {recipe && !loading && (
          <div className="recipe-result">
            <h2>Your Delicious Recipe 🍽️</h2>
            <div className="recipe-content">
              <ReactMarkdown>{recipe}</ReactMarkdown>
            </div>
            <div className="recipe-actions">
              <button
                className="save-recipe-btn"
                onClick={handleSaveRecipe}
                disabled={savingRecipe || !user}
              >
                {savingRecipe ? "💾 Saving..." : "💾 Save Recipe"}
              </button>
              <button className="print-recipe-btn" onClick={handlePrintRecipe}>
                🖨️ Print/PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Navbar component
function Navbar() {
  const { user } = useAuthState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          {/* <img
            src="/smartchef-logo.png"
            alt="SmartChef Studio"
            className="nav-logo-img"
          /> */}
          SmartChef Studio
        </Link>
        <div
          className={`nav-overlay ${isMenuOpen ? "active" : ""}`}
          onClick={closeMenu}
        ></div>
        <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Home
          </Link>
          {user ? (
            <>
              <Link
                to="/saved-recipes"
                className="nav-link"
                onClick={closeMenu}
              >
                Saved Recipes
              </Link>
              <Link to="/profile" className="nav-link" onClick={closeMenu}>
                Profile
              </Link>
              <Link to="/inventory" className="nav-link" onClick={closeMenu}>
                Kitchen Inventory
              </Link>
              <span className="user-greeting">
                👋 Hello, {user.displayName || user.email.split("@")[0]}
              </span>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

// Main App component
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RecipeGenerator />} />
            <Route
              path="/saved-recipes"
              element={
                <ProtectedRoute>
                  <SavedRecipes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <KitchenInventory />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}