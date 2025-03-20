import React from 'react'
import "./Loader.css";

const Loader = () => {
    return (
        <div className='loader-wrapper'>
            <div class="card">
                <div class="loader">
                    <p>Loading</p>
                    <div class="words">
                        <span class="word">Ingredients</span>
                        <span class="word">Recipes</span>
                        <span class="word">Flavors</span>
                        <span class="word">Dishes</span>
                        <span class="word">Meals</span>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Loader