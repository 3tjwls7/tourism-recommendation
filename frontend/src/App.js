import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import QuestionPage from './components/QuestionPage';
import ResultPage from './components/ResultPage';
import NearbyPage from './components/NearbyPage';
import RoutePage from './components/RoutePage';

function App() {
  const [answers, setAnswers] = useState({
    latitude: null,
    longitude: null,
    categories: [],
    parking: '아니오'
  });

  const saveAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/question/1" />} />
        <Route path="/question/:step" element={<QuestionPage saveAnswer={saveAnswer} />} />
        <Route path="/result" element={<ResultPage answers={answers} />} />
        <Route path="/nearby" element={<NearbyPage />} />
        <Route path="/route" element={<RoutePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
