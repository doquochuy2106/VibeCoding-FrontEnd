import "./header.css";

//functions => return views (giao diện: html/css/js)
//jsx

const Header = () => {
  return (
    <header className="app-header">
      <div className="app-header-brand">
        <div className="app-header-logo">T</div>
        <span className="app-header-title">Todo App</span>
      </div>
      <nav className="app-header-nav">
        <a href="#">Trang chủ</a>
        <a href="#">Công việc</a>
        <a href="#">Giới thiệu</a>
      </nav>
    </header>
  );
}

export default Header;
