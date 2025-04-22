import React, { useEffect, useState, useCallback } from "react";
import { Card, Button, Typography, Progress, Result, Modal } from "antd";
import axios from "axios";

const { Title } = Typography;
// dekodeerib HTML-i
const decodeHTML = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};
// Quiz komponent
// võtab vastu kategooria ja raskusastme
const Quiz = ({ category, difficulty }) => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [disabled, setDisabled] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [difficulties, setDifficulties] = useState([]);

  useEffect(() => {
    function shuffleArray(array) {
        return array
          .map((value) => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);
      }
      // laeb küsimused API-st
      axios
        .get(`https://opentdb.com/api.php?amount=7&category=${category}&difficulty=${difficulty}`)
        .then((res) => {
          const fetched = res.data.results.map((q) => ({
            ...q,
            all_answers: shuffleArray([
              ...q.incorrect_answers,
              q.correct_answer,
            ]),
          }));
          setQuestions(fetched);
        })
  }, [category, difficulty]);
  // järgmine küsimus
  const nextQuestion = useCallback(() => {
    setCurrent((prev) => {
      if (prev + 1 === questions.length) {
        setShowResult(true);
        return prev; // do not increment anymore
      } else {
        return prev + 1;
      }
    });
    setSelected(null);
    setTimeLeft(15);
    setDisabled(false);
  }, [questions.length]);

  // kui küsimus on vale, siis suurendab vale vastuse arvu
  useEffect(() => {
    if (disabled) return;
  
    const countdown = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
  
    const timeout = setTimeout(() => {
      setDisabled(true);
      setWrong((prev) => prev + 1);
      setDifficulties((prev) => [...prev, questions[current].difficulty]);
  
      setTimeout(() => {
        nextQuestion();
      }, 1500);
    }, 15000);
  
    return () => {
      clearInterval(countdown);
      clearTimeout(timeout);
    };
  }, [current, disabled, questions, nextQuestion]);
  
  
  const handleAnswer = (answer, correct) => {
    setDisabled(true);
    setSelected(answer);
    if (answer === correct) {
      setScore((prev) => prev + 1);
    } else {
      setWrong((prev) => prev + 1);
    }
    setDifficulties((prev) => [...prev, questions[current].difficulty]);
    setTimeout(() => nextQuestion(), 1500);
  };

  
  // funktsioon, mis tagastab keskmise raskusastme
  // vastavalt valitud raskusastmele
  const getDifficultyLabel = () => {
    const levelScore = { easy: 1, medium: 2, hard: 3 };
    const avg =
      difficulties.reduce((acc, d) => acc + levelScore[d], 0) / difficulties.length;
    if (avg < 1.5) return "Lihtne";
    if (avg < 2.5) return "Keskmine";
    return "Raske";
  };
  
  // kui küsimusi pole, siis näitab laadimist
  if (!questions.length) return <p>Laadimine...</p>;
  // kui küsimused on laetud, siis näitab küsimust
  const question = questions[current];
 
    
  

  return (
    <div style={{ maxWidth: 600, margin: "auto", marginTop: 50 }}> 
      <Card>
        <Title level={4}>
          {current + 1}/{questions.length}: {decodeHTML(question.question)} 
        </Title>
        {questions[current]?.all_answers.map((ans, i) => {
            const decoded = decodeHTML(ans);
            const isCorrect = ans === questions[current].correct_answer;
            const isSelected = ans === selected;

            let style = { marginTop: 10 };
            if (disabled) {
                if (isCorrect) style = { ...style, backgroundColor: "#52c41a", color: "#fff" };
                else if (isSelected && !isCorrect)
                style = { ...style, backgroundColor: "#ff4d4f", color: "#fff" };
            }

            return (
                <Button
                key={i}
                disabled={disabled}
                onClick={() => handleAnswer(ans, questions[current].correct_answer)}
                block
                style={style}
                >
                {decoded}
                </Button>
            );
            })}


        <Progress
          percent={(timeLeft / 15) * 100}
          status={timeLeft <= 5 ? "exception" : "active"}
          showInfo={false}
          strokeColor="#52c41a"
          style={{ marginTop: 20 }}
        />
      </Card>

      <Modal
        open={showResult}
        footer={null}
        closable={false}
        centered
        destroyOnClose
      >
        <Result
          status="success"
          title="Mäng on lõppenud!"
          subTitle={`Õigeid vastuseid: ${score}, Valesid vastuseid: ${wrong}`}
          extra={[
            <p key="1">Edukuse protsent: {((score / 15) * 100).toFixed(2)}%</p>,
            <p key="2">Keskmine raskus: {getDifficultyLabel()}</p>,
            <Button key="3" type="primary" onClick={() => window.location.reload()}>
              Alusta uuesti
            </Button>,
          ]}
        />
      </Modal>
    </div>
  );
};

export default Quiz;
