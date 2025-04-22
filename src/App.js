import React, { useState } from "react";
import { Layout, Typography, Select, Button } from "antd";
import Quiz from "./Quiz";
import "antd/dist/reset.css";

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
// põhikomponent
const App = () => {
  const [category, setCategory] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [start, setStart] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh", padding: 24 }}>
      <Header style={{ background: "#fff" }}>
        <Title level={2}>Viktoriin</Title>
      </Header>
      <Content>
        {!start ? (
          <div style={{ maxWidth: 400, margin: "auto", marginTop: 50 }}>
            <Title level={4}>Vali kategooria ja raskusaste</Title>
            <Select
              style={{ width: "100%", marginBottom: 20 }}
              placeholder="Kategooria"
              onChange={setCategory}
            >
              <Option value="9">Üldteadmised</Option>
              <Option value="21">Sport</Option>
              <Option value="23">Ajalugu</Option>
              <Option value="17">Teadus ja loodus</Option>
              
            </Select>
            <Select
              style={{ width: "100%", marginBottom: 20 }}
              placeholder="Raskusaste"
              onChange={setDifficulty}
            >
              <Option value="easy">Lihtne</Option>
              <Option value="medium">Keskmine</Option>
              <Option value="hard">Raske</Option>
            </Select>
            <Button
              type="primary"
              disabled={!category || !difficulty}
              block
              onClick={() => setStart(true)}
            >
              Alusta
            </Button>
          </div>
        ) : (
          <Quiz category={category} difficulty={difficulty} />
        )}
      </Content>
    </Layout>
  );
};

export default App;
