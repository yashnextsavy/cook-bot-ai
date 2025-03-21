export default function RecipeCard({ recipe }) {
    return (
        <div className="community-recipe-card">
            <img src={recipe.image} alt={recipe.title} className="community-recipe-image" />
            <div className="community-recipe-info">
                <h3>{recipe.title}</h3>
                <p>Shared by: {recipe.user}</p>
            </div>
        </div>
    );
}
