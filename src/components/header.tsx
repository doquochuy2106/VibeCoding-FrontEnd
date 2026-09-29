import { Link } from "react-router-dom";
import "./header.css";

const Header = () => {
  return (
    <header className="app-header">
      <div className="app-header-brand">
        <div className="app-header-logo">T</div>
        <span className="app-header-title">Todo App</span>
      </div>
      <nav className="app-header-nav">
        <Link to="/">Trang chủ</Link>
        <a href="#">Công việc</a>
        <Link to="/admin" style={{ color: "#0f8f6f", fontWeight: 600 }}>Quản trị (Admin)</Link>
      </nav>
    </header>
  );
};

export default Header;
