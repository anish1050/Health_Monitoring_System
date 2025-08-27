import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  return (
    <>
      <header className="header">
        <div className="container">
          <div className="logo">Health<span>Wise</span></div>
          <nav className="main-nav">
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><a className="btn btn-outline" href="/login.html">Log In</a></li>
              <li><a className="btn btn-primary" href="/register.html">Register</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Your Health Journey Starts Here</h1>
            <p>Monitor, track, and improve your health with our comprehensive health tracking platform.</p>
            <div className="cta-buttons">
              <a href="/register.html" className="btn btn-primary btn-large">Get Started Free</a>
              <a href="/learnmore.html" className="btn btn-secondary btn-large">Learn More</a>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7" alt="Person monitoring health on a laptop" />
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Why Choose HealthWise</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon heart-icon"></div>
              <h3>Heart Rate Monitoring</h3>
              <p>Track your heart rate in real-time and receive personalized insights.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon activity-icon"></div>
              <h3>Insights about Your Heart rate</h3>
              <p>Understand patterns in your heart rate data and get actionable recommendations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon nutrition-icon"></div>
              <h3>Spo2 monitoring</h3>
              <p>Keep track of your blood oxygen levels throughout the day and night..</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon sleep-icon"></div>
              <h3>Insights about your Spo2</h3>
              <p>Learn how your oxygen levels affect your overall health and daily performance.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <h2 className="section-title">About HealthWise</h2>
            <p>HealthWise was created with a simple mission: to make health tracking accessible, informative, and engaging for everyone. Our team of health experts and developers work together to provide you with the most accurate and useful health monitoring tools.</p>
            <p>With our platform, you can take control of your health journey, set meaningful goals, and track your progress over time.</p>
          </div>
          <div className="about-image">
            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" alt="Person using health tracking application" />
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials">
        <div className="container">
          <h2 className="section-title">What Our Users Say</h2>
          <div className="testimonial-slider">
            <div className="testimonial-card">
              <p className="testimonial-text">"HealthWise has completely changed how I approach my fitness goals. The detailed insights have helped me make better health decisions."</p>
              <p className="testimonial-author">- Sarah J.</p>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">"I've tried many health apps, but HealthWise stands out with its user-friendly interface and comprehensive tracking features."</p>
              <p className="testimonial-author">- Michael T.</p>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">"The sleep analysis feature has been a game-changer for me. I've improved my sleep quality significantly in just a few weeks."</p>
              <p className="testimonial-author">- Emma R.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Ready to start your health journey?</h2>
          <p>Join thousands of users who have transformed their health with HealthWise.</p>
          <a href="/register.html" className="btn btn-primary btn-large">Get Started Today</a>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">Health<span>Wise</span></div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Company</h4>
                <ul>
                  <li><a href="/about.html">About Us</a></li>
                  <li><a href="/careers.html">Careers</a></li>
                  <li><a href="/contact.html">Contact</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Resources</h4>
                <ul>
                  <li><a href="/blog.html">Blog</a></li>
                  <li><a href="/guides.html">Guides</a></li>
                  <li><a href="/help.html">Help Center</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} HealthWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
