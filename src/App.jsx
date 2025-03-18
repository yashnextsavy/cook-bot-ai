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
import { saveRecipe } from "./services/recipeService";
import "./App.css";

// Main recipe generator component
function RecipeGenerator() {
  const [prompt, setPrompt] = useState("");
  const [recipe, setRecipe] = useState(null);
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
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "Recipe Generator",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-pro-exp-02-05:free",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful cooking assistant that provides detailed recipes. Format your response in markdown with clear ingredients list and step-by-step instructions. Use headings, bullet points, and other markdown formatting to make the recipe easy to read.",
              },
              { role: "user", content: `Generate a recipe for: ${prompt}` },
            ],
          }),
        },
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "Something went wrong");
      }

      setRecipe(data.choices[0].message.content);
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
    <main className="recipe-container">
      <div className="header-row">
        <h1>🍽️ AI Recipe Generator</h1>
        <div className="header-controls">
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
      <p className="intro">
        Enter ingredients, cuisine type, or any recipe idea to get started!
      </p>

      <div className="input-container">
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
        <button
          onClick={generateRecipe}
          disabled={loading || !prompt.trim()}
          className="generate-btn"
        >
          {loading ? "👩‍🍳 Cooking..." : "👩‍🍳 Generate Recipe"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {saveSuccess && (
        <div className="success-message">✅ Recipe saved successfully!</div>
      )}

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
    </main>
  );
}

// Navbar component
function Navbar() {
  const { user } = useAuthState();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          RecipeAI 🍽️
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          {user ? (
            <>
              <Link to="/saved-recipes" className="nav-link">
                Saved Recipes
              </Link>
              <Link to="/profile" className="nav-link">
                Profile
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
