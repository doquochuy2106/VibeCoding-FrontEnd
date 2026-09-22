import Footer from "./components/footer";
import Header from "./components/header";
import Home from "./components/home";

const App = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Home />
      </main>
      <Footer />
    </div>
  );
};

export default App;
