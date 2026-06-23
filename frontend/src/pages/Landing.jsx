import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@hooks/usePageTitle";
import "@styles/pages/Landing.css";

import logo from "../assets/landing/logo-alb-2.png";
import nyxIcon from "../assets/landing/Nyx.png";
import dashboardImg from "../assets/landing-screenshots/dashboard.png";
import statisticsImg from "../assets/landing-screenshots/statistics.png";
import chatWindowImg from "../assets/landing-screenshots/chat-window.png";

const Reveal = ({className = "", children }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${isVisible ? "is-visible" : ""} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
};

const Landing = () => {
  usePageTitle("Noxy");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-page">
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-inner">
          <img src={logo} alt="Noxy" className="navbar-logo" />
          <Link to="/login" className="navbar-login">
            Login
          </Link>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Alarm monitoring &amp; analysis</span>
          <h1 className="hero-title">
            Real-time alarm monitoring across your infrastructure.
          </h1>
          <p className="hero-subtitle">
            Noxy aggregates alarms across your servers, breaks down severity
            and status trends, and answers questions about your data in
            plain language — no dashboards to memorize.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary">
              Log in
            </Link>
            <a href="#features" className="btn btn-ghost">
              See how it works
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="features" id="features">
          <Reveal as="article" className="feature">
            <div className="feature-text">
              <span className="feature-tag">Alarms table</span>
              <h2>Every alarm, filtered down to the one you need.</h2>
              <p>
                Search and filter the full alarm feed by status, severity,
                type, server, or project. Paginate through thousands of
                records without losing context.
              </p>
            </div>
            <div className="feature-media">
              <img
                src={dashboardImg}
                alt="Noxy alarms table with filters, search, and pagination"
                loading="lazy"
              />
            </div>
          </Reveal>

          <Reveal as="article" className="feature feature-reverse">
            <div className="feature-text">
              <span className="feature-tag">Statistics</span>
              <h2>KPIs and trends, without building a spreadsheet.</h2>
              <p>
                Total and active alarm counts, average resolution time,
                severity and status breakdowns, category charts — all
                computed from the same data feeding the alarms table.
              </p>
            </div>
            <div className="feature-media">
              <img
                src={statisticsImg}
                alt="Noxy KPI statistics dashboard with charts"
                loading="lazy"
              />
            </div>
          </Reveal>

          <Reveal as="article" className="feature">
            <div className="feature-text">
              <span className="feature-tag">AI assistant</span>
              <h2>Ask it in plain language. It writes the SQL.</h2>
              <p>
                "Export critical alarms from last month." "Which servers had
                the most network issues this week?" Ask the question — it
                generates the query, runs it, and replies with an answer, a
                chart, or a file.
              </p>
              <div className="assistant-meet">
                <img src={nyxIcon} alt="" className="assistant-meet-icon" />
                <p className="assistant-meet-text">
                  <strong>Meet Nyx</strong> — the assistant behind every
                  answer, built right into the chat.
                </p>
              </div>
            </div>
            <div className="feature-media">
              <img
                src={chatWindowImg}
                alt="Nyx answering a question about alarm data with a chart and export option"
                loading="lazy"
              />
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <nav className="footer-links">
            <a href="#features">Dashboard</a>
            <a href="#features">Statistics</a>
            <a href="#features">AI Assistant</a>
            <Link to="/login">Login</Link>
          </nav>
          <span className="footer-copyright">
            © {new Date().getFullYear()} Noxy. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
