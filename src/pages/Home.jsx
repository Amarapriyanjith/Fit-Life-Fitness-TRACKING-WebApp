import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      {/* Hero Section with main value proposition and call to actions */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">SMART FITNESS • BUILT FOR BEGINNERS</div>
            <h1>Build a healthier<br /><span>you, one day</span> at a time.</h1>
            <p className="hero-copy">
              FitLife brings workouts, nutrition guidance, BMI, water tracking and progress monitoring together in one simple experience.
            </p>
            <div className="hero-actions">
              <Link className="btn primary" to="/dashboard">Start Your Journey <b>→</b></Link>
              <Link className="btn ghost" to="/workouts">Explore Workouts</Link>
            </div>
            <div className="mini-proof">
              <div className="avatars"><i>G</i><i>F</i><i>L</i><i>+</i></div>
              <div>
                <strong>Made for real beginners</strong>
                <small>Simple plans. Clear goals. No intimidation.</small>
              </div>
            </div>
          </div>

          {/* Hero visual card displaying daily stats and score */}
          <div className="hero-card">
            <div className="orb"></div>
            <div className="hero-stat">
              <small>YOUR DAILY SCORE</small>
              <strong>82<span>/100</span></strong>
              <div className="progress"><i style={{ width: '82%' }}></i></div>
              <small>Great start — keep it going[cite: 7].</small>
            </div>
            <div className="float-card fc1">💧 <b>1.6L</b><small>Water today</small></div>
            <div className="float-card fc2">🔥 <b>420</b><small>Calories active</small></div>
            <div className="person">FIT<br />LIFE</div>
          </div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">EVERYTHING IN ONE PLACE</div>
              <h2>Your fitness, <span>simplified.</span></h2>
            </div>
            <p>Designed around the common problems beginners face with complicated fitness apps.</p>
          </div>
          
          <div className="feature-grid">
            <Link className="feature" to="/workouts">
              <div className="icon">⚡</div>
              <h3>Personalized Workouts</h3>
              <p>Choose beginner, intermediate or advanced plans that match your fitness level.</p>
              <b>View plans →</b>
            </Link>
            <Link className="feature" to="/nutrition">
              <div className="icon">🥗</div>
              <h3>Simple Meal Plans</h3>
              <p>Understandable daily meal ideas with calorie-aware choices and practical portions.</p>
              <b>Plan meals →</b>
            </Link>
            <Link className="feature" to="/tracking">
              <div className="icon">📊</div>
              <h3>Track Your Progress</h3>
              <p>Monitor BMI, water, calories and your progress through a clear dashboard.</p>
              <b>See tracking →</b>
            </Link>
          </div>
        </div>
      </section>

      {/* Dark Section detailing core benefits */}
      <section className="dark-section">
        <div className="container split">
          <div>
            <div className="eyebrow">WHY FITLIFE?</div>
            <h2>Fitness shouldn't feel<br /><span>complicated.</span></h2>
            <p>
              FitLife focuses on accessibility: beginner-friendly guidance, essential features without unnecessary barriers, and an onboarding experience that keeps the first step simple.
            </p>
            <Link className="btn light" to="/about">Learn About FitLife →</Link>
          </div>
          <div className="check-list">
            <div>✓ <span>Beginner-friendly exercise plans</span></div>
            <div>✓ <span>Personalized guidance by fitness level</span></div>
            <div>✓ <span>BMI & health recommendations</span></div>
            <div>✓ <span>Water and calorie tracking</span></div>
            <div>✓ <span>Progress dashboard & reminders</span></div>
          </div>
        </div>
      </section>

      {/* Motivational Quote Section */}
      <section className="section">
        <div className="container">
          <div className="quote">
            <div className="quote-mark">“</div>
            <div>
              <h3>Small habits become big results.</h3>
              <p>Whether you're starting from zero or rebuilding your routine, FitLife is designed to help you stay consistent.</p>
            </div>
            <Link className="btn primary" to="/dashboard">Try the Demo →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}