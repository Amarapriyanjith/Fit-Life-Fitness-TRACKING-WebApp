import React, { useState } from 'react';

const workoutData = {
  beginner: [
    { icon: '🧘', title: 'Full Body Mobility', desc: 'Gentle stretches to wake up joints and improve posture.', tag: '15 MINS' },
    { icon: '🚶', title: 'Low-Impact Walking Cardio', desc: 'Step-based routine designed to get your heart rate up safely.', tag: '20 MINS' },
    { icon: '🛋️', title: 'Chair & Wall Strength', desc: 'Build foundational strength using supportive furniture.', tag: '15 MINS' }
  ],
  intermediate: [
    { icon: '⚡', title: 'Dynamic Core Sculpt', desc: 'Strengthen your abdominal muscles with controlled movements.', tag: '25 MINS' },
    { icon: '🏋️', title: 'Dumbbell Basics', desc: 'Introduction to weighted exercises for muscle tone.', tag: '30 MINS' },
    { icon: '🏃', title: 'Interval Jog & Walk', desc: 'Alternating paces to boost endurance and stamina.', tag: '30 MINS' }
  ],
  advanced: [
    { icon: '🔥', title: 'High Intensity HIIT', desc: 'Push your limits with fast-paced explosive bodyweight moves.', tag: '40 MINS' },
    { icon: '💪', title: 'Advanced Power Circuit', desc: 'Challenging compound lifts and explosive strength drills.', tag: '45 MINS' },
    { icon: '🚴', title: 'Endurance Cardio Blast', desc: 'Maximum effort endurance training for peak conditioning.', tag: '50 MINS' }
  ]
};

export default function Workouts() {
  const [level, setLevel] = useState('beginner');

  return (
    <div>
      

      {/* Main Content */}
      <main>
        <section className="page-hero">
          <div className="container">
            <div className="eyebrow">MOVE WITH CONFIDENCE</div>
            <h1>Workouts that meet<br /><span>you where you are.</span></h1>
            <p>Start small, learn the movements, and build consistency. Select a fitness level to explore a sample plan.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="tabs">
              <button className={`tab ${level === 'beginner' ? 'active' : ''}`} onClick={() => setLevel('beginner')}>Beginner</button>
              <button className={`tab ${level === 'intermediate' ? 'active' : ''}`} onClick={() => setLevel('intermediate')}>Intermediate</button>
              <button className={`tab ${level === 'advanced' ? 'active' : ''}`} onClick={() => setLevel('advanced')}>Advanced</button>
            </div>
            
            <div className="workout-grid" id="workoutGrid">
              {workoutData[level].map((item, index) => (
                <div className="workout" key={index}>
                  <div className="w-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <span className="tag">{item.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dark-section">
          <div className="container cta-center">
            <div className="eyebrow">READY?</div>
            <h2>Your first workout can start <span>today.</span></h2>
            <a className="btn light" href="/dashboard">Open My Dashboard →</a>
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
          <p>Smart personalized fitness for beginners.</p>
          <small>© 2026 FitLife Project</small>
        </div>
      </footer>
    </div>
  );
}