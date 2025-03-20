
import React, { useState, useEffect } from 'react';
import './RecipeSteps.css';

const RecipeSteps = ({ recipe }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [steps, setSteps] = useState([]);
  const [substitutions, setSubstitutions] = useState({});

  useEffect(() => {
    if (!recipe) return;
    
    try {
      // Parse recipe content into steps
      const content = recipe.split('\n');
      const parsedSteps = [];
      let inSteps = false;
      
      content.forEach(line => {
        if (line?.toLowerCase().includes('instructions:')) {
          inSteps = true;
        } else if (inSteps && line?.trim().length > 0) {
          parsedSteps.push(line.replace(/^\d+\.\s*/, '').trim());
        }
      });
    
    setSteps(parsedSteps.length ? parsedSteps : ['No steps found']);
    
    try {
      // Generate common substitutions
      const ingredients = recipe.split('Ingredients:')[1]?.split('Instructions:')[0]
        ?.split('\n')
        .filter(line => line?.trim().startsWith('*'))
        .map(line => line.replace('*', '').trim()) || [];
      
    const commonSubs = {
      'butter': 'margarine, coconut oil, olive oil',
      'milk': 'almond milk, soy milk, oat milk',
      'eggs': 'applesauce, mashed banana, flax eggs',
      'flour': 'almond flour, coconut flour, oat flour',
      'sugar': 'honey, maple syrup, stevia',
    };
    
    const subs = {};
    ingredients?.forEach(ing => {
      Object.keys(commonSubs).forEach(key => {
        if (ing.toLowerCase().includes(key)) {
          subs[ing] = commonSubs[key];
        }
      });
    });
    setSubstitutions(subs);
    } catch (error) {
      console.error('Error parsing substitutions:', error);
      setSubstitutions({});
    }
    } catch (error) {
      console.error('Error parsing recipe:', error);
      setSteps(['Error parsing recipe steps']);
    }
  }, [recipe]);

  const startTimer = (minutes) => {
    if (timer) clearInterval(timer);
    const seconds = minutes * 60;
    setTimeLeft(seconds);
    const newTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(newTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimer(newTimer);
  };

  const extractTime = (step) => {
    const timePattern = /(\d+)\s*(minute|minutes|min)/i;
    const match = step.match(timePattern);
    return match ? parseInt(match[1]) : null;
  };

  return (
    <div className="recipe-steps">
      <div className="steps-nav">
        <button 
          onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
          disabled={activeStep === 0}
        >
          Previous
        </button>
        <span>Step {activeStep + 1} of {steps.length}</span>
        <button 
          onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
          disabled={activeStep === steps.length - 1}
        >
          Next
        </button>
      </div>

      <div className="current-step">
        <p>{steps[activeStep]}</p>
        {extractTime(steps[activeStep]) && timeLeft === 0 && (
          <button 
            className="timer-btn"
            onClick={() => startTimer(extractTime(steps[activeStep]))}
          >
            Start {extractTime(steps[activeStep])} min timer
          </button>
        )}
        {timeLeft > 0 && (
          <div className="timer">
            Time remaining: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      {Object.keys(substitutions).length > 0 && (
        <div className="substitutions">
          <h4>Ingredient Substitutions</h4>
          <ul>
            {Object.entries(substitutions).map(([ingredient, subs]) => (
              <li key={ingredient}>
                <strong>{ingredient}:</strong> {subs}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecipeSteps;
