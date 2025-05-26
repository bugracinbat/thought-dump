import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { TopicPage } from "./pages/TopicPage";
import { CreatePostPage } from "./pages/CreatePostPage";
import { AdminPage } from "./pages/AdminPage";
import { SearchPage } from "./pages/SearchPage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/topics/:slug" element={<TopicPage />} />
        <Route path="/create" element={<CreatePostPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
