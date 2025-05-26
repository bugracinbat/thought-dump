import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { TopicPage } from "./pages/TopicPage";
import { CreatePostPage } from "./pages/CreatePostPage";
import { AdminPage } from "./pages/AdminPage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/topics/:slug" element={<TopicPage />} />
        <Route path="/create" element={<CreatePostPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
