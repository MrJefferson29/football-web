import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Polls from './pages/Polls';
import Matches from './pages/Matches';
import LocalLeagues from './pages/LocalLeagues';
import InterQuarterLeague from './pages/InterQuarterLeague';
import Highlights from './pages/Highlights';
import News from './pages/News';
import LiveMatches from './pages/LiveMatches';
import FanGroups from './pages/FanGroups';
import Statistics from './pages/Statistics';
import Products from './pages/Products';
import PredictionForums from './pages/PredictionForums';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Navbar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/polls" element={<Polls />} />
                    <Route path="/matches" element={<Matches />} />
                    <Route path="/local-leagues" element={<LocalLeagues />} />
                    <Route path="/inter-quarter-league" element={<InterQuarterLeague />} />
                    <Route path="/highlights" element={<Highlights />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/live-matches" element={<LiveMatches />} />
                    <Route path="/fan-groups" element={<FanGroups />} />
                    <Route path="/statistics" element={<Statistics />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/prediction-forums" element={<PredictionForums />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
