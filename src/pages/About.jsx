import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div>
      {/* Main content wrapper */}
      <main>
        {/* Page Hero Section */}
        <section className="page-hero">
          <div className="container">
            <div className="eyebrow">THE FITLIFE PROJECT</div>
            <h1>Making fitness more<br /><span>accessible.</span></h1>
            <p>FitLife is a proposed beginner-friendly fitness solution designed to make healthy routines easier for university students and health-conscious individuals.</p>
          </div>
        </section>

        {/* About Idea Section */}
        <section className="section">
          <div className="container about-grid">
            <div>
              <div className="eyebrow">THE IDEA</div>
              <h2>Less friction.<br /><span>More consistency.</span></h2>
            </div>
            <div>
              <p>Many existing fitness applications can overwhelm beginners with difficult workouts, complicated diet plans, paid feature restrictions, intrusive advertisements and poor onboarding. FitLife is designed around those usability challenges.</p>
              <p>The project brings personalized workouts, BMI calculation, meal planning, water and calorie tracking, progress monitoring and reminders into one straightforward experience.</p>
            </div>
          </div>
        </section>

        {/* Project Snapshot Timeline Section */}
        <section className="dark-section">
          <div className="container">
            <div className="eyebrow">PROJECT SNAPSHOT</div>
            <div className="timeline">
              <div>
                <b>01</b>
                <h3>Discover</h3>
                <p>Research user needs and common fitness-app usability issues.</p>
              </div>
              <div>
                <b>02</b>
                <h3>Design</h3>
                <p>Create a clear, beginner-friendly UI and onboarding experience.</p>
              </div>
              <div>
                <b>03</b>
                <h3>Develop</h3>
                <p>Build the application iteratively using Agile development.</p>
              </div>
              <div>
                <b>04</b>
                <h3>Improve</h3>
                <p>Test, fix issues and refine the experience before deployment.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Academic Project & University Information Section */}
        <section className="section">
          <div className="container university">
            <div>
              <div className="eyebrow">ACADEMIC PROJECT</div>
              <h2>Rajarata University<br /><span>of Sri Lanka.</span></h2>
            </div>
            <div>
              <p><b>Department:</b> ICT Department</p>
              <p><b>Course:</b> Skill Development / ICT 1108</p>
              <p><b>Supervisor:</b> Ms. Piyumi Herath</p>
              <p className="muted">The proposal identifies Flutter for mobile development, Firebase Authentication for accounts, and Firebase Firestore or MongoDB for application data.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section */}
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