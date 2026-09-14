import React, { useState } from 'react';

export default function Tracking() {
  // BMI calculate important info 
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiResult, setBmiResult] = useState('Your result will appear here.');

  // BMI එක Calculate fuction
  const handleCalculateBMI = (e) => {
    e.preventDefault();
    
    if (!height || !weight) return;

  
    const hInMeters = parseFloat(height) / 100;
    const wInKg = parseFloat(weight);

    if (hInMeters <= 0 || wInKg <= 0) {
      setBmiResult('Please enter valid height and weight values.');
      return;
    }

    // BMI fromula: weight (kg) / [height (m)]^2
    const bmi = (wInKg / (hInMeters * hInMeters)).toFixed(1);

    // BMI check state
    let status = '';
    if (bmi < 18.5) {
      status = 'Underweight';
    } else if (bmi >= 18.5 && bmi < 24.9) {
      status = 'Normal weight';
    } else if (bmi >= 25 && bmi < 29.9) {
      status = 'Overweight';
    } else {
      status = 'Obese';
    }

    setBmiResult(`Your BMI is ${bmi} (${status})`);
  };

  return (
    <div>
      {/* Main Content */}
      <main>
        <section className="page-hero">
          <div className="container">
            <div className="eyebrow">KNOW YOUR PROGRESS</div>
            <h1>Track the habits that<br /><span>move you forward.</span></h1>
            <p>FitLife keeps the important numbers visible without turning fitness into a spreadsheet[cite: 3].</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <span>WATER</span>
                <strong>1.6 <small>/ 2.5 L</small></strong>
                <div className="progress"><i style={{ width: '64%' }}></i></div>
                <p>8 glasses goal</p>
              </div>
              <div className="stat-card">
                <span>ACTIVE CALORIES</span>
                <strong>420 <small>kcal</small></strong>
                <div className="progress"><i style={{ width: '70%' }}></i></div>
                <p>600 kcal target</p>
              </div>
              <div className="stat-card">
                <span>WEEKLY STREAK</span>
                <strong>5 <small>days</small></strong>
                <div className="streak">🔥 🔥 🔥 🔥 🔥 ○ ○</div>
                <p>Keep your momentum</p>
              </div>
            </div>

            {/* BMI Calculator Box */}
            <div className="bmi-box">
              <div>
                <div className="eyebrow">BMI CALCULATOR</div>
                <h2>Understand your <span>starting point.</span></h2>
                <p>Enter your height and weight to calculate BMI. This is a general screening measure, not a diagnosis[cite: 3].</p>
              </div>
              <form onSubmit={handleCalculateBMI}>
                <label>
                  Height (cm)
                  <input 
                    id="height" 
                    type="number" 
                    min="80" 
                    max="250" 
                    placeholder="170" 
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    required 
                  />
                </label>
                <label>
                  Weight (kg)
                  <input 
                    id="weight" 
                    type="number" 
                    min="20" 
                    max="300" 
                    placeholder="65" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required 
                  />
                </label>
                <button className="btn primary" type="submit">Calculate BMI</button>
                <div id="bmiResult" className="bmi-result">{bmiResult}</div>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="container footer">
          <div className="brand">
            <span className="brand-mark">F</span>
            <span>Fit<span>Life</span></span>
          </div>
          <p>Smart personalized fitness for beginners[cite: 3].</p>
          <small>© 2026 FitLife Project</small>
        </div>
      </footer>
    </div>
  );
}