import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { AuthProvider, useAuthState } from "./context/AuthContext";
import ReactMarkdown from "react-markdown";
import gsap from "gsap";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Login from "./components/Auth/Login";
import SavedRecipes from "./components/SavedRecipes/SavedRecipes";
import UserProfile from "./components/Profile/UserProfile";
import KitchenInventory from "./components/Inventory/KitchenInventory";
import { saveRecipe } from "./services/recipeService";
import "./App.css";

function RecipeGenerator() {
  const [prompt, setPrompt] = useState("");
  const [servings, setServings] = useState(4);
  const [recipe, setRecipe] = useState(null);
  const [selectedCuisine, setSelectedCuisine] = useState('any');
  const [dietPreference, setDietPreference] = useState('any');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { user } = useAuthState();

  const mainRef = useRef(null);
  const containerRef = useRef(null);
  const resultRef = useRef(null);

  const cuisineTypes = [
    'any', 'italian', 'mexican', 'indian', 'chinese', 'japanese', 
    'thai', 'mediterranean', 'american', 'french'
  ];

  const difficultyLevels = [
    'any', 'easy', 'medium', 'hard'
  ];

  const dietaryOptions = [
    'any', 'vegetarian', 'vegan', 'keto', 'paleo'
  ];

  useEffect(() => {
    if (mainRef.current && containerRef.current) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();
        tl.from(mainRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power3.out"
        })
        .from(containerRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: "power3.out"
        }, "-=0.4");
      });

      return () => ctx.revert();
    }
  }, []);

  useEffect(() => {
    if (recipe && resultRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(resultRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power3.out"
        });
      });

      return () => ctx.revert();
    }
  }, [recipe]);

  const generateRecipe = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API key is not configured");
      }

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
            model: "google/learnlm-1.5-pro-experimental:free",
            messages: [
              {
                role: "system",
                content: "You are an experienced chef and cooking assistant. Provide detailed recipes with step-by-step instructions.",
              },
              {
                role: "user",
                content: `Generate a recipe for: ${prompt}\nServings: ${servings}\nCuisine: ${selectedCuisine}\nDiet: ${dietPreference}`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      setRecipe(data.choices[0].message.content);
    } catch (err) {
      setError(err.message || "Failed to generate recipe");
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
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save recipe");
    } finally {
      setSavingRecipe(false);
    }
  };

  return (
    <main className="recipe-page" ref={mainRef}>
      <div className="recipe-container glass" ref={containerRef}>
        <h1 className="title">Recipe Generator</h1>

        <div className="search-section">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What would you like to cook?"
            className="search-input"
            onKeyDown={(e) => e.key === "Enter" && generateRecipe()}
          />

          <div className="controls">
            <div className="servings-control">
              <button onClick={() => setServings(prev => Math.max(1, prev - 1))}>-</button>
              <span>{servings} servings</span>
              <button onClick={() => setServings(prev => prev + 1)}>+</button>
            </div>

            <select 
              className="filter-select"
              value={selectedCuisine} 
              onChange={e => setSelectedCuisine(e.target.value)}
            >
              <option value="any">Any Cuisine</option>
              {cuisineTypes.filter(cuisine => cuisine !== 'any').map(cuisine => (
                <option key={cuisine} value={cuisine}>
                  {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                </option>
              ))}
            </select>

            <select 
              className="filter-select"
              value={dietPreference} 
              onChange={e => setDietPreference(e.target.value)}
            >
              <option value="any">Any Diet</option>
              {dietaryOptions.filter(option => option !== 'any').map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>


            <button 
              className="generate-btn"
              onClick={generateRecipe}
              disabled={loading || !prompt.trim()}
            >
              {loading ? "Generating..." : "Generate Recipe"}
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {saveSuccess && <div className="success">Recipe saved!</div>}

        {recipe && (
          <div className="recipe-result glass" ref={resultRef}>
            <div className="recipe-content">
              <ReactMarkdown>{recipe}</ReactMarkdown>
            </div>

            <div className="action-buttons">
              <button
                className="save-btn"
                onClick={handleSaveRecipe}
                disabled={savingRecipe || !user}
              >
                {savingRecipe ? "Saving..." : "Save Recipe"}
              </button>
              <button
                className="print-btn"
                onClick={() => window.print()}
              >
                Print Recipe
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Navbar() {
  const { user } = useAuthState();
  const navRef = useRef(null);

  useEffect(() => {
    if (navRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(navRef.current, {
          y: -50,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out"
        });
      });

      return () => ctx.revert();
    }
  }, []);

  return (
    <nav className="navbar glass" ref={navRef}>
      <Link to="/" className="logo">SmartChef</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/saved-recipes">Saved</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/inventory">Inventory</Link>
            <button onClick={() => signOut(auth)} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
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